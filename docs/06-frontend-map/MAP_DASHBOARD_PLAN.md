# 🗺️ План разработки: Дашборд с картой России

**Проект:** CGM Dashboard — Географическая визуализация госзакупок  
**Статус:** План разработки  
**Дата:** Март 2026 г.

---

## 📋 Оглавление

1. [Обзор проекта](#обзор-проекта)
2. [Архитектура](#архитектура)
3. [Этапы разработки](#этапы-разработки)
4. [Технические детали](#технические-детали)
5. [Оценка времени](#оценка-времени)
6. [Риски и решения](#риски-и-решения)

---

## 🎯 Обзор проекта

### Цель
Создать **второй фронтенд** с интерактивной картой России для визуализации данных о госзакупках по регионам.

### Требования

| № | Требование | Приоритет |
|---|------------|-----------|
| 1 | Карта России с границами регионов | 🔴 Высокий |
| 2 | Подсветка регионов при наведении | 🔴 Высокий |
| 3 | Детальная информация по клику на регион | 🔴 Высокий |
| 4 | Фильтры (год, отрасль) | 🟡 Средний |
| 5 | Адаптивность (desktop/tablet) | 🟡 Средний |
| 6 | Экспорт данных региона | 🟢 Низкий |

### Что НЕ меняется

- ✅ Текущий дашборд остаётся без изменений
- ✅ Бэкенд расширяется (не меняется существующая логика)
- ✅ База данных не меняется (только новые view/индексы)

---

## 🏗 Архитектура

### Общая схема

```
┌─────────────────────────────────────────────────────────────┐
│                     PostgreSQL                              │
│                  cgm_dashboard                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Таблица: purchases                                 │   │
│  │  - id, customer_name, region, what_purchased        │   │
│  │  - price_rub, quantity, amount_rub, distributor     │   │
│  │  - year, purchase_date, purchase_month              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ (одни и те же данные)
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  FastAPI Backend                            │
│                  (порт 8000)                                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Существующие endpoints:                            │   │
│  │  • GET /api/kpi                                     │   │
│  │  • GET /api/charts/regions                          │   │
│  │  • GET /api/filters/years, months, regions...       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  НОВЫЕ endpoints для карты:                         │   │
│  │  • GET /api/map/regions                             │   │
│  │  • GET /api/map/region/{region_name}                │   │
│  │  • GET /api/map/region/{region_name}/detail         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
┌────────▼────────┐    ┌──────────▼──────────┐
│  Frontend v1    │    │  Frontend Map       │
│  (таблицы)      │    │  (карта)            │
│  порт: 5173     │    │  порт: 5174         │
│  /              │    │  /                  │
└─────────────────┘    └─────────────────────┘
```

### Структура проекта

```
cgm_goszakupki/
├── backend/
│   ├── main.py                 # ← ДОБАВИТЬ: новые endpoints
│   ├── requirements.txt        # ← обновить (если нужно)
│   └── ...
│
├── frontend/                   # ← СУЩЕСТВУЮЩИЙ (не меняется)
│   ├── src/
│   ├── package.json
│   └── ...
│
├── frontend_map/               # ← НОВЫЙ
│   ├── public/
│   │   └── russia.geojson      # Границы регионов
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/
│   │   │   │   ├── Map.tsx
│   │   │   │   ├── RegionLayer.tsx
│   │   │   │   └── MapLegend.tsx
│   │   │   ├── RegionDetail/
│   │   │   │   ├── RegionDetail.tsx
│   │   │   │   ├── RegionKpi.tsx
│   │   │   │   ├── TopSuppliers.tsx
│   │   │   │   └── TopCategories.tsx
│   │   │   └── Filters/
│   │   │       └── MapFilters.tsx
│   │   ├── api/
│   │   │   └── mapApi.ts
│   │   ├── stores/
│   │   │   └── mapStore.ts
│   │   ├── hooks/
│   │   │   └── useRegionData.ts
│   │   ├── styles/
│   │   │   └── map.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
│
└── docs/
    └── MAP_DASHBOARD.md        # ← ЭТОТ ФАЙЛ
```

---

## 📝 Этапы разработки

### Этап 1: Подготовка (0.5 дня)

#### 1.1. Создать структуру frontend_map

```powershell
# Копирование базовой структуры
Copy-Item frontend frontend_map -Recurse

# Очистка лишнего
Remove-Item frontend_map\src\components\* -Recurse
Remove-Item frontend_map\src\stores\*
```

#### 1.2. Настроить порт

**Файл:** `frontend_map/vite.config.ts`

```ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,  // ← Изменить с 5173 на 5174
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
})
```

#### 1.3. Найти и подготовить GeoJSON

**Источники:**
- [Natural Earth](https://www.naturalearthdata.com/downloads/110m-cultural-vectors/)
- [GitHub: Russia GeoJSON](https://github.com/codeforamerica/clickadoptahouse/blob/master/russia.geojson)
- [OpenStreetMap Russia](https://download.geofabrik.de/russia.html)

**Требования к файлу:**
- Формат: GeoJSON
- Поля в `properties`: `name` (название региона), `id` (код)
- Размер: желательно < 5 MB

**Разместить:** `frontend_map/public/russia.geojson`

---

### Этап 2: Бэкенд (1-2 дня)

#### 2.1. Добавить endpoint: список регионов для карты

**Файл:** `backend/main.py`

```python
@app.get("/api/map/regions")
async def get_map_regions(
    years: str = Query(default="", description="Годы через запятую"),
    industries: str = Query(default="", description="Отрасли через запятую")
):
    """
    Получить агрегированные данные по всем регионам для отображения на карте.
    
    Возвращает:
    [
      {
        "region": "Москва",
        "sum": 1250000000,
        "count": 234,
        "quantity": 50000,
        "avg_price": 5341880
      },
      ...
    ]
    """
    # SQL запрос с группировкой по region
    # С учётом фильтров (years, industries)
```

**Логика:**
1. Парсинг параметров `years`, `industries`
2. SQL запрос: `SELECT region, SUM(amount_rub), COUNT(*) ... GROUP BY region`
3. Возврат JSON массива

---

#### 2.2. Добавить endpoint: детализация региона

**Файл:** `backend/main.py`

```python
@app.get("/api/map/region/{region_name}")
async def get_region_detail(
    region_name: str,
    years: str = Query(default=""),
    industries: str = Query(default="")
):
    """
    Подробная информация по конкретному региону.
    
    Возвращает:
    {
      "region": "Москва",
      "kpi": {
        "total_sum": 1250000000,
        "contract_count": 234,
        "avg_contract": 5341880,
        "total_quantity": 50000
      },
      "top_suppliers": [
        {"name": "ООО Строй", "sum": 450000000, "percent": 36},
        ...
      ],
      "top_categories": [
        {"name": "Строительство", "sum": 300000000, "percent": 24},
        ...
      ],
      "dynamics": [
        {"month": "2024-01", "sum": 100000000, "count": 20},
        ...
      ]
    }
    """
```

**Логика:**
1. Валидация `region_name`
2. Несколько SQL запросов для KPI, топ-поставщиков, топ-категорий, динамики
3. Агрегация в единый ответ

---

#### 2.3. Опционально: добавить кэширование

**Файл:** `backend/main.py`

```python
from functools import lru_cache
import time

# Кэш на 5 минут
CACHE_TTL = 300
cache = {}

def get_cached(key, ttl=CACHE_TTL):
    if key in cache:
        data, timestamp = cache[key]
        if time.time() - timestamp < ttl:
            return data
    return None

def set_cached(key, data):
    cache[key] = (data, time.time())

@app.get("/api/map/regions")
async def get_map_regions(years: str = "", industries: str = ""):
    cache_key = f"map_regions:{years}:{industries}"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    # ... вычисления ...
    
    result = [...]
    set_cached(cache_key, result)
    return result
```

---

### Этап 3: Frontend Map — Базовый компонент карты (1-2 дня)

#### 3.1. Установить зависимости

```powershell
cd frontend_map
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

#### 3.2. Создать компонент карты

**Файл:** `frontend_map/src/components/Map/Map.tsx`

```tsx
import { MapContainer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { FC } from 'react'

interface MapProps {
  onRegionSelect: (region: string) => void
  regionData: RegionData[]
  filters: { years: string[]; industries: string[] }
}

export const Map: FC<MapProps> = ({ onRegionSelect, regionData, filters }) => {
  const getRegionColor = (regionName: string) => {
    const data = regionData.find(r => r.region === regionName)
    if (!data) return '#cccccc'
    
    // Градиент от суммы закупок
    const maxSum = Math.max(...regionData.map(r => r.sum))
    const intensity = data.sum / maxSum
    return `rgba(51, 136, 255, ${0.3 + intensity * 0.7})`
  }
  
  const onEachFeature = (feature: any, layer: any) => {
    const regionName = feature.properties.name
    
    layer.on({
      click: () => onRegionSelect(regionName),
      mouseover: (e: any) => {
        e.target.setStyle({
          fillOpacity: 0.8,
          weight: 2,
          color: '#fff'
        })
      },
      mouseout: (e: any) => {
        e.target.setStyle({
          fillOpacity: 0.5,
          weight: 1,
          color: '#ccc'
        })
      }
    })
  }
  
  const style = (feature: any) => ({
    fillColor: getRegionColor(feature.properties.name),
    fillOpacity: 0.5,
    color: '#ffffff',
    weight: 1
  })
  
  return (
    <MapContainer
      center={[60, 100]}
      zoom={3}
      minZoom={2}
      maxZoom={8}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom={true}
    >
      <GeoJSON
        url="/russia.geojson"
        onEachFeature={onEachFeature}
        style={style}
      />
    </MapContainer>
  )
}
```

---

#### 3.3. Создать легенду карты

**Файл:** `frontend_map/src/components/Map/MapLegend.tsx`

```tsx
import { FC } from 'react'

interface MapLegendProps {
  maxSum: number
}

export const MapLegend: FC<MapLegendProps> = ({ maxSum }) => {
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)} млрд ₽`
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)} млн ₽`
    return `${num.toFixed(0)} ₽`
  }
  
  return (
    <div className="map-legend">
      <h4>Сумма закупок</h4>
      <div className="legend-gradient">
        <div className="legend-step" style={{ opacity: 0.3 }}>
          <span>0</span>
        </div>
        <div className="legend-step" style={{ opacity: 0.5 }}>
          <span>{formatNumber(maxSum * 0.25)}</span>
        </div>
        <div className="legend-step" style={{ opacity: 0.7 }}>
          <span>{formatNumber(maxSum * 0.5)}</span>
        </div>
        <div className="legend-step" style={{ opacity: 1 }}>
          <span>{formatNumber(maxSum)}</span>
        </div>
      </div>
    </div>
  )
}
```

---

### Этап 4: Frontend Map — Детализация региона (1-2 дня)

#### 4.1. API клиент

**Файл:** `frontend_map/src/api/mapApi.ts`

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

export interface RegionSummary {
  region: string
  sum: number
  count: number
  quantity: number
  avg_price: number
}

export interface RegionDetail {
  region: string
  kpi: {
    total_sum: number
    contract_count: number
    avg_contract: number
    total_quantity: number
  }
  top_suppliers: Array<{ name: string; sum: number; percent: number }>
  top_categories: Array<{ name: string; sum: number; percent: number }>
  dynamics: Array<{ month: string; sum: number; count: number }>
}

export const mapApi = {
  getRegions: async (years?: string[], industries?: string[]): Promise<RegionSummary[]> => {
    const params = new URLSearchParams()
    if (years?.length) params.set('years', years.join(','))
    if (industries?.length) params.set('industries', industries.join(','))
    const { data } = await api.get(`/map/regions?${params}`)
    return data
  },
  
  getRegionDetail: async (
    regionName: string,
    years?: string[],
    industries?: string[]
  ): Promise<RegionDetail> => {
    const params = new URLSearchParams()
    if (years?.length) params.set('years', years.join(','))
    if (industries?.length) params.set('industries', industries.join(','))
    const { data } = await api.get(`/map/region/${encodeURIComponent(regionName)}?${params}`)
    return data
  }
}
```

---

#### 4.2. Zustand store

**Файл:** `frontend_map/src/stores/mapStore.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mapApi, RegionSummary, RegionDetail } from '../api/mapApi'

interface MapState {
  selectedRegion: string | null
  regionData: RegionSummary[]
  regionDetail: RegionDetail | null
  filters: {
    years: string[]
    industries: string[]
  }
  isLoading: boolean
  error: string | null
  
  // Actions
  setSelectedRegion: (region: string | null) => void
  setFilters: (filters: Partial<MapState['filters']>) => void
  loadRegionData: () => Promise<void>
  loadRegionDetail: (regionName: string) => Promise<void>
  clearDetail: () => void
}

export const useMapStore = create<MapState>()(
  persist(
    (set, get) => ({
      selectedRegion: null,
      regionData: [],
      regionDetail: null,
      filters: { years: [], industries: [] },
      isLoading: false,
      error: null,
      
      setSelectedRegion: (region) => {
        set({ selectedRegion: region })
        if (region) {
          get().loadRegionDetail(region)
        }
      },
      
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        }))
        get().loadRegionData()
      },
      
      loadRegionData: async () => {
        set({ isLoading: true, error: null })
        try {
          const { filters } = get()
          const data = await mapApi.getRegions(
            filters.years.length ? filters.years : undefined,
            filters.industries.length ? filters.industries : undefined
          )
          set({ regionData: data, isLoading: false })
        } catch (err) {
          set({ error: 'Ошибка загрузки данных карты', isLoading: false })
        }
      },
      
      loadRegionDetail: async (regionName) => {
        try {
          const { filters } = get()
          const detail = await mapApi.getRegionDetail(
            regionName,
            filters.years.length ? filters.years : undefined,
            filters.industries.length ? filters.industries : undefined
          )
          set({ regionDetail: detail })
        } catch (err) {
          set({ error: 'Ошибка загрузки детализации региона' })
        }
      },
      
      clearDetail: () => set({ regionDetail: null })
    }),
    {
      name: 'map-filters',
      partialize: (state) => ({ filters: state.filters })
    }
  )
)
```

---

#### 4.3. Компонент детализации региона

**Файл:** `frontend_map/src/components/RegionDetail/RegionDetail.tsx`

```tsx
import { FC } from 'react'
import { useMapStore } from '../../stores/mapStore'
import { RegionKpi } from './RegionKpi'
import { TopSuppliers } from './TopSuppliers'
import { TopCategories } from './TopCategories'

export const RegionDetail: FC = () => {
  const { selectedRegion, regionDetail, clearDetail } = useMapStore()
  
  if (!selectedRegion || !regionDetail) return null
  
  return (
    <div className="region-detail-panel">
      <div className="region-detail-header">
        <h2>{regionDetail.region}</h2>
        <button onClick={clearDetail} className="close-btn">✕</button>
      </div>
      
      <div className="region-detail-content">
        <RegionKpi kpi={regionDetail.kpi} />
        
        <div className="region-detail-grid">
          <TopSuppliers suppliers={regionDetail.top_suppliers} />
          <TopCategories categories={regionDetail.top_categories} />
        </div>
      </div>
    </div>
  )
}
```

---

#### 4.4. Компонент KPI региона

**Файл:** `frontend_map/src/components/RegionDetail/RegionKpi.tsx`

```tsx
import { FC } from 'react'

interface KpiData {
  total_sum: number
  contract_count: number
  avg_contract: number
  total_quantity: number
}

interface RegionKpiProps {
  kpi: KpiData
}

export const RegionKpi: FC<RegionKpiProps> = ({ kpi }) => {
  const formatMoney = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)} млрд ₽`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)} млн ₽`
    return `${num.toLocaleString()} ₽`
  }
  
  return (
    <div className="region-kpi">
      <div className="kpi-card">
        <span className="kpi-label">Общая сумма</span>
        <span className="kpi-value">{formatMoney(kpi.total_sum)}</span>
      </div>
      <div className="kpi-card">
        <span className="kpi-label">Контрактов</span>
        <span className="kpi-value">{kpi.contract_count}</span>
      </div>
      <div className="kpi-card">
        <span className="kpi-label">Средний контракт</span>
        <span className="kpi-value">{formatMoney(kpi.avg_contract)}</span>
      </div>
      <div className="kpi-card">
        <span className="kpi-label">Объём (шт)</span>
        <span className="kpi-value">{kpi.total_quantity.toLocaleString()}</span>
      </div>
    </div>
  )
}
```

---

### Этап 5: Frontend Map — Фильтры (0.5-1 день)

#### 5.1. Компонент фильтров

**Файл:** `frontend_map/src/components/Filters/MapFilters.tsx`

```tsx
import { FC } from 'react'
import { useMapStore } from '../../stores/mapStore'

export const MapFilters: FC = () => {
  const { filters, setFilters } = useMapStore()
  
  // Получить список годов с бэкенда
  const { data: years = [] } = useQuery({
    queryKey: ['years'],
    queryFn: () => fetch('/api/filters/years').then(r => r.json())
  })
  
  const toggleYear = (year: string) => {
    const newYears = filters.years.includes(year)
      ? filters.years.filter(y => y !== year)
      : [...filters.years, year]
    setFilters({ years: newYears })
  }
  
  return (
    <div className="map-filters">
      <div className="filter-group">
        <label>Год:</label>
        <div className="year-buttons">
          {years.map(year => (
            <button
              key={year}
              className={`year-btn ${filters.years.includes(year) ? 'active' : ''}`}
              onClick={() => toggleYear(year)}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
      
      {/* Аналогично для отраслей */}
    </div>
  )
}
```

---

### Этап 6: Сборка и запуск (0.5 дня)

#### 6.1. Главное приложение

**Файл:** `frontend_map/src/App.tsx`

```tsx
import { Map } from './components/Map/Map'
import { MapLegend } from './components/Map/MapLegend'
import { RegionDetail } from './components/RegionDetail/RegionDetail'
import { MapFilters } from './components/Filters/MapFilters'
import { useMapStore } from './stores/mapStore'
import { useEffect } from 'react'

function App() {
  const {
    selectedRegion,
    setSelectedRegion,
    regionData,
    filters,
    loadRegionData
  } = useMapStore()
  
  useEffect(() => {
    loadRegionData()
  }, [filters])
  
  const maxSum = regionData.length > 0
    ? Math.max(...regionData.map(r => r.sum))
    : 0
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>CGM Dashboard — Карта закупок</h1>
      </header>
      
      <MapFilters />
      
      <div className="main-content">
        <div className="map-container">
          <Map
            onRegionSelect={setSelectedRegion}
            regionData={regionData}
            filters={filters}
          />
          <MapLegend maxSum={maxSum} />
        </div>
        
        <RegionDetail />
      </div>
    </div>
  )
}

export default App
```

---

#### 6.2. Стили

**Файл:** `frontend_map/src/styles/map.css`

```css
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  padding: 1rem 2rem;
  background: #1976d2;
  color: white;
}

.main-content {
  flex: 1;
  display: flex;
  position: relative;
}

.map-container {
  flex: 1;
  position: relative;
}

.map-legend {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 1000;
}

.region-detail-panel {
  width: 400px;
  background: white;
  border-left: 1px solid #ddd;
  padding: 1.5rem;
  overflow-y: auto;
}

.region-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}
```

---

#### 6.3. Запуск

```powershell
# Терминал 1 - Backend (если не запущен)
cd backend
python main.py

# Терминал 2 - Frontend Map
cd frontend_map
npm run dev
```

**Доступ:** http://localhost:5174

---

## ⏱ Оценка времени

| Этап | Задачи | Время |
|------|--------|-------|
| **1. Подготовка** | Создание структуры, настройка порта, GeoJSON | 0.5 дня |
| **2. Бэкенд** | 2-3 новых endpoint, кэширование | 1-2 дня |
| **3. Карта** | Leaflet компонент, легенда | 1-2 дня |
| **4. Детализация** | API клиент, store, компоненты | 1-2 дня |
| **5. Фильтры** | Компонент фильтров | 0.5-1 дня |
| **6. Интеграция** | Сборка, стили, тестирование | 0.5 дня |
| **7. Тестирование** | Проверка на разных данных | 0.5 дня |
| **Итого** | | **5-8 дней** |

---

## ⚠️ Риски и решения

| Риск | Вероятность | Влияние | Решение |
|------|-------------|---------|---------|
| GeoJSON файл большой (>10 MB) | Средняя | Высокое | Сжатие, упрощение геометрии |
| Медленная загрузка данных | Средняя | Среднее | Кэширование на бэкенде |
| Конфликты портов | Низкая | Низкое | Изменение порта в vite.config.ts |
| Нет данных по некоторым регионам | Высокая | Низкое | Серый цвет, сообщение "нет данных" |
| Проблемы с CORS | Низкая | Среднее | Настройка ALLOWED_ORIGINS в .env |

---

## 📌 Контрольный список готовности

### Бэкенд
- [ ] Endpoint `/api/map/regions` работает
- [ ] Endpoint `/api/map/region/{name}` работает
- [ ] Кэширование настроено
- [ ] Swagger документация обновлена

### Фронтенд
- [ ] Карта отображается
- [ ] Регионы подсвечиваются при наведении
- [ ] Клик открывает детализацию
- [ ] Фильтры применяются
- [ ] Легенда отображается
- [ ] Адаптивность работает

### Тестирование
- [ ] Проверены все регионы
- [ ] Проверены фильтры
- [ ] Проверена производительность
- [ ] Проверена работа без данных

---

## 🚀 Следующие шаги

1. **Согласовать план** — утвердить оценку и приоритеты
2. **Начать с Этапа 1** — подготовить структуру
3. **Разрабатывать итеративно** — каждый этап тестируется
4. **Деплой** — добавить в docker-compose.yml

---

**Готов к началу разработки!** 🗺️
