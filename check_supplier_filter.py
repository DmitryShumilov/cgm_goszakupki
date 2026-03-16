"""
Проверка работы фильтра поставщиков
"""
import requests

# 1. Проверяем точное совпадение "ООО "БСС""
supplier_name = 'ООО "БСС"'
print(f"🔍 Проверка фильтра для: {supplier_name}\n")

response = requests.post("http://localhost:8000/api/kpi", json={
    "suppliers": [supplier_name]
})
kpi = response.json()
print(f"KPI с фильтром [{supplier_name}]:")
print(f"   Сумма: {kpi['total_amount']:,.2f} ₽")
print(f"   Контракты: {kpi['contract_count']}")

# 2. Проверяем, как выглядит название в top-5
response = requests.post("http://localhost:8000/api/charts/suppliers", json={})
suppliers_data = response.json()
print(f"\nTop-5 поставщиков:")
for i, (label, amount) in enumerate(zip(suppliers_data['top5']['labels'], suppliers_data['top5']['amounts'])):
    print(f"   {i+1}. {label}: {amount:,.2f} ₽")

# 3. Проверяем, есть ли расхождение в написании
print(f"\n🔍 Сравнение написания:")
print(f"   В фильтре: '{supplier_name}'")
print(f"   В top-5: '{suppliers_data['top5']['labels'][0]}'")
print(f"   Совпадают: {supplier_name == suppliers_data['top5']['labels'][0]}")

# 4. Проверяем через URL encoding
print(f"\n🔍 Проверка с разными вариантами кавычек:")

# Прямые кавычки
response = requests.post("http://localhost:8000/api/kpi", json={
    "suppliers": ['ООО "БСС"']
})
print(f"   Прямые кавычки (\"): {response.json()['contract_count']} контрактов")

# Кавычки ёлочкой
response = requests.post("http://localhost:8000/api/kpi", json={
    "suppliers": ['ООО «БСС»']
})
print(f"   Ёлочки («»): {response.json()['contract_count']} контрактов")

# Кавычки лапки
response = requests.post("http://localhost:8000/api/kpi", json={
    "suppliers": ["ООО 'БСС'"]
})
print(f"   Лапки (''): {response.json()['contract_count']} контрактов")

# 5. Проверяем все названия с ООО
response = requests.get("http://localhost:8000/api/filters/suppliers")
all_suppliers = response.json()
ooo_suppliers = [s for s in all_suppliers if s.startswith('ООО')]
print(f"\n📊 Все ООО поставщики ({len(ooo_suppliers)} шт.):")
for s in ooo_suppliers[:10]:
    print(f"   • {s}")
