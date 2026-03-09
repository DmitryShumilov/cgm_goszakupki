"""
FastAPI Backend для дашборда госзакупок CGM

API endpoints:
- GET /api/kpi - KPI карточки
- GET /api/charts/dynamics - Динамика закупок
- GET /api/charts/regions - Топ регионов
- GET /api/charts/suppliers - Топ поставщиков
- GET /api/charts/categories - Категории товаров
- GET /api/charts/heatmap - Тепловая карта
- GET /api/filters/* - Списки для фильтров
"""

from typing import Annotated
from fastapi import FastAPI, Query, HTTPException, Request, Body
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator, model_validator
from typing import List, Optional, Dict, Any
import psycopg2
import psycopg2.pool
from psycopg2.extras import RealDictCursor
from datetime import datetime
from functools import lru_cache
import time
import hashlib
import json
import os
import logging
import logging.handlers
import sys
from dotenv import load_dotenv
from contextlib import contextmanager

# Rate Limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Загрузка переменных окружения
load_dotenv()

# Параметры подключения к PostgreSQL
DB_CONFIG = {
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'port': int(os.getenv('POSTGRES_PORT', 5432)),
    'user': os.getenv('POSTGRES_USER', 'postgres'),
    'password': os.getenv('POSTGRES_PASSWORD'),
    'database': os.getenv('POSTGRES_DATABASE', 'cgm_dashboard')
}

# ============================================================================
# Connection Pool для PostgreSQL
# ============================================================================

# Глобальный пул соединений (min 1, max 10)
connection_pool = psycopg2.pool.SimpleConnectionPool(
    1,   # minconn — минимальное число соединений
    10,  # maxconn — максимальное число соединений
    **DB_CONFIG
)


@contextmanager
def get_db_connection():
    """Получение подключения к БД из пула"""
    conn = connection_pool.getconn()
    try:
        yield conn
    finally:
        connection_pool.putconn(conn)


# ============================================================================
# Логирование
# ============================================================================

# Логирование в файл и консоль
os.makedirs('logs', exist_ok=True)

# Создаём форматтер
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Обработчик для файла (RotatingFileHandler)
file_handler = logging.handlers.RotatingFileHandler(
    'logs/app.log',
    maxBytes=10*1024*1024,  # 10 MB
    backupCount=5,
    encoding='utf-8'
)
file_handler.setFormatter(formatter)
file_handler.setLevel(logging.INFO)

# Обработчик для консоли
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)
console_handler.setLevel(logging.INFO)

# Настройка логгера
logging.basicConfig(level=logging.INFO, handlers=[file_handler, console_handler])
logger = logging.getLogger(__name__)


app = FastAPI(
    title="CGM Dashboard API",
    description="API для дашборда госзакупок",
    version="1.0.0"
)


@app.on_event("shutdown")
def shutdown_db_pool():
    """Закрытие всех соединений при остановке приложения"""
    try:
        if connection_pool:
            connection_pool.closeall()
            logger.info("Database connection pool closed")
    except Exception as e:
        logger.warning(f"Error closing connection pool: {e}")

# CORS для frontend
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:80"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,
)

# ============================================================================
# Rate Limiting
# ============================================================================

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    import time
    start_time = time.time()

    response = await call_next(request)

    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")

    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error: {exc.errors()}")
    # Преобразуем ошибки в сериализуемый формат
    errors = []
    for error in exc.errors():
        err_dict = {
            "type": error.get("type", "validation_error"),
            "loc": error.get("loc", []),
            "msg": error.get("msg", "Validation failed"),
            "input": str(error.get("input", "")) if error.get("input") is not None else None
        }
        errors.append(err_dict)
    return JSONResponse(
        status_code=422,
        content={"detail": "Validation error", "errors": errors}
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    logger.error(f"Value error: {exc}")
    return JSONResponse(
        status_code=422,
        content={"detail": str(exc)}
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.error(f"HTTP error {exc.status_code}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


# ============================================================================
# Кэширование (In-memory с TTL)
# ============================================================================

class SimpleCache:
    """In-memory кэш с TTL"""
    def __init__(self, ttl_seconds: int = 300):
        self._cache = {}
        self._timestamps = {}
        self.ttl = ttl_seconds

    def get(self, key: str):
        if key in self._cache:
            if time.time() - self._timestamps[key] < self.ttl:
                return self._cache[key]
            else:
                del self._cache[key]
                del self._timestamps[key]
        return None

    def set(self, key: str, value):
        self._cache[key] = value
        self._timestamps[key] = time.time()

    def clear(self):
        self._cache.clear()
        self._timestamps.clear()

# Глобальный кэш на 5 минут
cache = SimpleCache(ttl_seconds=300)


def get_cache_key(prefix: str, filters: dict) -> str:
    """Генерация ключа кэша из параметров фильтров"""
    filter_str = json.dumps(filters, sort_keys=True, default=str)
    hash_key = hashlib.md5(filter_str.encode()).hexdigest()
    return f"{prefix}:{hash_key}"


# ============================================================================
# Вспомогательные функции
# ============================================================================


@contextmanager
def get_db_cursor():
    """
    Контекстный менеджер для получения курсора БД
    Автоматически commit/rollback и закрытие ресурсов
    """
    conn = None
    cur = None
    try:
        with get_db_connection() as conn:
            cur = conn.cursor(cursor_factory=RealDictCursor)
            yield cur
            conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        if cur:
            cur.close()


def build_filter_clause(filters: dict) -> tuple:
    """
    Построение WHERE clause для фильтров
    Возвращает (where_clause, params)
    """
    conditions = []
    params = []
    
    if filters.get('years'):
        placeholders = ','.join(['%s'] * len(filters['years']))
        conditions.append(f"year IN ({placeholders})")
        params.extend(filters['years'])
    
    if filters.get('months'):
        # Преобразуем номера месяцев в YYYY-MM формат
        month_patterns = [f"%-{int(m):02d}" for m in filters['months']]
        placeholders = ','.join(['%s'] * len(month_patterns))
        conditions.append(f"purchase_month LIKE ANY(ARRAY[{placeholders}])")
        params.extend(month_patterns)
    
    if filters.get('regions'):
        placeholders = ','.join(['%s'] * len(filters['regions']))
        conditions.append(f"region IN ({placeholders})")
        params.extend(filters['regions'])
    
    if filters.get('customers'):
        placeholders = ','.join(['%s'] * len(filters['customers']))
        conditions.append(f"customer_name IN ({placeholders})")
        params.extend(filters['customers'])
    
    if filters.get('suppliers'):
        placeholders = ','.join(['%s'] * len(filters['suppliers']))
        conditions.append(f"distributor IN ({placeholders})")
        params.extend(filters['suppliers'])
    
    if filters.get('products'):
        placeholders = ','.join(['%s'] * len(filters['products']))
        conditions.append(f"what_purchased IN ({placeholders})")
        params.extend(filters['products'])
    
    if filters.get('date_from'):
        conditions.append("purchase_date >= %s")
        params.append(filters['date_from'])
    
    if filters.get('date_to'):
        conditions.append("purchase_date <= %s")
        params.append(filters['date_to'])
    
    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""
    return where_clause, params


# ============================================================================
# Модели данных
# ============================================================================

class FilterParams(BaseModel):
    years: Optional[List[int]] = None
    months: Optional[List[int]] = None
    regions: Optional[List[str]] = None
    customers: Optional[List[str]] = None
    suppliers: Optional[List[str]] = None
    products: Optional[List[str]] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None

    # Валидация годов (1900-2100)
    @field_validator('years')
    @classmethod
    def validate_years(cls, v):
        if v is None:
            return v
        for year in v:
            if not isinstance(year, int) or year < 1900 or year > 2100:
                raise ValueError(f'Invalid year: {year}. Must be between 1900 and 2100')
        return v

    # Валидация месяцев (1-12)
    @field_validator('months')
    @classmethod
    def validate_months(cls, v):
        if v is None:
            return v
        for month in v:
            if not isinstance(month, int) or month < 1 or month > 12:
                raise ValueError(f'Invalid month: {month}. Must be between 1 and 12')
        return v

    # Валидация строк (регионы, заказчики, поставщики, продукты)
    @field_validator('regions', 'customers', 'suppliers', 'products')
    @classmethod
    def validate_string_lists(cls, v):
        if v is None:
            return v
        for item in v:
            if not isinstance(item, str) or len(item) > 500:
                raise ValueError('Invalid string value. Must be string with max 500 characters')
        return v

    # Валидация дат (формат YYYY-MM-DD)
    @field_validator('date_from', 'date_to')
    @classmethod
    def validate_dates(cls, v):
        if v is None:
            return v
        try:
            datetime.strptime(v, '%Y-%m-%d')
        except ValueError:
            raise ValueError(f'Invalid date format: {v}. Must be YYYY-MM-DD')
        return v

    # Валидация: date_to должен быть >= date_from
    @model_validator(mode='after')
    def validate_date_range(self):
        if self.date_from and self.date_to:
            if self.date_from > self.date_to:
                raise ValueError('date_to must be greater than or equal to date_from')
        return self


# ============================================================================
# API Endpoints - KPI
# ============================================================================

@app.post("/api/kpi")
@limiter.limit("60/minute")
def get_kpi(request: Request, filters: Annotated[Optional[FilterParams], Body()] = None):
    """
    Получить KPI карточки (POST для поддержки больших фильтров)
    """
    if filters is None:
        filters = FilterParams()

    filter_dict = filters.model_dump() if hasattr(filters, 'model_dump') else {}
    cache_key = get_cache_key("kpi", filter_dict)

    # Проверка кэша
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result

    where_clause, params = build_filter_clause(filter_dict)

    try:
        with get_db_cursor() as cur:
            query = f"""
            SELECT
                COALESCE(SUM(amount_rub), 0) as total_amount,
                COUNT(*) as contract_count,
                COALESCE(AVG(amount_rub), 0) as avg_contract_amount,
                COALESCE(SUM(quantity), 0) as total_quantity,
                CASE
                    WHEN COALESCE(SUM(quantity), 0) = 0 THEN 0
                    ELSE COALESCE(SUM(amount_rub), 0) / SUM(quantity)
                END as avg_price_per_unit,
                COUNT(DISTINCT customer_name) as customer_count
            FROM purchases
            {where_clause}
            """

            cur.execute(query, params)
            result = cur.fetchone()

            response = {
                "total_amount": float(result['total_amount']),
                "contract_count": int(result['contract_count']),
                "avg_contract_amount": float(result['avg_contract_amount']),
                "total_quantity": float(result['total_quantity']),
                "avg_price_per_unit": float(result['avg_price_per_unit']),
                "customer_count": int(result['customer_count'])
            }

            # Сохранение в кэш
            cache.set(cache_key, response)

            return response
    except ValueError as e:
        logger.error(f"Validation error in get_kpi: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Error in get_kpi: {e}")
        raise HTTPException(status_code=500, detail=str(e))
# ============================================================================
# API Endpoints - Charts
# ============================================================================

@app.post("/api/charts/dynamics")
@limiter.limit("60/minute")
def get_dynamics(request: Request, filters: Annotated[Optional[FilterParams], Body()] = None):
    """
    Динамика закупок по месяцам (POST)

    Возвращает данные для комбинированной диаграммы:
    - Столбцы: сумма закупок
    - Линия: количество
    """
    if filters is None:
        filters = FilterParams()

    where_clause, params = build_filter_clause(filters.model_dump() if hasattr(filters, 'model_dump') else {})

    with get_db_cursor() as cur:
        query = f"""
        SELECT
            purchase_month,
            SUM(amount_rub) as amount,
            SUM(quantity) as quantity
        FROM purchases
        {where_clause}
        GROUP BY purchase_month
        ORDER BY purchase_month
        """

        cur.execute(query, params)
        results = cur.fetchall()

    return {
        "labels": [r['purchase_month'] for r in results],
        "amounts": [float(r['amount']) for r in results],
        "quantities": [float(r['quantity']) if r['quantity'] else 0 for r in results]
    }


@app.post("/api/charts/regions")
@limiter.limit("60/minute")
def get_regions(request: Request, filters: Annotated[Optional[FilterParams], Body()] = None):
    """Топ-10 регионов по сумме контрактов (POST)"""
    if filters is None:
        filters = FilterParams()

    where_clause, params = build_filter_clause(filters.model_dump() if hasattr(filters, 'model_dump') else {})

    with get_db_cursor() as cur:
        # Получаем топ-10
        query = f"""
        SELECT
            region,
            SUM(amount_rub) as amount,
            COUNT(*) as count
        FROM purchases
        {where_clause}
        GROUP BY region
        ORDER BY amount DESC
        LIMIT 10
        """

        cur.execute(query, params)
        results = cur.fetchall()

        # Получаем общую сумму по всем регионам (с теми же фильтрами)
        total_query = f"""
        SELECT COALESCE(SUM(amount_rub), 0) as total
        FROM purchases
        {where_clause}
        """

        cur.execute(total_query, params)
        total = cur.fetchone()['total']

    return {
        "labels": [r['region'] for r in results],
        "amounts": [float(r['amount']) for r in results],
        "counts": [int(r['count']) for r in results],
        "total": float(total) if total else 0
    }


@app.post("/api/charts/suppliers")
@limiter.limit("60/minute")
def get_suppliers(request: Request, filters: Annotated[Optional[FilterParams], Body()] = None):
    """Топ-5 поставщиков + Остальные (POST)"""
    if filters is None:
        filters = FilterParams()

    where_clause, params = build_filter_clause(filters.model_dump() if hasattr(filters, 'model_dump') else {})

    with get_db_cursor() as cur:
        # Получаем общую сумму
        total_query = f"""
        SELECT COALESCE(SUM(amount_rub), 0) as total
        FROM purchases
        {where_clause}
        """

        cur.execute(total_query, params)
        total = cur.fetchone()['total']

        # Получаем топ-5
        query = f"""
        SELECT
            distributor,
            SUM(amount_rub) as amount
        FROM purchases
        {where_clause}
        GROUP BY distributor
        ORDER BY amount DESC
        LIMIT 5
        """

        cur.execute(query, params)
        results = cur.fetchall()

        # Считаем остальные
        top5_sum = sum(float(r['amount']) for r in results)
        others = max(0, float(total) - top5_sum)

    return {
        "top5": {
            "labels": [r['distributor'] for r in results],
            "amounts": [float(r['amount']) for r in results]
        },
        "others": others,
        "total": float(total)
    }


@app.post("/api/charts/categories")
@limiter.limit("60/minute")
def get_categories(request: Request, filters: Annotated[Optional[FilterParams], Body()] = None):
    """Категории товаров (Что закупали) (POST)"""
    if filters is None:
        filters = FilterParams()

    where_clause, params = build_filter_clause(filters.model_dump() if hasattr(filters, 'model_dump') else {})

    with get_db_cursor() as cur:
        query = f"""
        SELECT
            what_purchased,
            SUM(amount_rub) as amount
        FROM purchases
        {where_clause}
        GROUP BY what_purchased
        ORDER BY amount DESC
        LIMIT 7
        """

        cur.execute(query, params)
        results = cur.fetchall()

    return {
        "labels": [r['what_purchased'] for r in results],
        "amounts": [float(r['amount']) for r in results]
    }


@app.post("/api/charts/heatmap")
@limiter.limit("60/minute")
def get_heatmap(request: Request, filters: Annotated[Optional[FilterParams], Body()] = None):
    """
    Тепловая карта: доля товаров по месяцам (POST)

    Возвращает матрицу:
    - rows: товары (топ-20)
    - columns: месяцы
    - values: % доли в месяце
    """
    if filters is None:
        filters = FilterParams()

    where_clause, params = build_filter_clause(filters.model_dump() if hasattr(filters, 'model_dump') else {})

    with get_db_cursor() as cur:
        # Получаем топ-20 товаров по сумме
        products_query = f"""
        SELECT
            what_purchased,
            SUM(amount_rub) as total_amount
        FROM purchases
        {where_clause}
        GROUP BY what_purchased
        ORDER BY total_amount DESC
        LIMIT 20
        """

        cur.execute(products_query, params)
        top_products = [row['what_purchased'] for row in cur.fetchall()]

        if not top_products:
            return {"products": [], "months": [], "matrix": []}

        # Получаем сумму по каждому товару из топ-20 в каждом месяце
        # Используем те же параметры + top_products для IN clause
        placeholders = ','.join(['%s'] * len(top_products))

        # Если есть where_clause, добавляем IN condition через AND
        if where_clause:
            query = f"""
            SELECT
                what_purchased,
                purchase_month,
                SUM(amount_rub) as amount
            FROM purchases
            {where_clause}
            AND what_purchased IN ({placeholders})
            GROUP BY what_purchased, purchase_month
            ORDER BY what_purchased, purchase_month
            """
            cur.execute(query, params + top_products)
        else:
            query = f"""
            SELECT
                what_purchased,
                purchase_month,
                SUM(amount_rub) as amount
            FROM purchases
            WHERE what_purchased IN ({placeholders})
            GROUP BY what_purchased, purchase_month
            ORDER BY what_purchased, purchase_month
            """
            cur.execute(query, top_products)

        results = cur.fetchall()

        # Получаем общую сумму по каждому месяцу
        total_query = f"""
        SELECT
            purchase_month,
            SUM(amount_rub) as total
        FROM purchases
        {where_clause}
        GROUP BY purchase_month
        """

        cur.execute(total_query, params)
        totals = {r['purchase_month']: float(r['total']) for r in cur.fetchall()}

    # Формируем матрицу
    months = sorted(set(r['purchase_month'] for r in results))

    # Создаём матрицу с процентами (топ-20 уже отфильтрованы)
    matrix = []
    for product in top_products:
        row = {"product": product}
        for month in months:
            month_amount = next(
                (r['amount'] for r in results if r['what_purchased'] == product and r['purchase_month'] == month),
                0
            )
            month_total = totals.get(month, 0)
            pct = (month_amount / month_total * 100) if month_total > 0 else 0
            row[month] = round(pct, 2)

        # Итоговая доля
        total_amount = sum(r['amount'] for r in results if r['what_purchased'] == product)
        grand_total = sum(totals.values())
        row["total_pct"] = round((total_amount / grand_total * 100) if grand_total > 0 else 0, 2)

        matrix.append(row)

    return {
        "products": [r["product"] for r in matrix],
        "months": months,
        "matrix": matrix
    }


# ============================================================================
# API Endpoints - Filters
# ============================================================================

@app.get("/api/filters/years")
def get_years():
    """Доступные годы"""
    with get_db_cursor() as cur:
        cur.execute("SELECT DISTINCT year FROM purchases WHERE year IS NOT NULL ORDER BY year")
        years = [row['year'] for row in cur.fetchall()]
    return years


@app.get("/api/filters/months")
def get_months():
    """Доступные месяцы (1-12)"""
    with get_db_cursor() as cur:
        cur.execute("""
            SELECT DISTINCT EXTRACT(MONTH FROM TO_DATE(purchase_month, 'YYYY-MM')) as month
            FROM purchases
            ORDER BY month
        """)
        months = [int(row['month']) for row in cur.fetchall()]
    return months


@app.get("/api/filters/regions")
def get_regions_list():
    """Доступные регионы"""
    with get_db_cursor() as cur:
        cur.execute("SELECT DISTINCT region FROM purchases ORDER BY region")
        regions = [row['region'] for row in cur.fetchall()]
    return regions


@app.get("/api/filters/customers")
def get_customers_list():
    """Доступные заказчики"""
    with get_db_cursor() as cur:
        cur.execute("SELECT DISTINCT customer_name FROM purchases ORDER BY customer_name")
        customers = [row['customer_name'] for row in cur.fetchall()]
    return customers


@app.get("/api/filters/suppliers")
def get_suppliers_list():
    """Доступные поставщики"""
    with get_db_cursor() as cur:
        cur.execute("SELECT DISTINCT distributor FROM purchases ORDER BY distributor")
        suppliers = [row['distributor'] for row in cur.fetchall()]
    return suppliers


@app.get("/api/filters/products")
def get_products_list():
    """Доступные товары"""
    with get_db_cursor() as cur:
        cur.execute("SELECT DISTINCT what_purchased FROM purchases ORDER BY what_purchased")
        products = [row['what_purchased'] for row in cur.fetchall()]
    return products


# ============================================================================
# Health check
# ============================================================================

@app.get("/api/health")
@limiter.limit("30/minute")
def health_check(request: Request):
    """Проверка подключения к БД"""
    try:
        with get_db_cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM purchases")
            result = cur.fetchone()
            count = result['count'] if result else 0
        return {"status": "ok", "records": count}
    except Exception as e:
        logger.error(f"Health check error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/")
@limiter.limit("30/minute")
def root(request: Request):
    """Корневой endpoint"""
    return {
        "message": "CGM Dashboard API",
        "docs": "/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
