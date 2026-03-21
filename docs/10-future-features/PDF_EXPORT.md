# 📄 PDF Экспорт для CGM Dashboard

**Дата создания:** 18 марта 2026 г.  
**Статус:** ✅ Реализовано в Comparison Dashboard (v1.5.1) 🆕  
**Приоритет:** P2 (важно)  
**Оценка времени:** ~4 часа

---

## ✅ Реализованный функционал (v1.5.1)

**Где реализовано:** `frontend_compare/` (Сравнение периодов, порт 5175)

**Реализовано:**
- ✅ Экспорт всего дашборда в PDF
- ✅ Разделение страниц: фильтры → KPI → таблица
- ✅ Сохранение тёмного фона (Glassmorphism 2.0)
- ✅ A4 формат, альбомная ориентация (landscape)
- ✅ Принудительное разделение страниц через `pagebreak`

**Файлы:**
- `frontend_compare/src/utils/exportToPdf.ts` — Утилита экспорта
- `frontend_compare/src/components/ComparisonCharts/ComparisonTable.tsx` — CSV экспорт

**Документация:**
- [../PDF_EXPORT_FIX.md](../PDF_EXPORT_FIX.md) — Разделение страниц
- [../PDF_EXPORT_BACKGROUND_FIX.md](../PDF_EXPORT_BACKGROUND_FIX.md) — Тёмный фон
- [../CSV_EXPORT_ENCODING_FIX.md](../CSV_EXPORT_ENCODING_FIX.md) — CSV кодировка

---

## 📋 Обзор (оригинальный документ)

Этот документ описывает спецификацию **экспорта дашборда в PDF** с поддержкой:
- Экспорта отдельных диаграмм
- Экспорта всего дашборда (без sidebar)
- Формат A4, горизонтальная ориентация

---

## ⚠️ Важное примечание

**Эта функция НЕ входит в текущий объём проекта** и реализуется опционально.

**Причина:**
- Требует дополнительных библиотек (html2pdf, jsPDF)
- Увеличивает размер сборки
- Не критична для основной функциональности

**Рекомендация:** Реализовать в рамках улучшения UX (P2).

---

## 🎯 Назначение

PDF экспорт предназначен для:

1. **Подготовки отчётов** для руководства
2. **Печати дашборда** на принтере
3. **Сохранения снимков** данных на определённую дату
4. **Отправки по email** стейкхолдерам
5. **Архивирования** показателей

---

## 🎨 Варианты экспорта

### Вариант 1: Экспорт отдельных диаграмм

**Расположение:** Кнопка в заголовке каждой диаграммы

```
┌─────────────────────────────────────────────────────────┐
│  📈 Динамика закупок                      [📄 PDF] [📥] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Диаграмма...]                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Параметры:**
- Формат: A4, альбомная ориентация
- Поля: 10 мм
- Качество: 300 DPI
- Имя файла: `cgm_dynamics_2026-03-18.pdf`

---

### Вариант 2: Экспорт всего дашборда

**Расположение:** Кнопка в AppBar (рядом с обновлением)

```
┌─────────────────────────────────────────────────────────┐
│  📊 CGM Госзакупки    [📄 PDF] [🔄]      14:35         │
├─────────────┬───────────────────────────────────────────┤
│             │                                           │
│  Фильтры    │   KPI карточки                            │
│  (скрыть)   │                                           │
│             │   [Диаграммы...]                          │
└─────────────┴───────────────────────────────────────────┘
```

**Параметры:**
- Формат: A4, альбомная ориентация
- Страниц: 1-3 (автомасштабирование)
- Поля: 5 мм
- Имя файла: `cgm_dashboard_2026-03-18.pdf`

---

## 📐 Макет PDF

### 1. Экспорт диаграммы (одна страница)

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  CGM Dashboard — Динамика закупок                        │
│  Дата формирования: 18.03.2026 14:35                     │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                                                     │ │
│  │              [Диаграмма]                            │ │
│  │                                                     │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  Фильтры: 2024 год, Москва, Все продукты                │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**Размеры:**
- Ширина: 297 мм (A4 landscape)
- Высота: 210 мм
- Поля: 10 мм
- Область контента: 277 × 190 мм

---

### 2. Экспорт всего дашборда (1-3 страницы)

#### Страница 1: KPI и основные диаграммы

```
┌───────────────────────────────────────────────────────────┐
│  CGM Dashboard — Отчёт о госзакупках                     │
│  Дата: 18.03.2026                                         │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ KPI  │ │ KPI  │ │ KPI  │ │ KPI  │ │ KPI  │ │ KPI  │  │
│  │  1   │ │  2   │ │  3   │ │  4   │ │  5   │ │  6   │  │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘  │
│                                                           │
│  ┌─────────────────────┐  ┌─────────────────────┐        │
│  │   Динамика          │  │   Топ регионов      │        │
│  └─────────────────────┘  └─────────────────────┘        │
│                                                           │
│  ┌─────────────────────┐  ┌─────────────────────┐        │
│  │   Поставщики        │  │   Категории         │        │
│  └─────────────────────┘  └─────────────────────┘        │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

#### Страница 2: Тепловая карта и детали

```
┌───────────────────────────────────────────────────────────┐
│  CGM Dashboard — Отчёт о госзакупках (продолжение)       │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │           Тепловая карта закупок                    │ │
│  │                                                     │ │
│  │  [Таблица: товары × месяцы]                         │ │
│  │                                                     │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  Применённые фильтры:                                     │
│  • Годы: 2024                                             │
│  • Регионы: Москва, СПб                                   │
│  • Продукты: Все                                          │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 🔧 Техническая реализация

### 1. Выбор библиотеки

**Рекомендуемая:** `html2pdf.js`

**Почему:**
- ✅ Простая интеграция
- ✅ Сохраняет стили CSS
- ✅ Поддержка React компонентов
- ✅ Автоматическое разбиение на страницы
- ✅ Векторное качество (SVG)

**Альтернативы:**
- `jsPDF` + `html2canvas` — больше контроля, но сложнее
- `react-pdf` — декларативный подход, но требует перевёрстки
- `window.print()` + `@media print` — нативно, но меньше контроля

---

### 2. Установка зависимостей

```bash
cd frontend
npm install html2pdf.js
npm install --save-dev @types/html2pdf.js
```

---

### 3. Утилита экспорта

**Файл:** `frontend/src/utils/exportToPdf.ts`

```typescript
import html2pdf from 'html2pdf.js';

export interface ExportOptions {
  filename: string;
  orientation?: 'portrait' | 'landscape';
  quality?: number;
  margin?: number;
}

const defaultOptions: ExportOptions = {
  filename: 'cgm_export.pdf',
  orientation: 'landscape',
  quality: 100,
  margin: 5,
};

export const exportToPdf = async (
  element: HTMLElement,
  options: ExportOptions = defaultOptions
): Promise<void> => {
  const opt = {
    margin: options.margin ?? defaultOptions.margin,
    filename: options.filename ?? defaultOptions.filename,
    image: { 
      type: 'jpeg', 
      quality: options.quality ?? defaultOptions.quality 
    },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: options.orientation ?? defaultOptions.orientation,
    },
  };

  try {
    await html2pdf().set(opt).from(element).save();
    console.log('✅ PDF exported successfully');
  } catch (error) {
    console.error('❌ PDF export failed:', error);
    throw error;
  }
};

export const exportElementById = (
  elementId: string,
  options: ExportOptions
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }
  return exportToPdf(element, options);
};
```

---

### 4. Компонент ExportButton

**Файл:** `frontend/src/components/ui/ExportButton.tsx`

```typescript
import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { exportElementById } from '../../utils/exportToPdf';

interface ExportButtonProps {
  targetId: string;
  filename: string;
  tooltip?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  targetId,
  filename,
  tooltip = 'Экспорт в PDF',
}) => {
  const handleExport = async () => {
    try {
      await exportElementById(targetId, {
        filename,
        orientation: 'landscape',
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Не удалось экспортировать в PDF. Попробуйте ещё раз.');
    }
  };

  return (
    <Tooltip title={tooltip}>
      <IconButton
        onClick={handleExport}
        size="small"
        sx={{
          color: '#ffffff',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
        aria-label="Экспорт в PDF"
      >
        <PictureAsPdfIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};
```

---

### 5. Обновление компонентов диаграмм

**Файл:** `frontend/src/components/charts/DynamicsChart.tsx`

```typescript
import { Box, Typography } from '@mui/material';
import { ExportButton } from '../ui/ExportButton';

export const DynamicsChart: React.FC<DynamicsChartProps> = ({
  data,
  loading,
}) => {
  const chartId = `chart-dynamics-${Date.now()}`;

  return (
    <Box
      id={chartId}
      sx={{
        p: 2,
        background: 'rgba(15, 12, 41, 0.95)',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ color: '#fff', fontSize: '16px' }}>
          📈 Динамика закупок
        </Typography>
        <ExportButton
          targetId={chartId}
          filename={`cgm_dynamics_${new Date().toISOString().split('T')[0]}.pdf`}
          tooltip="Экспорт диаграммы в PDF"
        />
      </Box>

      {/* Диаграмма */}
      <ResponsiveContainer width="100%" height={350}>
        {/* ... */}
      </ResponsiveContainer>

      {/* Подпись для PDF */}
      <Typography
        variant="caption"
        sx={{
          display: 'none',
          color: 'rgba(255, 255, 255, 0.6)',
          mt: 2,
          '@media print': {
            display: 'block',
          },
        }}
      >
        Дата формирования: {new Date().toLocaleString('ru-RU')}
      </Typography>
    </Box>
  );
};
```

---

### 6. Экспорт всего дашборда

**Файл:** `frontend/src/App.tsx`

```typescript
import { ExportButton } from './components/ui/ExportButton';
import { Box, CssBaseline, CircularProgress } from '@mui/material';

const DashboardContent = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportFull = async () => {
    setIsExporting(true);
    try {
      // Скрываем sidebar перед экспортом
      const mainContent = document.getElementById('main-content');
      const filterPanel = document.querySelector('[role="navigation"]');
      
      if (filterPanel) {
        filterPanel.classList.add('hide-for-export');
      }

      await exportElementById('dashboard-export-wrapper', {
        filename: `cgm_dashboard_${new Date().toISOString().split('T')[0]}.pdf`,
        orientation: 'landscape',
        margin: 5,
      });

      if (filterPanel) {
        filterPanel.classList.remove('hide-for-export');
      }
    } catch (error) {
      console.error('Full export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />

      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            📊 CGM Госзакупки
          </Typography>
          
          <Tooltip title="Экспорт всего дашборда в PDF">
            <IconButton
              onClick={handleExportFull}
              disabled={isExporting}
              sx={{ color: '#fff', mr: 1 }}
            >
              {isExporting ? (
                <CircularProgress size={24} sx={{ color: '#fff' }} />
              ) : (
                <PictureAsPdfIcon />
              )}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Обёртка для экспорта */}
      <Box id="dashboard-export-wrapper" sx={{ display: 'flex', flex: 1 }}>
        <FilterPanel onRefresh={handleRefresh} />

        <Box component="main" id="main-content" sx={{ flexGrow: 1 }}>
          <KpiPanel data={kpiData} />
          
          {/* Индикаторы активных фильтров */}
          {hasActiveFilters && <ActiveFiltersPanel />}

          {/* Диаграммы */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <DynamicsChart data={dynamicsData} />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <RegionsChart data={regionsData} />
            </Grid>
            {/* ... другие диаграммы */}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};
```

---

### 7. CSS для экспорта

**Файл:** `frontend/src/index.css`

```css
/* Скрытие элементов при экспорте */
.hide-for-export {
  display: none !important;
}

/* Стили для PDF экспорта */
@media print {
  /* Скрываем sidebar */
  [role="navigation"] {
    display: none !important;
  }

  /* Оптимизируем фон */
  body {
    background: white !important;
  }

  /* Сохраняем градиенты */
  .MuiPaper-root {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}

/* Специальные классы для экспорта */
.export-page-break {
  page-break-before: always;
}

.export-no-break {
  page-break-inside: avoid;
}
```

---

## 📁 Изменяемые файлы

| Файл | Изменения | Строк |
|------|-----------|-------|
| `frontend/package.json` | +1 зависимость | +1 |
| `frontend/src/utils/exportToPdf.ts` | Новый файл | ~60 |
| `frontend/src/components/ui/ExportButton.tsx` | Новый файл | ~50 |
| `frontend/src/components/charts/DynamicsChart.tsx` | +20 строк | ~100 → ~120 |
| `frontend/src/components/charts/RegionsChart.tsx` | +20 строк | ~80 → ~100 |
| `frontend/src/components/charts/SuppliersChart.tsx` | +20 строк | ~100 → ~120 |
| `frontend/src/components/charts/CategoriesChart.tsx` | +20 строк | ~80 → ~100 |
| `frontend/src/components/charts/HeatmapChart.tsx` | +20 строк | ~120 → ~140 |
| `frontend/src/App.tsx` | +40 строк | ~350 → ~390 |
| `frontend/src/index.css` | +30 строк | ~200 → ~230 |
| **Итого** | **+281 строк** | **10 файлов** |

---

## ⏱ План реализации

### Этап 1: Настройка (30 мин)

```bash
npm install html2pdf.js
```

**Файлы:**
- `package.json`
- `src/utils/exportToPdf.ts`

---

### Этап 2: Базовый компонент (30 мин)

**Файлы:**
- `src/components/ui/ExportButton.tsx`

---

### Этап 3: Экспорт диаграмм (1.5 часа)

**Файлы:**
- `src/components/charts/DynamicsChart.tsx`
- `src/components/charts/RegionsChart.tsx`
- `src/components/charts/SuppliersChart.tsx`
- `src/components/charts/CategoriesChart.tsx`
- `src/components/charts/HeatmapChart.tsx`

---

### Этап 4: Экспорт всего дашборда (1 час)

**Файлы:**
- `src/App.tsx`
- `src/index.css`

---

### Этап 5: Тестирование (30 мин)

**Проверка:**
- [ ] Экспорт каждой диаграммы работает
- [ ] Экспорт всего дашборда скрывает sidebar
- [ ] PDF открывается в браузере
- [ ] Качество текста читаемое
- [ ] Градиенты сохраняются
- [ ] Имя файла корректное

---

## 🎨 Примеры использования

### 1. Экспорт диаграммы

```typescript
// В компоненте DynamicsChart
<ExportButton
  targetId="chart-dynamics"
  filename="cgm_dynamics_2026-03-18.pdf"
  tooltip="Экспорт в PDF"
/>
```

**Результат:**
- Скачивается файл `cgm_dynamics_2026-03-18.pdf`
- Формат: A4 landscape
- Содержит: диаграмму + заголовок + дату

---

### 2. Экспорт всего дашборда

```typescript
// В AppBar
<IconButton onClick={handleExportFull}>
  <PictureAsPdfIcon />
</IconButton>
```

**Результат:**
- Скачивается файл `cgm_dashboard_2026-03-18.pdf`
- 1-3 страницы (автомасштабирование)
- Sidebar скрыт
- KPI + все диаграммы

---

## 📊 Метрики качества

| Метрика | Значение | Цель |
|---------|----------|------|
| Время генерации PDF | < 3 сек | < 5 сек |
| Размер файла (1 стр.) | < 500 KB | < 1 MB |
| Качество текста | 300 DPI | 300 DPI |
| Сохранение стилей | 95% | 90% |

---

## ✅ Чеклист готовности

- [ ] Установлен `html2pdf.js`
- [ ] Создан `exportToPdf.ts`
- [ ] Создан `ExportButton.tsx`
- [ ] Добавлены кнопки экспорта во все диаграммы
- [ ] Реализован экспорт всего дашборда
- [ ] Sidebar скрывается при экспорте
- [ ] Добавлены CSS стили для экспорта
- [ ] Протестировано в Chrome/Firefox
- [ ] Проверено качество PDF
- [ ] Обновлена документация

---

## 🔗 Связанные документы

- [../07-ui-ux/UI_UX_IMPROVEMENTS_PLAN.md](../07-ui-ux/UI_UX_IMPROVEMENTS_PLAN.md) — План улучшений UI/UX
- [../05-architecture/FRONTEND_ARCH.md](../05-architecture/FRONTEND_ARCH.md) — Архитектура frontend

---

## 📝 Примечания

### Почему html2pdf.js?

1. **Простота** — одна функция для экспорта
2. **Надёжность** — работает в 95% случаев
3. **Качество** — векторное SVG + шрифты
4. **Совместимость** — Chrome, Firefox, Edge

### Ограничения

- Большие таблицы могут разбиваться на страницы
- Анимации не сохраняются
- Интерактивность теряется (статичный PDF)

### Будущие улучшения

- [ ] Выбор формата (A4, A3, Letter)
- [ ] Выбор ориентации (книжная/альбомная)
- [ ] Добавление логотипа компании
- [ ] Водяной знак "Конфиденциально"
- [ ] Экспорт в PNG/JPG

---

**Статус:** ⏳ Ожидает реализации
**Приоритет:** P2 (важно)
**Оценка времени:** ~4 часа

---

**Дата создания:** 18 марта 2026 г.
**Автор:** CGM Dashboard Team
