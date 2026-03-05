import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

# Загрузка переменных окружения
load_dotenv()

# Параметры подключения
DB_CONFIG = {
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'port': int(os.getenv('POSTGRES_PORT', 5432)),
    'user': os.getenv('POSTGRES_USER', 'postgres'),
    'password': os.getenv('POSTGRES_PASSWORD')
}

TARGET_DB = 'cgm_dashboard'

print("=" * 60)
print("ПРОВЕРКА И СОЗДАНИЕ БАЗЫ ДАННЫХ")
print("=" * 60)

try:
    # Подключаемся к默认的 postgres базе
    conn = psycopg2.connect(**DB_CONFIG, database='postgres')
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    
    # Проверяем существование базы
    cur.execute("""
        SELECT datname FROM pg_database 
        WHERE datname = %s;
    """, (TARGET_DB,))
    
    result = cur.fetchone()
    
    if result:
        print(f"[OK] База данных '{TARGET_DB}' уже существует")
    else:
        print(f"[INFO] База данных '{TARGET_DB}' не найдена. Создаю...")
        cur.execute(f'CREATE DATABASE {TARGET_DB};')
        print(f"[OK] База данных '{TARGET_DB}' успешно создана")
    
    # Проверяем список всех баз
    cur.execute("SELECT datname FROM pg_database WHERE datistemplate = false;")
    databases = cur.fetchall()
    print("\n[INFO] Существующие базы данных:")
    for db in databases:
        print(f"  - {db[0]}")
    
    cur.close()
    conn.close()
    
    # Тест подключения к новой базе
    print(f"\n[INFO] Проверка подключения к {TARGET_DB}...")
    conn_test = psycopg2.connect(**DB_CONFIG, database=TARGET_DB)
    cur_test = conn_test.cursor()
    cur_test.execute("SELECT version();")
    version = cur_test.fetchone()[0]
    print(f"[OK] Подключение успешно!")
    print(f"PostgreSQL: {version[:50]}...")
    cur_test.close()
    conn_test.close()
    
    print("\n" + "=" * 60)
    print("ГОТОВО! База данных готова к работе")
    print("=" * 60)
    
except Exception as e:
    print(f"[ERROR] Ошибка: {e}")
