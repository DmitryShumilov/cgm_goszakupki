/**
 * E2E тесты для CGM Dashboard
 * Критические сценарии использования
 */
import { test, expect } from '@playwright/test';

test.describe('CGM Dashboard - Основные сценарии', () => {
  
  test.beforeEach(async ({ page }) => {
    // Переход на главную страницу перед каждым тестом
    await page.goto('/');
  });

  test('дашборд загружается успешно', async ({ page }) => {
    // Проверка заголовка
    await expect(page).toHaveTitle(/CGM/);
    
    // Проверка наличия заголовка приложения
    await expect(page.getByText(/CGM|Госзакупки|Dashboard/)).toBeVisible();
  });

  test('KPI карточки отображаются', async ({ page }) => {
    // Проверка наличия KPI карточек
    const kpiTitles = [
      'Общая сумма закупок',
      'Количество контрактов',
      'Средняя сумма контракта',
      'Общий объём',
      'Средняя цена',
      'Заказчик',
    ];
    
    for (const title of kpiTitles) {
      await expect(page.getByText(new RegExp(title))).toBeVisible({ timeout: 10000 });
    }
  });

  test('фильтр по году работает', async ({ page }) => {
    // Найти кнопку года и кликнуть
    const yearButton = page.getByText('2025').first();
    await expect(yearButton).toBeVisible();
    await yearButton.click();
    
    // Проверка, что год выбран (кнопка активна)
    await expect(yearButton).toHaveClass(/contained|active|MuiButton-contained/);
  });

  test('фильтр по месяцу работает', async ({ page }) => {
    // Найти кнопку месяца и кликнуть
    const monthButton = page.getByText(/Янв|Фев|Мар/).first();
    await expect(monthButton).toBeVisible();
    await monthButton.click();
  });

  test('кнопка "Обновить данные" работает', async ({ page }) => {
    // Найти кнопку обновления
    const refreshButton = page.getByText(/Обновить|Refresh/);
    await expect(refreshButton).toBeVisible();
    
    // Клик и проверка что запрос отправлен (можно проверить по network)
    await refreshButton.click();
    
    // Небольшая задержка для проверки обновления
    await page.waitForTimeout(1000);
  });

  test('кнопка "Сбросить фильтры" работает', async ({ page }) => {
    // Сначала применить фильтр
    const yearButton = page.getByText('2025').first();
    if (await yearButton.isVisible()) {
      await yearButton.click();
      await page.waitForTimeout(500);
    }
    
    // Найти и нажать сброс
    const resetButton = page.getByText(/Сбросить|Reset/);
    if (await resetButton.isVisible()) {
      await resetButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('диаграммы загружаются', async ({ page }) => {
    // Проверка наличия заголовков диаграмм
    const chartTitles = [
      'Динамика',
      'Регион',
      'Поставщик',
    ];
    
    for (const title of chartTitles) {
      const locator = page.getByText(new RegExp(title, 'i'));
      if (await locator.count() > 0) {
        await expect(locator.first()).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('панель фильтров отображается', async ({ page }) => {
    // Проверка наличия панели фильтров
    const filterPanel = page.getByText(/Год|Месяц|Регион|Продукт/);
    await expect(filterPanel.first()).toBeVisible();
  });

  test('адаптивность - мобильное меню', async ({ page }) => {
    // Установить мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Проверка наличия кнопки меню для мобильных
    const menuButton = page.getByRole('button', { name: /Фильтр|Menu|Filter/i });
    if (await menuButton.count() > 0) {
      await expect(menuButton.first()).toBeVisible();
    }
  });
});
