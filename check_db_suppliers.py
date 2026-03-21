"""
Проверка названий поставщиков в БД
"""
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# Получаем пароль из .env
postgres_password = os.getenv("POSTGRES_PASSWORD", "")

conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="cgm_dashboard",
    user="postgres",
    password=postgres_password
)

cur = conn.cursor()

# Получаем уникальных поставщиков
cur.execute("SELECT DISTINCT distributor FROM purchases ORDER BY distributor LIMIT 20;")
print("📊 Поставщики в БД (полные названия):\n")
for row in cur.fetchall():
    print(f"   • {row[0]}")

# Проверяем, есть ли уже сокращённые названия
cur.execute("SELECT DISTINCT distributor FROM purchases WHERE distributor LIKE 'ООО%' OR distributor LIKE 'АО%' OR distributor LIKE 'ПАО%' OR distributor LIKE 'ИП%' LIMIT 20;")
print("\n📊 Поставщики с сокращениями в БД:\n")
for row in cur.fetchall():
    print(f"   • {row[0]}")

# Проверяем конкретного поставщика "БСС"
cur.execute("SELECT DISTINCT distributor FROM purchases WHERE distributor ILIKE '%БСС%';")
print("\n🔍 Поставщик БСС в БД:\n")
for row in cur.fetchall():
    print(f"   • {row[0]}")

# Считаем количество записей
cur.execute("SELECT distributor, COUNT(*) as cnt, SUM(amount_rub) as total FROM purchases WHERE distributor ILIKE '%БСС%' GROUP BY distributor;")
print("\n📊 Статистика по БСС:\n")
for row in cur.fetchall():
    print(f"   • {row[0]}: {row[1]} записей, {row[2]:,.2f} ₽")

cur.close()
conn.close()
