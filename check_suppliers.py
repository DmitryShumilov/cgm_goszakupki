"""
Проверка mapping поставщиков
"""
import requests
import json

# Проверяем API
print("📊 Проверка API поставщиков...\n")

# 1. Получаем список поставщиков
response = requests.get("http://localhost:8000/api/filters/suppliers")
suppliers = response.json()
print(f"✅ Список поставщиков (filters/suppliers): {len(suppliers)} шт.")
print(f"   Примеры: {suppliers[:5] if len(suppliers) >= 5 else suppliers}")

# 2. Проверяем топ поставщиков
response = requests.post("http://localhost:8000/api/charts/suppliers", json={})
data = response.json()
print(f"\n✅ Топ поставщиков (charts/suppliers):")
print(f"   Top-5: {data['top5']['labels']}")
print(f"   Top-5 суммы: {data['top5']['amounts']}")
print(f"   Остальные: {data['others']:,.2f}")
print(f"   Всего: {data['total']:,.2f}")

# 3. Проверяем KPI
response = requests.post("http://localhost:8000/api/kpi", json={})
kpi = response.json()
print(f"\n✅ KPI (без фильтров):")
print(f"   Сумма: {kpi['total_amount']:,.2f} ₽")
print(f"   Контракты: {kpi['contract_count']}")

# 4. Проверяем KPI с фильтром по поставщику из top-5
if data['top5']['labels']:
    first_supplier = data['top5']['labels'][0]
    print(f"\n🔍 Проверка поставщика: {first_supplier}")
    
    response = requests.post("http://localhost:8000/api/kpi", json={
        "suppliers": [first_supplier]
    })
    kpi_supplier = response.json()
    print(f"   KPI с фильтром: {kpi_supplier['total_amount']:,.2f} ₽ ({kpi_supplier['contract_count']} контрактов)")
    
    # Сравниваем с суммой из top5
    top5_amount = data['top5']['amounts'][0]
    print(f"   Сумма в top-5: {top5_amount:,.2f} ₽")
    
    if abs(kpi_supplier['total_amount'] - top5_amount) > 1:
        print(f"   ⚠️ РАСХОЖДЕНИЕ: {abs(kpi_supplier['total_amount'] - top5_amount):,.2f} ₽")
    else:
        print(f"   ✅ Суммы совпадают")

# 5. Проверяем raw данные из БД
print("\n📊 Проверка raw данных (дублирование поставщиков)...")
response = requests.get("http://localhost:8000/api/filters/suppliers")
all_suppliers = response.json()

# Ищем дубликаты
from collections import Counter
supplier_counts = Counter(all_suppliers)
duplicates = {k: v for k, v in supplier_counts.items() if v > 1}
if duplicates:
    print(f"   ⚠️ Найдены дубликаты в списке поставщиков: {duplicates}")
else:
    print(f"   ✅ Дубликатов нет")

# 6. Проверяем, есть ли в БД полные названия
print("\n🔍 Проверка названий в БД...")
response = requests.get("http://localhost:8000/api/filters/suppliers?raw=true")
if response.status_code == 200:
    raw_suppliers = response.json()
    print(f"   Raw поставщики: {len(raw_suppliers)}")
    print(f"   Примеры: {raw_suppliers[:5] if len(raw_suppliers) >= 5 else raw_suppliers}")
else:
    print(f"   Raw endpoint недоступен ({response.status_code})")
