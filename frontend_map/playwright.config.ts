import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright конфигурация для E2E тестирования CGM Dashboard
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  // Таймауты
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  
  // Запуск тестов параллельно
  fullyParallel: true,
  
  // Количество воркеров
  workers: 4,
  
  // Запретить запуск тестов параллельно для одного файла
  forbidOnly: !!process.env.CI,
  
  // Повторные попытки в CI
  retries: process.env.CI ? 2 : 0,
  
  // Отчётность
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  // Общие настройки для всех тестов
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  
  // Конфигурация проектов (браузеры)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Тестирование на мобильных устройствах
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // Планшет
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },
  ],
  
  // Запуск локального сервера для тестов
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
