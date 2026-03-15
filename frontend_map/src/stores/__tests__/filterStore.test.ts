/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useFilterStore } from '../filterStore';

describe('filterStore', () => {
  beforeEach(() => {
    // Сбрасываем состояние перед каждым тестом
    useFilterStore.setState({
      selectedYears: [],
      selectedRegions: [],
      selectedSuppliers: [],
      selectedProducts: [],
      availableYears: [2024, 2025, 2026],
      availableRegions: [],
      availableSuppliers: [],
      availableProducts: [],
    });
  });

  it('инициализируется с пустыми выбранными фильтрами', () => {
    const state = useFilterStore.getState();
    expect(state.selectedYears).toEqual([]);
    expect(state.selectedRegions).toEqual([]);
    expect(state.selectedSuppliers).toEqual([]);
    expect(state.selectedProducts).toEqual([]);
  });

  it('добавляет год при toggleYear', () => {
    useFilterStore.getState().toggleYear(2024);

    const state = useFilterStore.getState();
    expect(state.selectedYears).toContain(2024);
  });

  it('удаляет год при повторном toggleYear', () => {
    useFilterStore.getState().toggleYear(2024);
    useFilterStore.getState().toggleYear(2024);

    const state = useFilterStore.getState();
    expect(state.selectedYears).not.toContain(2024);
  });

  it('добавляет регион при toggleRegion', () => {
    useFilterStore.getState().toggleRegion('Москва');

    const state = useFilterStore.getState();
    expect(state.selectedRegions).toContain('Москва');
  });

  it('удаляет регион при повторном toggleRegion', () => {
    useFilterStore.getState().toggleRegion('Москва');
    useFilterStore.getState().toggleRegion('Москва');

    const state = useFilterStore.getState();
    expect(state.selectedRegions).not.toContain('Москва');
  });

  it('добавляет поставщика при toggleSupplier', () => {
    useFilterStore.getState().toggleSupplier('Поставщик 1');

    const state = useFilterStore.getState();
    expect(state.selectedSuppliers).toContain('Поставщик 1');
  });

  it('добавляет продукт при toggleProduct', () => {
    useFilterStore.getState().toggleProduct('Продукт 1');

    const state = useFilterStore.getState();
    expect(state.selectedProducts).toContain('Продукт 1');
  });

  it('сбрасывает все фильтры при resetFilters', () => {
    useFilterStore.getState().toggleYear(2024);
    useFilterStore.getState().toggleRegion('Москва');
    useFilterStore.getState().toggleSupplier('Поставщик 1');

    useFilterStore.getState().resetFilters();

    const state = useFilterStore.getState();
    expect(state.selectedYears).toEqual([]);
    expect(state.selectedRegions).toEqual([]);
    expect(state.selectedSuppliers).toEqual([]);
    expect(state.selectedProducts).toEqual([]);
  });

  it('устанавливает доступные годы', () => {
    useFilterStore.getState().setAvailableYears([2023, 2024, 2025]);

    const state = useFilterStore.getState();
    expect(state.availableYears).toEqual([2023, 2024, 2025]);
  });

  it('устанавливает доступные регионы', () => {
    useFilterStore.getState().setAvailableRegions(['Москва', 'СПб']);

    const state = useFilterStore.getState();
    expect(state.availableRegions).toEqual(['Москва', 'СПб']);
  });

  it('устанавливает доступные поставщики', () => {
    useFilterStore.getState().setAvailableSuppliers(['Поставщик 1', 'Поставщик 2']);

    const state = useFilterStore.getState();
    expect(state.availableSuppliers).toEqual(['Поставщик 1', 'Поставщик 2']);
  });

  it('устанавливает доступные продукты', () => {
    useFilterStore.getState().setAvailableProducts(['Продукт 1', 'Продукт 2']);

    const state = useFilterStore.getState();
    expect(state.availableProducts).toEqual(['Продукт 1', 'Продукт 2']);
  });
});
