# 📊 CGM Dashboard — Сравнение периодов

**Порт:** 5175
**Статус:** ✅ Production Ready
**Версия:** 1.5.2 (Network Fix) 🆕
**Дата релиза:** 19 марта 2026
**Последнее обновление:** 21 марта 2026 🆕

---

## 🎯 Назначение

Дашборд сравнения периодов для анализа изменений показателей госзакупок между двумя независимыми периодами (например, 2024 vs 2025).

**Контекст использования:**
- 🏢 Локальная сеть (intranet)
- 👥 До 5 одновременных пользователей
- 📅 Обновление данных: раз в неделю
- 🔒 Нет доступа из интернета

---

## ⚡ Быстрый старт

### Предварительные требования

| Компонент | Версия | Статус |
|-----------|--------|--------|
| **Node.js** | 18+ | ✅ Требуется |
| **npm** | 9+ | ✅ Требуется |
| **Backend API** | Порт 8000 | ✅ Требуется |
| **PostgreSQL** | 17+ | ✅ Требуется |

### Установка зависимостей

```bash
cd frontend_compare
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

**Откройте в браузере:**
- **Local:** http://localhost:5175
- **LAN:** http://192.168.x.x:5175

### Production сборка

```bash
npm run build
npm run preview
```

---

## 📁 Структура проекта

```
frontend_compare/
├── src/
│   ├── api/                      # API клиент
│   │   ├── client.ts             # Axios instance
│   │   └── compareApi.ts         # Comparison API endpoints
│   │
│   ├── stores/                   # Zustand stores
│   │   └── comparisonStore.ts    # Store для сравнения периодов
│   │
│   ├── components/
│   │   ├── ui/                   # Базовые UI компоненты
│   │   │   └── SwapButton.tsx    # Кнопка обмена периодов
│   │   │
│   │   ├── PeriodFilters/        # Фильтры двух периодов
│   │   │   ├── PeriodColumn.tsx
│   │   │   ├── PeriodFilters.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── ComparisonKpiPanel/   # KPI с индикаторами
│   │   │   ├── KpiComparisonCard.tsx
│   │   │   ├── ComparisonKpiPanel.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── ComparisonCharts/     # Диаграммы сравнения
│   │       ├── ComparisonTable.tsx
│   │       └── index.ts
│   │
│   ├── hooks/
│   ├── utils/
│   │   ├── formatters.ts         # Форматирование данных
│   │   └── exportToPdf.ts        # Экспорт в PDF
│   │
│   ├── types/
│   │   └── index.ts              # TypeScript типы
│   │
│   ├── App.tsx                   # Главный компонент
│   ├── main.tsx                  # Точка входа
│   ├── index.css                 # Глобальные стили
│   └── setupTests.ts             # Mock для тестов
│
├── tests/
│   └── e2e/                      # E2E тесты Playwright
│       └── comparison.spec.ts
│
├── src/components/**/__tests__/  # Unit тесты
├── package.json
├── vite.config.ts                # Vite конфигурация
├── vitest.config.ts              # Vitest конфигурация
├── playwright.config.ts          # Playwright конфигурация
└── README.md                     # Этот файл
```

---

## 🛠 Технологии

| Компонент | Версия | Назначение |
|-----------|--------|------------|
| **React** | 19.2.4 | UI библиотека |
| **TypeScript** | 5.9.3 | Типизация |
| **Vite** | 7.3.1 | Сборщик |
| **Material-UI** | 7.3.9 | UI компоненты |
| **Recharts** | 3.7.0 | Диаграммы |
| **Zustand** | 5.0.11 | State manager (с persist) |
| **TanStack Query** | 5.90.21 | Data fetching |
| **Axios** | 1.13.6 | HTTP клиент |
| **html2pdf.js** | 0.10.3 | PDF экспорт |

---

## 📊 Функционал

### 🔀 Фильтры периодов

**Две независимые колонки фильтров:**

| Фильтр | Тип | Мультивыбор |
|--------|-----|-------------|
| **Год** | Кнопки | ✅ |
| **Регион** | Кнопки | ✅ |
| **Продукт** | Кнопки | ✅ |

**Особенности:**
- 🔄 Кнопка обмена периодов местами
- 💾 Сохранение в localStorage (persist)
- 📍 Индикатор текущих фильтров

---

### 📈 KPI Метрики (6 карточек)

| Метрика | Иконка | Формат |
|---------|--------|--------|
| 💰 Общая сумма контрактов | 💰 | Млрд/млн/тыс ₽ |
| 📄 Количество контрактов | 📄 | Число |
| 📊 Средняя сумма контракта | 📊 | Млрд/млн/тыс ₽ |
| 📦 Общий объём (шт) | 📦 | Число |
| 🏷️ Средняя цена за единицу | 🏷️ | Число (2 знака) + ₽ |
| 🏢 Количество заказчиков | 🏢 | Число |

**Индикаторы изменений:**
- 📈 Рост (>5%)
- 📉 Падение (<-5%)
- ➡️ Стабильно (±5%)

---

### 📋 Таблица сравнения регионов

**Колонки:**

| Колонка | Сортировка | Формат |
|---------|------------|--------|
| Регион | ✅ | Текст |
| Период А (сумма) | ✅ | Млрд/млн/тыс ₽ |
| Период Б (сумма) | ✅ | Млрд/млн/тыс ₽ |
| Контракты | ❌ | А → Б |
| Изменение (сумма) | ✅ | Полное число + ₽ |
| Изменение (%) | ✅ | Процент |
| Тренд | ✅ | Иконка + цвет |

**Функции:**
- 🔽 Сортировка по клику на заголовок
- 📥 Экспорт в CSV (с BOM для кириллицы) ✅ 🆕
- 📊 Итоговая статистика трендов

---

### 📄 PDF Экспорт

**Параметры:**
- 📐 Формат: A4
- 📄 Ориентация: Альбомная (landscape)
- 🎨 Сохранение стилей Glassmorphism 2.0 ✅ 🆕
- 📑 Разделение страниц: фильтры → KPI → таблица ✅ 🆕

**Структура PDF:**
- **Страница 1:** Фильтры периодов (Период А / Период Б)
- **Страница 2:** KPI карточки (6 метрик с индикаторами)
- **Страница 3+:** Детальное сравнение по регионам

**Кнопка:** В AppBar (иконка PDF)

**Документация:**
- [docs/PDF_EXPORT_FIX.md](../docs/PDF_EXPORT_FIX.md) — Разделение страниц
- [docs/PDF_EXPORT_BACKGROUND_FIX.md](../docs/PDF_EXPORT_BACKGROUND_FIX.md) — Тёмный фон

---

## 📡 API Endpoints

### Сравнение периодов

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/compare/kpi` | POST | Сравнение KPI двух периодов |
| `/api/compare/dynamics` | POST | Сравнение динамики по месяцам |
| `/api/compare/regions` | POST | Сравнение топ-10 регионов |
| `/api/compare/suppliers` | POST | Scatter plot поставщиков |
| `/api/compare/table` | POST | Таблица сравнения по регионам |

### Фильтры (справочники)

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/filters/years` | GET | Список доступных лет |
| `/api/filters/months` | GET | Список месяцев |
| `/api/filters/regions` | GET | Список регионов |
| `/api/filters/products` | GET | Список продуктов |

---

## 🧪 Тестирование

### Unit тесты

```bash
npm run test              # Запуск всех тестов
npm run test:ui           # UI режим
npm run test:coverage     # С покрытием (цель 60%+)
```

**Покрытие:**
- comparisonStore: 11 тестов
- PeriodColumn: 12 тестов
- SwapButton: 7 тестов
- KpiComparisonCard: 15 тестов
- ComparisonDynamicsChart: 10 тестов
- ComparisonRegionsChart: 9 тестов
- ComparisonScatterPlot: 11 тестов
- ComparisonTable: 17 тестов

**Итого:** 92 теста (100% прохождение) ✅

---

### E2E тесты (Playwright)

```bash
npm run test:e2e          # Headless режим
npm run test:e2e:ui       # UI режим
npm run test:e2e:headed   # В браузере
npm run test:e2e:report   # Показать отчёт
```

**Браузеры:**
- Desktop Chrome
- Desktop Edge
- Mobile Chrome (Pixel 5)

---

## 🎨 Дизайн-система

### Цветовая палитра

| Цвет | HEX | Назначение |
|------|-----|------------|
| **Период А** | `#3388ff` | Синий |
| **Период Б** | `#ff6b6b` | Красный |
| **Рост** | `#38EF7D` | Зелёный |
| **Падение** | `#FF6B6B` | Красный |
| **Стабильно** | `#FFD93D` | Жёлтый |

### Glassmorphism 2.0

```css
background: linear-gradient(
  135deg,
  rgba(15, 12, 41, 0.95) 0%,
  rgba(48, 43, 99, 0.85) 100%
);
border: 1px solid rgba(255, 255, 255, 0.1);
backdrop-filter: blur(20px);
```

---

## 🔧 Конфигурация

### Vite (vite.config.ts)

```typescript
export default defineConfig({
  server: {
    host: '0.0.0.0',  // ✅ Доступ по LAN
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

### Переменные окружения

Создайте `.env` (если требуется):

```bash
VITE_API_URL=http://localhost:8000
```

---

## 📈 Производительность

| Метрика | Значение | Цель | Статус |
|---------|----------|------|--------|
| Время загрузки KPI | <500ms | <1s | ✅ |
| Время загрузки таблицы | <500ms | <1s | ✅ |
| Время ответа API | <300ms | <1s | ✅ |
| Размер сборки | ~500KB | <1MB | ✅ |

---

## 🚀 Развёртывание

### Production чеклист

- [ ] Backend API запущен (порт 8000)
- [ ] PostgreSQL подключён
- [ ] `.env` настроен
- [ ] `npm run build` выполнен
- [ ] Доступ по LAN проверен

### Доступ по LAN

```bash
# Узнать IP адрес
ipconfig  # Windows

# Открыть с другого устройства
http://192.168.x.x:5175
```

---

## 📝 История изменений

### Версия 1.5.2 (21 марта 2026) 🆕

**✅ Исправления проекта:**
- frontend_map: Исправлен доступ по локальной сети
- frontend_map: Убрано дублирование `/api` в путях
- frontend_map: Все API запросы работают корректно

**📄 Документация:**
- [../docs/FRONTEND_MAP_NETWORK_FIX.md](../docs/FRONTEND_MAP_NETWORK_FIX.md)

### Версия 1.5.1 (21 марта 2026) 🆕

**✅ Исправления:**
- PDF экспорт: разделение на страницы (фильтры → KPI → таблица)
- PDF экспорт: сохранение тёмного фона дашборда
- CSV экспорт: корректное отображение кириллицы в Excel (BOM)

**📄 Документация:**
- [docs/PDF_EXPORT_FIX.md](../docs/PDF_EXPORT_FIX.md)
- [docs/PDF_EXPORT_BACKGROUND_FIX.md](../docs/PDF_EXPORT_BACKGROUND_FIX.md)
- [docs/CSV_EXPORT_ENCODING_FIX.md](../docs/CSV_EXPORT_ENCODING_FIX.md)

### Версия 1.0.0 (19 марта 2026)

**✅ Реализовано:**
- Фильтры двух периодов (независимые)
- KPI Panel (6 карточек с индикаторами)
- Таблица сравнения регионов (с сортировкой)
- PDF экспорт (A4, landscape)
- 92 теста (100% прохождение)

**🎨 Дизайн:**
- Glassmorphism 2.0 стиль
- Цветовая индикация трендов
- Адаптивность (mobile/tablet/desktop)

---

## 📞 Поддержка

### Документация

- [Основной README](../README.md)
- [API документация](../docs/04-api-reference/API.md)
- [Отчёт о тестировании](../docs/08-qa-audit/QA_AUDIT_MARCH_19.md)

### Контакты

По вопросам обращайтесь к команде разработки CGM Dashboard.

---

**Последнее обновление:** 19 марта 2026  
**Статус:** ✅ Production Ready
