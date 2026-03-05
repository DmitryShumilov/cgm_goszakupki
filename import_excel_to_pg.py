"""
Скрипт импорта данных из Excel в PostgreSQL

Логика временной привязки:
- Если год(contract_date) == year → берём contract_date
- Если не совпадают → берём месяц из contract_date + год из year
"""

import pandas as pd
import psycopg2
from datetime import datetime
from psycopg2.extras import execute_batch
import sys
import locale
import os
from dotenv import load_dotenv

# Загрузка переменных окружения
load_dotenv()

# Устанавливаем кодировку вывода
sys.stdout.reconfigure(encoding='utf-8')

# Параметры подключения к PostgreSQL
DB_CONFIG = {
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'port': int(os.getenv('POSTGRES_PORT', 5432)),
    'user': os.getenv('POSTGRES_USER', 'postgres'),
    'password': os.getenv('POSTGRES_PASSWORD'),
    'database': os.getenv('POSTGRES_DATABASE', 'cgm_dashboard')
}

# Путь к Excel файлу
EXCEL_FILE = os.getenv('EXCEL_FILE_PATH', 'database.xlsx')

print("=" * 70)
print("ИМПОРТ ДАННЫХ ИЗ EXCEL В POSTGRESQL")
print("=" * 70)
print(f"Время начала: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print()

# ============================================================================
# ШАГ 1: Чтение Excel
# ============================================================================
print("[1/5] Чтение Excel файла...")
xl = pd.ExcelFile(EXCEL_FILE)
df = pd.read_excel(xl, xl.sheet_names[0])
print(f"    Прочитано строк: {len(df):,}")
print(f"    Прочитано колонок: {len(df.columns)}")
print()

# ============================================================================
# ШАГ 2: Обработка данных и применение логики дат
# ============================================================================
print("[2/5] Обработка данных...")

# Переименование колонок для удобства
col_mapping = {
    'Заказчик: наименование': 'customer_name',
    'Регион': 'region',
    'Контракт: дата': 'contract_date',
    'Что закупали': 'what_purchased',
    'цена, руб': 'price_rub',
    'количество ': 'quantity',  # Пробел в конце
    ' сумма, руб': 'amount_rub',  # Пробел в начале
    'Информация о поставщиках': 'distributor',  # Изменено: берём из колонки 21
    'Год': 'year'
}

df = df.rename(columns=col_mapping)

# Функция для расчёта purchase_date
def calculate_purchase_date(row):
    """
    Логика временной привязки:
    - Если год(contract_date) == year → берём contract_date
    - Если не совпадают → берём месяц из contract_date + год из year
    """
    if pd.isna(row['contract_date']):
        return None
    
    contract_year = row['contract_date'].year
    purchase_year = int(row['year']) if pd.notna(row['year']) else contract_year
    
    if contract_year == purchase_year:
        return row['contract_date']
    else:
        # Берём месяц и день из contract_date, год из year
        try:
            return row['contract_date'].replace(year=purchase_year)
        except ValueError:
            # Для 29 февраля в невисокосном году
            return row['contract_date'].replace(year=purchase_year, day=28)

# Применяем логику дат
df['purchase_date'] = df.apply(calculate_purchase_date, axis=1)

# Создаём колонку purchase_month для группировки (YYYY-MM)
df['purchase_month'] = df['purchase_date'].apply(
    lambda x: x.strftime('%Y-%m') if pd.notna(x) else None
)

# Очистка данных
df['customer_name'] = df['customer_name'].astype(str).str.strip()
df['region'] = df['region'].astype(str).str.strip()
df['what_purchased'] = df['what_purchased'].astype(str).str.strip()
df['distributor'] = df['distributor'].astype(str).str.strip()

# Преобразование числовых колонок
df['price_rub'] = pd.to_numeric(df['price_rub'], errors='coerce')
df['quantity'] = pd.to_numeric(df['quantity'], errors='coerce')
df['amount_rub'] = pd.to_numeric(df['amount_rub'], errors='coerce')
df['year'] = pd.to_numeric(df['year'], errors='coerce').astype('Int64')

print(f"    Записей с purchase_date: {df['purchase_date'].notna().sum():,}")
print(f"    Записей с amount_rub: {df['amount_rub'].notna().sum():,}")
print()

# ============================================================================
# ШАГ 3: Создание таблицы в PostgreSQL
# ============================================================================
print("[3/5] Создание таблицы в PostgreSQL...")

conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()

# Удаляем таблицу если существует (для чистой перезагрузки)
cur.execute("DROP TABLE IF EXISTS purchases CASCADE;")

# Создаём таблицу
create_table_sql = """
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    region TEXT NOT NULL,
    what_purchased TEXT,
    price_rub REAL,
    quantity REAL,
    amount_rub REAL NOT NULL,
    distributor TEXT,
    year INTEGER,
    purchase_date DATE NOT NULL,
    purchase_month TEXT NOT NULL
);
"""
cur.execute(create_table_sql)

# Создаём индексы для производительности
indexes = [
    "CREATE INDEX idx_year ON purchases(year);",
    "CREATE INDEX idx_month ON purchases(purchase_month);",
    "CREATE INDEX idx_region ON purchases(region);",
    "CREATE INDEX idx_customer ON purchases(customer_name);",
    "CREATE INDEX idx_distributor ON purchases(distributor);",
    "CREATE INDEX idx_what_purchased ON purchases(what_purchased);",
]

for idx_sql in indexes:
    cur.execute(idx_sql)

conn.commit()
print("    Таблица 'purchases' создана")
print("    Индексы созданы")
print()

# ============================================================================
# ШАГ 4: Вставка данных
# ============================================================================
print("[4/5] Вставка данных в таблицу...")

# Подготовка данных для вставки
columns = [
    'customer_name', 'region', 'what_purchased', 'price_rub', 
    'quantity', 'amount_rub', 'distributor', 'year', 
    'purchase_date', 'purchase_month'
]

# Фильтруем записи с valid данными
valid_df = df[df['purchase_date'].notna() & df['amount_rub'].notna()].copy()
print(f"    Записей для вставки: {len(valid_df):,}")

# Преобразуем данные в список кортежей
data_to_insert = []
for _, row in valid_df.iterrows():
    data_to_insert.append((
        row['customer_name'],
        row['region'],
        row['what_purchased'],
        float(row['price_rub']) if pd.notna(row['price_rub']) else None,
        float(row['quantity']) if pd.notna(row['quantity']) else None,
        float(row['amount_rub']) if pd.notna(row['amount_rub']) else None,
        row['distributor'],
        int(row['year']) if pd.notna(row['year']) else None,
        row['purchase_date'],
        row['purchase_month']
    ))

# Пакетная вставка
insert_sql = """
INSERT INTO purchases (
    customer_name, region, what_purchased, price_rub, 
    quantity, amount_rub, distributor, year, 
    purchase_date, purchase_month
) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

execute_batch(cur, insert_sql, data_to_insert, page_size=1000)
conn.commit()

print(f"    Успешно вставлено {len(valid_df):,} записей")
print()

# ============================================================================
# ШАГ 5: Проверка и статистика
# ============================================================================
print("[5/5] Проверка данных и статистика...")

# Общее количество записей
cur.execute("SELECT COUNT(*) FROM purchases;")
total = cur.fetchone()[0]
print(f"    Всего записей в БД: {total:,}")

# Сумма всех контрактов
cur.execute("SELECT SUM(amount_rub) FROM purchases;")
total_amount = cur.fetchone()[0]
print(f"    Общая сумма контрактов: {total_amount:,.2f} RUB")

# Диапазон дат
cur.execute("SELECT MIN(purchase_date), MAX(purchase_date) FROM purchases;")
date_range = cur.fetchone()
print(f"    Диапазон дат: {date_range[0]} — {date_range[1]}")

# Количество уникальных заказчиков
cur.execute("SELECT COUNT(DISTINCT customer_name) FROM purchases;")
customers = cur.fetchone()[0]
print(f"    Уникальных заказчиков: {customers}")

# Количество уникальных поставщиков
cur.execute("SELECT COUNT(DISTINCT distributor) FROM purchases;")
suppliers = cur.fetchone()[0]
print(f"    Уникальных поставщиков: {suppliers}")

# Записей по годам
cur.execute("""
    SELECT year, COUNT(*), SUM(amount_rub) 
    FROM purchases 
    GROUP BY year 
    ORDER BY year;
""")
print("\n    Записи по годам:")
for row in cur.fetchall():
    print(f"      {row[0]}: {row[1]:,} контрактов, {row[2]:,.2f} RUB")

cur.close()
conn.close()

print()
print("=" * 70)
print("ИМПОРТ ЗАВЕРШЁН УСПЕШНО")
print("=" * 70)
print(f"Время окончания: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 70)
