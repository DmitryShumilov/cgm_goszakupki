import requests
import time

print("Проверка Backend API...\n")
time.sleep(2)

# Health check
try:
    response = requests.get("http://localhost:8000/api/health", timeout=5)
    print(f"1. Health check: {response.status_code}")
    print(f"   Ответ: {response.json()}")
except Exception as e:
    print(f"1. Health check: Ошибка - {e}")

# Filters
try:
    response = requests.get("http://localhost:8000/api/filters/years", timeout=5)
    print(f"\n2. Filters/years: {response.status_code}")
    if response.status_code == 200:
        print(f"   Ответ: {response.json()}")
    else:
        print(f"   Ответ: {response.text}")
except Exception as e:
    print(f"2. Filters/years: Ошибка - {e}")

# KPI
try:
    response = requests.post("http://localhost:8000/api/kpi", json={}, timeout=5)
    print(f"\n3. KPI: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Total: {data.get('total_amount')}")
        print(f"   Count: {data.get('contract_count')}")
    else:
        print(f"   Ответ: {response.text}")
except Exception as e:
    print(f"3. KPI: Ошибка - {e}")

# Frontend
try:
    response = requests.get("http://localhost:5173", timeout=5)
    print(f"\n4. Frontend: {response.status_code}")
except Exception as e:
    print(f"4. Frontend: Ошибка - {e}")
