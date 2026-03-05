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

from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
from functools import lru_cache
import time
import hashlib
import json
import os
from dotenv import load_dotenv

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

app = FastAPI(
    title="CGM Dashboard API",
    description="API для дашборда госзакупок",
    version="1.0.0"
)

# CORS для frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Логирование
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    import time
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")
    
    return response


# ============================================================================
# Простой кэш с TTL
# ============================================================================

class SimpleCache:
    """Простой in-memory кэш с TTL"""
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

def get_db_connection():
    """Получение подключения к БД"""
    return psycopg2.connect(**DB_CONFIG)


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


# ============================================================================
# API Endpoints - KPI
# ============================================================================

@app.post("/api/kpi")
def get_kpi(filters: FilterParams = None):
    """
    Получить KPI карточки (POST для поддержки больших фильтров)
    """
    if filters is None:
        filters = FilterParams()
    
    filter_dict = filters.dict() if hasattr(filters, 'dict') else {}
    cache_key = get_cache_key("kpi", filter_dict)
    
    # Проверка кэша
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result
    
    where_clause, params = build_filter_clause(filter_dict)
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
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
    
    cur.close()
    conn.close()
    
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


# ============================================================================
# API Endpoints - Charts
# ============================================================================

@app.post("/api/charts/dynamics")
def get_dynamics(filters: FilterParams = None):
    """
    Динамика закупок по месяцам (POST)
    
    Возвращает данные для комбинированной диаграммы:
    - Столбцы: сумма закупок
    - Линия: количество
    """
    if filters is None:
        filters = FilterParams()
    
    where_clause, params = build_filter_clause(filters.dict() if hasattr(filters, 'dict') else {})
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
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
    
    cur.close()
    conn.close()
    
    return {
        "labels": [r['purchase_month'] for r in results],
        "amounts": [float(r['amount']) for r in results],
        "quantities": [float(r['quantity']) if r['quantity'] else 0 for r in results]
    }


@app.post("/api/charts/regions")
def get_regions(filters: FilterParams = None):
    """Топ-10 регионов по сумме контрактов (POST)"""
    if filters is None:
        filters = FilterParams()

    where_clause, params = build_filter_clause(filters.dict() if hasattr(filters, 'dict') else {})

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

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

    cur.close()
    conn.close()

    return {
        "labels": [r['region'] for r in results],
        "amounts": [float(r['amount']) for r in results],
        "counts": [int(r['count']) for r in results],
        "total": float(total) if total else 0
    }


@app.post("/api/charts/suppliers")
def get_suppliers(filters: FilterParams = None):
    """Топ-5 поставщиков + Остальные (POST)"""
    if filters is None:
        filters = FilterParams()
    
    where_clause, params = build_filter_clause(filters.dict() if hasattr(filters, 'dict') else {})
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
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
    
    cur.close()
    conn.close()
    
    return {
        "top5": {
            "labels": [r['distributor'] for r in results],
            "amounts": [float(r['amount']) for r in results]
        },
        "others": others,
        "total": float(total)
    }


@app.post("/api/charts/categories")
def get_categories(filters: FilterParams = None):
    """Категории товаров (Что закупали) (POST)"""
    if filters is None:
        filters = FilterParams()
    
    where_clause, params = build_filter_clause(filters.dict() if hasattr(filters, 'dict') else {})
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
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
    
    cur.close()
    conn.close()
    
    return {
        "labels": [r['what_purchased'] for r in results],
        "amounts": [float(r['amount']) for r in results]
    }


@app.post("/api/charts/heatmap")
def get_heatmap(filters: FilterParams = None):
    """
    Тепловая карта: доля товаров по месяцам (POST)
    
    Возвращает матрицу:
    - rows: товары
    - columns: месяцы
    - values: % доли в месяце
    """
    if filters is None:
        filters = FilterParams()
    
    where_clause, params = build_filter_clause(filters.dict() if hasattr(filters, 'dict') else {})
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Получаем сумму по каждому товару в каждом месяце
    query = f"""
    SELECT 
        what_purchased,
        purchase_month,
        SUM(amount_rub) as amount
    FROM purchases
    {where_clause}
    GROUP BY what_purchased, purchase_month
    ORDER BY what_purchased, purchase_month
    """
    
    cur.execute(query, params)
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
    
    cur.close()
    conn.close()
    
    # Формируем матрицу
    products = list(set(r['what_purchased'] for r in results))
    months = sorted(set(r['purchase_month'] for r in results))
    
    # Создаём матрицу с процентами
    matrix = []
    for product in products[:20]:  # Ограничиваем топ-20 товаров
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
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT DISTINCT year FROM purchases WHERE year IS NOT NULL ORDER BY year")
    years = [row[0] for row in cur.fetchall()]
    cur.close()
    conn.close()
    return years


@app.get("/api/filters/months")
def get_months():
    """Доступные месяцы (1-12)"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT DISTINCT EXTRACT(MONTH FROM TO_DATE(purchase_month, 'YYYY-MM')) as month
        FROM purchases
        ORDER BY month
    """)
    months = [int(row[0]) for row in cur.fetchall()]
    cur.close()
    conn.close()
    return months


@app.get("/api/filters/regions")
def get_regions_list():
    """Доступные регионы"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT DISTINCT region FROM purchases ORDER BY region")
    regions = [row[0] for row in cur.fetchall()]
    cur.close()
    conn.close()
    return regions


@app.get("/api/filters/customers")
def get_customers_list():
    """Доступные заказчики"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT DISTINCT customer_name FROM purchases ORDER BY customer_name")
    customers = [row[0] for row in cur.fetchall()]
    cur.close()
    conn.close()
    return customers


@app.get("/api/filters/suppliers")
def get_suppliers_list():
    """Доступные поставщики"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT DISTINCT distributor FROM purchases ORDER BY distributor")
    suppliers = [row[0] for row in cur.fetchall()]
    cur.close()
    conn.close()
    return suppliers


@app.get("/api/filters/products")
def get_products_list():
    """Доступные товары"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT DISTINCT what_purchased FROM purchases ORDER BY what_purchased")
    products = [row[0] for row in cur.fetchall()]
    cur.close()
    conn.close()
    return products


# ============================================================================
# Health check
# ============================================================================

@app.get("/api/health")
def health_check():
    """Проверка подключения к БД"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM purchases")
        count = cur.fetchone()[0]
        cur.close()
        conn.close()
        return {"status": "ok", "records": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def root():
    """Корневой endpoint"""
    return {
        "message": "CGM Dashboard API",
        "docs": "/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
