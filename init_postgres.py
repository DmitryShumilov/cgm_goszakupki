import subprocess
import os
import time

PG_PATH = r"C:\Program Files\PostgreSQL\17"
DATA_DIR = os.path.join(PG_PATH, "data")
BIN_DIR = os.path.join(PG_PATH, "bin")
INITDB = os.path.join(BIN_DIR, "initdb.exe")
PG_CTL = os.path.join(BIN_DIR, "pg_ctl.exe")

print("=" * 60)
print("ИНИЦИАЛИЗАЦИЯ POSTGRESQL")
print("=" * 60)

# Проверка наличия initdb
if os.path.exists(INITDB):
    print(f"[OK] initdb найден: {INITDB}")
else:
    print(f"[ERROR] initdb не найден")
    exit(1)

# Очистка data директории
print("\nОчистка data директории...")
import shutil
if os.path.exists(DATA_DIR):
    shutil.rmtree(DATA_DIR)
os.makedirs(DATA_DIR, exist_ok=True)
print("[OK] Директория очищена и создана")

# Инициализация кластера
print("\nИнициализация кластера базы данных...")
result = subprocess.run(
    [INITDB, "-D", DATA_DIR, "-E", "UTF8", "--locale=Russian-Russia.1251"],
    capture_output=True,
    text=True
)
if result.returncode == 0:
    print("[OK] Кластер успешно инициализирован")
    print(result.stdout[-500:] if len(result.stdout) > 500 else result.stdout)
else:
    print(f"[ERROR] Ошибка инициализации (код: {result.returncode})")
    print(result.stderr)
    exit(1)

# Запуск PostgreSQL
print("\nЗапуск PostgreSQL...")
result = subprocess.run(
    [PG_CTL, "start", "-D", DATA_DIR, "-l", os.path.join(DATA_DIR, "logfile.log")],
    capture_output=True,
    text=True
)
if result.returncode == 0:
    print("[OK] PostgreSQL запущен")
    print(result.stdout)
else:
    print(f"[ERROR] Не удалось запустить PostgreSQL")
    print(result.stderr)
    exit(1)

# Пауза для запуска
time.sleep(3)

print("\n" + "=" * 60)
print("ГОТОВО! PostgreSQL готов к работе")
print("=" * 60)
print("Хост: localhost")
print("Порт: 5432")
print("Пользователь: postgres")
print("Пароль: (не установлен, используйте psql для настройки)")
print("=" * 60)
