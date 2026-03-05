# 🎨 Frontend Documentation - CGM Dashboard

## 📦 Технологии

| Компонент | Технология |
|-----------|------------|
| **Фреймворк** | React 18 + TypeScript |
| **Сборщик** | Vite 7 |
| **UI библиотека** | Material-UI (MUI) |
| **Графики** | Recharts |
| **Состояние** | Zustand |
| **Data fetching** | TanStack Query (React Query) |
| **HTTP клиент** | Axios |

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

Отображает 6 KPI карточек:
- Общая сумма закупок
- Количество контрактов
- Средняя сумма контракта
- Общий объём (шт)
- Средняя цена за единицу
- Количество заказчиков

**Пропсы:**
```typescript
interface KpiPanelProps {
  data: KpiData | null;
  loading?: boolean;
}
```

### FilterPanel

Боковая панель с фильтрами:
- Год закупки (сетка кнопок 2024-2034)
- Месяц закупки (сетка 12 месяцев)
- Регион (Autocomplete)
- Заказчик (Autocomplete)
- Поставщик (Autocomplete)
- Что закупали (Autocomplete)
- Кнопки: Обновить, Сбросить

### DynamicsChart

Комбинированная диаграмма:
- Столбцы: сумма закупок
- Линия: количество

### RegionsChart

Топ-10 регионов по сумме (горизонтальный bar chart)

### SuppliersChart

Топ-5 поставщиков + Остальные (pie chart)

### CategoriesChart

Топ-7 категорий товаров (pie chart)

### HeatmapChart

Тепловая карта: доля товаров по месяцам (%)
- Ось Y: товары (топ-15)
- Ось X: месяцы
- Ячейки: % доли с цветовой кодировкой
- Итоговая колонка: общая доля

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

---

## 🎨 Темизация

```typescript
// src/main.tsx
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2', light: '#e3f2fd' },
    secondary: { main: '#ff9800' },
    background: { default: '#f5f5f5' },
  },
});
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

---

## 📝 Changelog

### v1.0.0 (2026-03-03)
- ✅ Initial release
- ✅ KPI panel (6 карточек)
- ✅ Filter panel (6 фильтров)
- ✅ 5 chart components
- ✅ Heatmap component
- ✅ Responsive design
