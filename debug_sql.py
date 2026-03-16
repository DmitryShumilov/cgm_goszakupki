"""
Проверка SQL запроса с логированием
"""
import requests
import json

# Добавим временный endpoint для отладки
# Сначала проверим, что происходит при прямом SQL запросе

# Создадим тестовый запрос с явным указанием параметров
test_data = {
    "suppliers": ['ООО "БСС"'],
    "years": None,
    "months": None,
    "regions": None,
    "customers": None,
    "products": None
}

print("🔍 Отладка запроса фильтрации:\n")
print(f"Данные запроса: {json.dumps(test_data, ensure_ascii=False)}")

# Проверим, что происходит при запросе
response = requests.post("http://localhost:8000/api/kpi", json=test_data)
print(f"\nРезультат: {response.json()}")

# Теперь проверим без фильтра
response = requests.post("http://localhost:8000/api/kpi", json={})
print(f"\nБез фильтра: {response.json()}")

# Проверим, как работает LIKE запрос
print("\n🔍 Проверка альтернативных вариантов:\n")

# Вариант 1: Пустой фильтр
response = requests.post("http://localhost:8000/api/kpi", json={})
print(f"Пустой фильтр: {response.json()['total_amount']:,.2f} ₽")

# Вариант 2: Фильтр с несуществующим поставщиком
response = requests.post("http://localhost:8000/api/kpi", json={
    "suppliers": ["НЕ СУЩЕСТВУЕТ"]
})
print(f"Не существующий: {response.json()['total_amount']:,.2f} ₽")

# Вариант 3: Фильтр с полным списком поставщиков
response = requests.get("http://localhost:8000/api/filters/suppliers")
all_suppliers = response.json()
response = requests.post("http://localhost:8000/api/kpi", json={
    "suppliers": all_suppliers[:10]  # Первые 10
})
print(f"Первые 10 поставщиков: {response.json()['total_amount']:,.2f} ₽")

# Вариант 4: Проверка с "БСС" в разных регистрах
for variant in ['ооо "бсс"', 'ООО "БСС"', 'Ооо "Бсс"']:
    response = requests.post("http://localhost:8000/api/kpi", json={
        "suppliers": [variant]
    })
    print(f"Регистр '{variant}': {response.json()['total_amount']:,.2f} ₽")
