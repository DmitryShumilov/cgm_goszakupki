# E2E Тестирование CGM Dashboard

## Запуск тестов

### Базовые команды

```bash
# Запустить все E2E тесты (headless)
npm run test:e2e

# Запустить тесты в режиме UI (интерактивно)
npm run test:e2e:ui

# Запустить тесты в браузере (headed mode)
npm run test:e2e:headed

# Показать отчёт после тестов
npm run test:e2e:report
```

### Тестирование конкретных браузеров

```bash
# Только Chromium
npx playwright test --project=chromium

# Только мобильные устройства
npx playwright test --project="Mobile Chrome" --project="Mobile Safari"

# Только планшет
npx playwright test --project=iPad
```

### Тестирование конкретных файлов

```bash
# Конкретный файл теста
npx playwright test tests/e2e/dashboard.spec.ts

# Конкретный тест по названию
npx playwright test --grep "дашборд загружается"

# Тесты с тегом @smoke
npx playwright test --grep @smoke
```

## Структура тестов

```
tests/e2e/
├── dashboard.spec.ts    # Основные сценарии дашборда
├── mobile.spec.ts       # Тесты адаптивности
└── fixtures/            # Фикстуры и хелперы (опционально)
```

## Критические сценарии (Smoke Tests)

| № | Сценарий | Файл | Статус |
|---|----------|------|--------|
| 1 | Загрузка дашборда | dashboard.spec.ts | ✅ |
| 2 | KPI карточки отображаются | dashboard.spec.ts | ✅ |
| 3 | Фильтр по году | dashboard.spec.ts | ✅ |
| 4 | Фильтр по месяцу | dashboard.spec.ts | ✅ |
| 5 | Кнопка "Обновить" | dashboard.spec.ts | ✅ |
| 6 | Кнопка "Сбросить фильтры" | dashboard.spec.ts | ✅ |
| 7 | Диаграммы загружаются | dashboard.spec.ts | ✅ |
| 8 | Мобильная версия | mobile.spec.ts | ✅ |
| 9 | Планшетная версия | mobile.spec.ts | ✅ |
| 10 | Desktop разрешения | mobile.spec.ts | ✅ |

## Конфигурация

### playwright.config.ts

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  fullyParallel: true,
  workers: 4,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html'], ['list'], ['json']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
    { name: 'iPad', use: { ...devices['iPad Pro'] } },
  ],
});
```

## Отчётность

После запуска тестов HTML отчёт доступен по команде:

```bash
npm run test:e2e:report
```

Отчёт открывается в браузере и содержит:
- Список всех тестов
- Статус выполнения
- Скриншоты ошибок
- Video failed тестов
- Trace для отладки

## CI/CD Интеграция

### GitHub Actions пример

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
          npx playwright install --with-deps chromium
      
      - name: Run E2E tests
        run: |
          cd frontend
          npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

## Отладка тестов

### Playwright Inspector

```bash
# Запуск с инспектором
npx playwright test --debug

# Запуск конкретного теста с инспектором
npx playwright test --debug tests/e2e/dashboard.spec.ts
```

### Trace Viewer

```bash
# Просмотр trace
npx playwright show-trace trace.zip
```

### Эмуляция устройств

```typescript
// В тесте
test('mobile test', async ({ browser }) => {
  const context = await browser.newContext({
    ...devices['iPhone 12'],
  });
  const page = await context.newPage();
  // ...
});
```

## Best Practices

1. **Изоляция тестов** - каждый тест должен быть независимым
2. **Page Object Model** - для сложных сценариев используйте POM
3. **Ожидания** - используйте `await expect()` вместо `waitForTimeout()`
4. **Селекторы** - используйте data-testid атрибуты
5. **Артефакты** - скриншоты и video сохраняются при ошибках

## Добавление data-testid

Для надёжных селекторов добавьте data-testid в компоненты:

```tsx
// React компонент
<button data-testid="refresh-button">
  Обновить данные
</button>

// Тест
await page.getByTestId('refresh-button').click();
```

## Устранение проблем

### Тесты падают с timeout

```typescript
// Увеличьте timeout для конкретного теста
test('долгий тест', async ({ page }) => {
  test.setTimeout(60000);
  // ...
});
```

### Элемент не найден

```typescript
// Используйте более надёжные селекторы
await page.getByRole('button', { name: 'Обновить' }).click();

// Или по data-testid
await page.getByTestId('refresh-button').click();

// Или по тексту
await page.getByText('Обновить данные').click();
```

### Ложные срабатывания

```typescript
// Добавьте retry для flaky тестов
test('flaky test', async ({ page }) => {
  test.retry(2);
  // ...
});
```
