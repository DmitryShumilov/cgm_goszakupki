# 🗺️ Карта регионов РФ

**Проект:** CGM Dashboard — Интерактивная карта госзакупок
**Адрес:** http://localhost:5174
**Статус:** ✅ Готов к использованию

---

## 📋 Обзор

Интерактивная карта России для визуализации данных о госзакупках по регионам.

### Основные возможности

- **85 регионов России** — все субъекты РФ
- **Цветовая индикация** — градиент от суммы закупок (синий)
- **Интерактивность** — hover эффекты, tooltip, выделение при клике
- **Панель региона** — KPI карточки при выборе региона
- **Легенда** — градиент сумм закупок
- **Zoom control** — кнопки +/- для масштабирования
- **Адаптивность** — mobile/tablet/desktop версии

---

## 🏗 Архитектура

```
┌─────────────────────┐     ┌──────────────┐     ┌─────────────┐
│  GeoJSON (85 рег)   │ --> │  React Map   │ --> │  Leaflet    │
│  russia_regions.    │     │  Components  │     │  Рендеринг  │
└─────────────────────┘     └──────────────┘     └─────────────┘
                                   │
                                   v
                            ┌──────────────┐
                            │  Zustand     │
                            │  Store       │
                            └──────────────┘
```

---

## 📁 Структура frontend_map

```
frontend_map/
├── src/
│   ├── api/
│   │   └── mapApi.ts           # API клиент (mock данные)
│   ├── components/
│   │   ├── Map/
│   │   │   ├── Map.tsx         # Основной компонент карты
│   │   │   └── MapLegend.tsx   # Легенда карты
│   │   └── RegionDetail/
│   │       └── RegionDetail.tsx # Панель информации о регионе
│   ├── stores/
│   │   └── mapStore.ts         # Zustand store
│   ├── styles/
│   │   └── map.css             # Стили карты
│   ├── utils/
│   │   └── regionMapping.ts    # Маппинг названий регионов
│   ├── App.tsx                 # Главный компонент
│   ├── index.css               # Глобальные стили
│   └── main.tsx                # Точка входа
├── public/
│   └── russia_regions.geojson  # GeoJSON карта РФ (WGS84)
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🔧 Технологии

| Компонент | Версия | Назначение |
|-----------|--------|------------|
| React | 19.2.4 | UI библиотека |
| TypeScript | 5.9.3 | Типизация |
| Vite | 7.3.1 | Сборщик |
| Leaflet | 1.9.4 | Карта |
| react-leaflet | 5.0.0 | React компоненты для Leaflet |
| @types/leaflet | 1.9.21 | TypeScript типы |
| Material-UI | 7.3.9 | UI компоненты |
| Zustand | 5.0.11 | State manager |
| Axios | 1.13.6 | HTTP клиент |

---

## 📊 Модель данных

### RegionData

```typescript
interface RegionData {
  region: string;      // Название региона (БД)
  sum: number;         // Сумма закупок (руб)
  count: number;       // Количество контрактов
  quantity: number;    // Объём (шт)
  avg_price: number;   // Средняя цена
}
```

### GeoJSON Structure

```json
{
  "type": "FeatureCollection",
  "crs": {
    "type": "name",
    "properties": {
      "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
    }
  },
  "features": [
    {
      "type": "Feature",
      "properties": {
        "region": "Сахалинская область",
        "federal_district": "Дальневосточный",
        "population": 466568
      },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [...]
      }
    }
  ]
}
```

---

## 🔑 Ключевые особенности реализации

### 1. Нормализация координат

**Проблема:** Чукотский АО пересекает 180-й меридиан, что вызывает искажения.

**Решение:**
```typescript
function normalizeCoordinates(geojson: any): any {
  return {
    ...geojson,
    features: geojson.features.map((feature: any) => {
      const splitCoords = (coords: any[]): any[] => {
        // Проверяем пересечение 180-го меридиана
        const longitudes = coords.flat(2).filter((c: any) => typeof c[0] === 'number');
        const hasNegative = longitudes.some((lon: number) => lon < 0);
        const hasPositive = longitudes.some((lon: number) => lon > 0);
        
        if (hasNegative && hasPositive) {
          // Сдвигаем отрицательные долготы на +360
          const adjustCoords = (c: any[]): any[] => {
            if (typeof c[0] === 'number' && typeof c[1] === 'number') {
              return c[0] < 0 ? [c[0] + 360, c[1]] : c;
            }
            return c.map(adjustCoords);
          };
          return coords.map(adjustCoords);
        }
        
        return coords.map(splitCoords);
      };
      
      return {
        ...feature,
        geometry: {
          ...geom,
          coordinates: splitCoords(geom.coordinates)
        }
      };
    })
  };
}
```

### 2. Маппинг названий регионов

**Проблема:** Названия регионов в GeoJSON и БД могут отличаться.

**Примеры:**
- GeoJSON: `Ханты-Мансийский автономный округ — Югра` (длинное тире)
- БД: `Ханты-Мансийский автономный округ - Югра` (короткое тире)

**Решение:** `regionMapping.ts`
```typescript
export const regionMapping: Record<string, string> = {
  'Ханты-Мансийский автономный округ — Югра': 'Ханты-Мансийский автономный округ - Югра',
  'Сахалинская область': 'Сахалинская область',
  // ... другие регионы
};

export function normalizeRegionName(geojsonName: string): string {
  return regionMapping[geojsonName] || geojsonName;
}
```

### 3. Актуальное состояние в обработчиках событий

**Проблема:** Замыкание в `onEachFeature` не видит обновлений `selectedRegion`.

**Решение:** Использование `useRef`
```typescript
const selectedRegionRef = useRef(selectedRegion);
useEffect(() => {
  selectedRegionRef.current = selectedRegion;
}, [selectedRegion]);

// В обработчике:
const isSelected = selectedRegionRef.current === normalizedDbName;
```

---

## 🎨 Компоненты

### Map.tsx

Основной компонент карты.

**Props:**
- `onRegionSelect: (region: string) => void`
- `regionData: RegionData[]`
- `selectedRegion: string | null`

**Функции:**
- Загрузка и нормализация GeoJSON
- Отрисовка регионов через `GeoJSON`
- Обработка событий (click, mouseover, mouseout)
- Стилизация регионов (цвет, opacity, stroke)

### MapLegend.tsx

Легенда карты с градиентом сумм.

**Функции:**
- Вычисление min/max сумм
- Отрисовка градиента
- Подсчёт регионов с данными/без данных

### RegionDetail.tsx

Панель информации о выбранном регионе.

**KPI карточки:**
- Общая сумма
- Количество контрактов
- Средний контракт
- Объём (шт)

---

## 🚀 Запуск

```bash
cd frontend_map
npm install
npm run dev
```

**Откройте:** http://localhost:5174

---

## 🔧 Устранение проблем

### Карта не отображается

1. Проверьте консоль на ошибки
2. Убедитесь, что GeoJSON загружен:
   ```javascript
   console.log('✅ GeoJSON loaded:', data.features?.length, 'features');
   ```
3. Проверьте, что SVG виден (F12 → Elements):
   ```javascript
   document.querySelectorAll('path.leaflet-interactive').length
   // Должно быть 85+
   ```

### Регион не выделяется

1. Проверьте консоль при клике:
   ```
   📍 Clicked: Регион -> normalized: Регион
   Data found: {...}
   ```
2. Убедитесь, что `data` не `undefined`
3. Проверьте `regionMapping.ts`

### Tooltip не появляется

1. Проверьте, что `data.sum > 0`
2. Убедитесь, что `mouseover` событие срабатывает
3. Проверьте CSS (pointer-events)

---

## 📈 Будущие улучшения

### Планируется

- [ ] Подключение к backend API (`/api/map/regions`)
- [ ] Детализация по региону (топ поставщиков, категорий)
- [ ] Фильтры по годам/месяцам
- [ ] Экспорт данных (CSV, Excel)
- [ ] Печать карты

### Опционально

- [ ] Анимация при наведении
- [ ] Сравнение периодов
- [ ] Тепловая карта по районам
- [ ] 3D визуализация (Deck.gl)

---

## 📞 Поддержка

По вопросам обращайтесь к команде разработки CGM Dashboard.
