# 🌐 Доступ к дашборду из локальной сети

**Дата:** 16 марта 2026  
**Статус:** ✅ Настроено (разрешены все origin)

---

## 📋 Текущая конфигурация

| Параметр | Значение |
|----------|----------|
| **Локальный IP** | Динамический (DHCP) |
| **Backend API** | Порт 8000 |
| **Frontend (Dashboard)** | Порт 5173 |
| **Frontend Map (Карта)** | Порт 5174 |
| **CORS** | ✅ Разрешены все origin |

---

## ✅ Проверка доступа

### Серверы слушают все интерфейсы
```
0.0.0.0:8000  - Backend API
0.0.0.0:5173  - Frontend Dashboard
0.0.0.0:5174  - Frontend Map
```

**Статус:** ✅ Все серверы доступны по всем сетевым интерфейсам

### CORS настройка
```python
# В backend/main.py
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    response.headers["Access-Control-Allow-Origin"] = "*"
```

**Статус:** ✅ Доступ разрешён с любых IP-адресов в локальной сети

---

## 🔗 URL для доступа

### 1. Узнайте ваш текущий IP-адрес

**Windows (PowerShell):**
```powershell
ipconfig | findstr "IPv4"
```

**Результат:**
```
IPv4-адрес. . . . . . . . . . . . : 192.168.x.x
```

### 2. URL для доступа

**С этого компьютера (localhost):**
- **Дашборд:** http://localhost:5173
- **Карта:** http://localhost:5174
- **API:** http://localhost:8000/api/health
- **Swagger:** http://localhost:8000/docs

**С других устройств в сети (замените X.X на ваш IP):**
- **Дашборд:** http://192.168.x.x:5173
- **Карта:** http://192.168.x.x:5174
- **API:** http://192.168.x.x:8000/api/health
- **Swagger:** http://192.168.x.x:8000/docs

---

## 📱 Примеры использования

### Доступ с телефона/планшета
1. Убедитесь, что устройство подключено к той же WiFi сети
2. Откройте браузер
3. Перейдите на `http://192.168.x.x:5173` (замените на ваш IP)

### Доступ с другого компьютера в офисе
1. Откройте браузер
2. Перейдите на `http://192.168.x.x:5173`

### Демонстрация заказчику
1. Узнайте текущий IP: `ipconfig | findstr "IPv4"`
2. Откройте дашборд на проекторе/экране
3. Все устройства в сети могут подключиться по этому IP

---

## 🔥 Брандмауэр Windows

### Проверка правил
```powershell
# Правила для Python (backend)
Get-NetFirewallRule -DisplayName '*Python*' | Select-Object DisplayName, Enabled, Direction, Action

# Правила для Node.js (frontend)
Get-NetFirewallRule -DisplayName '*Node*' | Select-Object DisplayName, Enabled, Direction, Action
```

### Если правила отсутствуют
Создайте правило для портов:

```powershell
# Разрешить входящие подключения на порты 8000, 5173, 5174
New-NetFirewallRule -DisplayName "CGM Dashboard" -Direction Inbound -LocalPort 8000,5173,5174 -Protocol TCP -Action Allow
```

---

## 🧪 Тестирование доступа

### 1. Проверка с этого компьютера
```bash
# Backend
curl http://192.168.1.59:8000/api/health

# Frontend
curl http://192.168.1.59:5173

# Frontend Map
curl http://192.168.1.59:5174
```

### 2. Проверка с другого устройства
Откройте в браузере другого устройства (телефон, планшет, другой ПК):
- http://192.168.1.59:5173
- http://192.168.1.59:5174

### 3. Проверка CORS заголовков
```bash
curl -H "Origin: http://192.168.1.100:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://192.168.1.59:8000/api/health -v
```

Ожидаемый ответ:
```
Access-Control-Allow-Origin: http://192.168.1.100:5173
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## 📱 Примеры использования

### Доступ с телефона/планшета
1. Убедитесь, что устройство подключено к той же WiFi сети
2. Откройте браузер
3. Перейдите на http://192.168.1.59:5173

### Доступ с другого компьютера в офисе
1. Откройте браузер
2. Перейдите на http://192.168.1.59:5173

### Демонстрация заказчику
1. Подключите ноутбук к той же сети
2. Откройте http://192.168.1.59:5173 на проекторе/экране

---

## 🔧 Перезапуск после изменения CORS

После изменения `.env` перезапустите backend:

```powershell
# Остановка
.\stop_project.ps1

# Запуск
.\start_project.ps1
```

Или вручную:
```powershell
# Остановить backend
taskkill /F /IM python.exe

# Запустить backend
cd backend
python main.py
```

---

## 🚀 Быстрая настройка для текущего IP

Автоматическое обновление `.env` для текущего IP:

```powershell
# Получить текущий IP
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*"} | Select-Object -First 1).IPAddress

# Обновить .env
$envContent = Get-Content .env
$envContent = $envContent -replace "ALLOWED_ORIGINS=.*", "ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:80,http://localhost,http://$ip`:5173,http://$ip`:5174,http://$ip`:80,http://$ip"
$envContent | Set-Content .env

Write-Host "CORS обновлён для IP: $ip"
```

---

## 📊 Статус

| Компонент | Статус | Примечание |
|-----------|--------|------------|
| **Backend API** | ✅ Доступен | Слушает 0.0.0.0:8000 |
| **Frontend** | ✅ Доступен | Слушает 0.0.0.0:5173 |
| **Frontend Map** | ✅ Доступен | Слушает 0.0.0.0:5174 |
| **Брандмауэр** | ✅ Настроен | Python и Node.js разрешены |
| **CORS** | ✅ Настроен | Добавлен IP 192.168.1.59 |

---

## 📞 Поддержка

При проблемах с доступом:

1. Проверьте, что серверы запущены: `.\check_project.ps1`
2. Проверьте брандмауэр: `Get-NetFirewallRule -DisplayName '*CGM*'`
3. Проверьте CORS в `.env`
4. Перезапустите проект: `.\stop_project.ps1` → `.\start_project.ps1`
