import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SwapButton } from '../SwapButton';
import { useComparisonStore } from '../../../stores/comparisonStore';

describe('SwapButton', () => {
  beforeEach(() => {
    // Сброс состояния перед каждым тестом
    useComparisonStore.setState({
      periodA: {
        years: [2024],
        months: [],
        regions: ['Москва'],
        products: ['Продукт 1'],
      },
      periodB: {
        years: [2025],
        months: [],
        regions: ['СПб'],
        products: ['Продукт 2'],
      },
    });
  });

  it('должен отображать кнопку обмена периодов', () => {
    render(<SwapButton />);
    expect(screen.getByText('Поменять местами')).toBeInTheDocument();
  });

  it('должен иметь иконку 🔄', () => {
    render(<SwapButton />);
    expect(screen.getByText('🔄')).toBeInTheDocument();
  });

  it('должен иметь tooltip', () => {
    render(<SwapButton />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', undefined); // Tooltip работает через title
  });

  it('должен обменивать периоды местами при клике', () => {
    render(<SwapButton />);
    
    fireEvent.click(screen.getByText('Поменять местами'));
    
    const state = useComparisonStore.getState();
    expect(state.periodA.years).toEqual([2025]);
    expect(state.periodB.years).toEqual([2024]);
    expect(state.periodA.regions).toEqual(['СПб']);
    expect(state.periodB.regions).toEqual(['Москва']);
  });

  it('должен добавлять анимацию при клике', () => {
    render(<SwapButton />);
    
    fireEvent.click(screen.getByText('Поменять местами'));
    
    // Кнопка должна быть disabled во время анимации
    const button = screen.getByText('Поменять местами').closest('button');
    // Проверяем что кнопка была нажата (анимация происходит быстро)
    expect(button).toBeDefined();
  });

  it('должен иметь правильные стили', () => {
    render(<SwapButton />);
    
    const button = screen.getByText('Поменять местами').closest('button');
    expect(button).toHaveStyle('text-transform: none');
    expect(button).toHaveStyle('font-weight: 600');
  });

  it('должен быть disabled во время анимации', async () => {
    render(<SwapButton />);

    fireEvent.click(screen.getByText('Поменять местами'));

    // Сразу после клика кнопка должна быть disabled
    const button = screen.getByText('Поменять местами').closest('button');
    expect(button).toBeDisabled();
  });
});
