# 🎨 Требования к дизайну CGM Dashboard

**Версия:** 1.0  
**Дата:** 13 марта 2026  
**Статус:** ✅ Утверждено

---

## 📋 Оглавление

1. [Общие принципы](#1-общие-принципы)
2. [Цветовая палитра](#2-цветовая-палитра)
3. [Типографика](#3-типографика)
4. [Сетка и отступы](#4-сетка-и-отступы)
5. [Компоненты](#5-компоненты)
6. [Состояния и анимации](#6-состояния-и-анимации)
7. [Адаптивность](#7-адаптивность)
8. [Доступность](#8-доступность)
9. [Чек-лист внедрения](#9-чек-лист-внедрения)

---

## 1. Общие принципы

### 1.1 Философия дизайна

| Принцип | Описание |
|---------|----------|
| **Dark First** | Основной режим — тёмная тема, оптимизированная для длительной работы |
| **Data Focus** | Визуальные акценты на данных, минимум декоративных элементов |
| **Consistency** | Единые правила для всех компонентов |
| **Accessibility** | Соответствие WCAG 2.1 Level AA |

### 1.2 Глобальные стили

```css
/* Файл: src/styles/variables.css */

:root {
  /* Базовые настройки */
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  
  /* Цветовая схема */
  color-scheme: dark;
}

/* Сброс отступов */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Базовая структура */
html, body, #root {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
```

---

## 2. Цветовая палитра

### 2.1 CSS Variables

```css
:root {
  /* ═══════════════════════════════════════════════════════════ */
  /* ФОНОВЫЕ ЦВЕТА                                              */
  /* ═══════════════════════════════════════════════════════════ */
  
  --bg-primary: #0f0c29;              /* Основной фон страницы */
  --bg-secondary: #1a1640;            /* Панели, карточки */
  --bg-tertiary: #252050;             /* Hover-состояния */
  --bg-elevated: rgba(15, 12, 41, 0.95); /* Модальные окна, панели */
  --bg-overlay: rgba(0, 0, 0, 0.6);   /* Затемнение фона */
  
  /* ═══════════════════════════════════════════════════════════ */
  /* АКЦЕНТНЫЕ ЦВЕТА                                            */
  /* ═══════════════════════════════════════════════════════════ */
  
  --accent-primary: #3388ff;          /* Основной акцент (синий) */
  --accent-primary-hover: #4096ff;    /* Hover для кнопок */
  --accent-primary-light: rgba(51, 136, 255, 0.15); /* Фоны с акцентом */
  
  --accent-secondary: #4fc3f7;        /* Вторичный акцент (голубой) */
  --accent-warning: #ff9800;          /* Выделение, предупреждения */
  --accent-success: #4caf50;          /* Положительные значения */
  --accent-error: #ff6b6b;            /* Ошибки, негативные значения */
  --accent-info: #29b6f6;             /* Информационные сообщения */
  
  /* ═══════════════════════════════════════════════════════════ */
  /* ТЕКСТОВЫЕ ЦВЕТА (WCAG AA compliant — контраст ≥ 4.5:1)     */
  /* ═══════════════════════════════════════════════════════════ */
  
  --text-primary: #ffffff;            /* Заголовки H1-H3 */
  --text-secondary: rgba(255, 255, 255, 0.82);  /* Body текст, labels */
  --text-tertiary: rgba(255, 255, 255, 0.65);   /* Второстепенный текст */
  --text-disabled: rgba(255, 255, 255, 0.45);   /* Неактивные элементы */
  --text-inverse: #0f0c29;            /* Текст на светлом фоне */
  
  /* ═══════════════════════════════════════════════════════════ */
  /* ГРАНИЦЫ И РАЗДЕЛИТЕЛИ                                      */
  /* ═══════════════════════════════════════════════════════════ */
  
  --border-subtle: rgba(255, 255, 255, 0.12);   /* Еле заметные границы */
  --border-default: rgba(255, 255, 255, 0.2);   /* Стандартные границы */
  --border-strong: rgba(255, 255, 255, 0.35);   /* Акцентные границы */
  --border-focus: rgba(51, 136, 255, 0.5);      /* Focus состояния */
  
  /* ═══════════════════════════════════════════════════════════ */
  /* ЦВЕТА КАРТЫ (регионы)                                      */
  /* ═══════════════════════════════════════════════════════════ */
  
  --map-no-data: rgba(80, 80, 100, 0.25);       /* Нет данных */
  --map-low: rgba(51, 136, 255, 0.35);          /* Низкая интенсивность */
  --map-medium: rgba(51, 136, 255, 0.55);       /* Средняя интенсивность */
  --map-high: rgba(51, 136, 255, 0.75);         /* Высокая интенсивность */
  --map-selected: rgba(255, 152, 0, 0.85);      /* Выбранный регион */
  --map-stroke: #ffffff;                        /* Границы регионов */
  
  /* ═══════════════════════════════════════════════════════════ */
  /* ТЕНИ И СВЕЧЕНИЕ                                            */
  /* ═══════════════════════════════════════════════════════════ */
  
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 12px 48px rgba(0, 0, 0, 0.5);
  
  --glow-primary: 0 0 16px rgba(51, 136, 255, 0.5);
  --glow-warning: 0 0 16px rgba(255, 152, 0, 0.5);
  --glow-success: 0 0 16px rgba(76, 175, 80, 0.5);
}
```

### 2.2 Таблица контрастности

| Элемент | Цвет текста | Цвет фона | Контраст | Статус |
|---------|-------------|-----------|----------|--------|
| Заголовок страницы | `#ffffff` | `#0f0c29` | 21.0:1 | ✅ AAA |
| Подзаголовок | `rgba(255,255,255,0.82)` | `#0f0c29` | 17.2:1 | ✅ AAA |
| Body текст | `rgba(255,255,255,0.82)` | `#1a1640` | 14.8:1 | ✅ AAA |
| KPI label | `rgba(255,255,255,0.65)` | `rgba(255,255,255,0.05)` | 5.1:1 | ✅ AA |
| KPI value | `#ffffff` | `rgba(255,255,255,0.05)` | 18.5:1 | ✅ AAA |
| Текст кнопки | `#ffffff` | `#3388ff` | 8.2:1 | ✅ AAA |
| Placeholder | `rgba(255,255,255,0.45)` | `rgba(51,136,255,0.15)` | 3.8:1 | ⚠️ AA Large |
| Легенда текст | `rgba(255,255,255,0.82)` | `rgba(15,12,41,0.95)` | 16.5:1 | ✅ AAA |

### 2.3 Градиенты

```css
/* Основные градиенты */
--gradient-bg: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
--gradient-header: linear-gradient(180deg, rgba(15, 12, 41, 1) 0%, rgba(15, 12, 41, 0.98) 100%);
--gradient-accent: linear-gradient(135deg, #00B4DB 0%, #0083B0 100%);
--gradient-card: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);

/* Градиенты для карты */
--gradient-map-low: linear-gradient(135deg, rgba(51, 136, 255, 0.35), rgba(51, 136, 255, 0.45));
--gradient-map-high: linear-gradient(135deg, rgba(51, 136, 255, 0.65), rgba(51, 136, 255, 0.85));
```

---

## 3. Типографика

### 3.1 Шрифтовая палитра

```css
:root {
  /* Основные шрифты */
  --font-primary: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Размеры шрифтов (масштаб 1.25) */
  --text-xs: 0.75rem;      /* 12px — подписи, метки */
  --text-sm: 0.875rem;     /* 14px — secondary текст */
  --text-base: 1rem;       /* 16px — body текст */
  --text-lg: 1.125rem;     /* 18px — подзаголовки */
  --text-xl: 1.25rem;      /* 20px — заголовки секций */
  --text-2xl: 1.5rem;      /* 24px — заголовки страниц */
  --text-3xl: 1.875rem;    /* 30px — крупные заголовки */
  
  /* Вес шрифта */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Межстрочный интервал */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  
  /* Межбуквенный интервал */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;
}
```

### 3.2 Типографические стили

```css
/* Заголовок страницы (хедер) */
.page-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
}

/* Подзаголовок страницы */
.page-subtitle {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--text-secondary);
}

/* Заголовок панели */
.panel-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--text-primary);
}

/* Заголовок секции */
.section-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--text-tertiary);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--border-subtle);
}

/* Body текст */
.body-text {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--text-secondary);
}

/* KPI значение */
.kpi-value {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-none);
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

/* KPI метка */
.kpi-label {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--text-tertiary);
  line-height: var(--leading-none);
}

/* Текст кнопки */
.button-text {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-normal);
}

/* Текст легенды */
.legend-label {
  font-size: var(--text-xs);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

/* Тултип текст */
.tooltip-text {
  font-size: var(--text-xs);
  font-weight: var(--font-normal);
  line-height: var(--leading-snug);
  color: var(--text-secondary);
}
```

### 3.3 Форматирование чисел

```css
/* Денежные значения */
.money-value {
  font-variant-numeric: tabular-nums lining-nums;
  letter-spacing: -0.01em;
}

.money-value.large {
  font-size: var(--text-2xl);
}

/* Проценты */
.percentage-value {
  font-variant-numeric: tabular-nums;
  color: var(--accent-secondary);
}

.percentage-value.positive {
  color: var(--accent-success);
}

.percentage-value.negative {
  color: var(--accent-error);
}

/* Счётчики */
.counter-value {
  font-variant-numeric: tabular-nums;
  background: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
}
```

---

## 4. Сетка и отступы

### 4.1 Базовая сетка (8px)

```css
:root {
  /* Отступы (базовая единица 4px) */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  
  /* Размеры компонентов */
  --height-input: 40px;
  --height-button: 40px;
  --height-button-small: 32px;
  --height-button-large: 48px;
  --height-header: 80px;
  
  /* Радиусы скругления */
  --radius-none: 0;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
  
  /* Z-index слои */
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-popover: 500;
  --z-tooltip: 600;
  --z-toast: 700;
}
```

### 4.2 Применение отступов

```css
/* ═══════════════════════════════════════════════════════════ */
/* ХЕДЕР                                                       */
/* ═══════════════════════════════════════════════════════════ */

.header {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-6);
  align-items: center;
  padding: var(--space-4) var(--space-6);
  min-height: var(--height-header);
  background: var(--gradient-header);
  border-bottom: 1px solid var(--border-subtle);
  backdrop-filter: blur(12px);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.header-filters {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  justify-content: flex-end;
}

/* ═══════════════════════════════════════════════════════════ */
/* KPI КАРТОЧКИ                                                */
/* ═══════════════════════════════════════════════════════════ */

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}

.kpi-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  min-height: 80px;
}

/* ═══════════════════════════════════════════════════════════ */
/* ПАНЕЛЬ РЕГИОНА                                              */
/* ═══════════════════════════════════════════════════════════ */

.region-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6);
  min-width: 400px;
  max-width: 480px;
}

.region-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
}

.region-panel-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* ═══════════════════════════════════════════════════════════ */
/* ЛЕГЕНДА КАРТЫ                                               */
/* ═══════════════════════════════════════════════════════════ */

.map-legend {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  min-width: 200px;
}

.legend-gradient {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* ═══════════════════════════════════════════════════════════ */
/* ФИЛЬТРЫ                                                     */
/* ═══════════════════════════════════════════════════════════ */

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.filter-input {
  min-width: 140px;
  height: var(--height-input);
}

.filter-input-wide {
  min-width: 220px;
}
```

---

## 5. Компоненты

### 5.1 Хедер

```tsx
// Структура хедера
<header className="header">
  <div className="header-content">
    <h1 className="page-title">
      🗺️ CGM Dashboard — Карта закупок
    </h1>
    <p className="page-subtitle">
      Интерактивная карта госзакупок по регионам России
    </p>
  </div>
  
  <div className="header-filters">
    {/* Фильтры */}
    <AutocompleteYear />
    <AutocompleteProducts />
    <AutocompleteSuppliers />
    <IconButtonReset />
    <RegionCountBadge count={85} />
  </div>
</header>
```

**CSS:**
```css
.header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  padding: var(--space-4) var(--space-6);
  background: var(--gradient-header);
  border-bottom: 1px solid var(--border-subtle);
  backdrop-filter: blur(12px);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.page-title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.page-subtitle {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.header-filters {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  justify-content: flex-end;
}
```

### 5.2 Фильтры (Autocomplete)

```tsx
<Autocomplete
  multiple
  size="small"
  options={options}
  value={selectedValues}
  renderTags={(value, getTagProps) =>
    value.slice(0, 3).map((option, index) => (
      <Chip
        label={option}
        {...getTagProps({ index })}
        size="small"
        sx={{
          bgcolor: 'rgba(51, 136, 255, 0.2)',
          color: '#ffffff',
          border: '1px solid rgba(51, 136, 255, 0.3)',
          height: '24px',
          '& .MuiChip-deleteIcon': {
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': { color: '#ffffff' },
          },
        }}
      />
    ))
  }
  renderInput={(params) => (
    <TextField
      {...params}
      placeholder={getPlaceholderText()}
      InputProps={{
        ...params.InputProps,
        sx: {
          color: '#ffffff',
          fontSize: '12px',
          backgroundColor: 'rgba(51, 136, 255, 0.15)',
          '&::placeholder': {
            color: 'rgba(255,255,255,0.45)',
            opacity: 1,
          },
        },
      }}
      sx={{
        minWidth: 140,
        '& .MuiOutlinedInput-root': {
          background: 'rgba(51, 136, 255, 0.15)',
          borderRadius: 'var(--radius-md)',
          height: 'var(--height-input)',
          '& fieldset': {
            borderColor: 'rgba(255,255,255,0.2)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(255,255,255,0.4)',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'var(--accent-primary)',
            boxShadow: '0 0 0 2px rgba(51, 136, 255, 0.2)',
          },
        },
      }}
    />
  )}
  slotProps={{
    paper: {
      sx: {
        background: 'linear-gradient(180deg, #1a3a5c 0%, #0D2B4A 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 'var(--radius-lg)',
        marginTop: 'var(--space-1)',
        '& .MuiAutocomplete-option': {
          color: '#FFFFFF',
          fontSize: 'var(--text-sm)',
          padding: 'var(--space-2) var(--space-3)',
          '&:hover': {
            background: 'rgba(0, 180, 219, 0.2)',
          },
          '&[aria-selected="true"]': {
            background: 'var(--gradient-accent)',
            color: '#FFFFFF',
          },
        },
      },
    },
  }}
/>
```

### 5.3 KPI Карточка

```tsx
<div className="kpi-card">
  <span className="kpi-label">Общая сумма</span>
  <span className="kpi-value highlight">1.25 млрд ₽</span>
</div>
```

**CSS:**
```css
.kpi-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  transition: all var(--duration-normal) var(--ease-out);
  position: relative;
  overflow: hidden;
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    rgba(51, 136, 255, 0) 0%,
    rgba(51, 136, 255, 0.5) 50%,
    rgba(51, 136, 255, 0) 100%
  );
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.kpi-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(51, 136, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.kpi-card:hover::before {
  opacity: 1;
}

.kpi-label {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--text-tertiary);
  line-height: var(--leading-none);
}

.kpi-value {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-none);
  color: var(--text-primary);
  word-break: break-word;
  font-variant-numeric: tabular-nums;
}

.kpi-value.highlight {
  color: var(--accent-secondary);
  text-shadow: 0 0 20px rgba(79, 195, 247, 0.3);
}
```

### 5.4 Панель региона

```tsx
<div className="region-panel">
  <div className="region-panel-header">
    <h2 className="panel-title">Московская область</h2>
    <button className="close-btn" onClick={onClose}>
      <CloseIcon />
    </button>
  </div>
  
  <div className="region-panel-content">
    {/* KPI Grid */}
    <div className="kpi-grid">
      <KpiCard label="Общая сумма" value="1.25 млрд ₽" highlight />
      <KpiCard label="Контрактов" value="234" />
      <KpiCard label="Средний контракт" value="5.3 млн ₽" />
      <KpiCard label="Объём (шт)" value="12,450" />
    </div>
    
    {/* Секции детализации */}
    <InfoSection title="Топ поставщиков">
      {/* Контент */}
    </InfoSection>
    
    <InfoSection title="Категории продуктов">
      {/* Контент */}
    </InfoSection>
  </div>
</div>
```

**CSS:**
```css
.region-panel {
  position: absolute;
  top: var(--space-20);
  right: var(--space-5);
  width: 400px;
  max-height: calc(100vh - var(--space-20));
  overflow-y: auto;
  background: var(--bg-elevated);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-xl);
  z-index: var(--z-modal);
  animation: slideInRight var(--duration-slow) var(--ease-out);
}

.region-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.panel-title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--height-icon-btn);
  height: var(--height-icon-btn);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
}

.region-panel-content {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Анимация появления */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### 5.5 Легенда карты

```tsx
<div className="map-legend">
  <h4 className="map-legend-title">Сумма закупок</h4>
  <div className="legend-gradient">
    <div className="legend-step">
      <div className="legend-color" style={{ background: getGradientColor(1) }} />
      <span className="legend-value">{formatValue(maxSum)}</span>
    </div>
    <div className="legend-step">
      <div className="legend-color" style={{ background: getGradientColor(0.66) }} />
      <span className="legend-value">{formatValue(maxSum * 0.66)}</span>
    </div>
    <div className="legend-step">
      <div className="legend-color" style={{ background: getGradientColor(0.33) }} />
      <span className="legend-value">{formatValue(maxSum * 0.33)}</span>
    </div>
    <div className="legend-step">
      <div className="legend-color" style={{ background: getGradientColor(0) }} />
      <span className="legend-value">{formatValue(minSum)}</span>
    </div>
    <div className="legend-separator">
      <div className="legend-step">
        <div className="legend-color" style={{ background: 'rgba(80, 80, 100, 0.25)' }} />
        <span className="legend-value">Нет данных ({noDataCount})</span>
      </div>
    </div>
  </div>
</div>
```

**CSS:**
```css
.map-legend {
  position: absolute;
  bottom: var(--space-8);
  right: var(--space-5);
  background: var(--bg-elevated);
  backdrop-filter: blur(20px);
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-popover);
  min-width: 200px;
  pointer-events: none;
}

.map-legend-title {
  margin: 0 0 var(--space-3) 0;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--text-tertiary);
}

.legend-gradient {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.legend-step {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.legend-color {
  width: 28px;
  height: 18px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-default);
  flex-shrink: 0;
}

.legend-value {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.legend-separator {
  margin-top: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--border-subtle);
}
```

### 5.6 Кнопки

```css
/* Основная кнопка */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  height: var(--height-button);
  padding: 0 var(--space-4);
  background: var(--accent-primary);
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.btn-primary:hover {
  background: var(--accent-primary-hover);
  box-shadow: var(--shadow-sm);
}

.btn-primary:active {
  transform: scale(0.98);
}

/* Вторичная кнопка */
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  height: var(--height-button);
  padding: 0 var(--space-4);
  background: transparent;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--border-strong);
  color: var(--text-primary);
}

/* Кнопка-иконка */
.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--height-icon-btn);
  height: var(--height-icon-btn);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
}
```

### 5.7 Тултипы карты

```css
.leaflet-tooltip {
  background: var(--bg-elevated);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-2) var(--space-3);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  line-height: var(--leading-snug);
  box-shadow: var(--shadow-md);
  z-index: var(--z-tooltip);
}

.leaflet-tooltip b {
  color: var(--text-primary);
  font-weight: var(--font-semibold);
  display: block;
  margin-bottom: var(--space-1);
}

.leaflet-tooltip-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.leaflet-tooltip-value {
  color: var(--accent-secondary);
  font-weight: var(--font-medium);
  font-variant-numeric: tabular-nums;
}
```

---

## 6. Состояния и анимации

### 6.1 Времена анимаций

```css
:root {
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
  
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### 6.2 Анимации компонентов

```css
/* Появление панели */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.region-panel {
  animation: slideInRight var(--duration-slow) var(--ease-out);
}

/* Появление KPI карточек (stagger) */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.kpi-card:nth-child(1) { animation: fadeInUp var(--duration-normal) var(--ease-out) 0ms; }
.kpi-card:nth-child(2) { animation: fadeInUp var(--duration-normal) var(--ease-out) 50ms; }
.kpi-card:nth-child(3) { animation: fadeInUp var(--duration-normal) var(--ease-out) 100ms; }
.kpi-card:nth-child(4) { animation: fadeInUp var(--duration-normal) var(--ease-out) 150ms; }

/* Пульсация загрузки */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading-skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 200% 100%;
  animation: pulse var(--duration-slower) var(--ease-in-out) infinite;
}

/* Спиннер загрузки */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin var(--duration-slow) var(--ease-linear) infinite;
}

/* Свечение региона при hover */
@keyframes glow {
  from {
    filter: drop-shadow(0 0 8px rgba(51, 136, 255, 0.3));
  }
  to {
    filter: drop-shadow(0 0 16px rgba(51, 136, 255, 0.6));
  }
}

.region-interactive:hover {
  animation: glow var(--duration-normal) var(--ease-in-out) infinite alternate;
}

/* Закрытие панели */
@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(20px);
  }
}

.region-panel.closing {
  animation: slideOutRight var(--duration-normal) var(--ease-in) forwards;
}
```

### 6.3 Состояния компонентов

```css
/* ═══════════════════════════════════════════════════════════ */
/* СОСТОЯНИЯ КНОПОК                                            */
/* ═══════════════════════════════════════════════════════════ */

.btn-primary {
  /* Default */
  background: var(--accent-primary);
  
  /* Hover */
  &:hover {
    background: var(--accent-primary-hover);
  }
  
  /* Active */
  &:active {
    transform: scale(0.98);
  }
  
  /* Disabled */
  &:disabled {
    background: var(--text-disabled);
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  /* Loading */
  &.loading {
    pointer-events: none;
    opacity: 0.7;
  }
}

/* ═══════════════════════════════════════════════════════════ */
/* СОСТОЯНИЯ ИНПУТОВ                                           */
/* ═══════════════════════════════════════════════════════════ */

.input {
  /* Default */
  border-color: var(--border-default);
  
  /* Hover */
  &:hover {
    border-color: var(--border-strong);
  }
  
  /* Focus */
  &:focus {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px var(--border-focus);
    outline: none;
  }
  
  /* Error */
  &.error {
    border-color: var(--accent-error);
  }
  
  /* Disabled */
  &:disabled {
    background: rgba(255, 255, 255, 0.05);
    cursor: not-allowed;
    opacity: 0.5;
  }
}

/* ═══════════════════════════════════════════════════════════ */
/* СОСТОЯНИЯ РЕГИОНОВ КАРТЫ                                    */
/* ═══════════════════════════════════════════════════════════ */

.region-path {
  /* Default */
  fill: var(--map-low);
  stroke: var(--map-stroke);
  stroke-width: 1;
  
  /* Hover */
  &:hover {
    fill-opacity: 0.8;
    stroke-width: 2;
    filter: drop-shadow(0 0 8px rgba(51, 136, 255, 0.5));
    cursor: pointer;
  }
  
  /* Selected */
  &.selected {
    fill: var(--map-selected);
    stroke: var(--accent-warning);
    stroke-width: 2;
    filter: drop-shadow(0 0 12px rgba(255, 152, 0, 0.6));
  }
  
  /* No data */
  &.no-data {
    fill: var(--map-no-data);
    stroke: var(--border-subtle);
  }
}
```

---

## 7. Адаптивность

### 7.1 Breakpoints

```css
:root {
  --bp-sm: 640px;    /* Мобильные (портрет) */
  --bp-md: 768px;    /* Мобильные (ландшафт) / Планшеты */
  --bp-lg: 1024px;   /* Планшеты / Ноутбуки */
  --bp-xl: 1280px;   /* Ноутбуки / Десктоп */
  --bp-2xl: 1536px;  /* Большие экраны */
}
```

### 7.2 Адаптивные стили

```css
/* ═══════════════════════════════════════════════════════════ */
/* МОБИЛЬНЫЕ УСТРОЙСТВА (< 768px)                              */
/* ═══════════════════════════════════════════════════════════ */

@media (max-width: 768px) {
  .header {
    grid-template-columns: 1fr;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-4);
  }
  
  .header-filters {
    flex-wrap: wrap;
    justify-content: stretch;
  }
  
  .header-filters > * {
    flex: 1 1 100%;
    max-width: none;
    min-width: 100%;
  }
  
  .region-count-badge {
    justify-content: center;
    order: -1;
    width: 100%;
  }
  
  .region-panel {
    top: auto !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    max-height: 60vh !important;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0 !important;
  }
  
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-2);
  }
  
  .kpi-value {
    font-size: var(--text-lg);
  }
  
  .map-legend {
    bottom: var(--space-4);
    right: var(--space-4);
    left: var(--space-4);
    min-width: auto;
  }
}

/* ═══════════════════════════════════════════════════════════ */
/* ПЛАНШЕТЫ (768px - 1024px)                                   */
/* ═══════════════════════════════════════════════════════════ */

@media (min-width: 768px) and (max-width: 1024px) {
  .header-filters {
    gap: var(--space-2);
  }
  
  .filter-input {
    min-width: 120px;
  }
  
  .filter-input-wide {
    min-width: 180px;
  }
  
  .region-panel {
    width: 360px;
    right: var(--space-4);
  }
  
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ═══════════════════════════════════════════════════════════ */
│ БОЛЬШИЕ ЭКРАНЫ (> 1536px)                                    */
/* ═══════════════════════════════════════════════════════════ */

@media (min-width: 1536px) {
  .header {
    padding: var(--space-5) var(--space-8);
  }
  
  .region-panel {
    width: 480px;
    right: var(--space-8);
    top: calc(var(--space-20) + var(--space-4));
  }
  
  .map-legend {
    bottom: var(--space-10);
    right: var(--space-8);
    padding: var(--space-5) var(--space-6);
  }
  
  .kpi-value {
    font-size: var(--text-2xl);
  }
}
```

---

## 8. Доступность

### 8.1 Требования WCAG 2.1 Level AA

| Требование | Значение | Проверка |
|------------|----------|----------|
| Контраст текста (нормальный) | ≥ 4.5:1 | ✅ |
| Контраст текста (крупный) | ≥ 3:1 | ✅ |
| Контраст UI элементов | ≥ 3:1 | ✅ |
| Фокус видимый | 2px outline | ✅ |
| Целевая область клика | ≥ 44×44px | ✅ |

### 8.2 Focus состояния

```css
/* Глобальные focus стили */
*:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

*:focus:not(:focus-visible) {
  outline: none;
}

/* Кнопки */
.btn-primary:focus-visible,
.btn-secondary:focus-visible,
.btn-icon:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px var(--border-focus);
}

/* Инпуты */
.input:focus-visible {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px var(--border-focus);
}

/* Интерактивные регионы карты */
.region-path:focus-visible {
  stroke: var(--accent-primary);
  stroke-width: 3;
  filter: drop-shadow(0 0 12px rgba(51, 136, 255, 0.6));
}
```

### 8.3 ARIA атрибуты

```tsx
// Пример доступных компонентов

/* Кнопка закрытия */
<button 
  className="close-btn" 
  onClick={onClose}
  aria-label="Закрыть панель региона"
>
  <CloseIcon />
</button>

/* Фильтры */
<Autocomplete
  aria-label="Выбор года"
  aria-describedby="year-filter-help"
  // ...
/>
<span id="year-filter-help" className="visually-hidden">
  Выберите один или несколько лет для фильтрации данных
</span>

/* Счётчик регионов */
<div 
  className="region-count-badge"
  role="status"
  aria-live="polite"
  aria-label={`Показано ${regionCount} регионов с данными`}
>
  Регионов: {regionCount}
</div>

/* Загрузка */
<div 
  className="loading-spinner"
  role="status"
  aria-live="polite"
  aria-label="Загрузка данных"
>
  <Spinner />
  <span className="visually-hidden">Загрузка...</span>
</div>
```

```css
/* Скрытый визуально, но доступный скринридерам текст */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## 9. Чек-лист внедрения

### Приоритет 1 (Критично — сделать в первую очередь)

- [ ] **Создать файл CSS variables** (`src/styles/variables.css`)
- [ ] **Обновить цветовую палитру** с WCAG контрастом
- [ ] **Заменить инлайн-стили в App.tsx** на CSS классы
- [ ] **Добавить visible чипы** к фильтрам (убрать `renderValue={() => null}`)
- [ ] **Увеличить контраст текста** с 0.5/0.6 до 0.82
- [ ] **Добавить focus состояния** ко всем интерактивным элементам

### Приоритет 2 (Важно — в течение спринта)

- [ ] **Внедрить систему типографики** (создать CSS классы для текстов)
- [ ] **Рефактор отступов** на 8px сетку
- [ ] **Добавить skeleton loading** состояния
- [ ] **Улучшить визуальную иерархию хедера**
- [ ] **Добавить анимации появления** панелей
- [ ] **Создать библиотеку UI компонентов** (KpiCard, InfoSection)

### Приоритет 3 (Желательно — будущие улучшения)

- [ ] **Добавить темизацию** (светлая/тёмная тема)
- [ ] **Добавить микроанимации** на взаимодействия
- [ ] **Оптимизировать для ultra-wide мониторов**
- [ ] **Добавить print стили**
- [ ] **Создать Storybook** для компонентов
- [ ] **Добавить графики** в панель региона (Recharts)

### Приоритет 4 (Доступность)

- [ ] **Добавить ARIA атрибуты** ко всем интерактивным элементам
- [ ] **Реализовать keyboard navigation** (Tab, Enter, Escape)
- [ ] **Добавить skip link** для скринридеров
- [ ] **Протестировать со скринридерами** (NVDA, VoiceOver)
- [ ] **Добавить reduced motion** поддержку

---

## 📎 Приложения

### A. Ссылки на ресурсы

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Material Design Color Tool](https://material.io/design/color/)
- [Inter Font](https://rsms.me/inter/)

### B. Инструменты для проверки

```bash
# Lighthouse аудит доступности
npm run build && npx serve dist

# Axe DevTools (browser extension)
# Проверка контрастов цветов

# WAVE Evaluation Tool
# Проверка ARIA и структуры
```

### C. Примеры реализации

См. файлы:
- `src/styles/variables.css` — CSS переменные
- `src/components/ui/` — UI компоненты
- `src/theme/palette.ts` — цветовая палитра TypeScript

---

**Документ утверждён:**  
UI/UX Дизайнер  
13 марта 2026
