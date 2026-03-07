# 📝 Changelog

Все значимые изменения в проекте CGM Dashboard.

---

## [1.1.0] - 2026-03-07

### 🔒 Безопасность

#### CORS Whitelist
- **Исправлено:** Уязвимость CORS с `allow_origins=["*"]`
- **Изменения:**
  - `backend/main.py` — whitelist доменов из `.env`
  - `.env` — добавлена переменная `ALLOWED_ORIGINS`
  - `.env.example` — добавлен пример
- **Лимиты:** `http://localhost:5173,http://localhost:80`
- **Методы:** `GET, POST, OPTIONS`

#### Rate Limiting
- **Добавлено:** Защита от DDoS через `slowapi`
- **Изменения:**
  - `backend/requirements.txt` — добавлен `slowapi>=0.1.9`
  - `backend/main.py` — декораторы `@limiter.limit`
- **Лимиты:**
  - `/api/health`, `/` — 30 запросов/минуту
  - `/api/kpi`, `/api/charts/*` — 60 запросов/минуту

#### Валидация данных
- **Улучшено:** Pydantic модели с проверкой типов
- **Проверки:**
  - Годы: 1900-2100
  - Месяцы: 1-12
  - Строки: макс. 500 символов
  - Даты: формат YYYY-MM-DD
  - Диапазон дат: `date_to >= date_from`

---

### ⚡ Производительность

#### Кэширование
- **Оптимизировано:** Устранена задержка 50+ секунд
- **Проблема:** Redis `socket_connect_timeout=5` сек вызывал задержки
- **Решение:** Возвращён in-memory `SimpleCache` с TTL 5 минут
- **Результат:** Время ответа **<300ms** (улучшение в 172 раза)
- **Изменения:**
  - `backend/main.py` — `SimpleCache` класс
  - `backend/requirements.txt` — удалён `redis>=5.0.0`

#### Индексы БД
- **Создано:** 12 индексов для оптимизации запросов
- **Общий размер:** 848 kB
- **Время запросов:** <1ms
- **Файлы:** `backend/create_indexes.sql`, `backend/create_indexes.py`

---

### 🔄 Frontend

#### Zustand Persist Middleware
- **Добавлено:** Сохранение фильтров в localStorage
- **Изменения:** `frontend/src/stores/filterStore.ts`
- **Функции:**
  - `persist` middleware с `safeStorage`
  - SSR-safe проверка `window.localStorage`
  - Сохранение: `selectedYears`, `selectedMonths`, `selectedRegions`, etc.
- **Ключ:** `cgm-filter-storage`

#### SSR-Safe Storage
- **Исправлено:** Ошибка `localStorage is not defined` при SSR
- **Решение:** Обёртка `safeStorage` с проверкой `typeof window`

---

### 📝 Документация

#### Обновлённые файлы
- `README.md` — раздел "Этап 6: Безопасность и производительность"
- `DEPLOYMENT.md` — переменные окружения, безопасность
- `TROUBLESHOOTING.md` — диагностика производительности
- `OPTIMIZATION_PLAN.md` — выполненные работы (Неделя 1)
- `docs/API.md` — кэширование, лимиты

#### Новые файлы
- `CHANGELOG.md` — история изменений

---

### 🐛 Исправления

#### Критические
- **Удалён `asyncio>=3.4.3`** из `requirements.txt`
  - Конфликт с встроенным модулем Python
- **Восстановлен импорт `logging`** в `backend/main.py`
  - Ошибка `NameError: name 'logging' is not defined`

#### Производительность
- **Redis timeout:** Уменьшен с 5 сек до 0.5 сек
- **In-memory кэш:** Восстановлён вместо Redis

---

### 🔧 Технические изменения

#### Зависимости
**Добавлено:**
- `slowapi>=0.1.9` — Rate Limiting

**Удалено:**
- `asyncio>=3.4.3` — конфликт с встроенным модулем
- `redis>=5.0.0` — не требуется для in-memory кэша

#### Конфигурация
**`.env`:**
```bash
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:80
REDIS_HOST=localhost  # опционально
REDIS_PORT=6379       # опционально
```

**`.env.example`:**
- Добавлены примеры `ALLOWED_ORIGINS`, `REDIS_HOST`, `REDIS_PORT`

---

### 📊 Метрики

| Метрика | До (7 марта) | После | Улучшение |
|---------|--------------|-------|-----------|
| **Время ответа KPI** | 50+ сек | 0.29 сек | **172x** |
| **Время ответа Charts** | 50+ сек | 0.26 сек | **192x** |
| **CORS** | `["*"]` уязвимость | Whitelist | ✅ |
| **Rate Limiting** | Нет | 60/min | ✅ |
| **Кэширование** | Redis (50 сек) | In-memory (<1мс) | ✅ |
| **Фильтры persist** | Нет | localStorage | ✅ |

---

## [1.0.0] - 2026-03-06

### Первоначальный релиз

#### Backend
- FastAPI сервер с 14 endpoints
- PostgreSQL подключение через psycopg2
- In-memory кэширование (SimpleCache)
- Логирование запросов

#### Frontend
- React 19 + TypeScript
- Material-UI v7 компоненты
- Recharts диаграммы (5 шт.)
- Zustand store для фильтров
- TanStack Query для data fetching

#### База данных
- PostgreSQL 17.2
- Таблица `purchases` (1802 записи)
- 12 индексов для производительности

#### Функционал
- 6 KPI метрик
- 5 интерактивных диаграмм
- 6 фильтров (год, месяц, регион, заказчик, поставщик, продукт)
- Адаптивная вёрстка (mobile/tablet/desktop)
- Автообновление данных (5 минут)

---

## Формат версий

Проект использует [Semantic Versioning](https://semver.org/lang/ru/):

- **MAJOR** — обратно несовместимые изменения
- **MINOR** — новая функциональность (обратно совместима)
- **PATCH** — исправления багов (обратно совместимы)

---

## Контакты

По вопросам обращайтесь к команде разработки CGM Dashboard.
