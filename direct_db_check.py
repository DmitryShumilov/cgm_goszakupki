"""
Прямая проверка SQL запроса через psycopg2
"""
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

# Получаем параметры подключения из backend
DB_CONFIG = {
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'port': int(os.getenv('POSTGRES_PORT', 5432)),
    'user': os.getenv('POSTGRES_USER', 'postgres'),
    'password': os.getenv('POSTGRES_PASSWORD'),
    'database': os.getenv('POSTGRES_DATABASE', 'cgm_dashboard')
}

print("📊 Подключение к БД...")
print(f"   Host: {DB_CONFIG['host']}")
print(f"   Database: {DB_CONFIG['database']}")

try:
    conn = psycopg2.connect(**DB_CONFIG)
    print("   ✅ Подключение успешно\n")
except Exception as e:
    print(f"   ❌ Ошибка: {e}\n")
    # Пробуем без password из env
    print("   Пробуем без пароля...")
    DB_CONFIG['password'] = ''
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("   ✅ Подключение успешно\n")
    except Exception as e2:
        print(f"   ❌ Ошибка: {e2}\n")
        exit(1)

cur = conn.cursor(cursor_factory=RealDictCursor)

# Тест 1: Прямой запрос без фильтра
print("🔍 Тест 1: Запрос без фильтра\n")
cur.execute("""
    SELECT COUNT(*) as cnt, SUM(amount_rub) as total
    FROM purchases
""")
result = cur.fetchone()
print(f"   Всего записей: {result['cnt']}")
print(f"   Всего сумма: {result['total']:,.2f} ₽\n")

# Тест 2: Запрос с фильтром по поставщику (как в build_filter_clause)
print('🔍 Тест 2: Запрос с фильтром по поставщику ООО "БСС"\n')
supplier = 'ООО "БСС"'
cur.execute("""
    SELECT COUNT(*) as cnt, SUM(amount_rub) as total
    FROM purchases
    WHERE distributor IN (%s)
""", (supplier,))
result = cur.fetchone()
print(f"   Записей: {result['cnt']}")
print(f"   Сумма: {result['total']:,.2f} ₽\n")

# Тест 3: Проверка, какие поставщики есть в БД
print('🔍 Тест 3: Поиск поставщиков с "БСС" в названии\n')
cur.execute("""
    SELECT DISTINCT distributor, COUNT(*) as cnt, SUM(amount_rub) as total
    FROM purchases
    WHERE distributor ILIKE %s
    GROUP BY distributor
""", ('%БСС%',))
results = cur.fetchall()
for r in results:
    print(f"   {r['distributor']}: {r['cnt']} записей, {r['total']:,.2f} ₽")

# Тест 4: Точное совпадение
print('\n🔍 Тест 4: Точное совпадение "ООО \'БСС\'"\n')
cur.execute("""
    SELECT distributor, COUNT(*) as cnt, SUM(amount_rub) as total
    FROM purchases
    WHERE distributor = %s
    GROUP BY distributor
""", ('ООО "БСС"',))
results = cur.fetchall()
if results:
    for r in results:
        print(f"   {r['distributor']}: {r['cnt']} записей, {r['total']:,.2f} ₽")
else:
    print("   ❌ Не найдено записей")

# Тест 5: Проверка первых 5 записей distributor
print("\n🔍 Тест 5: Первые 5 записей distributor\n")
cur.execute("""
    SELECT DISTINCT distributor FROM purchases ORDER BY distributor LIMIT 5
""")
results = cur.fetchall()
for r in results:
    print(f"   • {repr(r['distributor'])}")

cur.close()
conn.close()
