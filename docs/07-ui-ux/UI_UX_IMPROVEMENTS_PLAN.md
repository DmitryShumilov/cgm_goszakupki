# 🎨 План улучшений UI/UX CGM Dashboard

**Дата:** 17 марта 2026
**Версия:** 1.4.6 (выполнено)
**Статус:** ✅ Частично выполнено (3 из 6 задач P3)
**Аудитор:** Senior UI/UX Designer

---

## 📊 Резюме

**Текущая оценка:** 89/100 ⭐
**Потенциальная оценка:** 93/100 ⭐ (+4)
**Общее время реализации:** 4 часа 45 минут

---

## 📋 Содержание

1. [Статус рекомендаций](#статус-рекомендаций)
2. [Детальный план работ](#детальный-план-работ)
3. [Приоритет 1: Критично](#приоритет-1-критично)
4. [Приоритет 2: Важно](#приоритет-2-важно)
5. [Приоритет 3: Желательно](#приоритет-3-желательно)
6. [Ожидаемые улучшения](#ожидаемые-улучшения)
7. [Чек-лист внедрения](#чек-лист-внедрения)

---

## Статус рекомендаций

### Выполнено (v1.4.3) — 6 из 10

| № | Рекомендация | Приоритет | Статус | Версия |
|---|--------------|-----------|--------|--------|
| 1.1 | Увеличить контраст текста | P1 | ✅ Выполнено | 1.4.3 |
| 1.2 | Добавить ARIA-атрибуты | P1 | ✅ Выполнено | 1.4.3 |
| 2.1 | Унифицировать стили диаграмм | P2 | ✅ Выполнено | 1.4.3 |
| 2.2 | Добавить подсказки для метрик | P2 | ✅ Выполнено | 1.4.3 |
| 2.3 | Оптимизировать градиенты KPI | P2 | ✅ Выполнено | 1.4.3 |
| 3.1 | Добавить спарклайны в Heatmap | P3 | ✅ Выполнено | 1.4.3 |

### Выполнено (v1.4.6) — 3 из 6 P3 🆕

| № | Рекомендация | Приоритет | Статус | Версия |
|---|--------------|-----------|--------|--------|
| 3.2 | Lazy loading для диаграмм | P3 | ✅ Выполнено | 1.4.6 |
| 3.3 | Memoization компонентов | P3 | ✅ Выполнено | 1.4.6 |
| 3.5 | Skip link для навигации | P3 | ✅ Выполнено | 1.4.6 |

### Ожидает реализации — 3 задачи

| № | Рекомендация | Приоритет | Статус | Время |
|---|--------------|-----------|--------|-------|
| 1.3 | Индикаторы активных фильтров | P1 | ⏳ Ожидает | 45 мин |
| 2.4 | Экспорт KPI в CSV | P2 | ⏳ Ожидает | 1 час |
| 3.4 | Сравнение периодов | P3 | ⏳ Ожидает | 2 часа |

---

## Детальный план работ

### Этап 1: Критично (P1) — 45 минут

#### 1.3 Индикаторы активных фильтров

**Проблема:**
- Пользователь выбирает фильтры в панели
- После закрытия панели не видно, что выбрано
- Нужно открывать панель снова для проверки

**Решение:**
Добавить панель с чипами активных фильтров над KPI карточками.

**Файл:** `frontend/src/App.tsx`

**Код для вставки (после `<KpiPanel />`):**

```tsx
{/* Индикаторы активных фильтров */}
{(selectedYears.length > 0 || selectedMonths.length > 0 ||
  selectedRegions.length > 0 || selectedCustomers.length > 0 ||
  selectedSuppliers.length > 0 || selectedProducts.length > 0) && (
  <Box sx={{ mb: 3 }}>
    <Typography variant="subtitle2" sx={{ mb: 1, color: '#fff' }}>
      Активные фильтры:
    </Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {selectedYears.map(year => (
        <Chip
          key={year}
          label={`Год: ${year}`}
          onDelete={() => toggleYear(year)}
          sx={{
            bgcolor: 'rgba(0, 180, 219, 0.3)',
            color: '#fff',
            border: '1px solid rgba(0, 180, 219, 0.5)',
            '& .MuiChip-deleteIcon': { 
              color: '#fff', 
              '&:hover': { color: '#fff' } 
            }
          }}
        />
      ))}
      {selectedMonths.map(month => (
        <Chip
          key={month}
          label={`Месяц: ${month}`}
          onDelete={() => toggleMonth(month)}
          sx={{
            bgcolor: 'rgba(79, 195, 247, 0.3)',
            color: '#fff',
            border: '1px solid rgba(79, 195, 247, 0.5)',
            '& .MuiChip-deleteIcon': { 
              color: '#fff', 
              '&:hover': { color: '#fff' } 
            }
          }}
        />
      ))}
      {selectedRegions.map(region => (
        <Chip
          key={region}
          label={`Регион: ${region.length > 20 ? region.substring(0, 20) + '...' : region}`}
          onDelete={() => toggleRegion(region)}
          sx={{
            bgcolor: 'rgba(255, 152, 0, 0.3)',
            color: '#fff',
            border: '1px solid rgba(255, 152, 0, 0.5)',
            '& .MuiChip-deleteIcon': { 
              color: '#fff', 
              '&:hover': { color: '#fff' } 
            }
          }}
        />
      ))}
      {/* Аналогично для customers, suppliers, products */}
    </Box>
  </Box>
)}
```

**Необходимые импорты:**
```tsx
import { Chip, Typography, Box } from '@mui/material';
```

**Результат:**
- ✅ Пользователь видит выбранные фильтры без открытия панели
- ✅ Быстрое удаление фильтров (клик на крестик)
- ✅ Улучшенная ориентация в данных

**Время:** 45 минут  
**Сложность:** Средняя

---

### Этап 2: Важно (P2) — 1 час

#### 2.4 Экспорт в PDF (вместо CSV)

**Проблема:**
- Пользователь не может экспортировать данные дашборда
- CSV формат неудобен для печати и отчётов

**Решение:**
Добавить кнопку экспорта в PDF в AppBar.

**Файл:** `frontend/src/App.tsx`

**Код функции:**

```tsx
import { exportToPdf } from './utils/exportToPdf';

const handleExportPdf = useCallback(async () => {
  const element = document.getElementById('dashboard-export-wrapper');
  if (!element) return;

  try {
    await exportToPdf(element, {
      filename: `cgm_dashboard_${new Date().toISOString().split('T')[0]}.pdf`,
      orientation: 'landscape',
    });
  } catch (error) {
    console.error('Export failed:', error);
  }
}, []);
```

**Добавить кнопку в AppBar (после кнопки обновления):**

```tsx
<IconButton
  onClick={handleExportPdf}
  title="Экспорт в PDF"
  sx={{ mr: 1, color: '#fff' }}
>
  <PictureAsPdfIcon />
</IconButton>
```

**Необходимые импорты:**
```tsx
import { IconButton } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
```

**Результат:**
- ✅ Пользователь может скачать дашборд в PDF
- ✅ Имя файла с датой: `cgm_dashboard_2026-03-18.pdf`
- ✅ Формат A4, горизонтальная ориентация
- ✅ Сохранение всех стилей и градиентов

**Примечание:** Экспорт в CSV заменён на PDF как более удобный формат для отчётов и печати.

**Время:** 1 час
**Сложность:** Средняя

---

### Этап 3: Желательно (P3) — 3 часа

#### 3.2 Lazy loading для диаграмм

**Проблема:**
- Все 5 диаграмм загружаются сразу
- Лишняя нагрузка на начальную загрузку

**Решение:**
Использовать React.lazy + Suspense для ленивой загрузки.

**Файл:** `frontend/src/App.tsx`

**Код:**

```tsx
import { Suspense, lazy } from 'react';
import { Skeleton, Box } from '@mui/material';

// Ленивая загрузка диаграмм
const DynamicsChart = lazy(() => import('./components/charts/DynamicsChart'));
const RegionsChart = lazy(() => import('./components/charts/RegionsChart'));
const SuppliersChart = lazy(() => import('./components/charts/SuppliersChart'));
const CategoriesChart = lazy(() => import('./components/charts/CategoriesChart'));
const HeatmapChart = lazy(() => import('./components/charts/HeatmapChart'));

// В компоненте (заменить существующие вызовы)
<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2, mb: 2 }}>
  <Suspense fallback={<Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />}>
    <DynamicsChart data={dynamicsData || null} loading={dynamicsLoading} />
  </Suspense>
  <Suspense fallback={<Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />}>
    <RegionsChart data={regionsData || null} loading={regionsLoading} />
  </Suspense>
</Box>

<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2, mb: 2 }}>
  <Suspense fallback={<Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />}>
    <SuppliersChart data={suppliersData || null} loading={suppliersLoading} />
  </Suspense>
  <Suspense fallback={<Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />}>
    <CategoriesChart data={categoriesData || null} loading={categoriesLoading} />
  </Suspense>
</Box>

<Box sx={{ mb: 2 }}>
  <Suspense fallback={<Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />}>
    <HeatmapChart data={heatmapData || null} loading={heatmapLoading} />
  </Suspense>
</Box>
```

**Результат:**
- ✅ Диаграммы загружаются по мере необходимости
- ✅ Skeleton fallback показывает место загрузки
- ✅ Улучшенная производительность начальной загрузки

**Время:** 1 час  
**Сложность:** Средняя

---

#### 3.3 Memoization компонентов

**Проблема:**
- Компоненты перерисовываются при каждом изменении состояния
- Лишние ре-рендеры снижают производительность

**Решение:**
Обернуть компоненты в React.memo.

**Файл:** `frontend/src/components/kpi/KpiPanel.tsx`

```tsx
import { memo } from 'react';

export const KpiPanel = memo(({ data, loading = false }: KpiPanelProps) => {
  // ... существующий код
});
```

**Файл:** `frontend/src/components/filters/FilterPanel.tsx`

```tsx
import { memo } from 'react';

export const FilterPanel = memo(({ onRefresh }: FilterPanelProps) => {
  // ... существующий код
});
```

**Результат:**
- ✅ Компоненты перерисовываются только при изменении props
- ✅ Уменьшение количества лишних ре-рендеров
- ✅ Улучшенная производительность

**Время:** 30 минут  
**Сложность:** Низкая

---

#### 3.4 Сравнение периодов

**Проблема:**
- Нельзя сравнить «этот месяц vs прошлый месяц»
- Нет режима сравнения периодов

**Решение:**
Добавить переключатель режима сравнения.

**Файл:** `frontend/src/components/filters/FilterPanel.tsx`

```tsx
// Добавить state
const [compareMode, setCompareMode] = useState(false);

// Добавить переключатель (после кнопки сброса)
<FormControlLabel
  control={
    <Switch
      checked={compareMode}
      onChange={(e) => setCompareMode(e.target.checked)}
      sx={{ 
        color: '#fff',
        '& .MuiSwitch-switchBase.Mui-checked': {
          color: '#3388ff',
        },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
          backgroundColor: '#3388ff',
        },
      }}
    />
  }
  label="Сравнение периодов"
  sx={{ 
    color: '#fff', 
    fontSize: '13px',
    ml: 2,
  }}
/>
```

**Необходимые импорты:**
```tsx
import { Switch, FormControlLabel } from '@mui/material';
```

**Дальнейшие шаги:**
1. Добавить параметр `compareMode` в API запросы
2. Backend должен вернуть данные за 2 периода
3. Обновить диаграммы для отображения сравнения

**Время:** 2 часа  
**Сложность:** Высокая

---

#### 3.5 Skip link для навигации

**Проблема:**
- Нет быстрого перехода к основному контенту
- Пользователи клавиатуры должны табулировать через все фильтры

**Решение:**
Добавить skip link, появляющийся при фокусе.

**Файл:** `frontend/src/index.css`

```css
/* В начало файла */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--accent-primary, #3388ff);
  color: white;
  padding: 8px 16px;
  z-index: 1000;
  text-decoration: none;
  font-weight: 500;
  transition: top 0.3s ease;
  border-radius: 0 0 4px 0;
}

.skip-link:focus {
  top: 0;
  outline: 2px solid #fff;
  outline-offset: 2px;
}
```

**Файл:** `frontend/src/App.tsx`

```tsx
// В начало компонента (перед всем остальным)
<a href="#main-content" className="skip-link">
  Перейти к основному содержимому
</a>

// Добавить id к основному контенту
<Box 
  component="main" 
  id="main-content"
  sx={{ 
    flexGrow: 1, 
    height: '100vh', 
    overflow: 'auto',
  }}
>
  {/* Основной контент */}
</Box>
```

**Результат:**
- ✅ Пользователи клавиатуры могут пропустить навигацию
- ✅ Улучшенная доступность (WCAG 2.1 AA)
- ✅ Соответствие требованию 2.4.1 Skip Links

**Время:** 30 минут  
**Сложность:** Низкая

---

## Ожидаемые улучшения

### По категориям

| Категория | Текущая | После | Улучшение | Статус |
|-----------|---------|-------|-----------|--------|
| **Визуальный дизайн** | 95/100 | 95/100 | 0 | ✅ Уже отлично |
| **Юзабилити** | 90/100 | 95/100 | +5 | ⏳ Ожидает |
| **Адаптивность** | 90/100 | 90/100 | 0 | ✅ Уже отлично |
| **Доступность** | 85/100 | 90/100 | +5 | ⏳ Ожидает |
| **Производительность** | 90/100 | 95/100 | +5 | ⏳ Ожидает |

### Итоговая оценка

**89/100 → 93/100** ⭐ (+4)

---

## Чек-лист внедрения

### Перед началом

- [ ] Создать ветку git: `git checkout -b feature/ui-ux-improvements-1.4.4`
- [ ] Убедиться, что все тесты проходят
- [ ] Сделать backup текущей версии

### Этап 1: Критично (P1)

- [ ] Добавить индикаторы активных фильтров в `App.tsx`
- [ ] Протестировать удаление фильтров
- [ ] Протестировать на мобильной версии

### Этап 2: Важно (P2)

- [ ] Добавить функцию `handleExportPdf` в `App.tsx`
- [ ] Добавить кнопку экспорта в AppBar
- [ ] Установить `html2pdf.js`
- [ ] Протестировать скачивание PDF
- [ ] Проверить качество PDF (A4, landscape)

### Этап 3: Желательно (P3)

- [ ] Добавить lazy loading для всех 5 диаграмм
- [ ] Добавить React.memo для KpiPanel
- [ ] Добавить React.memo для FilterPanel
- [ ] Добавить переключатель сравнения периодов
- [ ] Добавить skip link для навигации
- [ ] Протестировать навигацию с клавиатуры

### После внедрения

- [ ] Запустить сборку: `npm run build`
- [ ] Исправить все ошибки TypeScript
- [ ] Протестировать в браузере
- [ ] Проверить Lighthouse (доступность, производительность)
- [ ] Создать commit: `feat: UI/UX improvements v1.4.4`
- [ ] Создать pull request
- [ ] Обновить CHANGELOG.md

---

## Приложения

### A. Необходимые импорты для App.tsx

```tsx
import { Suspense, lazy, useCallback } from 'react';
import { Skeleton, Box, Chip, Typography, IconButton } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

// Ленивая загрузка
const DynamicsChart = lazy(() => import('./components/charts/DynamicsChart'));
const RegionsChart = lazy(() => import('./components/charts/RegionsChart'));
const SuppliersChart = lazy(() => import('./components/charts/SuppliersChart'));
const CategoriesChart = lazy(() => import('./components/charts/CategoriesChart'));
const HeatmapChart = lazy(() => import('./components/charts/HeatmapChart'));
```

### B. Тестовый сценарий

**Сценарий 1: Индикаторы активных фильтров**
1. Открыть дашборд
2. Выбрать 2 года, 3 месяца, 2 региона
3. Закрыть панель фильтров
4. Проверить, что чипы отображаются над KPI
5. Кликнуть на крестик чипа
6. Проверить, что фильтр снят

**Сценарий 2: Экспорт PDF**
1. Кликнуть на кнопку экспорта (иконка PDF)
2. Проверить скачивание файла `cgm_dashboard_YYYY-MM-DD.pdf`
3. Открыть файл в браузере/Adobe Reader
4. Проверить качество текста и градиентов
5. Проверить формат A4 и горизонтальную ориентацию

**Сценарий 3: Skip link**
1. Нажать Tab в начале страницы
2. Проверить появление skip link
3. Нажать Enter
4. Проверить переход к основному контенту

---

**Дата составления:** 17 марта 2026  
**Статус:** ⏳ Ожидает реализации  
**Ответственный:** UI/UX Designer
