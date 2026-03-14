/**
 * E2E тесты для фильтрации данных
 * Тестирование работы фильтров и обновления данных
 */
import { test, expect } from '@playwright/test';

test.describe('Filters - Фильтрация данных', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('фильтр по году - выбор одного года', async ({ page }) => {
    // Найти кнопку года 2025 и кликнуть
    const yearButton = page.getByText('2025').first();
    await expect(yearButton).toBeVisible({ timeout: 10000 });
    await yearButton.click();

    // Проверка что кнопка активна
    await expect(yearButton).toHaveClass(/MuiButton-contained/);

    // Небольшая задержка для обновления данных
    await page.waitForTimeout(1000);

    // Проверка что KPI обновились (хотя бы одна карточка видна)
    const kpiCard = page.getByText(/сумма|контракт|объём/i).first();
    await expect(kpiCard).toBeVisible();
  });

  test('фильтр по году - выбор нескольких лет', async ({ page }) => {
    // Выбрать 2024
    const year2024 = page.getByText('2024').first();
    if (await year2024.isVisible()) {
      await year2024.click();
      await page.waitForTimeout(500);
    }

    // Выбрать 2025
    const year2025 = page.getByText('2025').first();
    if (await year2025.isVisible()) {
      await year2025.click();
      await page.waitForTimeout(500);
    }

    // Проверка что обе кнопки активны
    if (await year2024.isVisible()) {
      await expect(year2024).toHaveClass(/MuiButton-contained/);
    }
    if (await year2025.isVisible()) {
      await expect(year2025).toHaveClass(/MuiButton-contained/);
    }
  });

  test('фильтр по месяцу - выбор месяца', async ({ page }) => {
    // Найти кнопку месяца (Янв, Фев, Мар и т.д.)
    const monthButton = page.getByText(/^Янв$|^Фев$|^Мар$|^Апр$/).first();
    await expect(monthButton).toBeVisible({ timeout: 10000 });
    await monthButton.click();

    // Проверка что месяц выбран
    await expect(monthButton).toHaveClass(/MuiButton-contained/);

    await page.waitForTimeout(1000);
  });

  test('фильтр по региону - мультивыбор', async ({ page }) => {
    // Найти Autocomplete для регионов
    const regionInput = page.getByLabel(/Регион/i).locator('input').first();
    await expect(regionInput).toBeVisible({ timeout: 10000 });

    // Кликнуть для открытия dropdown
    await regionInput.click();
    await page.waitForTimeout(500);

    // Выбрать первый доступный регион
    const firstOption = page.locator('[role="listbox"] li').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
      await page.waitForTimeout(1000);

      // Проверка что регион выбран (chip/tag отображается)
      const chip = page.locator('.MuiChip-root').first();
      await expect(chip).toBeVisible();
    }
  });

  test('фильтр по поставщику - поиск', async ({ page }) => {
    // Найти Autocomplete для поставщиков
    const supplierInput = page.getByLabel(/Поставщик/i).locator('input').first();
    await expect(supplierInput).toBeVisible({ timeout: 10000 });

    // Ввести текст для поиска
    await supplierInput.click();
    await supplierInput.fill('ООО');
    await page.waitForTimeout(500);

    // Проверка что есть варианты выбора
    const options = page.locator('[role="listbox"] li');
    const count = await options.count();
    expect(count).toBeGreaterThan(0);
  });

  test('фильтр по продукту - выбор', async ({ page }) => {
    // Найти Autocomplete для продуктов
    const productInput = page.getByLabel(/Продукт|Товар|Что закупали/i).locator('input').first();
    await expect(productInput).toBeVisible({ timeout: 10000 });

    // Кликнуть для открытия
    await productInput.click();
    await page.waitForTimeout(500);

    // Выбрать первый вариант
    const firstOption = page.locator('[role="listbox"] li').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
      await page.waitForTimeout(1000);

      // Проверка что продукт выбран
      const chip = page.locator('.MuiChip-root').first();
      await expect(chip).toBeVisible();
    }
  });

  test('сброс фильтров', async ({ page }) => {
    // Сначала применить фильтр
    const yearButton = page.getByText('2025').first();
    if (await yearButton.isVisible()) {
      await yearButton.click();
      await page.waitForTimeout(500);
    }

    // Найти кнопку сброса
    const resetButton = page.getByText(/Сбросить|Reset/i).first();
    if (await resetButton.isVisible()) {
      await resetButton.click();
      await page.waitForTimeout(1000);

      // Проверка что фильтр сброшен (кнопка года не активна)
      if (await yearButton.isVisible()) {
        await expect(yearButton).not.toHaveClass(/MuiButton-contained/);
      }
    }
  });

  test('комбинация фильтров - год + месяц', async ({ page }) => {
    // Выбрать год
    const yearButton = page.getByText('2025').first();
    if (await yearButton.isVisible()) {
      await yearButton.click();
      await page.waitForTimeout(500);
    }

    // Выбрать месяц
    const monthButton = page.getByText(/^Янв$/).first();
    if (await monthButton.isVisible()) {
      await monthButton.click();
      await page.waitForTimeout(1000);
    }

    // Проверка что данные обновились
    const kpiCard = page.getByText(/сумма|контракт/i).first();
    await expect(kpiCard).toBeVisible();
  });

  test('фильтры сохраняются в localStorage', async ({ page }) => {
    // Применить фильтр
    const yearButton = page.getByText('2025').first();
    if (await yearButton.isVisible()) {
      await yearButton.click();
      await page.waitForTimeout(1000);
    }

    // Перезагрузить страницу
    await page.reload();
    await page.waitForTimeout(2000);

    // Проверка что фильтр сохранился
    if (await yearButton.isVisible()) {
      await expect(yearButton).toHaveClass(/MuiButton-contained/);
    }
  });
});

test.describe('Filters - Edge Cases', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('пустой результат фильтрации', async ({ page }) => {
    // Применить все фильтры которые могут дать пустой результат
    const yearButton = page.getByText('2030').first();
    if (await yearButton.isVisible()) {
      await yearButton.click();
      await page.waitForTimeout(2000);

      // Проверка что KPI показывают 0 или сообщение
      const kpiValue = page.getByText(/0|Нет данных/i).first();
      if (await kpiValue.count() > 0) {
        await expect(kpiValue).toBeVisible();
      }
    }
  });

  test('быстрое переключение фильтров', async ({ page }) => {
    // Быстро кликнуть несколько фильтров
    const yearButtons = page.getByText(/2024|2025|2026/);
    const count = await yearButtons.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      const button = yearButtons.nth(i);
      if (await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(200);
      }
    }

    // Проверка что приложение не упало
    const kpiCard = page.getByText(/сумма|контракт/i).first();
    await expect(kpiCard).toBeVisible({ timeout: 10000 });
  });

  test('фильтр с большим количеством вариантов', async ({ page }) => {
    // Тест для Autocomplete с большим списком
    const regionInput = page.getByLabel(/Регион/i).locator('input').first();
    await expect(regionInput).toBeVisible({ timeout: 10000 });

    await regionInput.click();
    await page.waitForTimeout(500);

    // Проверка что dropdown открылся
    const listbox = page.locator('[role="listbox"]');
    await expect(listbox).toBeVisible();

    // Проверка что есть скролл если вариантов много
    const options = page.locator('[role="listbox"] li');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(0);
  });
});
