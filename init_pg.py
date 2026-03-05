import subprocess
import os
import time

# Путь без кириллицы
PG_DATA_DIR = r"C:\pg_data"
PG_PATH = r"C:\Program Files\PostgreSQL\17"
BIN_DIR = os.path.join(PG_PATH, "bin")
INITDB = os.path.join(BIN_DIR, "initdb.exe")
PG_CTL = os.path.join(BIN_DIR, "pg_ctl.exe")

print("=" * 60)
print("POSTGRESQL INITIALIZATION")
print("=" * 60)
print(f"Data directory: {PG_DATA_DIR}")

# Очистка если существует
if os.path.exists(PG_DATA_DIR):
    import shutil
    shutil.rmtree(PG_DATA_DIR)
    
os.makedirs(PG_DATA_DIR, exist_ok=True)
print(f"[OK] Directory created: {PG_DATA_DIR}")

# Инициализация кластера с WIN1251
print("\nInitializing database cluster...")
result = subprocess.run(
    [INITDB, "-D", PG_DATA_DIR, "-E", "WIN1251", "--locale=Russian_Russia.1251"],
    capture_output=True,
    text=True,
    encoding='cp866'
)
if result.returncode == 0:
    print("[OK] Cluster initialized successfully")
else:
    print(f"[ERROR] Init failed (code: {result.returncode})")
    print("Trying without locale...")
    
    # Пробуем без локали
    result2 = subprocess.run(
        [INITDB, "-D", PG_DATA_DIR, "-E", "WIN1251"],
        capture_output=True,
        text=True,
        encoding='cp866'
    )
    if result2.returncode == 0:
        print("[OK] Cluster initialized successfully (no locale)")
    else:
        print(f"[ERROR] Init failed again (code: {result2.returncode})")
        print(result2.stderr)
        exit(1)

# Настройка pg_hba.conf
print("\nConfiguring authentication...")
pg_hba = os.path.join(PG_DATA_DIR, "pg_hba.conf")
with open(pg_hba, "a") as f:
    f.write("\n# Local trust authentication\n")
    f.write("host all all 127.0.0.1/32 trust\n")
    f.write("host all all ::1/128 trust\n")

# Запуск PostgreSQL
print("\nStarting PostgreSQL...")
log_file = os.path.join(PG_DATA_DIR, "logfile.log")
result = subprocess.run(
    [PG_CTL, "start", "-D", PG_DATA_DIR, "-l", log_file],
    capture_output=True,
    text=True,
    encoding='cp866'
)
if result.returncode == 0:
    print("[OK] PostgreSQL started")
else:
    print(f"[ERROR] Failed to start PostgreSQL")
    print(result.stderr)
    exit(1)

time.sleep(3)

# Проверка подключения
print("\nTesting connection...")
PSQL = os.path.join(BIN_DIR, "psql.exe")
result = subprocess.run(
    [PSQL, "-h", "localhost", "-U", "postgres", "-d", "postgres", "-c", "SELECT version();"],
    capture_output=True,
    text=True,
    encoding='cp866'
)
if result.returncode == 0:
    print("[OK] Connection successful!")
    print(result.stdout[:300])
else:
    print(f"[WARNING] Connection test failed: {result.stderr}")

print("\n" + "=" * 60)
print("READY! PostgreSQL is up and running")
print("=" * 60)
print("Host: localhost")
print("Port: 5432")
print("User: postgres")
print("=" * 60)
