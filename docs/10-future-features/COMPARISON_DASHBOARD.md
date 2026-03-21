# 📊 Сравнение периодов — Спецификация дашборда

**Дата создания:** 18 марта 2026 г.
**Статус:** ⏳ Рекомендуется к реализации
**Приоритет:** P3 (желательно)
**Оценка времени:** ~3.5 часа

---

## 📋 Обзор

Этот документ описывает спецификацию **отдельного дашборда сравнения периодов**, который не входит в основной дашборд и реализуется опционально.

---

## ⚠️ Важное примечание

**Этот дашборд НЕ является частью основного CGM Dashboard (порт 5173).**

**Причина:**
- Основной дашборд оптимизирован для быстрого просмотра текущих показателей
- Режим сравнения требует сложных UI-компонентов (две колонки фильтров, KPI с индикаторами)
- Перегруженность интерфейса снижает удобство использования

**Рекомендация:** Реализовать как **отдельный дашборд** на порту **5175**.

---

## 🎯 Назначение

Дашборд сравнения периодов предназначен для:

1. **Сравнения показателей** двух периодов (год/месяц/регион)
2. **Выявления трендов** (рост/падение закупок)
3. **Анализа изменений** в разрезе регионов/поставщиков/продуктов
4. **Подготовки отчётов** для руководства

---

## 📍 Расположение в проекте

### Рекомендуемая структура

```
cgm_goszakupki/
├── frontend/              # Основной дашборд (порт 5173)
├── frontend_map/          # Карта регионов (порт 5174)
└── frontend_compare/      # Дашборд сравнения (порт 5175) ← НОВЫЙ
    ├── src/
    │   ├── App.tsx
    │   ├── api/
    │   ├── components/
    │   │   ├── PeriodFilters/      # Две колонки фильтров
    │   │   ├── ComparisonKpiPanel/ # KPI с индикаторами
    │   │   └── ComparisonCharts/   # Диаграммы с группировкой
    │   ├── stores/
    │   │   └── comparisonStore.ts  # Zustand store для сравнения
    │   └── ...
    ├── package.json
    └── vite.config.ts
```

---

## 🎨 Архитектура интерфейса

### 1. Заголовок дашборда

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 CGM Dashboard — Сравнение периодов                          │
│                                                                 │
│  [⚙️ Настройки] [📥 Экспорт отчёта] [❓ Помощь]                │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2. Панель фильтров (две колонки)

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 Режим сравнения периодов           [🔄 Поменять местами]   │
├─────────────────────────┬───────────────────────────────────────┤
│  Период А               │  Период Б                             │
│  ─────────              │  ─────────                            │
│                                                                 │
│  Годы: ☑ 2024           │  Годы: ☑ 2025                         │
│        ☐ 2025           │        ☐ 2024                         │
│        ☐ 2026           │        ☐ 2026                         │
│                                                                 │
│  Месяцы: ☑ Все          │  Месяцы: ☑ Все                        │
│                                                                 │
│  Регионы:               │  Регионы:                             │
│  ☑ Москва               │  ☑ Москва                             │
│  ☑ Санкт-Петербург      │  ☐ Казань                             │
│  ☐ Казань               │                                       │
│                                                                 │
│  Продукты:              │  Продукты:                            │
│  ☑ Freestyle Libre      │  ☑ Freestyle Libre                    │
│  ☑ Lumiflex Linx        │  ☐ Lumiflex Linx                      │
│                                                                 │
│  [Сбросить фильтры]     │  [Сбросить фильтры]                   │
└─────────────────────────┴───────────────────────────────────────┘
```

---

### 3. KPI карточки с индикаторами

```
┌─────────────────────────────────────────────────────────────────┐
│  KPI Метрики                                                    │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│ Общая сумма  │ Контрактов   │ Средний      │ Объём (шт)        │
│              │              │ контракт     │                   │
│ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────────┐  │
│ │ 1.25 млрд│ │ │   234    │ │ │  5.3 млн │ │ │    50 тыс    │  │
│ │Период А  │ │ │Период А  │ │ │Период А  │ │ │  Период А    │  │
│ └──────────┘ │ └──────────┘ │ └──────────┘ │ └──────────────┘  │
│ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────────┐  │
│ │ 1.89 млрд│ │ │   312    │ │ │  6.1 млн │ │ │    72 тыс    │  │
│ │Период Б  │ │ │Период Б  │ │ │Период Б  │ │ │  Период Б    │  │
│ └──────────┘ │ └──────────┘ │ └──────────┘ │ └──────────────┘  │
│ 📈 +51.2%    │ 📈 +33.3%    │ 📈 +15.1%    │ 📈 +44.0%         │
│ (+640 млн ₽) │ (+78)        │ (+800 тыс ₽) │ (+22 тыс)         │
└──────────────┴──────────────┴──────────────┴───────────────────┘
```

---

### 4. Диаграммы с группировкой

#### 4.1 Динамика закупок (Composed Chart)

```
┌─────────────────────────────────────────────────────────────────┐
│  📈 Динамика закупок                                            │
│                                                                 │
│  Сумма (млн ₽)    Количество (шт)                               │
│                                                                 │
│  2024 ████ 2025 ███████                                        │
│                                                                 │
│  Янв  Фев  Мар  Апр  Май  ...  Дек                             │
│  ░░░░ ▓▓▓▓ ████ ─────                                          │
│  2024 2024 2024  2024/25                                       │
│                                                                 │
│  [▓] Период А (2024)    [█] Период Б (2025)                    │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.2 Топ-10 регионов (Grouped Bar Chart)

```
┌─────────────────────────────────────────────────────────────────┐
│  🌍 Топ-10 регионов                                             │
│                                                                 │
│  Москва         ████████████ ░░░░░░░░                          │
│  СПб           ██████████ ░░░░░░░░░░                           │
│  Казань        ████████ ░░░░░░░░░░░░                           │
│  ...                                                            │
│                                                                 │
│                 2024      2025                                  │
│  [▓] Период А (2024)    [█] Период Б (2025)                    │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.3 Сравнение поставщиков (Scatter Plot)

```
┌─────────────────────────────────────────────────────────────────┐
│  🏢 Поставщики: Период А vs Период Б                            │
│                                                                 │
│  Сумма 2025 (млн ₽)                                             │
│       ↑                                                         │
│   500 │        ● Москва                                         │
│       │     ●                                                   │
│   250 │  ●         ● СПб                                        │
│       │ ●                                                       │
│     0 └────────────────────────────→                            │
│       0    250   500   Сумма 2024 (млн ₽)                       │
│                                                                 │
│  Диагональ: точки выше — рост, ниже — падение                   │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5. Таблица изменений

```
┌─────────────────────────────────────────────────────────────────┐
│  📋 Детальное сравнение по регионам                             │
├──────────────┬──────────┬──────────┬──────────┬────────────────┤
│ Регион       │ Период А │ Период Б │ Изменение│ Статус         │
├──────────────┼──────────┼──────────┼──────────┼────────────────┤
│ Москва       │ 1.25 млрд│ 1.89 млрд│ +51.2%   │ 📈 Рост        │
│ СПб          │ 850 млн  │ 920 млн  │ +8.2%    │ 📈 Рост        │
│ Казань       │ 420 млн  │ 380 млн  │ -9.5%    │ 📉 Падение     │
│ ...          │ ...      │ ...      │ ...      │ ...            │
└──────────────┴──────────┴──────────┴──────────┴────────────────┘

[📥 Экспорт в CSV] [🖨️ Печать]
```

---

## 🔧 Техническая спецификация

### 1. Zustand Store

**Файл:** `frontend_compare/src/stores/comparisonStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ComparisonState {
  // Режим сравнения
  compareModeEnabled: boolean;
  
  // Фильтры периода А
  periodA: {
    years: number[];
    months: number[];
    regions: string[];
    customers: string[];
    suppliers: string[];
    products: string[];
  };
  
  // Фильтры периода Б
  periodB: {
    years: number[];
    months: number[];
    regions: string[];
    customers: string[];
    suppliers: string[];
    products: string[];
  };
  
  // Actions
  setPeriodFilters: (period: 'A' | 'B', filters: Partial<ComparisonState['periodA']>) => void;
  swapPeriods: () => void;
  resetPeriod: (period: 'A' | 'B') => void;
  resetAll: () => void;
}

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      compareModeEnabled: true,
      
      periodA: {
        years: [2024],
        months: [],
        regions: [],
        customers: [],
        suppliers: [],
        products: [],
      },
      
      periodB: {
        years: [2025],
        months: [],
        regions: [],
        customers: [],
        suppliers: [],
        products: [],
      },
      
      setPeriodFilters: (period, filters) => {
        const key = period === 'A' ? 'periodA' : 'periodB';
        set((state) => ({
          [key]: { ...state[key], ...filters },
        }));
      },
      
      swapPeriods: () => {
        const { periodA, periodB } = get();
        set({ periodA: periodB, periodB: periodA });
      },
      
      resetPeriod: (period) => {
        const key = period === 'A' ? 'periodA' : 'periodB';
        set({
          [key]: {
            years: period === 'A' ? [2024] : [2025],
            months: [],
            regions: [],
            customers: [],
            suppliers: [],
            products: [],
          },
        });
      },
      
      resetAll: () => {
        set({
          periodA: {
            years: [2024],
            months: [],
            regions: [],
            customers: [],
            suppliers: [],
            products: [],
          },
          periodB: {
            years: [2025],
            months: [],
            regions: [],
            customers: [],
            suppliers: [],
            products: [],
          },
        });
      },
    }),
    {
      name: 'cgm-comparison-storage',
    }
  )
);
```

---

### 2. API Client

**Файл:** `frontend_compare/src/api/compareApi.ts`

```typescript
import apiClient from './client';

export interface ComparisonParams {
  years?: number[];
  months?: number[];
  regions?: string[];
  suppliers?: string[];
  products?: string[];
}

export interface ComparisonResult {
  periodA: any;
  periodB: any;
}

export const compareApi = {
  getKpiComparison: async (
    paramsA: ComparisonParams,
    paramsB: ComparisonParams
  ): Promise<ComparisonResult> => {
    const [dataA, dataB] = await Promise.all([
      apiClient.post('/api/kpi', paramsA),
      apiClient.post('/api/kpi', paramsB),
    ]);
    
    return { periodA: dataA.data, periodB: dataB.data };
  },
  
  getDynamicsComparison: async (
    paramsA: ComparisonParams,
    paramsB: ComparisonParams
  ): Promise<ComparisonResult> => {
    const [dataA, dataB] = await Promise.all([
      apiClient.post('/api/charts/dynamics', paramsA),
      apiClient.post('/api/charts/dynamics', paramsB),
    ]);
    
    return { periodA: dataA.data, periodB: dataB.data };
  },
  
  // ... другие endpoints
};
```

---

### 3. React Query

**Файл:** `frontend_compare/src/App.tsx`

```typescript
const { data: kpiComparison, isLoading: kpiLoading } = useQuery({
  queryKey: ['kpi-comparison', periodA, periodB],
  queryFn: () => compareApi.getKpiComparison(periodA, periodB),
  enabled: compareModeEnabled,
});

const { data: dynamicsComparison } = useQuery({
  queryKey: ['dynamics-comparison', periodA, periodB],
  queryFn: () => compareApi.getDynamicsComparison(periodA, periodB),
});
```

---

### 4. Компоненты

#### 4.1 PeriodFilters

**Файл:** `frontend_compare/src/components/PeriodFilters/PeriodFilters.tsx`

```typescript
interface PeriodFiltersProps {
  period: 'A' | 'B';
  title: string;
  color: string;
}

export const PeriodFilters: React.FC<PeriodFiltersProps> = ({
  period,
  title,
  color,
}) => {
  const { periodA, periodB, setPeriodFilters } = useComparisonStore();
  
  const filters = period === 'A' ? periodA : periodB;
  
  return (
    <Box sx={{ border: `2px solid ${color}`, borderRadius: 2, p: 3 }}>
      <Typography variant="h6" sx={{ color, mb: 2 }}>
        {title}
      </Typography>
      
      {/* Годы */}
      <YearGrid
        selected={filters.years}
        onChange={(years) => setPeriodFilters(period, { years })}
      />
      
      {/* Регионы */}
      <RegionAutocomplete
        selected={filters.regions}
        onChange={(regions) => setPeriodFilters(period, { regions })}
      />
      
      {/* ... другие фильтры */}
    </Box>
  );
};
```

#### 4.2 ComparisonKpiPanel

**Файл:** `frontend_compare/src/components/ComparisonKpiPanel/ComparisonKpiPanel.tsx`

```typescript
export const ComparisonKpiPanel: React.FC<ComparisonKpiPanelProps> = ({
  dataA,
  dataB,
}) => {
  const calculateChange = (a: number, b: number) => ({
    absDiff: b - a,
    pctDiff: ((b - a) / a) * 100,
    isPositive: b >= a,
  });
  
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6, lg: 3 }}>
        <KpiComparisonCard
          label="Общая сумма закупок"
          valueA={dataA.total_amount}
          valueB={dataB.total_amount}
          change={calculateChange(dataA.total_amount, dataB.total_amount)}
          format={formatCurrency}
        />
      </Grid>
      
      {/* ... другие карточки */}
    </Grid>
  );
};
```

---

## 📁 План реализации

### Этап 1: Настройка проекта (30 мин)

```bash
# Создание проекта
cd cgm_goszakupki
npm create vite@latest frontend_compare -- --template react-ts
cd frontend_compare
npm install

# Установка зависимостей
npm install @mui/material @emotion/react @emotion/styled
npm install recharts zustand @tanstack/react-query axios
npm install leaflet react-leaflet  # Если нужна карта
```

---

### Этап 2: Базовая структура (1 час)

**Файлы:**
- `frontend_compare/src/stores/comparisonStore.ts`
- `frontend_compare/src/api/compareApi.ts`
- `frontend_compare/src/App.tsx`
- `frontend_compare/vite.config.ts` (порт 5175)

---

### Этап 3: Компоненты (1.5 часа)

**Файлы:**
- `frontend_compare/src/components/PeriodFilters/PeriodFilters.tsx`
- `frontend_compare/src/components/ComparisonKpiPanel/ComparisonKpiPanel.tsx`
- `frontend_compare/src/components/ComparisonCharts/ComparisonDynamicsChart.tsx`
- `frontend_compare/src/components/ComparisonCharts/ComparisonRegionsChart.tsx`

---

### Этап 4: Тестирование (30 мин)

```bash
cd frontend_compare
npm run dev

# Открыть http://localhost:5175
# Проверить:
# - Загрузку данных
# - Переключение фильтров
# - Расчёт изменений
# - Отображение диаграмм
```

---

## 🚀 Запуск

### Команды

```bash
# Запуск дашборда сравнения
cd frontend_compare
npm run dev

# Сборка
npm run build

# Проверка типов
npm run type-check
```

### URL доступа

| Дашборд | Порт | URL |
|---------|------|-----|
| Основной | 5173 | http://localhost:5173 |
| Карта регионов | 5174 | http://localhost:5174 |
| **Сравнение** | **5175** | **http://localhost:5175** |

---

## 📊 Метрики качества

| Метрика | Значение | Цель |
|---------|----------|------|
| Время загрузки KPI | < 500ms | < 1s |
| Время загрузки Charts | < 500ms | < 1s |
| Время расчёта изменений | < 100ms | < 300ms |
| Покрытие тестами | > 60% | > 50% |

---

## ✅ Чеклист готовности

- [ ] Создан проект `frontend_compare`
- [ ] Настроен порт 5175
- [ ] Реализован `comparisonStore`
- [ ] Реализован `compareApi`
- [ ] Создан компонент `PeriodFilters`
- [ ] Создан компонент `ComparisonKpiPanel`
- [ ] Созданы компоненты диаграмм сравнения
- [ ] Реализован экспорт в CSV
- [ ] Протестирована работа фильтров
- [ ] Протестирован расчёт изменений
- [ ] Обновлена документация

---

## 🔗 Связанные документы

- [../07-ui-ux/UI_UX_IMPROVEMENTS_PLAN.md](../07-ui-ux/UI_UX_IMPROVEMENTS_PLAN.md) — План улучшений UI/UX
- [../05-architecture/FRONTEND_ARCH.md](../05-architecture/FRONTEND_ARCH.md) — Архитектура frontend
- [../04-api-reference/API.md](../04-api-reference/API.md) — Документация API

---

## 📝 Примечания

### Почему отдельный дашборд?

1. **Изоляция сложности** — основной дашборд остаётся простым
2. **Независимое развитие** — можно добавлять функции без влияния на основной
3. **Разные команды** — разные разработчики могут работать параллельно
4. **Производительность** — нет лишних перерисовок в основном дашборде

### Будущие улучшения

- [ ] Сравнение более 2 периодов (A/B/C)
- [ ] Сохранение пресетов сравнения
- [ ] Автоматические отчёты по расписанию
- [ ] Экспорт в PDF с графиками
- [ ] Отправка отчётов по email

---

**Статус:** ⏳ Ожидает реализации
**Приоритет:** P3 (желательно)
**Оценка времени:** ~3.5 часа

---

**Дата создания:** 18 марта 2026 г.
**Автор:** CGM Dashboard Team
