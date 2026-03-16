"""
Проверка SQL запроса фильтрации поставщиков
"""
import requests
import json

# Проверяем, что возвращает SQL запрос напрямую
# Создадим тестовый endpoint для отладки

# Сначала проверим, что top-5 работает правильно
print("📊 Проверка charts/suppliers:\n")
response = requests.post("http://localhost:8000/api/charts/suppliers", json={})
data = response.json()

print(f"Top-5 labels: {data['top5']['labels']}")
print(f"Top-5 amounts: {data['top5']['amounts']}")
print(f"Total: {data['total']:,.2f}")

# Теперь проверим, что происходит при фильтрации
# Посмотрим на SQL запрос в логах
print("\n🔍 Проверка фильтрации по первому поставщику из top-5:\n")
first_supplier = data['top5']['labels'][0]
print(f"Поставщик: {first_supplier}")
print(f"Представление: {repr(first_supplier)}")

response = requests.post("http://localhost:8000/api/kpi", json={
    "suppliers": [first_supplier]
})
kpi = response.json()
print(f"\nKPI результат: {kpi}")

# Проверим также через charts/suppliers с фильтром
print("\n🔍 Проверка charts/suppliers с фильтром по первому поставщику:\n")
response = requests.post("http://localhost:8000/api/charts/suppliers", json={
    "suppliers": [first_supplier]
})
filtered_suppliers = response.json()
print(f"Top-5 с фильтром: {filtered_suppliers['top5']['labels']}")
print(f"Top-5 amounts: {filtered_suppliers['top5']['amounts']}")
print(f"Total: {filtered_suppliers['total']:,.2f}")

# Проверим, есть ли данные в charts/dynamics с этим же фильтром
print("\n🔍 Проверка charts/dynamics с фильтром по первому поставщику:\n")
response = requests.post("http://localhost:8000/api/charts/dynamics", json={
    "suppliers": [first_supplier]
})
dynamics = response.json()
print(f"Labels: {dynamics['labels']}")
print(f"Amounts: {dynamics['amounts']}")
total_amount = sum(dynamics['amounts'])
print(f"Total sum: {total_amount:,.2f}")
