# 📋 Этап 1: Подготовка — Подробная инструкция

**Время выполнения:** 0.5 дня  
**Сложность:** Низкая

---

## 🎯 Цели этапа

1. ✅ Создать структуру папки `frontend_map`
2. ✅ Настроить порт 5174
3. ✅ Найти и подготовить GeoJSON файл границ России
4. ✅ Проверить базовый запуск

---

## 📝 Шаг 1: Создание структуры frontend_map

### 1.1. Скопировать базовую структуру

Откройте PowerShell в папке проекта:

```powershell
cd C:\Dashboards\cgm_goszakupki

# Копирование структуры frontend
Copy-Item -Path frontend -Destination frontend_map -Recurse
```

**Что будет скопировано:**
```
frontend_map/
├── public/
├── src/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
└── ...
```

---

### 1.2. Очистить лишние компоненты

Удалите компоненты из старого дашборда (они не понадобятся):

```powershell
cd frontend_map

# Удаление старых компонентов
Remove-Item -Path src\components\* -Recurse -Force

# Удаление старых store (создадим новые)
Remove-Item -Path src\stores\* -Recurse -Force

# Удаление старых API клиентов (создадим новые)
Remove-Item -Path src\api\* -Recurse -Force
```

**ИЛИ вручную:**
- Откройте проводник
- Перейдите в `C:\Dashboards\cgm_goszakupки\frontend_map\src`
- Удалите содержимое папок `components`, `stores`, `api`

---

### 1.3. Проверить структуру

После очистки должна остаться структура:

```
frontend_map/
├── public/              # Пустая или со стандартными файлами
├── src/
│   ├── components/      # ПУСТО (будем создавать новые)
│   ├── stores/          # ПУСТО (будем создавать новые)
│   ├── api/             # ПУСТО (будем создавать новые)
│   ├── App.tsx          # Нужно обновить
│   ├── main.tsx         # Можно оставить
│   └── index.css        # Можно обновить
├── package.json         # Нужно обновить
├── vite.config.ts       # Нужно обновить
└── index.html           # Можно оставить
```

---

## ⚙️ Шаг 2: Настройка порта 5174

### 2.1. Открыть vite.config.ts

**Файл:** `frontend_map\vite.config.ts`

Текущее содержимое (примерно):

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
})
```

---

### 2.2. Изменить порт

**Измените `port: 5173` на `port: 5174`:**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,  // ИЗМЕНЕНО с 5173 на 5174
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
})
```

**Как редактировать:**
1. Откройте файл в VS Code или любом редакторе
2. Найдите строку `port: 5173`
3. Замените на `port: 5174`
4. Сохраните файл

---

### 2.3. Проверить package.json

**Файл:** `frontend_map\package.json`

**Измените название проекта (опционально, для ясности):**

```json
{
  "name": "cgm-dashboard-map",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  ...
}
```

**Изменения:**
- `"name": "cgm-dashboard-map"` — чтобы отличать от основного фронтенда

---

## 🗺️ Шаг 3: Поиск и подготовка GeoJSON файла

### 3.1. Вариант А: Скачать готовый GeoJSON (рекомендуется)

#### Источник 1: GitHub (быстро)

1. Откройте браузер
2. Перейдите по ссылке:  
   https://raw.githubusercontent.com/codeforamerica/clickadoptahouse/master/russia.geojson
3. Сохраните файл:
   - Нажмите `Ctrl+S` (или ПКМ → "Сохранить как")
   - Путь сохранения: `frontend_map\public\russia.geojson`

**Проверка файла:**
```powershell
# Проверить наличие файла
Test-Path frontend_map\public\russia.geojson

# Должно вернуть: True
```

---

#### Источник 2: Natural Earth (качественно)

1. Перейдите на сайт: https://www.naturalearthdata.com/downloads/110m-cultural-vectors/
2. Скачайте архив: **110m Cultural Vectors**
3. Распакуйте архив
4. Найдите файл с границами России (или СНГ)
5. Конвертируйте в GeoJSON (если нужно) через онлайн-конвертер:
   - https://mapshaper.org/
   - Или используйте QGIS

---

#### Источник 3: OpenStreetMap Geofabrik

1. Перейдите: https://download.geofabrik.de/russia.html
2. Скачайте **Russia Federal Districts** (меньший размер)
3. Конвертируйте из `.shp` в `.geojson`:

**Конвертация через ogr2ogr (если установлен GDAL):**
```powershell
ogr2ogr -f GeoJSON -t_crs EPSG:4326 russia.geojson russia-federal-districts.shp
```

**ИЛИ онлайн-конвертер:**
- https://mygeodata.cloud/converter/shp-to-geojson

---

### 3.2. Проверка GeoJSON файла

Файл должен иметь структуру:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Москва",
        "id": "77"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [...]
      }
    },
    ...
  ]
}
```

**Важно:** Поле `properties.name` должно содержать название региона на русском языке (точно как в вашей базе данных).

---

### 3.3. Проверка соответствия названий

**Проблема:** Названия в GeoJSON и базе данных могут отличаться.

**Примеры расхождений:**
| GeoJSON | Ваша БД |
|---------|---------|
| `Москва` | `Москва` ✅ |
| `Санкт-Петербург` | `Санкт-Петербург` ✅ |
| `Республика Крым` | `Крым` ⚠️ |
| `Чукотский автономный округ` | `Чукотский АО` ⚠️ |

**Решение:**

1. **Проверьте названия в вашей БД:**
   ```sql
   SELECT DISTINCT region FROM purchases ORDER BY region;
   ```

2. **Проверьте названия в GeoJSON:**
   Откройте файл в текстовом редакторе и посмотрите значения `properties.name`

3. **Создайте файл сопоставления (если нужно):**

   **Файл:** `frontend_map\src\utils\regionMapping.ts`
   
   ```ts
   export const regionMapping: Record<string, string> = {
     'Республика Крым': 'Крым',
     'Чукотский автономный округ': 'Чукотский АО',
     'Ямало-Ненецкий автономный округ': 'Ямало-Ненецкий АО',
     'Ханты-Мансийский автономный округ': 'Ханты-Мансийский АО',
   }
   
   export function normalizeRegionName(geojsonName: string): string {
     return regionMapping[geojsonName] || geojsonName
   }
   ```

---

## 🧪 Шаг 4: Базовый запуск и проверка

### 4.1. Установить зависимости

```powershell
cd frontend_map
npm install
```

**Ожидаемый результат:**
```
added XXX packages, and audited XXX packages in XXs
```

---

### 4.2. Запустить dev-сервер

```powershell
npm run dev
```

**Ожидаемый результат:**
```
  VITE v7.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

### 4.3. Проверить в браузере

1. Откройте браузер
2. Перейдите: http://localhost:5174
3. **Ожидаемый результат:**
   - Страница загружается
   - Нет ошибок в консоли (F12 → Console)
   - Отображается пустая страница или стандартный шаблон Vite

---

### 4.4. Проверить проксирование API

**Проверка подключения к бэкенду:**

1. Откройте браузер
2. Перейдите: http://localhost:5174/api/health
3. **Ожидаемый результат:**
   ```json
   {"status":"ok"}
   ```

**Если ошибка:**
- Убедитесь, что бэкенд запущен на порту 8000
- Проверьте `vite.config.ts` — настройка proxy должна быть:
  ```ts
  proxy: {
    '/api': 'http://localhost:8000'
  }
  ```

---

## ✅ Шаг 5: Финальная проверка структуры

### 5.1. Итоговая структура

После завершения этапа 1:

```
frontend_map/
├── public/
│   └── russia.geojson      # Границы регионов ✅
├── src/
│   ├── components/          # ПУСТО (готово к новым компонентам)
│   ├── stores/              # ПУСТО (готово к новым store)
│   ├── api/                 # ПУСТО (готово к новым API)
│   ├── utils/               # Опционально (для regionMapping)
│   ├── App.tsx              # Базовый шаблон
│   ├── main.tsx             # Точка входа
│   └── index.css            # Базовые стили
├── package.json             # name: "cgm-dashboard-map"
├── vite.config.ts           # port: 5174 ✅
├── tsconfig.json
└── index.html
```

---

### 5.2. Чек-лист завершения этапа

- [ ] Папка `frontend_map` создана
- [ ] Старые компоненты удалены
- [ ] Порт изменён на 5174 в `vite.config.ts`
- [ ] Файл `russia.geojson` размещён в `public/`
- [ ] `npm install` выполнен без ошибок
- [ ] Dev-сервер запускается на порту 5174
- [ ] API проксирование работает (`/api/health` доступен)
- [ ] Названия регионов проверены на соответствие БД

---

## 🎨 Опционально: Обновить App.tsx для теста

**Файл:** `frontend_map\src\App.tsx`

```tsx
import './App.css'

function App() {
  return (
    <div className="app">
      <h1>CGM Dashboard — Карта</h1>
      <p>Порт 5174 работает!</p>
      <p>Следующий этап: создание компонента карты</p>
    </div>
  )
}

export default App
```

**Проверка:** После обновления откройте http://localhost:5174 — должно отобразиться сообщение.

---

## 📞 Если что-то пошло не так

### Проблема: Порт 5174 занят

**Решение:**
```ts
// vite.config.ts
server: {
  port: 5175,  // Используйте другой порт
}
```

---

### Проблема: GeoJSON не загружается

**Проверка:**
```powershell
# Проверить размер файла
(Get-Item frontend_map\public\russia.geojson).Length

# Если 0 байт — файл не загрузился, скачайте заново
```

---

### Проблема: Ошибки npm install

**Решение:**
```powershell
# Очистить кэш npm
npm cache clean --force

# Удалить node_modules и package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Установить заново
npm install
```

---

## 🚀 Готово к следующему этапу

После успешного завершения Этапа 1:

✅ Структура готова  
✅ Порт настроен  
✅ GeoJSON загружен  
✅ Dev-сервер работает  

**Следующий шаг:** Этап 2: Бэкенд (добавление endpoints для карты)

---

**Время на выполнение:** ~2-4 часа  
**Сложность:** Низкая (копирование + настройка)
