"""
Проверка точного написания БСС в БД
"""
import requests

# Получаем всех поставщиков
response = requests.get("http://localhost:8000/api/filters/suppliers")
all_suppliers = response.json()

# Ищем все варианты с "БСС"
print("🔍 Все варианты с 'БСС':\n")
for s in all_suppliers:
    if "БСС" in s.upper():
        # Показываем ASCII представление для отладки
        repr_s = repr(s)
        print(f"   • {repr_s}")
        print(f"     Длина: {len(s)} символов")
        print(f"     Байты: {s.encode('utf-8')}")
        print()

# Проверяем точное совпадение с разными вариациями
test_variants = [
    'ООО "БСС"',
    'ООО  "БСС"',  # Два пробела
    'ООО "БСС" ',  # Пробел в конце
    'ООО "БСС"',
    'ООО «БСС»',
    "ООО 'БСС'",
]

print("📊 Проверка вариантов написания:\n")
for variant in test_variants:
    response = requests.post("http://localhost:8000/api/kpi", json={
        "suppliers": [variant]
    })
    kpi = response.json()
    match = "✅" if kpi['contract_count'] > 0 else "❌"
    print(f"   {match} '{repr(variant)}' → {kpi['contract_count']} контрактов, {kpi['total_amount']:,.2f} ₽")
