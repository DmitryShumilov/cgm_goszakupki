# 📄 PDF Экспорт: Тёмный фон

**Дата:** 21 марта 2026  
**Версия:** 1.5.1  
**Статус:** ✅ Выполнено

---

## 📋 Проблема

При экспорте дашборда в PDF тёмный фон не сохранялся, из-за чего:
- ❌ Белый текст на белом фоне PDF становился невидимым
- ❌ Названия KPI карточек не отображались
- ❌ Пропадала визуальная иерархия дашборда

**Причина:** html2pdf по умолчанию не захватывает CSS градиенты и background-color элементов.

---

## ✅ Выполненные изменения

### 1. Обновлён `exportToPdf.ts`

**Файл:** `frontend_compare/src/utils/exportToPdf.ts`

**Изменения:**
- ✅ Сохранение оригинальных стилей перед экспортом
- ✅ Принудительная установка тёмного градиента
- ✅ Установка `backgroundColor: '#0f0c29'` в html2canvas
- ✅ Восстановление оригинальных стилей после экспорта (блок `finally`)
- ✅ Добавлена функция `ignoreElements` для скрытия элементов

**Код:**
```typescript
export const exportToPdf = async (
  element: HTMLElement,
  options: ExportOptions = defaultOptions
): Promise<void> => {
  // ✅ Сохраняем оригинальный фон
  const originalBackground = element.style.background;
  const originalColor = element.style.color;

  // ✅ Принудительно устанавливаем тёмный фон для экспорта
  element.style.background = 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)';
  element.style.color = '#ffffff';

  const opt = {
    // ...
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      // ✅ Принудительная отрисовка фона
      backgroundColor: '#0f0c29',
      // ✅ Игнорируем элементы с классом .hide-for-export
      ignoreElements: (element: HTMLElement) => {
        return element.classList?.contains('hide-for-export') ?? false;
      },
    },
    // ...
  };

  try {
    // ... логика экспорта
  } finally {
    // ✅ Восстанавливаем оригинальные стили
    element.style.background = originalBackground;
    element.style.color = originalColor;
  }
};
```

---

### 2. Обновлён `index.css`

**Файл:** `frontend_compare/src/index.css`

**Изменения:**
- ✅ Добавлен класс `.export-with-background` для принудительного фона
- ✅ Дочерние элементы наследуют цвет (`color: inherit`)

**Код:**
```css
/* ✅ Принудительный фон для экспорта PDF */
.export-with-background {
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%) !important;
  color: #ffffff !important;
}

.export-with-background * {
  color: inherit !important;
}
```

---

## 🎯 Как это работает

### Алгоритм экспорта:

1. **Сохранение оригинальных стилей:**
   ```typescript
   const originalBackground = element.style.background;
   const originalColor = element.style.color;
   ```

2. **Установка тёмного фона:**
   ```typescript
   element.style.background = 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)';
   element.style.color = '#ffffff';
   ```

3. **Настройка html2canvas:**
   ```typescript
   backgroundColor: '#0f0c29',  // Базовый цвет для захвата
   ```

4. **Генерация PDF:**
   - html2canvas создаёт скриншот с тёмным фоном
   - jsPDF генерирует PDF с сохранением цветов

5. **Восстановление стилей:**
   ```typescript
   finally {
     element.style.background = originalBackground;
     element.style.color = originalColor;
   }
   ```

---

## 📊 Результат

### До исправлений:
| Элемент | Статус |
|---------|--------|
| Фон PDF | ❌ Белый |
| Текст KPI | ❌ Невидимый |
| Градиенты | ❌ Не захвачены |

### После исправлений:
| Элемент | Статус |
|---------|--------|
| Фон PDF | ✅ Тёмный (#0f0c29 → #302b63 → #24243e) |
| Текст KPI | ✅ Белый, видимый |
| Градиенты | ✅ Захвачены |
| Визуальная иерархия | ✅ Сохранена |

---

## 📁 Изменённые файлы

| Файл | Изменения |
|------|-----------|
| `frontend_compare/src/utils/exportToPdf.ts` | +20 строк (фон + восстановление) |
| `frontend_compare/src/index.css` | +8 строк (класс export-with-background) |

---

## 🧪 Тестирование

**Проверено:**
- ✅ Тёмный фон сохраняется в PDF
- ✅ Белый текст виден на тёмном фоне
- ✅ KPI карточки отображаются корректно
- ✅ Градиенты захватываются
- ✅ Стили восстанавливаются после экспорта
- ✅ Разделение страниц работает

**Результат:**
```
Фон: Тёмный градиент ✅
Текст: Белый, видимый ✅
KPI: Отображаются ✅
Страницы: Разделены ✅
```

---

## 💡 Технические детали

### Почему это работает:

1. **`backgroundColor` в html2canvas:**
   - Указывает базовый цвет для рендеринга
   - Заполняет прозрачные области
   - Предотвращает белый фон по умолчанию

2. **Принудительный градиент:**
   - Применяется напрямую к элементу
   - Переопределяет CSS через style
   - Гарантирует захват html2canvas

3. **Восстановление стилей:**
   - Блок `finally` выполняется всегда
   - Возвращает оригинальный вид дашборда
   - Не влияет на последующие рендеры

---

## 🔧 Настройки html2canvas

### Ключевые параметры:

```typescript
html2canvas: {
  scale: 2,  // Масштаб для чёткости
  useCORS: true,  // Разрешить CORS изображения
  letterRendering: true,  // Корректный рендеринг текста
  logging: false,  // Отключить логи
  backgroundColor: '#0f0c29',  // ✅ Базовый цвет фона
  ignoreElements: (element) => {  // ✅ Игнорировать элементы
    return element.classList?.contains('hide-for-export') ?? false;
  }
}
```

---

## 📞 Поддержка

При возникновении проблем:

1. **Фон не сохраняется:**
   - Проверьте `backgroundColor` в настройках
   - Убедитесь, что градиент применён к элементу

2. **Текст не виден:**
   - Проверьте `color: #ffffff` в стилях
   - Убедитесь, что нет переопределений

3. **Ошибки экспорта:**
   - Откройте консоль браузера (F12)
   - Проверьте логи (`console.log`)

---

**Обновление завершено успешно!** ✅

**Версия:** 1.5.1  
**Дата:** 21 марта 2026
