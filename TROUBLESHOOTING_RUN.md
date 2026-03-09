# 🔧 Решение проблем при запуске CGM Dashboard

**Назначение:** Диагностика и устранение распространённых проблем при запуске проекта.

---

## 📋 Оглавление

1. [Диагностика](#диагностика)
2. [Проблемы с .env](#проблемы-с-env)
3. [Проблемы с Python](#проблемы-с-python)
4. [Проблемы с Node.js](#проблемы-с-nodejs)
5. [Проблемы с PostgreSQL](#проблемы-с-postgresql)
6. [Проблемы с backend](#проблемы-с-backend)
7. [Проблемы с frontend](#проблемы-с-frontend)
8. [Сетевые проблемы](#сетевые-проблемы)

---

## 🩺 Диагностика

### Шаг 1: Запустите проверку проекта

```powershell
.\check_project.ps1
```

Скрипт покажет:
- ✓ Какие компоненты установлены
- ✗ Какие компоненты отсутствуют или настроены неправильно
- ⚠ Предупреждения о потенциальных проблемах

### Шаг 2: Проверьте логи

```powershell
# Логи backend
Get-Content logs\backend_*.log -Tail 50

# Логи frontend (в консоли браузера или терминале)
```

---

## 📄 Проблемы с .env

### Ошибка: `.env file not found`

**Симптомы:**
```
✗ .env файл не найден
```

**Решение:**

```powershell
# Копирование шаблона
Copy-Item .env.example .env

# Откройте .env и укажите POSTGRES_PASSWORD
notepad .env
```

**Содержимое .env:**
```ini
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=ваш_пароль
POSTGRES_DATABASE=cgm_dashboard
```

---

### Ошибка: `POSTGRES_PASSWORD не указан`

**Симптомы:**
```
✗ POSTGRES_PASSWORD не указана
```

**Решение:**

1. Откройте `.env`
2. Найдите строку `POSTGRES_PASSWORD=`
3. Укажите пароль после `=`

```ini
POSTGRES_PASSWORD=Paravoz12
```

> Если вы не знаете пароль, обратитесь к администратору БД.

---

## 🐍 Проблемы с Python

### Ошибка: `Python не найден`

**Симптомы:**
```
✗ Python не найден
```

**Решение:**

1. **Установите Python 3.14+:**
   - Скачайте с https://www.python.org/downloads/
   - **ВАЖНО:** Отметьте галочку **"Add Python to PATH"** при установке

2. **Проверьте установку:**
   ```powershell
   python --version
   ```

3. **Если Python установлен, но не найден:**
   - Перезапустите PowerShell/терминал
   - Проверьте PATH:
     ```powershell
     $env:Path -split ';' | Select-String python
     ```

---

### Ошибка: `ModuleNotFoundError: No module named 'fastapi'`

**Симптомы:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Решение:**

```powershell
# Установка зависимостей backend
cd backend
pip install -r requirements.txt
cd ..
```

**Если ошибка сохраняется:**

```powershell
# Принудительная переустановка
pip install --force-reinstall fastapi uvicorn psycopg2-binary pydantic slowapi
```

---

### Ошибка: `pip not found`

**Симптомы:**
```
'pip' не является внутренней или внешней командой
```

**Решение:**

```powershell
# Используйте python -m pip
python -m pip install -r backend/requirements.txt
```

---

## 🟨 Проблемы с Node.js

### Ошибка: `Node.js не найден`

**Симптомы:**
```
✗ Node.js не найден
```

**Решение:**

1. **Установите Node.js 18+:**
   - Скачайте с https://nodejs.org/
   - Выберите LTS версию

2. **Проверьте установку:**
   ```powershell
   node --version
   npm --version
   ```

3. **Если Node.js установлен, но не найден:**
   - Перезапустите PowerShell/терминал
   - Проверьте PATH:
     ```powershell
     $env:Path -split ';' | Select-String node
     ```

---

### Ошибка: `npm install failed`

**Симптомы:**
```
npm ERR! code ENOENT
npm ERR! syscall open
```

**Решение:**

```powershell
# Очистка кэша npm
npm cache clean --force

# Удаление node_modules
cd frontend
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force

# Повторная установка
npm install
cd ..
```

---

### Ошибка: `Vite failed to start`

**Симптомы:**
```
failed to load config from vite.config.ts
error when starting dev server
```

**Решение:**

```powershell
# Обновление Vite
cd frontend
npm install vite@latest --save-dev
npm run dev
```

---

## 🐘 Проблемы с PostgreSQL

### Ошибка: `PostgreSQL not running`

**Симптомы:**
```
✗ PostgreSQL не доступен
✗ PostgreSQL not running or not found
```

**Решение:**

1. **Проверьте службу PostgreSQL:**
   ```powershell
   Get-Service -Name postgresql*
   ```

2. **Запустите службу:**
   ```powershell
   Start-Service postgresql-x64-17
   ```

3. **Или через pg_ctl:**
   ```powershell
   & "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" start -D "C:\pg_data"
   ```

4. **Если PostgreSQL не установлен:**
   - Скачайте с https://www.postgresql.org/download/
   - Установите версию 17+

---

### Ошибка: `database 'cgm_dashboard' does not exist`

**Симптомы:**
```
✗ База данных 'cgm_dashboard' не существует
```

**Решение:**

1. **Создайте базу данных:**
   ```powershell
   $env:PGPASSWORD = "ваш_пароль"
   & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -c "CREATE DATABASE cgm_dashboard;"
   ```

2. **Импортируйте данные:**
   ```powershell
   python import_excel_to_pg.py
   ```

---

### Ошибка: `password authentication failed`

**Симптомы:**
```
✗ PostgreSQL connection failed: password authentication failed
```

**Решение:**

1. **Проверьте пароль в .env:**
   ```ini
   POSTGRES_PASSWORD=правильный_пароль
   ```

2. **Сбросьте пароль PostgreSQL:**
   ```powershell
   # Подключение без пароля (если настроено)
   & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres
   
   # В SQL консоли:
   ALTER USER postgres WITH PASSWORD 'новый_пароль';
   \q
   ```

3. **Обновите .env:**
   ```ini
   POSTGRES_PASSWORD=новый_пароль
   ```

---

### Ошибка: `table 'purchases' does not exist`

**Симптомы:**
```
✗ Таблица 'purchases' не найдена
```

**Решение:**

```powershell
# Запуск скрипта создания таблицы и импорта
python import_excel_to_pg.py
```

**Если файла database.xlsx нет:**

1. Создайте таблицу вручную:
   ```sql
   CREATE TABLE purchases (
       id SERIAL PRIMARY KEY,
       customer_name TEXT,
       region TEXT,
       what_purchased TEXT,
       price_rub REAL,
       quantity REAL,
       amount_rub REAL,
       distributor TEXT,
       year INTEGER,
       purchase_date DATE,
       purchase_month TEXT
   );
   ```

2. Или восстановите из backup.

---

## 🖥 Проблемы с Backend

### Ошибка: `Address already in use`

**Симптомы:**
```
OSError: [Errno 98] Address already in use
```

**Решение:**

```powershell
# Остановка существующих процессов
.\stop_project.ps1

# Или вручную найти и убить процесс
Get-NetTCPConnection -LocalPort 8000 | Select-Object OwningProcess -Unique
Stop-Process -Id <PID> -Force
```

**Измените порт (альтернатива):**

В `.env`:
```ini
BACKEND_PORT=8001
```

В `backend/main.py` измените порт запуска.

---

### Ошибка: `Connection refused` при запуске backend

**Симптомы:**
```
psycopg2.OperationalError: connection to server at "localhost" (::1), port 5432 failed
```

**Решение:**

1. **Проверьте PostgreSQL:**
   ```powershell
   .\check_project.ps1
   ```

2. **Проверьте параметры подключения в .env:**
   ```ini
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=ваш_пароль
   POSTGRES_DATABASE=cgm_dashboard
   ```

3. **Проверьте firewall:**
   - Откройте порт 5432 для localhost

---

### Ошибка: `Backend не запускается`

**Симптомы:**
```
✗ Backend не запустился
```

**Решение:**

1. **Проверьте логи:**
   ```powershell
   Get-Content logs\backend_*.log -Tail 50
   ```

2. **Запустите вручную для отладки:**
   ```powershell
   cd backend
   python main.py
   ```

3. **Проверьте зависимости:**
   ```powershell
   pip list | Select-String fastapi
   pip install -r requirements.txt
   ```

---

## 🌐 Проблемы с Frontend

### Ошибка: `Frontend не запускается`

**Симптомы:**
```
✗ Frontend может запускаться дольше обычного
```

**Решение:**

1. **Запустите вручную:**
   ```powershell
   cd frontend
   npm run dev
   ```

2. **Проверьте консоль на ошибки:**
   - Ошибки TypeScript
   - Ошибки импорта модулей

3. **Очистите кэш:**
   ```powershell
   cd frontend
   Remove-Item node_modules -Recurse -Force
   npm install
   npm run dev
   ```

---

### Ошибка: `Cannot connect to backend`

**Симптомы:**
```
Network Error
ERR_CONNECTION_REFUSED
```

**Решение:**

1. **Проверьте, что backend запущен:**
   ```powershell
   curl http://localhost:8000/api/health
   ```

2. **Проверьте CORS настройки в .env:**
   ```ini
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:80
   ```

3. **Проверьте backend логи:**
   ```powershell
   Get-Content logs\backend_*.log -Tail 50
   ```

---

### Ошибка: `White screen / blank page`

**Симптомы:**
- Страница загружается, но пустая
- В консоли браузера ошибки JavaScript

**Решение:**

1. **Откройте консоль браузера (F12)**
2. **Проверьте ошибки:**
   - Ошибки загрузки ресурсов
   - Ошибки выполнения JavaScript

3. **Очистите кэш браузера:**
   - Ctrl+Shift+Delete
   - Очистить кэш и cookie

4. **Пересоберите frontend:**
   ```powershell
   cd frontend
   npm run build
   npm run dev
   ```

---

## 🌐 Сетевые проблемы

### Ошибка: `ECONNREFUSED`

**Симптомы:**
```
Error: connect ECONNREFUSED 127.0.0.1:8000
```

**Решение:**

1. **Проверьте, что сервис запущен:**
   ```powershell
   Get-NetTCPConnection -LocalPort 8000
   ```

2. **Перезапустите сервис:**
   ```powershell
   .\stop_project.ps1
   .\start_project.ps1
   ```

---

### Ошибка: `CORS policy`

**Симптомы:**
```
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Решение:**

1. **Проверьте .env:**
   ```ini
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:80
   ```

2. **Перезапустите backend:**
   ```powershell
   .\stop_project.ps1
   .\start_project.ps1
   ```

---

## 📊 Проверка после устранения

После устранения проблемы выполните:

```powershell
# 1. Проверка
.\check_project.ps1

# 2. Запуск
.\start_project.ps1

# 3. Проверка работы
curl http://localhost:8000/api/health
curl http://localhost:5173
```

---

## 🆘 Если ничего не помогло

1. **Полная переустановка:**

   ```powershell
   # Остановка
   .\stop_project.ps1
   
   # Удаление зависимостей
   Remove-Item backend\__pycache__ -Recurse -Force
   Remove-Item frontend\node_modules -Recurse -Force
   Remove-Item frontend\dist -Recurse -Force
   Remove-Item logs\* -Force
   
   # Переустановка
   .\install_project.ps1 -Force
   
   # Запуск
   .\start_project.ps1
   ```

2. **Проверьте системные требования:**
   - Python 3.14+
   - Node.js 18+
   - PostgreSQL 17+

3. **Обратитесь к документации:**
   - [QUICKSTART.md](QUICKSTART.md) — быстрый старт
   - [README.md](README.md) — основная документация
   - [docs/](docs/) — подробная документация

4. **Соберите информацию для обращения за помощью:**
   ```powershell
   python --version
   node --version
   .\check_project.ps1 -Json > check_report.json
   Get-Content logs\backend_*.log -Tail 100 > backend_log.txt
   ```

---

## 📞 Контакты поддержки

При возникновении проблем, которые не удалось решить:

1. Проверьте [QUICKSTART.md](QUICKSTART.md)
2. Изучите документацию в папке `docs/`
3. Проверьте логи в папке `logs/`
4. Запустите `.\check_project.ps1` для диагностики
