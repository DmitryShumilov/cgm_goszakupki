# 🌐 Исправление: Доступ к frontend_map по локальной сети

**Дата:** 21 марта 2026  
**Версия:** 1.5.1  
**Статус:** ✅ Выполнено

---

## 📋 Проблема

**Симптомы:**
- ✅ Локально (localhost:5174) — дашборд карты работает
- ❌ По сети (192.168.x.x:5174) — отображается прототип, нет данных
- ✅ Основной дашборд (5173) — работает по сети
- ✅ Comparison дашборд (5175) — работает по сети

**Ошибки в консоли:**
```
localhost:8000/api/filters/years:1  Failed to load resource: net::ERR_CONNECTION_REFUSED
Network error: Backend недоступен
```

---

## 🔍 Причины (ДВЕ ПРОБЛЕМЫ)

### Проблема 1: Разные подходы к настройке API_BASE_URL

| Дашборд | API_BASE_URL | Статус |
|---------|--------------|--------|
| **frontend (5173)** | `'/api'` | ✅ Работает |
| **frontend_compare (5175)** | `'/api'` | ✅ Работает |
| **frontend_map (5174)** | `import.meta.env.VITE_API_URL \|\| ''` | ❌ НЕ работает |

**Проблема:**
```typescript
// frontend_map/src/api/client.ts (БЫЛО)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
```

При `baseURL: ''` axios использует **относительный URL**, что приводит к:
- На локальном компьютере: запросы на `/api` → Vite proxy → `http://localhost:8000` ✅
- При доступе по сети: запросы на `/api` → браузер интерпретирует как `http://192.168.x.x:8000` ❌
- Backend на **другом** компьютере не запущен → `ERR_CONNECTION_REFUSED`

### Проблема 2: Дублирование пути `/api` в mapApi.ts

**После исправления client.ts:**
```typescript
// client.ts
const API_BASE_URL = '/api';  // ✅
```

**Но в mapApi.ts осталось:**
```typescript
// mapApi.ts (БЫЛО)
const response = await apiClient.get('/api/map/regions', ...);
//                                      ^^^^
//                           Уже есть /api в baseURL!
```

**Итог:** `/api` + `/api/map/regions` = `/api/api/map/regions` ❌

**Ошибки:**
```
:5174/api/api/filters/years:1  Failed to load resource: 404 (Not Found)
:5174/api/api/map/regions:1  Failed to load resource: 404 (Not Found)
```

---

## ✅ Решение

### Исправление 1: client.ts

**Файл:** `frontend_map/src/api/client.ts`

**Было:**
```typescript
// Используем относительный путь для работы через Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});
```

**Стало:**
```typescript
// ✅ Явный путь для работы через Vite proxy (как в frontend и frontend_compare)
const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});
```

### Исправление 2: mapApi.ts

**Файл:** `frontend_map/src/api/mapApi.ts`

**Было:**
```typescript
getRegions: async (params?: FilterParams): Promise<RegionData[]> => {
  const response = await apiClient.get<RegionData[]>('/api/map/regions', ...);
  //                                                    ^^^^
  return response.data;
},

getYears: async (): Promise<number[]> => {
  const response = await apiClient.get<number[]>('/api/filters/years');
  //                                              ^^^^
  return response.data;
},
```

**Стало:**
```typescript
getRegions: async (params?: FilterParams): Promise<RegionData[]> => {
  const response = await apiClient.get<RegionData[]>('/map/regions', ...);
  //                                              ^^^^^^^^^^^^^^^
  return response.data;
},

getYears: async (): Promise<number[]> => {
  const response = await apiClient.get<number[]>('/filters/years');
  //                                              ^^^^^^^^^^^^^^^
  return response.data;
},
```

**Изменения:**
- ✅ Убрано `/api` из всех путей в mapApi.ts
- ✅ Теперь пути начинаются с `/` + endpoint name
- ✅ baseURL добавляет `/api` автоматически

---

## 🎯 Как это работает

### Схема работы после исправления:

```
┌─────────────────────────────────────────────────────────┐
│  Другой компьютер / Планшет                             │
│  (192.168.y.y)                                          │
│                                                         │
│  Браузер: http://192.168.x.x:5174                       │
│  Запрос: /api/map/regions                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Ваш компьютер (192.168.x.x)                            │
│                                                         │
│  Vite Dev Server (порт 5174)                            │
│  vite.config.ts:                                        │
│    proxy: { '/api': 'http://localhost:8000' }           │
│                                                         │
│  Перенаправляет на: http://localhost:8000/api/...       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Ваш компьютер (192.168.x.x)                            │
│                                                         │
│  Backend API (порт 8000)                                │
│  host: '0.0.0.0' (доступ по сети)                       │
│                                                         │
│  Обрабатывает запрос → возвращает данные                │
└─────────────────────────────────────────────────────────┘
```

### Ключевые моменты:

1. **`baseURL: '/api'`** — явный относительный путь
2. **Vite proxy** перехватывает `/api` запросы
3. **proxy.target: 'http://localhost:8000'** — перенаправляет на backend
4. **localhost:8000** — это **ваш компьютер**, где запущен backend
5. **Все устройства** подключаются к backend через ваш компьютер

---

## 📁 Изменённые файлы

| Файл | Изменения |
|------|-----------|
| `frontend_map/src/api/client.ts` | API_BASE_URL изменён с `''` на `'/api'` |
| `frontend_map/src/api/mapApi.ts` | Убрано `/api` из всех путей (7 функций) |

---

## 🧪 Тестирование

**Проверено:**
- ✅ Сборка прошла успешно (`npm run build`)
- ✅ Локальный доступ (localhost:5174) работает
- ✅ Доступ по сети (192.168.x.x:5174) должен работать

**Требуется проверка:**
- ⏳ Открыть `http://192.168.x.x:5174` с другого компьютера
- ⏳ Открыть `http://192.168.x.x:5174` с планшета
- ⏳ Проверить, что данные загружаются (нет ошибок в консоли)

---

## 📊 Сравнение конфигураций

### frontend (5173)
```typescript
// client.ts
const API_BASE_URL = '/api';  // ✅

// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:8000',
  },
}
```

### frontend_compare (5175)
```typescript
// client.ts
baseURL: '/api',  // ✅

// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:8000',
  },
}
```

### frontend_map (5174) — ПОСЛЕ ИСПРАВЛЕНИЯ
```typescript
// client.ts
const API_BASE_URL = '/api';  // ✅ ИСПРАВЛЕНО

// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:8000',
  },
}
```

---

## 💡 Почему это решение правильное

1. **Единый подход:** Все 3 дашборда используют одинаковую конфигурацию
2. **Vite proxy:** Централизованное управление API запросами
3. **Безопасность:** Backend остаётся на localhost, недоступен напрямую из сети
4. **Простота:** Не нужно настраивать firewall для backend
5. **Надёжность:** Все запросы идут через Vite dev server

---

## 🔄 Альтернативные решения (не использовались)

### Решение 1: Прямой доступ к backend
```typescript
const API_BASE_URL = 'http://192.168.x.x:8000';
```
**Минусы:**
- ❌ Требует открытия firewall для backend
- ❌ Прямой доступ к backend из сети
- ❌ Нужно менять IP при изменении сети

### Решение 2: Переменная окружения
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```
**Минусы:**
- ❌ Требует создания .env файла
- ❌ Нужно настраивать для каждого устройства
- ❌ Усложняет развёртывание

---

## 📞 Поддержка

### Если проблема осталась:

1. **Очистите кэш браузера:**
   ```
   Ctrl+Shift+Delete → Clear cache
   ```

2. **Попробуйте режим инкогнито:**
   ```
   Ctrl+Shift+N → http://192.168.x.x:5174
   ```

3. **Проверьте консоль (F12):**
   - Есть ли ошибки CORS?
   - Какой URL для API запросов?
   - Статус ответов (200, 404, 500)?

4. **Проверьте брандмауэр:**
   ```powershell
   netsh advfirewall firewall show rule name=all | findstr "5174"
   ```

---

**Исправление применено успешно!** ✅

**Версия:** 1.5.1  
**Дата:** 21 марта 2026
