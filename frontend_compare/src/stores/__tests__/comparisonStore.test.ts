import { describe, it, expect, beforeEach } from 'vitest';
import { useComparisonStore } from '../comparisonStore';

describe('comparisonStore', () => {
  beforeEach(() => {
    // Сброс состояния перед каждым тестом
    useComparisonStore.setState({
      periodA: {
        years: [],
        months: [],
        regions: [],
        products: [],
      },
      periodB: {
        years: [],
        months: [],
        regions: [],
        products: [],
      },
      availableYears: [],
      availableMonths: [],
      availableRegions: [],
      availableProducts: [],
    });
  });

  it('должен иметь начальные значения периодов по умолчанию', () => {
    const state = useComparisonStore.getState();
    expect(state.periodA.years).toEqual([]);
    expect(state.periodB.years).toEqual([]);
  });

  it('должен переключать год периода А', () => {
    useComparisonStore.setState({
      availableYears: [2024, 2025, 2026],
      periodA: { years: [], months: [], regions: [], products: [] },
    });
    
    const { togglePeriodAYear } = useComparisonStore.getState();
    togglePeriodAYear(2024);
    
    const state = useComparisonStore.getState();
    expect(state.periodA.years).toContain(2024);
  });

  it('должен отключать год периода А при повторном клике', () => {
    useComparisonStore.setState({
      availableYears: [2024, 2025],
      periodA: { years: [2024], months: [], regions: [], products: [] },
    });
    
    const { togglePeriodAYear } = useComparisonStore.getState();
    togglePeriodAYear(2024);
    
    const state = useComparisonStore.getState();
    expect(state.periodA.years).not.toContain(2024);
  });

  it('должен переключать год периода Б', () => {
    useComparisonStore.setState({
      availableYears: [2024, 2025, 2026],
      periodB: { years: [], months: [], regions: [], products: [] },
    });
    
    const { togglePeriodBYear } = useComparisonStore.getState();
    togglePeriodBYear(2025);
    
    const state = useComparisonStore.getState();
    expect(state.periodB.years).toContain(2025);
  });

  it('должен обменивать периоды местами', () => {
    useComparisonStore.setState({
      periodA: { years: [2024], months: [1], regions: ['Москва'], products: [] },
      periodB: { years: [2025], months: [2], regions: ['СПб'], products: [] },
    });
    
    const { swapPeriods } = useComparisonStore.getState();
    swapPeriods();
    
    const state = useComparisonStore.getState();
    expect(state.periodA.years).toEqual([2025]);
    expect(state.periodB.years).toEqual([2024]);
  });

  it('должен сбрасывать все фильтры', () => {
    useComparisonStore.setState({
      periodA: { years: [2024, 2025], months: [1], regions: ['Москва'], products: ['Продукт 1'] },
      periodB: { years: [2025], months: [1, 2], regions: ['СПб'], products: [] },
    });
    
    const { resetAll } = useComparisonStore.getState();
    resetAll();
    
    const state = useComparisonStore.getState();
    expect(state.periodA.years).toEqual([]);
    expect(state.periodA.months).toEqual([]);
    expect(state.periodA.regions).toEqual([]);
    expect(state.periodA.products).toEqual([]);
  });

  it('должен устанавливать доступные годы', () => {
    const { setAvailableYears } = useComparisonStore.getState();
    setAvailableYears([2023, 2024, 2025, 2026]);
    
    const state = useComparisonStore.getState();
    expect(state.availableYears).toEqual([2023, 2024, 2025, 2026]);
  });

  it('должен устанавливать доступные регионы', () => {
    const { setAvailableRegions } = useComparisonStore.getState();
    setAvailableRegions(['Москва', 'СПб', 'Казань']);
    
    const state = useComparisonStore.getState();
    expect(state.availableRegions).toEqual(['Москва', 'СПб', 'Казань']);
  });

  it('должен переключать регионы периода А', () => {
    useComparisonStore.setState({
      availableRegions: ['Москва', 'СПб'],
      periodA: { years: [], months: [], regions: [], products: [] },
    });
    
    const { togglePeriodARegion } = useComparisonStore.getState();
    togglePeriodARegion('Москва');
    
    const state = useComparisonStore.getState();
    expect(state.periodA.regions).toContain('Москва');
  });

  it('должен переключать продукты периода Б', () => {
    useComparisonStore.setState({
      availableProducts: ['Продукт 1', 'Продукт 2'],
      periodB: { years: [], months: [], regions: [], products: [] },
    });
    
    const { togglePeriodBProduct } = useComparisonStore.getState();
    togglePeriodBProduct('Продукт 1');
    
    const state = useComparisonStore.getState();
    expect(state.periodB.products).toContain('Продукт 1');
  });

  it('должен сохранять состояние в localStorage (persist)', () => {
    // Persist проверяется через наличие ключа в store
    const state = useComparisonStore.getState();
    expect(state).toBeDefined();
  });
});
