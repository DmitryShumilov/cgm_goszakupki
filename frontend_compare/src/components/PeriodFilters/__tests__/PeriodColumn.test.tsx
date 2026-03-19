import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PeriodColumn } from '../PeriodColumn';
import { useComparisonStore } from '../../../stores/comparisonStore';

describe('PeriodColumn', () => {
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
      availableYears: [2024, 2025, 2026],
      availableRegions: ['Москва', 'СПб', 'Казань'],
      availableProducts: ['Продукт 1', 'Продукт 2'],
    });
  });

  it('должен отображать заголовок периода', () => {
    render(<PeriodColumn period="A" title="Период А" color="#3388ff" />);
    expect(screen.getByText('Период А')).toBeInTheDocument();
  });

  it('должен отображать кнопки годов', () => {
    render(<PeriodColumn period="A" title="Период А" color="#3388ff" />);
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
  });

  it('должен переключать год при клике', () => {
    render(<PeriodColumn period="A" title="Период А" color="#3388ff" />);
    
    fireEvent.click(screen.getByText('2024'));
    
    const state = useComparisonStore.getState();
    expect(state.periodA.years).toContain(2024);
  });

  it('должен отображать выбранный год как активный', () => {
    useComparisonStore.setState({
      periodA: { years: [2024], months: [], regions: [], products: [] },
    });
    
    render(<PeriodColumn period="A" title="Период А" color="#3388ff" />);
    
    const yearButton = screen.getByText('2024');
    expect(yearButton).toHaveStyle('background: linear-gradient(135deg, #3388ff 0%, #3388ffcc 100%)');
  });

  it('должен отображать регионы', () => {
    render(<PeriodColumn period="A" title="Период А" color="#3388ff" />);
    expect(screen.getByText('Москва')).toBeInTheDocument();
    expect(screen.getByText('СПб')).toBeInTheDocument();
  });

  it('должен переключать регион при клике', () => {
    render(<PeriodColumn period="A" title="Период А" color="#3388ff" />);
    
    fireEvent.click(screen.getByText('Москва'));
    
    const state = useComparisonStore.getState();
    expect(state.periodA.regions).toContain('Москва');
  });

  it('должен отображать продукты', () => {
    render(<PeriodColumn period="A" title="Период А" color="#3388ff" />);
    expect(screen.getByText('Продукт 1')).toBeInTheDocument();
    expect(screen.getByText('Продукт 2')).toBeInTheDocument();
  });

  it('должен переключать продукт при клике', () => {
    render(<PeriodColumn period="A" title="Период А" color="#3388ff" />);
    
    fireEvent.click(screen.getByText('Продукт 1'));
    
    const state = useComparisonStore.getState();
    expect(state.periodA.products).toContain('Продукт 1');
  });

  it('должен иметь кнопку сброса фильтров', () => {
    render(<PeriodColumn period="A" title="Период А" color="#3388ff" />);
    expect(screen.getByText('🔄 Сбросить фильтры')).toBeInTheDocument();
  });

  it('должен сбрасывать фильтры при клике на кнопку сброса', () => {
    useComparisonStore.setState({
      periodA: { years: [2024, 2025], months: [], regions: ['Москва'], products: ['Продукт 1'] },
    });
    
    render(<PeriodColumn period="A" title="Период А" color="#3388ff" />);
    
    fireEvent.click(screen.getByText('🔄 Сбросить фильтры'));
    
    const state = useComparisonStore.getState();
    expect(state.periodA.years).toEqual([]);
    expect(state.periodA.regions).toEqual([]);
    expect(state.periodA.products).toEqual([]);
  });

  it('должен обрезать длинные названия регионов', () => {
    useComparisonStore.setState({
      availableRegions: ['Очень длинное название региона которое превышает 25 символов'],
    });
    
    render(<PeriodColumn period="A" title="Период А" color="#3388ff" />);
    
    // Обрезка до 22 символов + "..."
    expect(screen.getByText('Очень длинное название...')).toBeInTheDocument();
  });

  it('должен использовать правильный цвет для периода Б', () => {
    render(<PeriodColumn period="B" title="Период Б" color="#ff6b6b" />);
    
    const periodBTitle = screen.getByText('Период Б');
    expect(periodBTitle).toHaveStyle('color: #ff6b6b');
  });
});
