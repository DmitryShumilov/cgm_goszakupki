# 🛠 Руководство разработчика CGM Dashboard

**Назначение:** Информация для разработчиков, которые будут поддерживать и развивать проект.

---

## 📋 Оглавление

1. [Архитектура проекта](#архитектура-проекта)
2. [Скрипты автоматизации](#скрипты-автоматизации)
3. [Структура кода](#структура-кода)
4. [Разработка](#разработка)
5. [Тестирование](#тестирование)
6. [Деплой](#деплой)
7. [Мониторинг и логи](#мониторинг-и-логи)

---

## 🏗 Архитектура проекта

### Технологический стек

| Компонент | Технология | Версия |
|-----------|------------|--------|
| Backend | Python + FastAPI | 3.14+ / 0.135+ |
| Frontend | React + TypeScript | 19+ / 5.9+ |
| Database | PostgreSQL | 17+ |
| UI Library | Material-UI | 7+ |
| Charts | Recharts | 3.7+ |
| State | Zustand | 5+ |

### Архитектурные паттерны

**Backend:**
- REST API с валидацией через Pydantic
- In-memory кэширование с TTL
- Rate limiting для защиты от DDoS
- Логирование всех запросов

**Frontend:**
- Компонентный подход (Functional Components + Hooks)
- Zustand для глобального состояния (с persist в localStorage)
- TanStack Query для data fetching
- TypeScript для типизации

---

## ⚡ Скрипты автоматизации

### Обзор скриптов

| Скрипт | Назначение | Пример |
|--------|------------|--------|
| `install_project.ps1` | Установка зависимостей | `.\install_project.ps1` |
| `check_project.ps1` | Проверка конфигурации | `.\check_project.ps1` |
| `start_project.ps1` | Запуск проекта | `.\start_project.ps1` |
| `stop_project.ps1` | Остановка проекта | `.\stop_project.ps1` |

### Параметры скриптов

#### start_project.ps1

```powershell
# Запуск всего проекта
.\start_project.ps1

# Только backend
.\start_project.ps1 -NoFrontend

# Только frontend
.\start_project.ps1 -NoBackend

# Режим разработки (подробное логирование)
.\start_project.ps1 -Dev
```

#### install_project.ps1

```powershell
# Полная установка
.\install_project.ps1

# Только backend
.\install_project.ps1 -BackendOnly

# Только frontend
.\install_project.ps1 -FrontendOnly

# Принудительная переустановка
.\install_project.ps1 -Force
```

#### check_project.ps1

```powershell
# Полная проверка
.\check_project.ps1

# Быстрая проверка
.\check_project.ps1 -Quick

# Вывод в JSON
.\check_project.ps1 -Json
```

### Внутреннее устройство скриптов

Все скрипты используют единую систему:
- **Цветовой вывод** для наглядности
- **Пошаговое выполнение** с прогрессом
- **Сохранение PID** процессов в `.pids.json`
- **Логирование** в папку `logs/`

---

## 📁 Структура кода

### Backend (backend/)

```
backend/
├── main.py                 # Точка входа, API endpoints
├── requirements.txt        # Python зависимости
├── create_indexes.py       # Скрипт создания индексов БД
├── logs/                   # Логи сервера
└── tests/                  # Юнит-тесты
    ├── test_api.py
    └── conftest.py
```

#### main.py — ключевые секции

```python
# 1. Импорт зависимостей (строки 1-40)
# 2. Загрузка .env (строка 43)
# 3. Конфигурация БД (строки 46-52)
# 4. Логгирование (строки 85-105)
# 5. Инициализация FastAPI (строки 108-113)
# 6. CORS middleware (строки 127-138)
# 7. Rate Limiting (строки 145-149)
# 8. Middleware для логирования (строки 151-160)
# 9. Обработчики ошибок (строки 163-195)
# 10. Кэширование (строки 199-230)
# 11. Pydantic модели (строки 234-380)
# 12. API endpoints (строки 383-817)
```

#### Добавление нового endpoint

```python
# 1. Создайте Pydantic модель для запроса (если нужна)
class NewRequest(BaseModel):
    param1: str
    param2: int

# 2. Создайте Pydantic модель для ответа (если нужна)
class NewResponse(BaseModel):
    result: str
    data: List[Dict]

# 3. Добавьте endpoint
@app.post("/api/new-endpoint")
@limiter.limit("60/minute")
async def new_endpoint(request: Request, body: NewRequest):
    """
    Описание endpoint.
    """
    logger.info("Processing new endpoint request")
    
    # Ваш код
    result = process_data(body.param1, body.param2)
    
    return {"result": "success", "data": result}
```

### Frontend (frontend/)

```
frontend/
├── src/
│   ├── main.tsx            # Точка входа
│   ├── App.tsx             # Главный компонент
│   ├── api/                # API клиент
│   │   └── api.ts
│   ├── components/         # React компоненты
│   │   ├── filters/        # Компоненты фильтров
│   │   ├── kpi/            # KPI карточки
│   │   ├── charts/         # Диаграммы
│   │   └── ui/             # UI компоненты
│   ├── stores/             # Zustand store
│   │   └── filterStore.ts
│   ├── hooks/              # Кастомные хуки
│   └── types/              # TypeScript типы
├── package.json
├── vite.config.ts
└── tests/                  # Тесты
```

#### Добавление нового компонента

```tsx
// 1. Создайте файл компонента
// src/components/my-component/MyComponent.tsx

import React from 'react';
import { Box, Typography } from '@mui/material';

interface MyComponentProps {
  title: string;
  data: number[];
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, data }) => {
  return (
    <Box>
      <Typography variant="h6">{title}</Typography>
      {/* Ваш код */}
    </Box>
  );
};

// 2. Экспортируйте из index.ts
// src/components/my-component/index.ts
export * from './MyComponent';
```

---

## 💻 Разработка

### Настройка окружения

1. **Склонируйте репозиторий:**
   ```powershell
   git clone <repository-url>
   cd cgm_goszakupki
   ```

2. **Установите зависимости:**
   ```powershell
   .\install_project.ps1
   ```

3. **Настройте .env:**
   ```powershell
   Copy-Item .env.example .env
   notepad .env  # Укажите POSTGRES_PASSWORD
   ```

4. **Проверьте конфигурацию:**
   ```powershell
   .\check_project.ps1
   ```

### Запуск в режиме разработки

```powershell
# Backend (отдельно)
cd backend
python main.py

# Frontend (отдельно, в другом терминале)
cd frontend
npm run dev
```

Или используйте скрипт:

```powershell
.\start_project.ps1 -Dev
```

### Внесение изменений

1. **Создайте ветку:**
   ```powershell
   git checkout -b feature/new-feature
   ```

2. **Внесите изменения**

3. **Запустите тесты:**
   ```powershell
   # Backend тесты
   cd backend
   pytest
   
   # Frontend тесты
   cd frontend
   npm test
   ```

4. **Проверьте линтеры:**
   ```powershell
   # Backend
   python -m flake8 backend/
   
   # Frontend
   cd frontend
   npm run lint
   ```

5. **Закоммитьте изменения:**
   ```powershell
   git add .
   git commit -m "feat: описание изменений"
   git push origin feature/new-feature
   ```

---

## 🧪 Тестирование

### Backend тесты

```powershell
cd backend
pytest              # Запуск всех тестов
pytest -v           # Подробный вывод
pytest --cov        # Покрытие кода
pytest tests/test_api.py  # Конкретный файл
```

### Frontend тесты

```powershell
cd frontend
npm test            # Запуск всех тестов
npm run test:ui     # Тесты с UI
npm run test:coverage  # Покрытие кода
```

### E2E тесты (Playwright)

```powershell
cd frontend
npm run test:e2e        # Запуск E2E тестов
npm run test:e2e:ui     # E2E с UI
npm run test:e2e:report # Отчёт о тестах
```

---

## 🚀 Деплой

### Production чеклист

Перед деплоем:

- [ ] Все тесты проходят
- [ ] Линтеры не показывают ошибок
- [ ] .env.example обновлён
- [ ] CHANGELOG.md обновлён
- [ ] Версия обновлена (package.json, setup.py)

### Деплой на сервер

1. **Подготовьте сервер:**
   - Установите Python 3.14+, Node.js 18+, PostgreSQL 17+
   - Настройте firewall (порты 80, 443, 5432)

2. **Разверните код:**
   ```bash
   git clone <repository-url>
   cd cgm_goszakupki
   ```

3. **Настройте окружение:**
   ```bash
   cp .env.example .env
   nano .env  # Укажите production параметры
   ```

4. **Установите зависимости:**
   ```bash
   .\install_project.ps1
   ```

5. **Запустите проект:**
   ```bash
   .\start_project.ps1
   ```

### Docker деплой

```bash
# Сборка образов
docker-compose build

# Запуск
docker-compose up -d

# Проверка
docker-compose ps
docker-compose logs -f
```

---

## 📊 Мониторинг и логи

### Логи

| Лог | Расположение | Описание |
|-----|--------------|----------|
| Backend | `logs/backend_*.log` | Логи FastAPI сервера |
| Frontend | Консоль браузера / терминал | Логи Vite dev server |
| PostgreSQL | `C:\pg_data\log\` | Логи СУБД |

### Мониторинг здоровья

```powershell
# Проверка backend
curl http://localhost:8000/api/health

# Проверка frontend
curl http://localhost:5173

# Swagger UI
http://localhost:8000/docs
```

### Метрики для мониторинга

- **Время ответа API:** < 300ms
- **Количество записей в БД:** отслеживать рост
- **Использование памяти:** backend ~200MB, frontend ~100MB
- **Количество ошибок в логах:** 0 критических

---

## 📝 Соглашения по коду

### Python (Backend)

```python
# Используйте type hints
def process_data(items: List[Dict[str, Any]]) -> Dict[str, float]:
    """Краткое описание функции."""
    pass

# Имена переменных: snake_case
total_amount = 0
user_count = 10

# Константы: UPPER_CASE
MAX_RETRIES = 5
DEFAULT_TIMEOUT = 30

# Docstrings для всех публичных функций
```

### TypeScript (Frontend)

```tsx
// Используйте интерфейсы для props
interface ComponentProps {
  title: string;
  count?: number;  // Опциональные свойства
}

// Имена компонентов: PascalCase
export const MyComponent: React.FC<ComponentProps> = ({ title, count }) => {
  return <div>{title}</div>;
};

// Имена переменных: camelCase
const totalCount = 100;
const userList = [];

// Константы: UPPER_CASE для глобальных
const MAX_ITEMS = 100;
```

### Git commit messages

```
feat: добавление новой функции
fix: исправление ошибки
docs: обновление документации
style: форматирование (без изменения логики)
refactor: рефакторинг кода
test: добавление тестов
chore: обновление зависимостей, настройки
```

Пример:
```
feat: добавление фильтра по регионам

- Добавлен компонент RegionFilter
- Обновлён filterStore для поддержки множественного выбора
- Добавлены тесты для нового фильтра
```

---

## 🔐 Безопасность

### Чеклист безопасности

- [ ] Пароли не хранятся в коде
- [ ] .env добавлен в .gitignore
- [ ] CORS настроен на разрешённые домены
- [ ] Rate limiting включён
- [ ] Валидация входных данных (Pydantic)
- [ ] Логи не содержат чувствительных данных

### Обновление зависимостей

Регулярно проверяйте уязвимости:

```powershell
# Backend
pip list --outdated
pip-audit  # Если установлен

# Frontend
cd frontend
npm audit
npm audit fix
```

---

## 📞 Поддержка

### Ресурсы

- [QUICKSTART.md](QUICKSTART.md) — быстрый старт
- [README.md](README.md) — основная документация
- [TROUBLESHOOTING_RUN.md](TROUBLESHOOTING_RUN.md) — решение проблем
- [docs/](docs/) — подробная документация

### Контакты

По вопросам обращайтесь к команде разработки.
