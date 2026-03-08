"""
Скрипт создания индексов для оптимизации производительности БД

Использование:
    python create_indexes.py
"""

import psycopg2
import os
import sys
from dotenv import load_dotenv

# Загрузка переменных окружения
load_dotenv()

# Параметры подключения
DB_CONFIG = {
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'port': int(os.getenv('POSTGRES_PORT', 5432)),
    'user': os.getenv('POSTGRES_USER', 'postgres'),
    'password': os.getenv('POSTGRES_PASSWORD'),
    'database': os.getenv('POSTGRES_DATABASE', 'cgm_dashboard')
}

def get_connection():
    """Получение подключения к БД"""
    return psycopg2.connect(**DB_CONFIG)

def create_indexes():
    """Создание индексов"""
    print("=" * 60)
    print("СОЗДАНИЕ ИНДЕКСОВ БД")
    print("=" * 60)
    
    # Чтение SQL скрипта
    script_path = os.path.join(os.path.dirname(__file__), 'create_indexes.sql')
    
    if not os.path.exists(script_path):
        print(f"[ERROR] Файл не найден: {script_path}")
        return False
    
    with open(script_path, 'r', encoding='utf-8') as f:
        sql_script = f.read()
    
    conn = None
    try:
        # Подключение к БД
        print(f"\n[INFO] Подключение к базе данных...")
        print(f"   Host: {DB_CONFIG['host']}")
        print(f"   Database: {DB_CONFIG['database']}")
        print(f"   User: {DB_CONFIG['user']}")
        
        conn = get_connection()
        conn.autocommit = True
        cur = conn.cursor()
        
        print("[OK] Подключение успешно!\n")
        
        # Проверка количества записей
        cur.execute("SELECT COUNT(*) FROM purchases")
        count = cur.fetchone()[0]
        print(f"[INFO] Записей в таблице purchases: {count:,}\n")
        
        # Получение списка индексов до
        print("[INFO] Индексы ДО:")
        cur.execute("""
            SELECT indexname 
            FROM pg_indexes 
            WHERE tablename = 'purchases'
            ORDER BY indexname
        """)
        indexes_before = [row[0] for row in cur.fetchall()]
        for idx in indexes_before:
            print(f"   - {idx}")
        
        # Выполнение скрипта
        print("\n[INFO] Выполнение SQL скрипта...")
        
        # Разделяем скрипт на отдельные команды
        commands = [cmd.strip() for cmd in sql_script.split(';') if cmd.strip()]
        
        created_count = 0
        for i, command in enumerate(commands):
            if command and not command.startswith('--'):
                try:
                    cur.execute(command)
                    # Извлекаем имя индекса из команды CREATE INDEX
                    if 'CREATE INDEX' in command.upper():
                        parts = command.split()
                        if 'IF NOT EXISTS' in command.upper():
                            idx_name = parts[4] if len(parts) > 4 else 'unknown'
                        else:
                            idx_name = parts[2] if len(parts) > 2 else 'unknown'
                        print(f"   [OK] {idx_name}")
                        created_count += 1
                except Exception as e:
                    # Игнорируем ошибки "уже существует"
                    if 'already exists' not in str(e).lower():
                        print(f"   [WARN] Ошибка: {e}")
        
        print(f"\n[OK] Скрипт выполнен! Создано индексов: {created_count}\n")
        
        # Получение списка индексов после
        print("[INFO] Индексы ПОСЛЕ:")
        cur.execute("""
            SELECT indexname, pg_size_pretty(pg_relation_size(indexname::regclass)) as size
            FROM pg_indexes
            WHERE tablename = 'purchases'
            ORDER BY indexname
        """)
        indexes_after = cur.fetchall()
        for idx, size in indexes_after:
            print(f"   - {idx} ({size})")
        
        # Общий размер
        cur.execute("""
            SELECT pg_size_pretty(sum(pg_relation_size(indexname::regclass)))
            FROM pg_indexes
            WHERE tablename = 'purchases'
        """)
        total_size = cur.fetchone()[0]
        print(f"\n[INFO] Общий размер индексов: {total_size}")
        
        cur.close()
        
        print("\n" + "=" * 60)
        print("ИНДЕКСЫ СОЗДАНЫ УСПЕШНО!")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"\n[ERROR] Ошибка: {e}")
        return False
        
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    success = create_indexes()
    sys.exit(0 if success else 1)
