import { test, expect } from '@playwright/test';

test.describe('Comparison Dashboard', () => {
  test('дашборд загружается', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await expect(page.locator('text=Сравнение периодов')).toBeVisible();
  });

  test('заголовок приложения отображается', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await expect(page.locator('text=CGM Dashboard')).toBeVisible();
  });

  test('порт 5175 отображается', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await expect(page.locator('text=Порт 5175')).toBeVisible();
  });

  test('проект создан и готов к разработке', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await expect(page.locator('text=Проект создан и готов к разработке')).toBeVisible();
  });

  test('Vite + React + TypeScript отображаются', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await expect(page.locator('text=Vite + React 19 + TypeScript + Material-UI')).toBeVisible();
  });
});
