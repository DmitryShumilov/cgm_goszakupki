# CGM Dashboard - Документация проекта

## 📊 Описание проекта

Дашборд для визуализации данных о госзакупках CGM. Данные импортируются из Excel файла и отображаются в веб-интерфейсе с фильтрами и диаграммами.

---

## 🏗 Архитектура

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│  Excel файл     │ --> │  PostgreSQL  │ --> │  FastAPI    │ --> │ Frontend │
│  database.xlsx  │     │  cgm_dashboard│    │  API (8000) │     │ (Vite)   │
└─────────────────┘     └──────────────┘     └─────────────┘     └──────────┘
```

---

## 📁 Структура проекта

```
C:\Users\Дмитрий\Dashboards\cgm_goszakupki\
├── database.xlsx              # Исходный Excel файл
├── import_excel_to_pg.py      # Скрипт импорта данных
├── setup_database.py          # Скрипт создания БД
├── backend/
│   ├── main.py                # FastAPI сервер
│   └── requirements.txt       # Python зависимости
└── docs/
    └── README.md              # Этот файл
```

---

## 🚀 Быстрый старт

### 1. Запуск PostgreSQL

PostgreSQL должен быть запущен. Если нет:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" -D "C:\pg_data" -l "C:\pg_data\logfile.log" start
```

### 2. Импорт данных (если ещё не импортированы)

```bash
cd C:\Users\Дмитрий\Dashboards\cgm_goszakupki
python import_excel_to_pg.py
```

### 3. Запуск Backend API

```bash
cd C:\Users\Дмитрий\Dashboards\cgm_goszakupki\backend
python main.py
```

API доступен по адресу: **http://localhost:8000**

Swagger документация: **http://localhost:8000/docs**

---

## 📡 API Endpoints

### KPI

| Endpoint | Описание |
|----------|----------|
| `GET /api/kpi` | Получить 6 KPI метрик |

**Пример ответа:**
```json
{
  "total_amount": 23492055000.0,
  "contract_count": 1802,
  "avg_contract_amount": 13036672.64,
  "total_quantity": 5596485.0,
  "avg_price_per_unit": 4197.64,
  "customer_count": 257
}
```

### Диаграммы

| Endpoint | Описание |
|----------|----------|
| `GET /api/charts/dynamics` | Динамика закупок (комбо: сумма + количество) |
| `GET /api/charts/regions` | Топ-10 регионов |
| `GET /api/charts/suppliers` | Топ-5 поставщиков + остальные |
| `GET /api/charts/categories` | Категории товаров |
| `GET /api/charts/heatmap` | Тепловая карта (матрица товаров по месяцам) |

### Фильтры

| Endpoint | Описание |
|----------|----------|
| `GET /api/filters/years` | Список годов (2024-2034) |
| `GET /api/filters/months` | Список месяцев (1-12) |
| `GET /api/filters/regions` | Список регионов |
| `GET /api/filters/customers` | Список заказчиков |
| `GET /api/filters/suppliers` | Список поставщиков |
| `GET /api/filters/products` | Список товаров |

### Применение фильтров

Все endpoints поддерживают фильтры через query параметры:

```
GET /api/kpi?years=2024,2025&regions=Москва,СПб&suppliers=Медиалайн
```

**Параметры:**
- `years` - годы (через запятую)
- `months` - месяцы (1-12, через запятую)
- `regions` - регионы (через запятую)
- `customers` - заказчики (через запятую)
- `suppliers` - поставщики (через запятую)
- `products` - товары (через запятую)

---

## 📊 Модель данных

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
| `purchase_date` | DATE | Дата закупки (рассчитанная) |
| `purchase_month` | TEXT | Месяц закупки (YYYY-MM) |

### Логика расчёта `purchase_date`

```python
if год(contract_date) == year:
    purchase_date = contract_date
else:
    purchase_date = contract_date.replace(year=year)
```

---

## 🎯 KPI метрики

| № | Метрика | Формула |
|---|---------|---------|
| 1 | Общая сумма закупок | SUM(amount_rub) |
| 2 | Количество контрактов | COUNT(*) |
| 3 | Средняя сумма контракта | SUM(amount_rub) / COUNT(*) |
| 4 | Общий объём (шт) | SUM(quantity) |
| 5 | Средняя цена за единицу | SUM(amount_rub) / SUM(quantity) |
| 6 | Количество заказчиков | COUNT(DISTINCT customer_name) |

---

## 🛠 Технические детали

### Версии ПО

| Компонент | Версия |
|-----------|--------|
| PostgreSQL | 17.2 |
| Python | 3.14 |
| FastAPI | 0.133.1 |
| Uvicorn | 0.41.0 |
| psycopg2 | 2.9.11 |

### Порты

| Сервис | Порт |
|--------|------|
| PostgreSQL | 5432 |
| FastAPI | 8000 |

### База данных

- **Хост:** localhost
- **Порт:** 5432
- **Пользователь:** postgres
- **База:** cgm_dashboard

---

## 📝 Скрипты

### import_excel_to_pg.py

Импорт данных из Excel в PostgreSQL.

**Запуск:**
```bash
python import_excel_to_pg.py
```

**Что делает:**
1. Читает `database.xlsx`
2. Применяет логику временной привязки
3. Создаёт таблицу `purchases`
4. Вставляет данные
5. Выводит статистику

### setup_database.py

Проверка и создание базы данных.

**Запуск:**
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
& "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" start -D "C:\pg_data" -l "C:\pg_data\logfile.log"
```

### API не отвечает

1. Проверьте, что PostgreSQL запущен
2. Проверьте лог ошибок FastAPI
3. Перезапустите сервер:
   ```bash
   cd backend
   python main.py
   ```

### Ошибки импорта

1. Проверьте, что Excel файл существует
2. Проверьте права доступа к файлу
3. Убедитесь, что PostgreSQL доступен

---

## 📞 Контакты

По вопросам обращайтесь к разработчику.
