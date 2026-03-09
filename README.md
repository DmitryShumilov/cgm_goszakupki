# 📊 CGM Dashboard - Проект госзакупок

## 🎯 Описание

Веб-дашборд для визуализации данных о госзакупках CGM с интерактивными фильтрами, KPI метриками и диаграммами.

**Статус проекта:** ✅ Готов к production использованию

---

## ⚡ Быстрый старт (для новых разработчиков)

**Первый запуск проекта:**

```powershell
# 1. Установка зависимостей
.\install_project.ps1

# 2. Проверка конфигурации
.\check_project.ps1

# 3. Запуск проекта
.\start_project.ps1
```

**Откройте в браузере:** http://localhost:5173

📖 **Подробная инструкция:** [QUICKSTART.md](QUICKSTART.md)

---

## 🏗 Архитектура

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│  Excel файл     │ --> │  PostgreSQL  │ --> │  FastAPI    │ --> │  React   │
│  database.xlsx  │     │  cgm_dashboard│    │  (8000)     │     │  (5173)  │
└─────────────────┘     └──────────────┘     └─────────────┘     └──────────┘
```

---

## 📁 Структура проекта

```
cgm_goszakupki/
├── 📄 Скрипты автоматизации
│   ├── install_project.ps1       # Установка зависимостей
│   ├── start_project.ps1         # Запуск проекта
│   ├── stop_project.ps1          # Остановка проекта
│   ├── check_project.ps1         # Проверка конфигурации
│   ├── setup_encoding.ps1        # Настройка UTF-8 кодировки
│   ├── convert_to_utf8bom.ps1    # Конвертация в UTF-8 с BOM
│   └── profile_template.ps1      # Шаблон профиля PowerShell
│
├── 📄 Конфигурация
│   ├── .env                      # Переменные окружения
│   ├── .env.example              # Шаблон конфигурации
│   ├── .editorconfig             # Стандарты кодировки
│   └── docker-compose.yml        # Docker конфигурация
│
├── 📊 Данные
│   ├── database.xlsx             # Исходный Excel файл
│   └── import_excel_to_pg.py     # Скрипт импорта данных
│
├── 🖥 Backend (Python/FastAPI)
│   ├── backend/
│   │   ├── main.py               # API сервер
│   │   ├── requirements.txt      # Python зависимости
│   │   └── logs/                 # Логи сервера
│
├── 🌐 Frontend (React/Vite)
│   ├── frontend/
│   │   ├── src/                  # Исходный код
│   │   │   ├── api/              # API клиент
│   │   │   ├── components/       # React компоненты
│   │   │   ├── stores/           # Zustand store
│   │   │   ├── App.tsx           # Главный компонент
│   │   │   └── main.tsx          # Точка входа
│   │   ├── package.json          # Node.js зависимости
│   │   └── vite.config.ts        # Конфигурация Vite
│
├── 📚 Документация
│   ├── README.md                 # Этот файл
│   ├── QUICKSTART.md             # Быстрый старт
│   ├── TROUBLESHOOTING_RUN.md    # Решение проблем запуска
│   ├── DEVELOPMENT.md            # Руководство разработчика
│   └── docs/                     # Подробная документация
│       ├── POWERSHELL_ENCODING.md # Настройка UTF-8
│       ├── API.md                # API документация
│       ├── DATABASE.md           # База данных
│       └── ...
│
└── 📝 Логи
    └── logs/                     # Логи backend и frontend
```

---

## 📚 Документация

### Для быстрого старта
| Документ | Описание |
|----------|----------|
| [**QUICKSTART.md**](QUICKSTART.md) | ⚡ Быстрый старт за 5 минут |
| [**TROUBLESHOOTING_RUN.md**](TROUBLESHOOTING_RUN.md) | 🔧 Решение проблем при запуске |
| [**DEVELOPMENT.md**](DEVELOPMENT.md) | 🛠 Руководство разработчика |

### Настройка окружения
| Документ | Описание |
|----------|----------|
| [**docs/POWERSHELL_ENCODING.md**](docs/POWERSHELL_ENCODING.md) | 🔧 Настройка UTF-8 кодировки PowerShell |

### Основная документация
| Документ | Описание |
|----------|----------|
| [API.md](docs/API.md) | Полная документация по API endpoints |
| [DATABASE.md](docs/DATABASE.md) | Схема БД, индексы, миграции |
| [FRONTEND_ARCH.md](docs/FRONTEND_ARCH.md) | Архитектура frontend приложения |
| [TESTING.md](docs/TESTING.md) | Руководство по тестированию |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Устранение распространённых проблем |
| [QA_AUDIT.md](docs/QA_AUDIT.md) | 📊 Отчёт об аудите качества (92.15/100) |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Развёртывание и Docker |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Руководство для разработчиков |
| [OPTIMIZATION_PLAN.md](docs/OPTIMIZATION_PLAN.md) | 📋 План оптимизации проекта |

---

## 🚀 Быстрый старт

### Предварительные требования

- **Python 3.14+**
- **PostgreSQL 17+**
- **Node.js 18+**
- **npm**

### Шаг 1: Запуск PostgreSQL

```powershell
# Если PostgreSQL не запущен
& "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" -D "C:\pg_data" start
```

### Шаг 2: Импорт данных (если не импортированы)

**Вариант А: Быстрое обновление (для пользователя)**

```powershell
# Дважды кликните на файл update_database.bat
# ИЛИ в PowerShell:
.\update_database.bat
```

**Вариант Б: Ручной запуск скрипта**

```bash
cd C:\Dashboards\cgm_goszakupki
python import_excel_to_pg.py
```

📄 **Подробная инструкция:** [docs/UPDATE_INSTRUCTION.md](docs/UPDATE_INSTRUCTION.md)

### Шаг 3: Запуск Backend API

```bash
cd backend
pip install fastapi uvicorn psycopg2-binary pydantic
python main.py
```

API доступен по адресу: **http://localhost:8000**  
Swagger документация: **http://localhost:8000/docs**

### Шаг 4: Запуск Frontend

```bash
cd frontend
npm install
npm run dev
```

Дашборд доступен по адресу: **http://localhost:5173**

---

## 📊 Функционал

### KPI метрики (6 карточек)

| Метрика | Описание |
|---------|----------|
| Общая сумма закупок | SUM(amount_rub) |
| Количество контрактов | COUNT(*) |
| Средняя сумма контракта | SUM / COUNT |
| Общий объём (шт) | SUM(quantity) |
| Средняя цена за единицу | SUM(amount) / SUM(quantity) |
| Количество заказчиков | COUNT(DISTINCT customer) |

### Фильтры

- **Год закупки** - Сетка кнопок (2024-2034)
- **Месяц закупки** - Сетка кнопок (12 месяцев)
- **Регион** - Мультивыбор с поиском (стильное dropdown меню)
- **Заказчик** - Мультивыбор с поиском (стильное dropdown меню)
- **Поставщик** - Мультивыбор с поиском (стильное dropdown меню)
- **Что закупали** - Мультивыбор с поиском (стильное dropdown меню)

### Диаграммы

1. **Динамика закупок** - Комбо: сумма (столбцы) + количество (линия)
2. **Топ-10 регионов** - Горизонтальный bar chart с % доли от общей суммы
3. **Топ-5 поставщиков** - Круговая + Остальные с % доли в заголовке (адаптивная легенда)
4. **Что закупали** - Круговая (Топ-7 категорий)
5. **Тепловая карта** - Матрица: товары × месяцы (%)

---

## 📡 API Endpoints

### KPI

```
GET /api/kpi?years=2024,2025&regions=Москва
```

### Диаграммы

```
GET /api/charts/dynamics
GET /api/charts/regions
GET /api/charts/suppliers
GET /api/charts/categories
GET /api/charts/heatmap
```

### Фильтры

```
GET /api/filters/years
GET /api/filters/months
GET /api/filters/regions
GET /api/filters/customers
GET /api/filters/suppliers
GET /api/filters/products
```

### Health check

```
GET /api/health
```

---

## 🗄 Модель данных

### Таблица `purchases`

| Колонка | Тип | Описание |
|---------|-----|----------|
| `id` | SERIAL | ID записи |
| `customer_name` | TEXT | Заказчик |
| `region` | TEXT | Регион |
| `what_purchased` | TEXT | Что закупали |
| `price_rub` | REAL | Цена за единицу |
| `quantity` | REAL | Количество |
| `amount_rub` | REAL | Сумма контракта |
| `distributor` | TEXT | Поставщик |
| `year` | INTEGER | Год закупки |
| `purchase_date` | DATE | Дата закупки |
| `purchase_month` | TEXT | Месяц (YYYY-MM) |

---

## 🛠 Технологии

### Backend

| Компонент | Версия | Назначение |
|-----------|--------|------------|
| Python | 3.14 | Язык программирования |
| FastAPI | 0.133.1 | Web фреймворк |
| Uvicorn | 0.41.0 | ASGI сервер |
| psycopg2 | 2.9.11 | PostgreSQL драйвер |
| pydantic | 2.5.3 | Валидация данных |
| slowapi | 0.1.9 | Rate Limiting |
| python-dotenv | 1.0.0 | Переменные окружения |

### Frontend

| Компонент | Версия | Назначение |
|-----------|--------|------------|
| React | 19.2.0 | UI библиотека |
| TypeScript | 5.9.3 | Типизация |
| Vite | 7.3.1 | Сборщик |
| Material-UI | 7.3.8 | UI компоненты |
| Recharts | 3.7.0 | Диаграммы |
| Zustand | 5.0.11 | State manager (с persist) |
| TanStack Query | 5.90.21 | Data fetching |
| Axios | 1.13.6 | HTTP клиент |

### Database

| Компонент | Версия | Назначение |
|-----------|--------|------------|
| PostgreSQL | 17.2 | СУБД |

---

## 📝 Скрипты

### import_excel_to_pg.py

Импорт данных из Excel в PostgreSQL.

```bash
python import_excel_to_pg.py
```

### setup_database.py

Создание базы данных.

```bash
python setup_database.py
```

---

## 🔧 Устранение проблем

### PostgreSQL не запускается

```powershell
# Проверка статуса
& "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" status -D "C:\pg_data"

# Запуск
& "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" start -D "C:\pg_data"
```

### API не отвечает

1. Проверьте PostgreSQL: `http://localhost:8000/api/health`
2. Перезапустите backend: `python backend/main.py`

### Frontend не загружается

1. Проверьте backend: `http://localhost:8000/api/health`
2. Проверьте консоль браузера
3. Перезапустите dev-сервер: `npm run dev`

### Ошибки TypeScript

```bash
cd frontend
npm run build
```

Исправьте все ошибки перед запуском.

---

## ✨ Этап 6: Безопасность и производительность (Март 2026)

### Реализованные улучшения (7-8 марта 2026):

#### 🔒 Безопасность
- **CORS whitelist** — Ограничение доменных имён вместо `["*"]`
- **Rate Limiting** — Защита от DDoS (30/min health, 60/min API)
- **Валидация данных** — Pydantic модели с проверкой типов

#### ⚡ Производительность
- **In-memory кэширование** — TTL 5 минут для KPI и charts
- **Оптимизация запросов** — Время ответа <300ms (было 50+ сек)
- **Индексы БД** — 12 индексов, 848 kB, время запросов <1ms

#### 📝 Мониторинг
- **Логирование запросов** — Время обработки, статус коды
- **Health checks** — Проверка подключения к БД
- **Error handling** — Детальные сообщения об ошибках

#### 🔄 Улучшения frontend
- **Zustand Persist** — Сохранение фильтров в localStorage
- **SSR-safe storage** — Безопасная работа с localStorage
- **Адаптивность** — Mobile/tablet/desktop версии

#### 🎨 UI/UX улучшения (8 марта 2026)
- **Стили dropdown меню фильтров** — Исправлено применение стилей для Autocomplete (slotProps.paper)
- **KPI "Общая сумма закупок"** — Удалено дублирование суммы
- **Топ-5 поставщиков** — Добавлен % доли в заголовок (аналогично Топ-10 регионов)

### Контекст проекта:
- ✅ Фронтенд не меняется (только косметические правки)
- ✅ База данных не меняется
- ✅ Рост данных: 50-100 строк/месяц
- ✅ Статус: Production, заказчик доволен

### Обновлённые файлы:
- `backend/main.py` — CORS, Rate Limiting, кэширование
- `backend/requirements.txt` — Добавлен slowapi, обновлены версии
- `frontend/src/stores/filterStore.ts` — Persist middleware
- `frontend/src/components/filters/FilterPanel.tsx` — Стили dropdown меню
- `frontend/src/components/kpi/KpiPanel.tsx` — Исправление дублирования KPI
- `frontend/src/components/charts/SuppliersChart.tsx` — Процент доли топ-5
- `docs/OPTIMIZATION_PLAN.md` — Финальный план оптимизации

### Рекомендуемые обновления (2 часа):
1. **Обновить backend зависимости** — 30 мин (P1)
2. **Обновить frontend (патчи)** — 30 мин (P2)
3. **Connection Pool для БД** — 1 час (P3)

[Подробнее](docs/OPTIMIZATION_PLAN.md)

---

## 📞 Контакты

По вопросам обращайтесь к разработчику.

---

## 📄 Лицензия

Внутренний проект для компании.
