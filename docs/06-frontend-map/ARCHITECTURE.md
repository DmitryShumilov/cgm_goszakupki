# CGM Dashboard — Карта закупок

## 📋 Описание

Интерактивная карта госзакупок по регионам России с фильтрами и детализацией по регионам.

**Технологии:**
- React 18 + TypeScript
- Vite (сборка)
- Zustand (state management)
- Leaflet + react-leaflet (карта)
- Material UI (компоненты фильтров)
- Playwright (E2E тесты)

---

## 🏗️ Архитектура проекта

```
frontend_map/
├── src/
│   ├── api/
│   │   ├── client.ts          # Axios клиент с интерцепторами ошибок
│   │   └── mapApi.ts          # API методы + mockData (85 регионов)
│   ├── components/
│   │   ├── Map/
│   │   │   ├── Map.tsx        # Интерактивная карта (Leaflet)
│   │   │   └── MapLegend.tsx  # Легенда с градиентом интенсивности
│   │   ├── RegionDetail/
│   │   │   └── RegionDetail.tsx  # Панель региона с KPI
│   │   └── HeaderFilters.tsx  # Фильтры в хедере
│   ├── stores/
│   │   ├── mapStore.ts        # Состояние карты (Zustand)
│   │   └── filterStore.ts     # Состояние фильтров (Zustand + persist)
│   ├── utils/
│   │   └── regionMapping.ts   # Сопоставление названий регионов
│   ├── styles/
│   │   └── map.css            # Стили в тёмной теме
│   ├── App.tsx                # Главный компонент
│   └── main.tsx               # Точка входа
├── public/
│   └── russia_regions.geojson # GeoJSON регионов России
├── tests/
│   └── e2e/                   # E2E тесты (Playwright)
└── docs/
    └── ARCHITECTURE.md        # Этот документ
```

---

## 🗺️ Компонент карты

### Map.tsx

**Основные возможности:**
- Отображение регионов РФ через GeoJSON
- Цветовая кодировка по сумме закупок (градиент интенсивности)
- Интерактивные ховер-эффекты с тултипами
- Клик для открытия панели региона
- Кастомные кнопки зума (+/-)
- Ограничение масштаба: `minZoom={3}`, `maxZoom={8}`

**Стилизация регионов:**
```css
path.leaflet-interactive {
  stroke: #ffffff;
  stroke-width: 1.5px;
  fill-opacity: 0.5;
  outline: none;  /* Убрана рамка фокуса */
}
```

### MapLegend.tsx

Легенда отображает градиент интенсивности:
- Максимальная сумма (тёмно-синий)
- 66% от максимума
- 33% от максимума
- Минимальная сумма (светло-синий)
- Нет данных (серый)

---

## 🎛️ Фильтры (HeaderFilters.tsx)

### Расположение
Фильтры находятся в хедере справа, вместе со счётчиком регионов.

### Состав фильтров
| Фильтр | Ширина | Placeholder | Логика отображения |
|--------|--------|-------------|-------------------|
| **Год** | 140px | "Год" | Показывает "Год" если пусто, иначе "2024 (+2)" |
| **Продукты** | 220px | "Продукты" | Показывает "Продукты" если все/ничего, иначе первое значение |
| **Поставщик** | 220px | "Поставщик" | Показывает "Поставщик" если все/ничего, иначе первое значение |

### Визуальный стиль
```css
background: rgba(51, 136, 255, 0.2);  /* Голубая заливка */
border-radius: 8px;
color: rgba(255, 255, 255, 0.8);  /* Белый текст */
font-size: 12px;
```

### Логика работы
1. **renderValue={() => null}** — скрывает стандартные чипы MUI
2. **renderTags={() => null}** — скрывает теги
3. **placeholder** — динамически обновляется через `renderInput`
4. **Input прозрачный** — текст виден только через placeholder

### Кнопка сброса
Сбрасывает все фильтры в исходное состояние через `resetFilters()` из `filterStore`.

---

## 📊 Хранилища состояний

### mapStore.ts

```typescript
interface MapState {
  selectedRegion: string | null;
  regionData: RegionData[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSelectedRegion: (region) => void;
  loadRegionData: () => Promise<void>;
  clearSelection: () => void;
}
```

### filterStore.ts

```typescript
interface FilterState {
  selectedYears: number[];
  selectedRegions: string[];
  selectedSuppliers: string[];
  selectedProducts: string[];
  
  availableYears: number[];
  availableRegions: string[];
  availableSuppliers: string[];
  availableProducts: string[];
  
  // Actions
  toggleYear: (year) => void;
  toggleRegion: (region) => void;
  // ...
  resetFilters: () => void;
}
```

**Особенности:**
- Использует `persist` middleware для сохранения в localStorage
- `safeStorage` обёртка для защиты от ошибок SSR
- Сохраняются только выбранные фильтры (partialize)

---

## 🌍 Сопоставление регионов

### regionMapping.ts

**Назначение:** Преобразование названий регионов между GeoJSON и БД.

**Исправленные ошибки:**
1. ✅ **Брянская область** → раньше мапилась на Белгородскую
2. ✅ **Ханты-Мансийский АО** — приведён символ тире (— вместо -)
3. ✅ **Северная Осетия** — приведён символ тире (— вместо -)

**Пример использования:**
```typescript
const normalizedDbName = normalizeRegionName(geojsonRegionName);
const data = regionData.find(r => r.region === normalizedDbName);
```

---

## 🎨 Цветовая схема

### Основные цвета
| Элемент | Цвет |
|---------|------|
| Фон карты | `linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)` |
| Регионы (нет данных) | `rgba(100, 100, 100, 0.3)` |
| Регионы (данные) | `rgba(51, 136, 255, 0.4-0.9)` |
| Выделенный регион | `rgba(255, 152, 0, 0.8)` |
| Границы | `#ffffff` |
| Хедер | `rgba(15, 12, 41, 1)` (полностью непрозрачный) |

### Фильтры
| Состояние | Цвет текста | Фон |
|-----------|-------------|-----|
| Placeholder | `rgba(255,255,255,0.8)` | `rgba(51, 136, 255, 0.2)` |
| Выбранное значение | `#ffffff` | `rgba(51, 136, 255, 0.2)` |
| Dropdown | `#FFFFFF` | `linear-gradient(180deg, #1a3a5c, #0D2B4A)` |

---

## 📦 Mock данные

### Структура RegionData
```typescript
interface RegionData {
  region: string;
  sum: number;        // Сумма закупок
  count: number;      // Количество контрактов
  quantity: number;   // Объём (шт)
  avg_price: number;  // Средняя цена
}
```

### Охват данных
- **85 регионов** в mockData
- Все регионы РФ включая новые (ДНР, ЛНР, Запорожская, Херсонская области)
- Тестовые данные для фильтров: 8 поставщиков, 10 продуктов

---

## ⚙️ Конфигурация

### Zoom карты
```typescript
<MapContainer
  zoom={3}        // Начальный масштаб (заполняет экран 1920×1080)
  minZoom={3}     // Нельзя уменьшить больше начального
  maxZoom={8}     // Максимальное приближение
  center={[64, 100]}  // Центр карты (Россия)
/>
```

### API клиент
```typescript
const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Интерцепторы для обработки ошибок:
// - 404: Данные не найдены
// - 422: Ошибка валидации
// - 500: Ошибка сервера
// - Network error: Backend недоступен
```

---

## 🧪 Тестирование

### E2E тесты (Playwright)
```bash
npm run test:e2e        # Запуск всех тестов
npm run test:e2e:ui     # Интерактивный режим
npm run test:e2e:report # HTML отчёт
```

### Smoke тесты
1. ✅ Загрузка дашборда
2. ✅ KPI карточки отображаются
3. ✅ Фильтры работают
4. ✅ Карта интерактивна
5. ✅ Панель региона открывается

---

## 🚀 Запуск проекта

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Сборка production
npm run build

# Предпросмотр сборки
npm run preview
```

**Порт:** `http://localhost:5173`

---

## 📝 История изменений

### v0.1.9 (текущая)
- ✅ Исправлены ошибки сопоставления регионов (Брянская обл., ХМАО, Сев. Осетия)
- ✅ Обновлены фильтры: динамический placeholder, скрытие чипов
- ✅ Синхронизированы стили фильтров со счётчиком регионов
- ✅ Убрана рамка фокуса при клике на регион
- ✅ Установлен minZoom=3 для заполнения экрана
- ✅ Убран backdrop-filter у хедера (устранены искажения цвета)

### Планы развития
- [ ] Подключение к реальному API
- [ ] Топ поставщиков по регионам
- [ ] Детализация по категориям закупок
- [ ] Экспорт данных (CSV, XLSX)
- [ ] Сравнение периодов

---

## 📞 Контакты

Вопросы и предложения: см. `CONTRIBUTING.md` в корне проекта.
