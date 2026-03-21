"""
Проверка поставщиков через backend API
"""
import requests

# Получаем все уникальные названия поставщиков из БД
response = requests.get("http://localhost:8000/api/filters/suppliers")
suppliers = response.json()

print(f"📊 Все поставщики ({len(suppliers)} шт.):\n")
for s in suppliers:
    print(f"   • {s}")

# Ищем "БСС"
print("\n🔍 Поиск поставщиков с 'БСС':\n")
for s in suppliers:
    if "БСС" in s.upper():
        print(f"   • {s}")

# Проверяем, есть ли полные названия
print("\n📊 Поставщики с полными названиями (начинаются с 'Общество'):\n")
for s in suppliers:
    if s.upper().startswith("ОБЩЕСТВО"):
        print(f"   • {s}")

print("\n📊 Поставщики с полными названиями (начинаются с 'Акционерное'):\n")
for s in suppliers:
    if s.upper().startswith("АКЦИОНЕРНОЕ"):
        print(f"   • {s}")
