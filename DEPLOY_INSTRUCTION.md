# 📦 Инструкция по развёртыванию на другом компьютере

**Проект:** CGM Dashboard — Дашборд госзакупок  
**Дата обновления:** Март 2026 г.

---

## 📋 Оглавление

1. [Что передавать](#что-передавать)
2. [Вариант 1: Docker (рекомендуется)](#вариант-1-docker-рекомендуется)
3. [Вариант 2: Ручная установка](#вариант-2-ручная-установка)
4. [Импорт данных](#импорт-данных)
5. [Проверка работы](#проверка-работы)
6. [Устранение проблем](#устранение-проблем)

---

## 📁 Что передавать

### Обязательные файлы

| Файл/Папка | Назначение |
|------------|------------|
| `backend/` | Backend на FastAPI |
| `frontend/` | Frontend на React |
| `docker-compose.yml` | Docker-конфигурация |
| `.env.example` | Шаблон переменных окружения |
| `database.xlsx` | Данные для импорта (если нужны) |
| `docs/` | Документация |
| `import_excel_to_pg.py` | Скрипт импорта данных |
| `setup_database.py` | Скрипт создания БД |

### Не нужно передавать

| Файл/Папка | Причина |
|------------|---------|
| `logs/` | Логи генерируются заново |
| `.qwen/` | Локальные настройки IDE |
| `__pycache__/` | Кэш Python |
| `node_modules/` | Устанавливается через `npm install` |
| `*.pyc` | Байт-код Python |

---

## 🐳 Вариант 1: Docker (рекомендуется)

### Предварительные требования

- **Docker Desktop для Windows** — [скачать](https://www.docker.com/products/docker-desktop/)
- **Git** (опционально) — для клонирования репозитория

### Шаг 1: Подготовка файлов

**Скопируйте проект на целевой компьютер:**

```powershell
# Вариант А: Копирование папки
xcopy /E /I C:\Dashboards\cgm_goszakupки D:\Projects\cgm_goszakupki

# Вариант Б: Создание архива для передачи
Compress-Archive -Path backend,frontend,docker-compose.yml,.env.example,database.xlsx,docs,import_excel_to_pg.py,setup_database.py -DestinationPath cgm_goszakupki_deploy.zip -Force
```

### Шаг 2: Настройка окружения

```powershell
cd D:\Projects\cgm_goszakupki

# Создать файл .env из шаблона
Copy-Item .env.example .env

# Отредактировать .env (открыть в блокноте)
notepad .env
```

**Минимальные изменения в `.env`:**

```ini
# PostgreSQL — задайте надёжный пароль
POSTGRES_PASSWORD=ваш_надёжный_пароль

# Опционально: измените порты, если заняты
POSTGRES_PORT=5432
BACKEND_PORT=8000
FRONTEND_PORT=80
```

### Шаг 3: Запуск Docker Compose

```powershell
# Запуск всех сервисов
docker-compose up -d --build

# Проверка статуса
docker-compose ps

# Просмотр логов (опционально)
docker-compose logs -f
```

**Ожидаемый результат:**
```
NAME           STATUS
cgm-postgres   Up (healthy)
cgm-backend    Up (healthy)
cgm-frontend   Up (healthy)
```

### Шаг 4: Импорт данных

```powershell
# Скопируйте database.xlsx в папку проекта

# Запуск импорта через Docker
docker-compose exec backend python import_excel_to_pg.py
```

**Ожидаемый результат:**
```
✅ Импорт завершён успешно
Добавлено записей: XXXXX
```

---

## 💻 Вариант 2: Ручная установка (без Docker)

### Предварительные требования

| Компонент | Версия | Ссылка |
|-----------|--------|--------|
| Python | 3.14+ | [python.org](https://www.python.org/downloads/) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| PostgreSQL | 17+ | [postgresql.org](https://www.postgresql.org/download/windows/) |

### Шаг 1: Установка PostgreSQL

1. Скачайте установщик с [официального сайта](https://www.postgresql.org/download/windows/)
2. Запустите установку, запомните:
   - Порт: `5432`
   - Суперпользователь: `postgres`
   - Пароль: (задайте надёжный пароль)
3. После установки создайте базу данных:

```powershell
# Через PowerShell (укажите свой пароль)
$env:PGPASSWORD = "ваш_пароль"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE cgm_dashboard;"
```

**ИЛИ через pgAdmin:**
- Откройте pgAdmin 4
- Подключитесь к серверу
- Правой кнопкой на Databases → Create → Database
- Имя: `cgm_dashboard`

### Шаг 2: Настройка окружения

```powershell
cd D:\Projects\cgm_goszakupки

# Создать файл .env
Copy-Item .env.example .env

# Отредактировать с вашими параметрами
notepad .env
```

**Пример `.env` для ручной установки:**

```ini
# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=ваш_пароль
POSTGRES_DATABASE=cgm_dashboard

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:80,http://localhost

# Excel файл
EXCEL_FILE_PATH=database.xlsx
```

### Шаг 3: Установка зависимостей Backend

```powershell
cd backend

# Установка зависимостей
pip install -r requirements.txt

# Проверка установки
python -c "import fastapi; print(f'FastAPI {fastapi.__version__}')"
```

### Шаг 4: Установка зависимостей Frontend

```powershell
cd frontend

# Установка зависимостей
npm install

# Проверка установки
npm run build
```

### Шаг 5: Импорт данных

```powershell
# Убедитесь, что database.xlsx в корне проекта
python import_excel_to_pg.py
```

### Шаг 6: Запуск проекта

**Терминал 1 — Backend:**

```powershell
cd backend
python main.py
```

**Терминал 2 — Frontend:**

```powershell
cd frontend
npm run dev
```

---

## 📊 Импорт данных

### Если данные уже есть в PostgreSQL

Пропустите этот шаг — данные будут доступны автоматически.

### Если нужен импорт из Excel

1. **Убедитесь, что файл существует:**
   ```powershell
   Test-Path database.xlsx
   ```

2. **Запустите импорт:**

   **Для Docker:**
   ```powershell
   docker-compose exec backend python import_excel_to_pg.py
   ```

   **Для ручной установки:**
   ```powershell
   python import_excel_to_pg.py
   ```

3. **Проверьте результат:**
   ```powershell
   # Docker
   docker-compose exec postgres psql -U postgres -d cgm_dashboard -c "SELECT COUNT(*) FROM purchases;"
   
   # Ручная установка
   & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d cgm_dashboard -c "SELECT COUNT(*) FROM purchases;"
   ```

---

## ✅ Проверка работы

### Быстрые проверки

| Проверка | URL / Команда | Ожидаемый результат |
|----------|---------------|---------------------|
| Frontend | http://localhost:5173 (ручной) или http://localhost (Docker) | Открывается дашборд |
| Backend Health | http://localhost:8000/api/health | `{"status": "ok"}` |
| Swagger API | http://localhost:8000/docs | Открывается Swagger UI |
| KPI endpoint | http://localhost:8000/api/kpi | JSON с метриками |
| PostgreSQL | `docker-compose exec postgres pg_isready` | `accepting connections` |

### Проверка через PowerShell

```powershell
# Проверка Backend
Invoke-RestMethod http://localhost:8000/api/health

# Проверка Frontend (для Docker)
Invoke-WebRequest http://localhost -UseBasicParsing | Select-Object StatusCode
```

---

## 🔧 Устранение проблем

### Docker не запускается

**Проблема:** `docker-compose: command not found`

**Решение:**
```powershell
# Проверьте установку Docker
docker --version

# Если не установлен — скачайте Docker Desktop
# https://www.docker.com/products/docker-desktop/
```

---

### PostgreSQL недоступен

**Проблема:** `connection refused` или `authentication failed`

**Решение:**

1. **Проверьте статус PostgreSQL:**
   ```powershell
   # Для ручной установки
   & "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" status -D "C:\pg_data"
   ```

2. **Проверьте `.env`:**
   ```ini
   POSTGRES_PASSWORD=правильный_пароль
   POSTGRES_DATABASE=cgm_dashboard
   ```

3. **Перезапустите сервис:**
   ```powershell
   # Docker
   docker-compose restart postgres
   
   # Ручная установка
   & "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" restart -D "C:\pg_data"
   ```

---

### Backend не запускается

**Проблема:** `ModuleNotFoundError` или `ImportError`

**Решение:**
```powershell
cd backend

# Переустановить зависимости
pip install --upgrade -r requirements.txt

# Проверить версию Python
python --version  # Должна быть 3.14+
```

---

### Frontend не запускается

**Проблема:** `npm: command not found` или ошибки зависимостей

**Решение:**

1. **Проверьте Node.js:**
   ```powershell
   node --version  # Должна быть 18+
   npm --version
   ```

2. **Очистите кэш и переустановите:**
   ```powershell
   cd frontend
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   npm cache clean --force
   npm install
   ```

3. **Запустите заново:**
   ```powershell
   npm run dev
   ```

---

### Ошибки CORS

**Проблема:** `Access-Control-Allow-Origin` в браузере

**Решение:**

1. **Проверьте `.env`:**
   ```ini
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:80,http://localhost
   ```

2. **Перезапустите backend:**
   ```powershell
   # Docker
   docker-compose restart backend
   
   # Ручная установка
   # Остановите Ctrl+C и запустите снова
   python backend/main.py
   ```

---

### Порт занят

**Проблема:** `Address already in use`

**Решение:**

1. **Найдите процесс на порту:**
   ```powershell
   netstat -ano | findstr :8000
   ```

2. **Остановите процесс или измените порт в `.env`:**
   ```ini
   BACKEND_PORT=8001
   FRONTEND_PORT=5174
   ```

---

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи:
   ```powershell
   # Docker
   docker-compose logs backend
   docker-compose logs frontend
   
   # Ручная установка — смотрите консоль запуска
   ```

2. Проверьте документацию в папке `docs/`

3. Убедитесь, что все требования выполнены

---

## 📝 Чек-лист развёртывания

- [ ] Скопированы все необходимые файлы
- [ ] Установлены предварительные требования (Docker ИЛИ Python+Node.js+PostgreSQL)
- [ ] Создан и настроен файл `.env`
- [ ] Запущен PostgreSQL (или Docker контейнер)
- [ ] Установлены зависимости (или собраны Docker образы)
- [ ] Импортированы данные из `database.xlsx`
- [ ] Запущен Backend (проверка: `/api/health`)
- [ ] Запущен Frontend (проверка: браузер)
- [ ] Проверена работа дашборда в браузере

---

**Готово!** 🎉 Проект должен работать на новом компьютере.
