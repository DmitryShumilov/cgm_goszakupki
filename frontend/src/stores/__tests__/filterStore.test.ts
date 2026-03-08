/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useFilterStore } from '../filterStore';

describe('filterStore', () => {
  beforeEach(() => {
    // Сброс состояния перед каждым тестом
    useFilterStore.setState({
      selectedYears: [2024],
      selectedMonths: [],
      selectedRegions: [],
      selectedCustomers: [],
      selectedSuppliers: [],
      selectedProducts: [],
      availableYears: [],
      availableMonths: [],
      availableRegions: [],
      availableCustomers: [],
      availableSuppliers: [],
      availableProducts: [],
    });
  });

  describe('toggleYear', () => {
    it('добавляет год к выбранным', () => {
      useFilterStore.getState().toggleYear(2025);
      expect(useFilterStore.getState().selectedYears).toContain(2025);
    });

    it('удаляет год из выбранных', () => {
      useFilterStore.getState().toggleYear(2024);
      expect(useFilterStore.getState().selectedYears).not.toContain(2024);
    });
  });

  describe('toggleMonth', () => {
    it('добавляет месяц к выбранным', () => {
      useFilterStore.getState().toggleMonth(1);
      expect(useFilterStore.getState().selectedMonths).toContain(1);
    });

    it('удаляет месяц из выбранных', () => {
      useFilterStore.getState().toggleMonth(1);
      useFilterStore.getState().toggleMonth(1);
      expect(useFilterStore.getState().selectedMonths).not.toContain(1);
    });
  });

  describe('toggleRegion', () => {
    it('добавляет регион к выбранным', () => {
      useFilterStore.getState().toggleRegion('Москва');
      expect(useFilterStore.getState().selectedRegions).toContain('Москва');
    });

    it('удаляет регион из выбранных', () => {
      useFilterStore.getState().toggleRegion('Москва');
      useFilterStore.getState().toggleRegion('Москва');
      expect(useFilterStore.getState().selectedRegions).not.toContain('Москва');
    });
  });

  describe('resetFilters', () => {
    it('сбрасывает все фильтры к значениям по умолчанию', () => {
      useFilterStore.setState({
        availableYears: [2024, 2025],
        availableMonths: [1, 2, 3],
        selectedYears: [2025],
        selectedMonths: [1],
        selectedRegions: ['Москва'],
        selectedCustomers: ['Заказчик 1'],
        selectedSuppliers: ['Поставщик 1'],
        selectedProducts: ['Товар 1'],
      });

      useFilterStore.getState().resetFilters();

      expect(useFilterStore.getState().selectedYears).toEqual([2024]);
      expect(useFilterStore.getState().selectedMonths).toEqual([1, 2, 3]);
      expect(useFilterStore.getState().selectedRegions).toEqual([]);
      expect(useFilterStore.getState().selectedCustomers).toEqual([]);
      expect(useFilterStore.getState().selectedSuppliers).toEqual([]);
      expect(useFilterStore.getState().selectedProducts).toEqual([]);
    });
  });

  describe('selectAllYears', () => {
    it('выбирает все доступные года', () => {
      useFilterStore.setState({
        availableYears: [2024, 2025, 2026],
        selectedYears: [2024],
      });

      useFilterStore.getState().selectAllYears();

      expect(useFilterStore.getState().selectedYears).toEqual([2024, 2025, 2026]);
    });
  });

  describe('selectAllMonths', () => {
    it('выбирает все доступные месяцы', () => {
      useFilterStore.setState({
        availableMonths: [1, 2, 3, 4, 5],
        selectedMonths: [1],
      });

      useFilterStore.getState().selectAllMonths();

      expect(useFilterStore.getState().selectedMonths).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('setAvailable*', () => {
    it('устанавливает доступные года и выбирает 2024 по умолчанию', () => {
      useFilterStore.getState().setAvailableYears([2024, 2025, 2026]);
      expect(useFilterStore.getState().availableYears).toEqual([2024, 2025, 2026]);
      expect(useFilterStore.getState().selectedYears).toContain(2024);
    });

    it('устанавливает доступные месяцы и выбирает все', () => {
      useFilterStore.getState().setAvailableMonths([1, 2, 3]);
      expect(useFilterStore.getState().availableMonths).toEqual([1, 2, 3]);
      expect(useFilterStore.getState().selectedMonths).toEqual([1, 2, 3]);
    });

    it('устанавливает доступные регионы и выбирает все', () => {
      useFilterStore.getState().setAvailableRegions(['Москва', 'СПб']);
      expect(useFilterStore.getState().availableRegions).toEqual(['Москва', 'СПб']);
      expect(useFilterStore.getState().selectedRegions).toEqual(['Москва', 'СПб']);
    });
  });
});
