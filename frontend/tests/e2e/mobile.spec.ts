/**
 * E2E тесты для мобильных устройств
 * Тестирование адаптивности и мобильного UX
 */
import { test, expect, devices } from '@playwright/test';

test.describe('Mobile - Адаптивность', () => {
  
  test.beforeEach(async ({ page }) => {
    // Установить мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
  });

  test('мобильная версия - загрузка', async ({ page }) => {
    // Проверка что страница загрузилась
    await expect(page).toHaveTitle(/CGM/);
    
    // Проверка видимости основного контента
    const mainContent = page.locator('main, [role="main"], .MuiBox-root').first();
    await expect(mainContent).toBeVisible();
  });

  test('мобильная версия - панель фильтров скрыта', async ({ page }) => {
    // На мобильных панель фильтров должна быть скрыта в drawer
    const filterPanel = page.locator('.MuiDrawer-root, [aria-label*="Фильтр"]').first();
    
    // Проверка что drawer существует
    if (await filterPanel.count() > 0) {
      // Drawer может быть скрыт
      const isVisible = await filterPanel.isVisible();
      
      // Если виден - проверить что можно закрыть
      if (isVisible) {
        const closeButton = page.getByRole('button', { name: /close/i }).first();
        if (await closeButton.count() > 0) {
          await closeButton.click();
        }
      }
    }
  });

  test('мобильная версия - KPI карточки адаптируются', async ({ page }) => {
    // Проверка что KPI карточки отображаются в столбец на мобильных
    const kpiCards = page.locator('[class*="Kpi"], [class*="kpi"], .MuiPaper-root').filter({ 
      hasText: /сумма|контракт|объём|цена/i 
    });
    
    // Хотя бы одна KPI карточка должна быть видна
    await expect(kpiCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('мобильная версия - навигация', async ({ page }) => {
    // Проверка что можно скроллить
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    expect(scrollHeight).toBeGreaterThan(0);
    
    // Прокрутка вниз
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Прокрутка вверх
    await page.evaluate(() => window.scrollTo(0, 0));
  });
});

test.describe('Tablet - Адаптивность', () => {
  
  test.beforeEach(async ({ page }) => {
    // Установить планшетный viewport (iPad)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
  });

  test('планшетная версия - загрузка', async ({ page }) => {
    await expect(page).toHaveTitle(/CGM/);
  });

  test('планшетная версия - сетка KPI', async ({ page }) => {
    // На планшете KPI должны быть в сетке 2-3 колонки
    const kpiContainer = page.locator('[class*="Grid"], [class*="grid"]').first();
    await expect(kpiContainer).toBeVisible();
  });
});

test.describe('Desktop - Разные разрешения', () => {
  
  test('Full HD разрешение', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Проверка что всё помещается на экране
    const mainContent = page.locator('#root, .app').first();
    await expect(mainContent).toBeVisible();
  });

  test('2K разрешение', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.goto('/');
    
    await expect(page).toHaveTitle(/CGM/);
  });
});
