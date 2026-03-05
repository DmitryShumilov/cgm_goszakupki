# 📊 CGM Dashboard - Проект госзакупок

## 🎯 Описание

Веб-дашборд для визуализации данных о госзакупках CGM с интерактивными фильтрами, KPI метриками и диаграммами.

**Статус проекта:** ✅ Готов к production использованию

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
├── database.xlsx              # Исходный Excel файл
├── import_excel_to_pg.py      # Скрипт импорта данных
├── setup_database.py          # Скрипт создания БД
├── backend/
│   ├── main.py                # FastAPI сервер
│   └── requirements.txt       # Python зависимости
├── frontend/
│   ├── src/
│   │   ├── api/               # API клиент
│   │   ├── components/        # React компоненты
│   │   ├── stores/            # Zustand store
│   │   ├── App.tsx            # Главный компонент
│   │   └── main.tsx           # Точка входа
│   ├── package.json
│   └── vite.config.ts
└── docs/
    ├── API.md                 # API документация
    ├── FRONTEND_ARCH.md       # Frontend архитектура
    ├── DATABASE.md            # База данных
    ├── TESTING.md             # Руководство по тестам
    ├── TROUBLESHOOTING.md     # Устранение проблем
    └── README.md              # Общая документация
└── CONTRIBUTING.md            # Руководство для разработчиков
```

---

## 📚 Документация

| Документ | Описание |
|----------|----------|
| [API.md](docs/API.md) | Полная документация по API endpoints |
| [FRONTEND_ARCH.md](docs/FRONTEND_ARCH.md) | Архитектура frontend приложения |
| [DATABASE.md](docs/DATABASE.md) | Схема БД, индексы, миграции |
| [TESTING.md](docs/TESTING.md) | Руководство по тестированию |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Устранение распространённых проблем |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Развёртывание и Docker |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Руководство для разработчиков |

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

```bash
cd C:\Users\Дмитрий\Dashboards\cgm_goszakupki
python import_excel_to_pg.py
```

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
- **Регион** - Мультивыбор с поиском
- **Заказчик** - Мультивыбор с поиском
- **Поставщик** - Мультивыбор с поиском
- **Что закупали** - Мультивыбор с поиском

### Диаграммы

1. **Динамика закупок** - Комбо: сумма (столбцы) + количество (линия)
2. **Топ-10 регионов** - Горизонтальный bar chart
3. **Топ-5 поставщиков** - Круговая + Остальные
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

| Компонент | Версия |
|-----------|--------|
| Python | 3.14 |
| FastAPI | 0.133.1 |
| Uvicorn | 0.41.0 |
| psycopg2 | 2.9.11 |
| pandas | latest |

### Frontend

| Компонент | Версия |
|-----------|--------|
| React | 18 |
| TypeScript | 5 |
| Vite | 7 |
| Material-UI | 5 |
| Recharts | 2 |
| Zustand | 5 |
| TanStack Query | 5 |

### Database

| Компонент | Версия |
|-----------|--------|
| PostgreSQL | 17.2 |

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

## ✨ Этап 5: Улучшения (Март 2026)

### Реализованные улучшения:

#### 📱 Адаптивная вёрстка
- Мобильная версия с выезжающей панелью фильтров
- Планшетная версия с оптимизированной сеткой
- Desktop версия с постоянной боковой панелью
- Responsive grid для KPI карточек и диаграмм

#### ⚡ Производительность
- Кэширование запросов на backend (TTL: 5 минут)
- Автообновление данных каждые 5 минут
- Code splitting и lazy loading
- Оптимизация React Query (staleTime: 5 минут)

#### 📝 Логирование и мониторинг
- Логирование всех HTTP запросов
- Время обработки каждого запроса
- Статус коды ответов

#### 🔄 Автообновление
- Refetch interval для KPI (5 минут)
- Кнопка "Обновить" для принудительного обновления
- Индикатор текущего времени в заголовке

### Новые файлы:
- `docs/TESTING.md` - Чек-лист для тестирования
- `backend SimpleCache class` - Кэширование запросов
- `FilterPanel mobile` - Адаптивная панель фильтров

---

## 📞 Контакты

По вопросам обращайтесь к разработчику.

---

## 📄 Лицензия

Внутренний проект для компании.
