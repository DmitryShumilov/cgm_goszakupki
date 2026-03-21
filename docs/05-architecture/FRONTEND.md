# 🎨 Frontend Documentation - CGM Dashboard

## 📦 Технологии

| Компонент | Технология |
|-----------|------------|
| **Фреймворк** | React 19 + TypeScript |
| **Сборщик** | Vite 7 |
| **UI библиотека** | Material-UI (MUI) 7 |
| **Графики** | Recharts 3 |
| **Состояние** | Zustand 5 |
| **Data fetching** | TanStack Query 5 |
| **HTTP клиент** | Axios 1 |

---

## 🚀 Быстрый старт

### Установка зависимостей

```bash
cd frontend
npm install
```

### Запуск dev-сервера

```bash
npm run dev
```

Дашборд доступен по адресу: **http://localhost:5173**

### Сборка для production

```bash
npm run build
```

Результат в папке `dist/`

---

## 📁 Структура проекта

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts          # Axios клиент
│   │   ├── index.ts           # API методы
│   │   └── types.ts           # TypeScript типы
│   ├── components/
│   │   ├── charts/
│   │   │   ├── DynamicsChart.tsx
│   │   │   ├── RegionsChart.tsx
│   │   │   ├── SuppliersChart.tsx
│   │   │   ├── CategoriesChart.tsx
│   │   │   └── HeatmapChart.tsx
│   │   ├── filters/
│   │   │   └── FilterPanel.tsx
│   │   └── kpi/
│   │       └── KpiPanel.tsx
│   ├── stores/
│   │   └── filterStore.ts     # Zustand store
│   ├── App.tsx                # Главный компонент
│   ├── main.tsx               # Точка входа
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🎯 Компоненты

### KpiPanel

Отображает 6 KPI карточек с градиентами и подсказками:
- Общая сумма закупок (синий градиент)
- Средняя сумма контракта (голубой градиент)
- Количество контрактов (зелёный градиент)
- Общий объём (шт) (синий градиент)
- Средняя цена за единицу (голубой градиент)
- Количество заказчиков (зелёный градиент)

**Пропсы:**
```typescript
interface KpiPanelProps {
  data: KpiData | null;
  loading?: boolean;
}
```

**Подсказки для метрик:**
- ℹ️ Иконка информации рядом с названием
- Tooltip с формулой расчёта при наведении
- Стиль: тёмная тема (`rgba(26, 58, 92, 0.98)`)

### FilterPanel

Боковая панель с фильтрами (тёмная тема):
- Год закупки (сетка кнопок 2024-2034, 11px)
- Месяц закупки (сетка 12 месяцев, 11px)
- Регион (Autocomplete, placeholder 12px, опции 12px)
- Заказчик (Autocomplete, placeholder 12px, опции 12px)
- Поставщик (Autocomplete, placeholder 12px, опции 12px)
- Что закупали (Autocomplete, placeholder 12px, опции 12px)
- Кнопки: Обновить, Сбросить

**Доступность (A11y):**
- ARIA-атрибуты для всех интерактивных элементов
- `role="navigation"` для Drawer
- `aria-label` для кнопок и панелей
- Контраст текста: 0.85 (WCAG 2.1 AA compliant)

### DynamicsChart

Комбинированная диаграмма (тёмная тема):
- Столбцы: сумма закупок
- Линия: количество
- Фон: `rgba(15, 12, 41, 0.95)`
- Tooltip: `rgba(26, 58, 92, 0.98)`

### RegionsChart

Топ-10 регионов по сумме (тёмная тема, горизонтальный bar chart)

### SuppliersChart

Топ-5 поставщиков + Остальные (тёмная тема, pie chart)

### CategoriesChart

Топ-7 категорий товаров (тёмная тема, pie chart)

### HeatmapChart

Тепловая карта (тёмная тема):
- Ось Y: товары (топ-15)
- Ось X: месяцы (12 месяцев)
- Ячейки: % доли с цветовой кодировкой (синяя гамма)
- Итоговая колонка: общая доля (синий фон)
- **📈 Тренд:** Line sparkline для визуализации динамики по месяцам

---

## 📡 API Integration

### Настройка клиента

```typescript
// src/api/client.ts
const apiClient = axios.create({
  baseURL: '/api',  // Прокси на backend
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Использование React Query

```typescript
const { data: kpiData, isLoading } = useQuery({
  queryKey: ['kpi', filterParams],
  queryFn: () => dashboardApi.getKpi(filterParams),
});
```

### Фильтры

Все API endpoints поддерживают фильтры:

```typescript
const filterParams = {
  years: [2024, 2025],
  months: [1, 2, 3],
  regions: ['Москва', 'СПб'],
  customers: ['Комитет...'],
  suppliers: ['Медиалайн'],
  products: ['Freestyle Libre'],
};

const data = await dashboardApi.getKpi(filterParams);
```

---

## 🗄 Управление состоянием

### Zustand Store

```typescript
// src/stores/filterStore.ts
const {
  selectedYears,
  toggleYear,
  resetFilters,
} = useFilterStore();
```

**Методы:**
- `toggleYear(year)` - Выбрать/снять год
- `selectAllYears()` - Выбрать все годы
- `resetFilters()` - Сбросить фильтры

**Persist middleware:**
- Сохранение фильтров в localStorage
- Ключ: `cgm-filter-storage`
- SSR-safe проверка window

---

## 🎨 Темизация

### Глобальная тема (main.tsx)

```typescript
const theme = createTheme({
  palette: {
    primary: { main: '#00B4DB' },
    secondary: { main: '#FF9500' },
    background: { default: '#0f0c29' },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    body2: { fontSize: '13px' },
    caption: { fontSize: '11px' },
  },
});
```

### Градиенты KPI карточек

| Метрика | Градиент |
|---------|----------|
| Общая сумма закупок | `#00B4DB` → `#0083B0` |
| Средняя сумма контракта | `#2193b0` → `#6dd5ed` |
| Количество контрактов | `#11998E` → `#38EF7D` |
| Общий объём (шт) | `#00B4DB` → `#0083B0` |
| Средняя цена за единицу | `#2193b0` → `#6dd5ed` |
| Заказчиков | `#11998E` → `#38EF7D` |

### Стили диаграмм (тёмная тема)

```typescript
<Paper sx={{
  p: 3,
  height: 400,
  background: 'rgba(15, 12, 41, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}}>
```

---

## 🔧 Конфигурация Vite

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

---

## 📊 Типы данных

```typescript
// src/api/types.ts
interface KpiData {
  total_amount: number;
  contract_count: number;
  avg_contract_amount: number;
  total_quantity: number;
  avg_price_per_unit: number;
  customer_count: number;
}

interface DynamicsData {
  labels: string[];
  amounts: number[];
  quantities: number[];
}

interface FilterParams {
  years?: number[];
  months?: number[];
  regions?: string[];
  customers?: string[];
  suppliers?: string[];
  products?: string[];
}
```

---

## ♿ Доступность (A11y)

### Реализованные улучшения

**ARIA-атрибуты:**
- `role="navigation"` для панели фильтров
- `role="region"` для KPI и диаграмм
- `aria-label` для всех интерактивных элементов
- `aria-expanded` для мобильного меню

**Контрастность:**
- Текст фильтров: `rgba(255, 255, 255, 0.85)` (WCAG 2.1 AA)
- Placeholder: `rgba(255, 255, 255, 0.85)`

**Управление с клавиатуры:**
- Tab/Shift+Tab навигация
- Enter/Space для активации кнопок
- Escape для закрытия меню

---

## 🐛 Устранение проблем

### Ошибки TypeScript

```bash
npm run build
```

Исправьте все ошибки перед запуском.

### API не отвечает

1. Проверьте, что backend запущен: `http://localhost:8000/api/health`
2. Проверьте proxy в vite.config.ts

### Графики не отображаются

1. Проверьте формат данных от API
2. Проверьте консоль браузера на ошибки

### Проблемы с доступностью

1. Проверьте ARIA-атрибуты в DevTools
2. Протестируйте навигацию с клавиатуры
3. Используйте скринридер для проверки

---

## 📝 Changelog

### v1.4.3 (2026-03-16)
- ✅ Оптимизация градиентов KPI карточек
- ✅ Увеличен контраст текста фильтров (WCAG 2.1 AA)
- ✅ Добавлены ARIA-атрибуты для доступности
- ✅ Унифицированы стили диаграмм (тёмная тема)
- ✅ Добавлены спарклайны в HeatmapChart
- ✅ Добавлены подсказки для метрик KPI
- ✅ Изменены размеры шрифтов в фильтрах

### v1.0.0 (2026-03-03)
- ✅ Initial release
- ✅ KPI panel (6 карточек)
- ✅ Filter panel (6 фильтров)
- ✅ 5 chart components
- ✅ Heatmap component
- ✅ Responsive design
