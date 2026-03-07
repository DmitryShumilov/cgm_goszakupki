# 🚀 План оптимизации CGM Dashboard

**Дата создания:** 6 марта 2026  
**Последнее обновление:** 7 марта 2026  
**Автор:** Senior Developer Audit  
**Статус:** ✅ **Выполнено: Неделя 1 (Безопасность + Производительность)**

---

## 📋 Обзор

Этот документ содержит приоритизированный план оптимизации проекта CGM Dashboard на основе аудита кода и лучших практик 2025-2026 (FastAPI, React 19, Material-UI v7, TanStack Query 5, Zustand 5).

**Текущее состояние проекта (7 марта 2026):**
- ✅ Backend (FastAPI) — работает стабильно
- ✅ Frontend (React 19) — актуальные версии
- ✅ PostgreSQL 17 — 1802 записи в БД
- ✅ MCP-серверы настроены (15 серверов)
- ✅ **CORS whitelist** — реализовано
- ✅ **Rate Limiting** — реализовано
- ✅ **Кэширование** — in-memory (TTL: 5 мин)
- ✅ **Zustand Persist** — сохранение фильтров
- ⚠️ Redis — отложен до необходимости

---

## 🎯 Приоритеты

| Приоритет | Категория | Срок |
|-----------|-----------|------|
| 🔴 **Высокий** | Безопасность (CORS, Rate Limiting, Secrets) | Неделя 1 |
| 🟡 **Средний** | Производительность (Connection Pool, Redis) | Неделя 2-3 |
| 🟢 **Низкий** | Рефакторинг и оптимизация | Неделя 3-4 |

---

## 🔴 НЕДЕЛЯ 1: Критические улучшения безопасности

### 1.1 Исправление CORS (30 минут)

**Проблема:** В `backend/main.py` используется `allow_origins=["*"]` с `allow_credentials=True` — это уязвимость.

**Файл:** `backend/main.py`

**Текущий код:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ❌ ОПАСНО
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Требуемые изменения:**
```python
import os

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
```

**Файл:** `.env` (добавить переменную):
```bash
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:80
```

**Чеклист:**
- [ ] Обновить `backend/main.py`
- [ ] Добавить `ALLOWED_ORIGINS` в `.env`
- [ ] Добавить `ALLOWED_ORIGINS` в `.env.example`
- [ ] Обновить `docker-compose.yml` для передачи переменной

---

### 1.2 Rate Limiting (1 час)

**Проблема:** Нет ограничения на количество запросов к API.

**Файл:** `backend/requirements.txt` (добавить):
```txt
slowapi>=0.1.9
```

**Файл:** `backend/main.py` (добавить после импортов):
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Инициализация лимитера
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
```

**Применить к endpoints:**
```python
@app.get("/api/health")
@limiter.limit("30/minute")
async def health_check(request: Request):
    ...

@app.post("/api/kpi")
@limiter.limit("60/minute")
async def get_kpi(request: Request, filters: Optional[FilterParams] = None):
    ...
```

**Чеклист:**
- [ ] Добавить `slowapi` в `requirements.txt`
- [ ] Добавить импорты в `main.py`
- [ ] Применить декораторы `@limiter.limit` ко всем endpoints
- [ ] Протестировать: `for i in {1..100}; do curl http://localhost:8000/api/health; done`

---

### 1.3 Docker Secrets для production (2 часа)

**Проблема:** Пароли хранятся в `.env` без шифрования.

**Файл:** `docker-compose.yml` (обновить секцию secrets):
```yaml
services:
  backend:
    secrets:
      - db_password
      - jwt_secret
    environment:
      POSTGRES_HOST: postgres
      POSTGRES_PORT: 5432
      # ... остальные переменные

  postgres:
    secrets:
      - db_password

secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
```

**Файл:** `.env` (добавить):
```bash
# Для локальной разработки (не коммитить!)
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_jwt_secret_here
```

**Чеклист:**
- [ ] Обновить `docker-compose.yml`
- [ ] Создать Docker secrets в production
- [ ] Обновить `DEPLOYMENT.md` с инструкциями

---

## 🟡 НЕДЕЛЯ 2: Производительность базы данных

### 2.1 Connection Pool для PostgreSQL (2 часа)

**Проблема:** Прямое создание подключений без пулинга.

**Файл:** `backend/main.py` (заменить функцию `get_db_connection`):
```python
import psycopg2.pool
from contextlib import contextmanager

# Глобальный пул соединений (после DB_CONFIG)
connection_pool = psycopg2.pool.SimpleConnectionPool(
    1,  # minconn
    20, # maxconn
    **DB_CONFIG
)

@contextmanager
def get_db_connection():
    conn = connection_pool.getconn()
    try:
        yield conn
    finally:
        connection_pool.putconn(conn)
```

**Обновить функцию закрытия:**
```python
@app.on_event("shutdown")
def shutdown_db_pool():
    if connection_pool:
        connection_pool.closeall()
        logger.info("Database connection pool closed")
```

**Чеклист:**
- [ ] Добавить `psycopg2.pool` импорт
- [ ] Создать `connection_pool`
- [ ] Обновить `get_db_connection()`
- [ ] Добавить `shutdown_db_pool()`
- [ ] Протестировать нагрузку (100+ запросов)

---

### 2.2 Индексы базы данных (1 час)

**✅ ВЫПОЛНЕНО 6 марта 2026**

**Созданные индексы:**

| Индекс | Поля | Размер | Назначение |
|--------|------|--------|------------|
| `idx_distributor_amount` | distributor, amount_rub | 160 kB | GROUP BY distributor |
| `idx_region_amount` | region, amount_rub | 96 kB | GROUP BY region |
| `idx_customer` | customer_name | 88 kB | Фильтр по заказчикам |
| `idx_what_purchased_amount` | what_purchased, amount_rub | 88 kB | GROUP BY what_purchased |
| `purchases_pkey` | id | 56 kB | Primary key |
| `idx_distributor` | distributor | 56 kB | Фильтр по поставщикам |
| `idx_amount_rub` | amount_rub | 56 kB | SUM/AVG запросы |
| `idx_quantity` | quantity | 56 kB | SUM quantity запросы |
| `idx_region` | region | 40 kB | Фильтр по регионам |
| `idx_year` | year | 40 kB | Фильтр по годам |
| `idx_what_purchased` | what_purchased | 40 kB | Фильтр по товарам |
| `idx_purchase_date` | purchase_date | 40 kB | Фильтр по дате |
| `idx_month` | purchase_month | 32 kB | Фильтр по месяцам |

**Общий размер индексов:** 848 kB

**Производительность запросов:**
- KPI запрос (year IN): 0.356 ms
- Группировка по регионам: 0.917 ms
- Группировка по поставщикам: 0.573 ms

**Файлы:**
- `backend/create_indexes.sql` — SQL скрипт
- `backend/create_indexes.py` — Python скрипт для применения

**Чеклист:**
- [x] Запустить `python backend/create_indexes.py`
- [x] Проверить индексы через `SELECT * FROM pg_indexes WHERE tablename = 'purchases'`
- [x] Замерить время запросов до/после

---

### 2.3 Zustand Persist Middleware (1 час)

**✅ ВЫПОЛНЕНО 6 марта 2026**

**Проблема:** Фильтры сбрасываются при перезагрузке страницы.

**Решение:** Добавлен `persist` middleware для сохранения выбранных фильтров в localStorage.

**Изменения в `frontend/src/stores/filterStore.ts`:**
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      // ... state ...
    }),
    {
      name: 'cgm-filter-storage', // Ключ в localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Сохраняем только выбранные фильтры
        selectedYears: state.selectedYears,
        selectedMonths: state.selectedMonths,
        selectedRegions: state.selectedRegions,
        selectedCustomers: state.selectedCustomers,
        selectedSuppliers: state.selectedSuppliers,
        selectedProducts: state.selectedProducts,
      }),
    }
  )
);
```

**Что сохраняется:**
- `selectedYears` — выбранные года
- `selectedMonths` — выбранные месяцы
- `selectedRegions` — выбранные регионы
- `selectedCustomers` — выбранные заказчики
- `selectedSuppliers` — выбранные поставщики
- `selectedProducts` — выбранные товары

**Что НЕ сохраняется:**
- `availableYears` и другие справочники (загружаются из API при старте)

**Чеклист:**
- [x] Обновить `filterStore.ts`
- [x] Протестировать: выбрать фильтры → перезагрузить страницу → проверить сохранение
- [x] Сборка без ошибок (`npm run build`)
- [x] TypeScript проверка без ошибок

---

## 🟡 НЕДЕЛЯ 3: Кэширование и рефакторинг

### 3.1 Redis для кэширования (4 часа)

**Проблема:** In-memory кэш не работает при масштабировании.

**Файл:** `docker-compose.yml` (добавить сервис):
```yaml
redis:
  image: redis:7-alpine
  container_name: cgm-redis
  restart: unless-stopped
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
    timeout: 5s
    retries: 5

volumes:
  redis_data:
    driver: local
```

**Файл:** `backend/requirements.txt` (добавить):
```txt
redis>=5.0.0
```

**Файл:** `backend/main.py` (добавить Redis cache):
```python
import redis.asyncio as redis
import json

# Глобальный Redis клиент
redis_client: redis.Redis = None

@app.on_event("startup")
async def startup_redis():
    global redis_client
    redis_client = redis.Redis(
        host=os.getenv('REDIS_HOST', 'localhost'),
        port=int(os.getenv('REDIS_PORT', 6379)),
        decode_responses=True,
        protocol=3
    )
    logger.info("Redis connected")

@app.on_event("shutdown")
async def shutdown_redis():
    if redis_client:
        await redis_client.close()
        logger.info("Redis connection closed")

# Декоратор для кэширования
def cached(ttl: int = 300):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            key = f"{func.__name__}:{str(kwargs)}"
            cached_result = await redis_client.get(key)
            if cached_result:
                return json.loads(cached_result)
            result = await func(*args, **kwargs)
            await redis_client.setex(key, ttl, json.dumps(result))
            return result
        return wrapper
    return decorator
```

**Файл:** `.env` (добавить):
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Чеклист:**
- [ ] Добавить Redis в `docker-compose.yml`
- [ ] Добавить `redis` в `requirements.txt`
- [ ] Обновить `main.py` с Redis подключением
- [ ] Применить `@cached` к endpoints: `get_kpi`, `get_dynamics`, `get_regions`, etc.
- [ ] Протестировать: первый запрос > 100ms, кэшированный < 10ms

---

### 3.2 Рефакторинг backend на модули (8 часов)

**Проблема:** Весь код в одном файле `main.py` (600+ строк).

**Новая структура:**
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Точка входа
│   ├── config.py            # Настройки
│   ├── database.py          # БД пул
│   ├── cache.py             # Redis кэш
│   ├── models/
│   │   ├── __init__.py
│   │   └── filters.py       # Pydantic модели
│   ├── api/
│   │   ├── __init__.py
│   │   ├── kpi.py           # KPI endpoints
│   │   ├── charts.py        # Charts endpoints
│   │   └── filters.py       # Filters endpoints
│   └── services/
│       ├── __init__.py
│       ├── kpi_service.py   # Бизнес-логика KPI
│       └── chart_service.py # Бизнес-логика Charts
├── tests/
├── requirements.txt
└── Dockerfile
```

**Чеклист:**
- [ ] Создать структуру папок
- [ ] Переместить Pydantic модели в `app/models/filters.py`
- [ ] Переместить endpoints в `app/api/*.py`
- [ ] Вынести бизнес-логику в `app/services/*.py`
- [ ] Обновить импорты в `main.py`
- [ ] Запустить все тесты
- [ ] Проверить работу через Swagger UI

---

### 3.3 Code Splitting для диаграмм (2 часа)

**Файл:** `frontend/src/App.tsx` (обновить импорты):
```typescript
import { lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

const DynamicsChart = lazy(() => import('./components/charts/DynamicsChart'));
const RegionsChart = lazy(() => import('./components/charts/RegionsChart'));
const SuppliersChart = lazy(() => import('./components/charts/SuppliersChart'));
const CategoriesChart = lazy(() => import('./components/charts/CategoriesChart'));
const HeatmapChart = lazy(() => import('./components/charts/HeatmapChart'));

// В компоненте DashboardContent:
<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2, mb: 2 }}>
  <Suspense fallback={<CircularProgress />}>
    <DynamicsChart data={dynamicsData || null} loading={dynamicsLoading} />
  </Suspense>
  <Suspense fallback={<CircularProgress />}>
    <RegionsChart data={regionsData || null} loading={regionsLoading} />
  </Suspense>
</Box>
```

**Чеклист:**
- [ ] Обновить `App.tsx` с lazy импортами
- [ ] Протестировать загрузку через DevTools → Network
- [ ] Проверить размеры чанков: `npm run build`

---

## 🟢 НЕДЕЛЯ 4: Дополнительные оптимизации

### 4.1 Мемоизация компонентов (1 час)

**Файл:** `frontend/src/components/charts/DynamicsChart.tsx`:
```typescript
import { memo } from 'react';

export const DynamicsChart = memo(({ data, loading }: Props) => {
  // ... component logic
});

DynamicsChart.displayName = 'DynamicsChart';
```

**Повторить для:** `RegionsChart`, `SuppliersChart`, `CategoriesChart`, `HeatmapChart`, `KpiPanel`

**Чеклист:**
- [ ] Применить `React.memo` ко всем компонентам диаграмм
- [ ] Протестировать через React DevTools Profiler

---

### 4.2 Vite: Оптимизация сборки (30 минут)

**Файл:** `frontend/vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          ui: ['@mui/material', '@mui/icons-material'],
          utils: ['axios', '@tanstack/react-query', 'zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
})
```

**Чеклист:**
- [ ] Обновить `vite.config.ts`
- [ ] Запустить `npm run build`
- [ ] Проверить размеры чанков в `dist/`

---

### 4.3 Обновление зависимостей (1 час)

**Файл:** `backend/requirements.txt`:
```txt
fastapi>=0.115.0,<1.0.0
uvicorn[standard]>=0.34.0,<1.0.0
psycopg2-binary>=2.9.11,<3.0.0
pydantic>=2.11.0,<3.0.0
pydantic-settings>=2.8.0
python-dotenv>=1.0.0
slowapi>=0.1.9
redis>=5.0.0

# Testing
pytest>=8.0.0
pytest-asyncio>=0.23.0
httpx>=0.26.0
pytest-cov>=4.1.0
```

**Файл:** `frontend/package.json` (проверить актуальность):
```bash
npx npm-check-updates -u
npm install
```

**Чеклист:**
- [ ] Обновить `requirements.txt`
- [ ] Запустить `pip install -r requirements.txt`
- [ ] Протестировать backend
- [ ] Обновить frontend зависимости
- [ ] Протестировать frontend

---

### 4.4 Интеграционные тесты (4 часа)

**Файл:** `backend/tests/test_integration.py`:
```python
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"

@pytest.mark.asyncio
async def test_kpi_no_filters():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/kpi", json={})
        assert response.status_code == 200
        data = response.json()
        assert "total_amount" in data

@pytest.mark.asyncio
async def test_kpi_with_year_filter():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/kpi", json={"years": [2024]})
        assert response.status_code == 200
```

**Чеклист:**
- [ ] Создать `test_integration.py`
- [ ] Добавить тесты для всех endpoints
- [ ] Запустить `pytest tests/ --cov=app`
- [ ] Проверить coverage > 80%

---

### 4.5 E2E тесты критических путей (3 часа)

**Файл:** `frontend/tests/e2e/critical-path.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test('дашборд загружается успешно', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Общая сумма закупок')).toBeVisible({ timeout: 10000 });
});

test('KPI карточки отображаются', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Количество контрактов')).toBeVisible();
});

test('фильтр по году работает', async ({ page }) => {
  await page.goto('/');
  const yearButton = page.getByText('2025').first();
  await expect(yearButton).toBeVisible();
  await yearButton.click();
  await expect(yearButton).toHaveClass(/contained|active/);
});

test('мобильная версия', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await expect(page).toHaveTitle(/CGM/);
});
```

**Чеклист:**
- [ ] Создать `critical-path.spec.ts`
- [ ] Запустить `npm run test:e2e`
- [ ] Проверить отчёт: `npm run test:e2e:report`

---

## 📊 Метрики успеха

| Метрика | До | После | Цель |
|---------|-----|-------|------|
| **Backend** |
| Время ответа API (p95) | <500ms | <200ms | ✅ |
| Coverage тестов | ~60% | 80%+ | ✅ |
| **Frontend** |
| Время загрузки (LCP) | <3s | <1.5s | ✅ |
| Bundle size (gzip) | ~250KB | <200KB | ✅ |
| Lighthouse Performance | ~85 | 95+ | ✅ |
| **Безопасность** |
| CORS | ❌ `["*"]` | ✅ Whitelist | ✅ |
| Rate Limiting | ❌ Нет | ✅ 60/min | ✅ |
| Secrets | ❌ .env | ✅ Docker Secrets | ✅ |

---

## 📝 История изменений

| Дата | Изменение | Статус |
|------|-----------|--------|
| 2026-03-06 | Создание документа | ✅ Черновик |
| **2026-03-07** | **Выполнена Неделя 1 (Безопасность + Производительность)** | ✅ **Завершено** |

---

## ✅ Выполненные работы (7 марта 2026)

### Неделя 1: Безопасность и Производительность

#### 🔒 Безопасность

**1.1 CORS whitelist** — ✅ Выполнено
- Изменено: `backend/main.py`
- Добавлено: `ALLOWED_ORIGINS` в `.env` и `.env.example`
- Лимиты: `http://localhost:5173,http://localhost:80`
- Методы: `GET, POST, OPTIONS`

**1.2 Rate Limiting** — ✅ Выполнено
- Добавлен: `slowapi>=0.1.9` в `requirements.txt`
- Лимиты: 30/min (health, root), 60/min (API endpoints)
- Обработчик ошибок: `_rate_limit_exceeded_handler`

**1.3 Docker Secrets** — ⏸ Отложено
- Не требуется для локальной разработки
- Будет реализовано при развёртывании в production

#### ⚡ Производительность

**2.1 Кэширование** — ✅ Выполнено (оптимизировано)
- Реализовано: `SimpleCache` (in-memory с TTL)
- TTL: 300 секунд (5 минут)
- Время ответа: **<300ms** (было 50+ сек из-за Redis timeout)
- Redis: отложен до необходимости (сложность не оправдана)

**2.2 Индексы БД** — ✅ Выполнено (ранее)
- Созданы: 12 индексов
- Общий размер: 848 kB
- Время запросов: <1ms

**2.3 Zustand Persist** — ✅ Выполнено
- Добавлен: `persist` middleware в `filterStore.ts`
- Storage: `safeStorage` (SSR-safe, проверка window)
- Сохраняемые данные: `selectedYears`, `selectedMonths`, `selectedRegions`, etc.
- Ключ localStorage: `cgm-filter-storage`

#### 📝 Дополнительные улучшения

- **Валидация данных:** Pydantic модели с проверкой типов (годы, месяцы, строки, даты)
- **Логирование:** Время обработки запросов в `app.log`
- **Error handling:** Детальные сообщения об ошибках (422, 500)
- **Удалён asyncio:** Исправлен конфликт с встроенным модулем

### Метрики после оптимизации

| Метрика | До | После | Улучшение |
|---------|-----|-------|-----------|
| **Время ответа KPI** | 50+ сек | **0.29 сек** | **172x** |
| **Время ответа Charts** | 50+ сек | **0.26 сек** | **192x** |
| **CORS** | `["*"]` | Whitelist | ✅ |
| **Rate Limiting** | Нет | 60/min | ✅ |
| **Кэширование** | Redis (50 сек) | In-memory (<1мс) | ✅ |
| **Фильтры persist** | Нет | localStorage | ✅ |

---

## 🔗 Связанные документы

- [README.md](../README.md) — Общая документация
- [DEPLOYMENT.md](../DEPLOYMENT.md) — Развёртывание
- [TESTING.md](TESTING.md) — Руководство по тестам
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — Устранение проблем

---

## ✅ Согласование

**Перед началом работ:**
1. Прочитать этот документ
2. Обсудить приоритеты с командой
3. Получить подтверждение на каждую неделю работ
4. Создать ветку `feature/optimization-week-1` и т.д.

**После каждой недели:**
1. Закоммитить изменения
2. Обновить статус в таблице выше
3. Протестировать функциональность
4. Обновить документ (если нужны корректировки)
