# 📝 Changelog

Все значимые изменения в проекте CGM Dashboard.

---

## [1.1.1] - 2026-03-08

### 🎨 UI/UX улучшения

#### Стили выпадающих меню фильтров
- **Исправлено:** Стили dropdown меню Autocomplete не применялись
- **Проблема:** Стили `& .MuiPaper-root` внутри `sx` не работали, т.к. Menu рендерится через Portal
- **Решение:** Использован `slotProps.paper` для прямой передачи стилей
- **Изменения:** `frontend/src/components/filters/FilterPanel.tsx`
- **Затронутые фильтры:** Продукты, Регион, Заказчик, Поставщик

**Пример использования:**
```tsx
<Autocomplete
  // ...
  slotProps={{
    paper: {
      sx: {
        background: 'linear-gradient(180deg, #1a3a5c 0%, #0D2B4A 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(255,255,255,0.2)',
        '& .MuiAutocomplete-option': {
          color: '#FFFFFF',
          '&:hover': {
            background: 'rgba(0, 180, 219, 0.2)',
          },
          '&[aria-selected="true"]': {
            background: 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)',
            color: '#FFFFFF',
          },
        },
      },
    },
  }}
/>
```

---

### 🐛 Исправления

#### KPI "Общая сумма закупок"
- **Исправлено:** Дублирование суммы в карточке KPI
- **Проблема:** Сумма отображалась дважды: в `value` и `subtitle`
- **Изменения:** Удалён `subtitle` с дублированием суммы в `KpiPanel.tsx`

**До:**
```tsx
{
  title: 'Общая сумма закупок',
  value: formatCurrency(data.total_amount),
  subtitle: `${formatNumber(data.total_amount)} RUB`, // ← Дубликат
}
```

**После:**
```tsx
{
  title: 'Общая сумма закупок',
  value: formatCurrency(data.total_amount),
}
```

---

### 📊 Диаграммы

#### Топ-5 поставщиков: процент доли
- **Добавлено:** Отображение процента доли топ-5 от общей суммы
- **Изменения:** `frontend/src/components/charts/SuppliersChart.tsx`
- **Логика:** Аналогично `RegionsChart` — вычисление `(top5Sum / total) * 100`

**Пример заголовка:** `🏢 Топ-5 Поставщиков (45.3%)`

**Код:**
```tsx
// Вычисление суммы топ-5
const top5Sum = data.top5.amounts.reduce((sum, val) => sum + val, 0);

// Вычисление процента
const percentage = data.total > 0 
  ? ((top5Sum / data.total) * 100).toFixed(1) 
  : '0';

// В заголовке
<Typography>🏢 Топ-5 Поставщиков ({percentage}%)</Typography>
```

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
- `OPTIMIZATION_PLAN.md` — финальный план с учётом контекста проекта
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

### 📋 Контекст проекта

**Требования заказчика:**
- ✅ Фронтенд не меняется (только косметические правки)
- ✅ База данных не меняется
- ✅ Рост данных: 50-100 строк/месяц
- ✅ Статус: Production, заказчик доволен

**Из этого следует:**
- ❌ Redis кэширование — не требуется (in-memory работает)
- ❌ Рефакторинг backend — не требуется (800 строк — приемлемо)
- ❌ Code Splitting — не требуется (фронтенд не меняется)
- ❌ E2E тесты — не требуется (проект стабильный)

**Рекомендуемые обновления (2 часа):**
1. Обновить backend зависимости — 30 мин
2. Обновить frontend (патчи) — 30 мин
3. Connection Pool для БД — 1 час

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
