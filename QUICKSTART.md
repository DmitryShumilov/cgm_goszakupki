# ⚡ Быстрый старт CGM Dashboard

**Время запуска:** 5-10 минут  
**Сложность:** Начальный уровень

---

## 🔧 Важная настройка перед началом (UTF-8 кодировка)

**Для корректной работы PowerShell скриптов с русским текстом:**

1. Откройте профиль PowerShell:
   ```powershell
   notepad $PROFILE
   ```

2. Добавьте эти строки:
   ```powershell
   [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
   [Console]::InputEncoding = [System.Text.Encoding]::UTF8
   $PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
   $PSDefaultParameterValues['Set-Content:Encoding'] = 'utf8'
   $PSDefaultParameterValues['Get-Content:Encoding'] = 'utf8'
   chcp 65001 | Out-Null
   ```

3. Сохраните и перезапустите PowerShell

📖 **Подробно:** [docs/POWERSHELL_ENCODING.md](docs/POWERSHELL_ENCODING.md)

---

## 📋 Предварительные требования

| Компонент | Версия | Где скачать |
|-----------|--------|-------------|
| Python | 3.14+ | https://www.python.org/downloads/ |
| Node.js | 18+ | https://nodejs.org/ |
| PostgreSQL | 17+ | https://www.postgresql.org/download/ |

> **Важно:** При установке Python отметьте галочку **"Add Python to PATH"**

---

## 🚀 Пошаговая инструкция

### Шаг 1: Проверка требований

Откройте PowerShell в папке проекта и выполните:

```powershell
python --version
node --version
```

Если команды не найдены — установите соответствующее ПО.

---

### Шаг 2: Установка зависимостей

**Автоматическая установка (рекомендуется):**

```powershell
.\install_project.ps1
```

Скрипт:
- ✓ Создаст `.env` файл из шаблона
- ✓ Установит Python зависимости (backend)
- ✓ Установит Node.js зависимости (frontend)

**Ручная установка (альтернатива):**

```powershell
# Backend
cd backend
pip install -r requirements.txt
cd ..

# Frontend
cd frontend
npm install
cd ..
```

---

### Шаг 3: Настройка .env

После установки откройте файл `.env` и укажите пароль PostgreSQL:

```ini
POSTGRES_PASSWORD=ваш_пароль
```

> Если вы не знаете пароль, обратитесь к администратору БД.

---

### Шаг 4: Проверка проекта

```powershell
.\check_project.ps1
```

Скрипт проверит:
- ✓ Наличие `.env` и корректность значений
- ✓ Версии Python и Node.js
- ✓ Доступность PostgreSQL
- ✓ Установленные зависимости
- ✓ Наличие базы данных и таблицы

---

### Шаг 5: Запуск проекта

```powershell
.\start_project.ps1
```

После запуска откройте в браузере:

| Компонент | URL |
|-----------|-----|
| **Дашборд** | http://localhost:5173 |
| **API** | http://localhost:8000 |
| **Swagger** | http://localhost:8000/docs |

---

### Шаг 6: Остановка проекта

```powershell
.\stop_project.ps1
```

---

## 📁 Структура проекта

```
cgm_goszakupki/
├── 📄 Скрипты автоматизации
│   ├── install_project.ps1    # Установка зависимостей
│   ├── start_project.ps1      # Запуск проекта
│   ├── stop_project.ps1       # Остановка проекта
│   └── check_project.ps1      # Проверка проекта
│
├── 📄 Конфигурация
│   ├── .env                   # Переменные окружения (создаётся)
│   ├── .env.example           # Шаблон конфигурации
│   └── docker-compose.yml     # Docker конфигурация
│
├── 🖥 Backend (Python/FastAPI)
│   ├── backend/
│   │   ├── main.py            # API сервер
│   │   └── requirements.txt   # Python зависимости
│
├── 🌐 Frontend (React/Vite)
│   ├── frontend/
│   │   ├── src/               # Исходный код
│   │   ├── package.json       # Node.js зависимости
│   │   └── vite.config.ts     # Конфигурация Vite
│
└── 📚 Документация
    ├── README.md              # Основная документация
    ├── QUICKSTART.md          # Этот файл
    └── docs/                  # Подробная документация
```

---

## 🔧 Команды управления

| Команда | Описание |
|---------|----------|
| `.\install_project.ps1` | Установка всех зависимостей |
| `.\check_project.ps1` | Проверка конфигурации и зависимостей |
| `.\start_project.ps1` | Запуск backend + frontend |
| `.\stop_project.ps1` | Корректная остановка |
| `.\start_project.ps1 -NoFrontend` | Запуск только backend |
| `.\start_project.ps1 -NoBackend` | Запуск только frontend |
| `.\install_project.ps1 -BackendOnly` | Установка только backend |
| `.\install_project.ps1 -Force` | Принудительная переустановка |

---

## ❓ Частые проблемы

### Python не найден
**Решение:** Установите Python 3.14+ и добавьте в PATH  
https://www.python.org/downloads/

### Node.js не найден
**Решение:** Установите Node.js 18+  
https://nodejs.org/

### PostgreSQL не запущен
**Решение:** Запустите службу PostgreSQL или через pg_ctl:
```powershell
& "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" start -D "C:\pg_data"
```

### .env файл не найден
**Решение:** Скопируйте шаблон:
```powershell
Copy-Item .env.example .env
```

### Ошибка подключения к БД
**Решение:** Проверьте пароль в `.env`:
```ini
POSTGRES_PASSWORD=правильный_пароль
```

---

## 📞 Поддержка

При возникновении проблем:

1. Запустите `.\check_project.ps1` для диагностики
2. Проверьте логи в папке `logs/`
3. Обратитесь к документации в папке `docs/`
4. См. [TROUBLESHOOTING_RUN.md](TROUBLESHOOTING_RUN.md) для подробного устранения проблем

---

## 📊 Проверка работы

После запуска проверьте:

1. **Frontend:** Откройте http://localhost:5173 — должен загрузиться дашборд
2. **Backend API:** Откройте http://localhost:8000/api/health — должен вернуть `{"status":"ok","records":...}`
3. **Swagger:** Откройте http://localhost:8000/docs — должна отобразиться документация API

---

## 🎯 Следующие шаги

- 📖 [Основная документация](README.md) — подробное описание проекта
- 📚 [API документация](docs/API.md) — описание endpoints
- 🗄 [База данных](docs/DATABASE.md) — схема БД и миграции
- 🧪 [Тестирование](docs/TESTING.md) — руководство по тестам
