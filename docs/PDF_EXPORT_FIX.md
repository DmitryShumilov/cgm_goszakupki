# 📄 PDF Экспорт: Разделение по страницам

**Дата:** 21 марта 2026  
**Версия:** 1.5.1  
**Статус:** ✅ Выполнено

---

## 📋 Проблема

При экспорте дашборда сравнения периодов в PDF все блоки (фильтры, KPI, таблица) помещались на одной странице, что затрудняло чтение и анализ данных.

**Требуемая логика:**
- **Страница 1:** Блок фильтров (Период А / Период Б)
- **Страница 2:** KPI карточки (6 метрик с индикаторами)
- **Страница 3+:** Детальное сравнение по регионам (таблица)

---

## ✅ Выполненные изменения

### 1. Обновлён `exportToPdf.ts`

**Файл:** `frontend_compare/src/utils/exportToPdf.ts`

**Изменения:**
- ✅ Добавлена настройка `pagebreak` для html2pdf
- ✅ Автоматическое добавление классов разделения перед экспортом
- ✅ Удаление классов после экспорта (чистота DOM)
- ✅ Увеличен отступ с 5mm до 10mm для лучшей читаемости
- ✅ Добавлено логирование ошибок

**Код:**
```typescript
pagebreak: {
  mode: ['avoid-all', 'css', 'legacy'],
  before: '.pdf-page-break-before',
  after: '.pdf-page-break-after',
}
```

---

### 2. Обновлён `App.tsx`

**Файл:** `frontend_compare/src/App.tsx`

**Изменения:**
- ✅ Добавлены CSS-классы для каждой секции:
  - `.filters-section` — фильтры периодов
  - `.kpi-section` — KPI панель
  - `.table-section` — таблица сравнения

**Код:**
```tsx
{/* Фильтры периодов - Страница 1 */}
<Box className="filters-section" sx={{ mb: 3 }}>
  <PeriodFilters />
</Box>

{/* KPI Panel с индикаторами - Страница 2 */}
<Box className="kpi-section" sx={{ mb: 3 }}>
  <ComparisonKpiPanel />
</Box>

{/* Таблица сравнения - Страница 3+ */}
<Box className="table-section" sx={{ mt: 3 }}>
  <ComparisonTable />
</Box>
```

---

### 3. Обновлён `index.css`

**Файл:** `frontend_compare/src/index.css`

**Изменения:**
- ✅ Добавлены утилитные классы для разделения страниц
- ✅ Добавлены `@media print` стили для печати
- ✅ Принудительное разделение для каждой секции

**Код:**
```css
/* ✅ Классы для разделения страниц при экспорте в PDF */
.pdf-page-break-after {
  page-break-after: always !important;
  break-after: page !important;
}

.pdf-page-break-before {
  page-break-before: always !important;
  break-before: page !important;
}

.pdf-no-break-inside {
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}

@media print {
  /* ✅ Принудительное разделение страниц для печати */
  .filters-section {
    page-break-after: always;
    break-after: page;
  }

  .kpi-section {
    page-break-after: always;
    break-after: page;
  }

  .table-section {
    page-break-before: always;
    break-before: page;
  }
}
```

---

## 📊 Результат

### Структура PDF:

| Страница | Содержимое |
|----------|------------|
| **1** | 📋 Фильтры периодов (Период А / Период Б) |
| **2** | 📊 KPI карточки (6 метрик с индикаторами изменений) |
| **3+** | 📋 Детальное сравнение по регионам (таблица) |

### Технические улучшения:

| Параметр | До | После |
|----------|-----|-------|
| **Отступ (margin)** | 5mm | 10mm ✅ |
| **Разделение страниц** | ❌ Нет | ✅ Да |
| **Ориентация** | Landscape | Landscape ✅ |
| **Качество** | 100 | 100 ✅ |
| **Scale** | 2 | 2 ✅ |

---

## 🎯 Как это работает

### Алгоритм экспорта:

1. **Пользователь нажимает кнопку PDF** → `handleExportPdf()`
2. **Добавляются классы разделения:**
   - `.filters-section` → `.pdf-page-break-after`
   - `.kpi-section` → `.pdf-page-break-after`
3. **html2pdf генерирует PDF:**
   - Использует настройку `pagebreak.mode: ['avoid-all', 'css', 'legacy']`
   - Применяет `page-break-after: always` к элементам с классом
4. **PDF сохраняется** → `cgm_comparison_2026-03-21.pdf`
5. **Классы удаляются** (возврат к исходному DOM)

---

## 📁 Изменённые файлы

| Файл | Изменения |
|------|-----------|
| `frontend_compare/src/utils/exportToPdf.ts` | +25 строк (pagebreak настройки) |
| `frontend_compare/src/App.tsx` | +6 строк (CSS классы) |
| `frontend_compare/src/index.css` | +30 строк (CSS стили) |

---

## 🧪 Тестирование

**Проверено:**
- ✅ Фильтры помещаются на первой странице
- ✅ KPI карточки на второй странице
- ✅ Таблица сравнения на третьей странице
- ✅ Отступы 10mm достаточны для печати
- ✅ Альбомная ориентация сохраняется
- ✅ Классы удаляются после экспорта

**Результат:**
```
Страница 1: Фильтры ✅
Страница 2: KPI ✅
Страница 3+: Таблица ✅
```

---

## 💡 Рекомендации

### Для пользователей:
- ✅ Каждый блок теперь на отдельной странице
- ✅ Удобно для печати и отправки отчётов
- ✅ Сохранена альбомная ориентация (A4 landscape)

### Для разработчиков:
- ✅ Можно добавить новые классы `.pdf-page-break-before/after` для других элементов
- ✅ Настройки pagebreak можно изменить в `exportToPdf.ts`
- ✅ Для отладки используйте `html2canvas.logging: true`

---

## 🔧 Настройки html2pdf

### Текущая конфигурация:

```typescript
{
  margin: 10,  // Отступы в мм
  filename: 'cgm_comparison_YYYY-MM-DD.pdf',
  image: {
    type: 'jpeg',
    quality: 100  // Максимальное качество
  },
  html2canvas: {
    scale: 2,  // Масштабирование для чёткости
    useCORS: true,  // Разрешить CORS изображения
    letterRendering: true,  // Корректный рендеринг текста
    logging: false  // Отключить логи
  },
  jsPDF: {
    unit: 'mm',
    format: 'a4',
    orientation: 'landscape'
  },
  pagebreak: {
    mode: ['avoid-all', 'css', 'legacy'],
    before: '.pdf-page-break-before',
    after: '.pdf-page-break-after'
  }
}
```

---

## 📞 Поддержка

При возникновении проблем:

1. Проверьте консоль браузера (F12) на ошибки
2. Убедитесь, что все данные загрузились перед экспортом
3. Проверьте, что html2pdf.js установлен (`npm list html2pdf.js`)

---

**Обновление завершено успешно!** ✅

**Версия:** 1.5.1  
**Дата:** 21 марта 2026
