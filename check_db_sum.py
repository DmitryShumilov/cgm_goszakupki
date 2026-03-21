import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

conn = psycopg2.connect(
    host=os.getenv("POSTGRES_HOST", "localhost"),
    port=os.getenv("POSTGRES_PORT", "5432"),
    database=os.getenv("POSTGRES_DATABASE", "cgm_dashboard"),
    user=os.getenv("POSTGRES_USER", "postgres"),
    password=os.getenv("POSTGRES_PASSWORD")
)

cur = conn.cursor()

# Общая сумма и количество записей
cur.execute("SELECT COUNT(*) as total_records, SUM(amount_rub) as total_amount FROM purchases;")
result = cur.fetchone()
print(f"📊 Общие данные:")
print(f"   Записей: {result[0]:,}")
print(f"   Сумма: {result[1]:,.2f} ₽" if result[1] else "   Сумма: None")

# Сумма по годам
cur.execute("SELECT year, COUNT(*) as cnt, SUM(amount_rub) as total FROM purchases GROUP BY year ORDER BY year;")
print(f"\n📅 По годам:")
for row in cur.fetchall():
    print(f"   {row[0]}: {row[1]:,} записей, {row[2]:,.2f} ₽" if row[2] else f"   {row[0]}: {row[1]:,} записей, None")

# Проверка NULL значений
cur.execute("SELECT COUNT(*) FROM purchases WHERE amount_rub IS NULL;")
null_amount = cur.fetchone()[0]
print(f"\n⚠️ NULL amount_rub: {null_amount:,}")

# Проверка отрицательных значений
cur.execute("SELECT COUNT(*) FROM purchases WHERE amount_rub < 0;")
neg_amount = cur.fetchone()[0]
print(f"⚠️ Отрицательные amount_rub: {neg_amount:,}")

# Топ-5 записей по сумме
cur.execute("SELECT customer_name, region, what_purchased, amount_rub, year FROM purchases ORDER BY amount_rub DESC LIMIT 5;")
print(f"\n🏆 Топ-5 записей по сумме:")
for row in cur.fetchall():
    print(f"   {row[3]:,.2f} ₽ - {row[0][:50]} ({row[1]}, {row[4]})")

# Проверка данных за 2024-2025 годы (основные)
cur.execute("SELECT year, COUNT(*) as cnt, SUM(amount_rub) as total FROM purchases WHERE year IN (2024, 2025) GROUP BY year ORDER BY year;")
print(f"\n📅 2024-2025 годы:")
for row in cur.fetchall():
    print(f"   {row[0]}: {row[1]:,} записей, {row[2]:,.2f} ₽" if row[2] else f"   {row[0]}: {row[1]:,} записей, None")

cur.close()
conn.close()
