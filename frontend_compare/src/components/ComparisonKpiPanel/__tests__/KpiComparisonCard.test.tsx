import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiComparisonCard } from '../KpiComparisonCard';
import type { ChangeData } from '../../../types';

const mockChangeGrowth: ChangeData = {
  absolute: 1000000,
  percent: 10.5,
  trend: 'growth',
};

const mockChangeDecline: ChangeData = {
  absolute: -500000,
  percent: -5.3,
  trend: 'decline',
};

const mockChangeStable: ChangeData = {
  absolute: 1000,
  percent: 0.5,
  trend: 'stable',
};

describe('KpiComparisonCard', () => {
  it('должен отображать заголовок карточки', () => {
    render(
      <KpiComparisonCard
        label="Общая сумма закупок"
        icon="💰"
        periodAValue={1000000000}
        periodBValue={1100000000}
        change={mockChangeGrowth}
        isMoney={true}
      />
    );
    
    expect(screen.getByText('Общая сумма закупок')).toBeInTheDocument();
  });

  it('должен отображать иконку', () => {
    render(
      <KpiComparisonCard
        label="Тест"
        icon="💰"
        periodAValue={1000}
        periodBValue={1100}
        change={mockChangeGrowth}
        isMoney={false}
      />
    );
    
    expect(screen.getByText('💰')).toBeInTheDocument();
  });

  it('должен отображать значение периода А', () => {
    render(
      <KpiComparisonCard
        label="Тест"
        icon="💰"
        periodAValue={1000000000}
        periodBValue={1100000000}
        change={mockChangeGrowth}
        isMoney={true}
      />
    );
    
    expect(screen.getByText('1.00 млрд ₽')).toBeInTheDocument();
  });

  it('должен отображать значение периода Б', () => {
    render(
      <KpiComparisonCard
        label="Тест"
        icon="💰"
        periodAValue={1000000000}
        periodBValue={1100000000}
        change={mockChangeGrowth}
        isMoney={true}
      />
    );
    
    expect(screen.getByText('1.10 млрд ₽')).toBeInTheDocument();
  });

  it('должен отображать процентное изменение с трендом роста', () => {
    render(
      <KpiComparisonCard
        label="Тест"
        icon="💰"
        periodAValue={1000}
        periodBValue={1100}
        change={mockChangeGrowth}
        isMoney={false}
      />
    );
    
    expect(screen.getByText('📈 +10.5%')).toBeInTheDocument();
  });

  it('должен отображать процентное изменение с трендом падения', () => {
    render(
      <KpiComparisonCard
        label="Тест"
        icon="💰"
        periodAValue={1000}
        periodBValue={950}
        change={mockChangeDecline}
        isMoney={false}
      />
    );
    
    expect(screen.getByText('📉 -5.3%')).toBeInTheDocument();
  });

  it('должен отображать процентное изменение со стабильным трендом', () => {
    render(
      <KpiComparisonCard
        label="Тест"
        icon="💰"
        periodAValue={1000}
        periodBValue={1005}
        change={mockChangeStable}
        isMoney={false}
      />
    );
    
    expect(screen.getByText('➡️ +0.5%')).toBeInTheDocument();
  });

  it('должен отображать абсолютное изменение для денег', () => {
    render(
      <KpiComparisonCard
        label="Тест"
        icon="💰"
        periodAValue={1000000000}
        periodBValue={1100000000}
        change={{ ...mockChangeGrowth, absolute: 100000000 }}
        isMoney={true}
      />
    );
    
    expect(screen.getByText('(+100.00 млн ₽)')).toBeInTheDocument();
  });

  it('должен отображать абсолютное изменение для чисел', () => {
    render(
      <KpiComparisonCard
        label="Тест"
        icon="📄"
        periodAValue={100}
        periodBValue={110}
        change={{ ...mockChangeGrowth, absolute: 10 }}
        isMoney={false}
      />
    );
    
    expect(screen.getByText('(+10)')).toBeInTheDocument();
  });

  it('должен форматировать числа в млн', () => {
    render(
      <KpiComparisonCard
        label="Тест"
        icon="💰"
        periodAValue={5000000}
        periodBValue={5500000}
        change={mockChangeGrowth}
        isMoney={true}
      />
    );
    
    expect(screen.getByText('5.00 млн ₽')).toBeInTheDocument();
    expect(screen.getByText('5.50 млн ₽')).toBeInTheDocument();
  });

  it('должен форматировать числа в тыс', () => {
    render(
      <KpiComparisonCard
        label="Тест"
        icon="💰"
        periodAValue={5000}
        periodBValue={5500}
        change={mockChangeGrowth}
        isMoney={true}
      />
    );
    
    expect(screen.getByText('5 тыс ₽')).toBeInTheDocument();
    expect(screen.getByText('6 тыс ₽')).toBeInTheDocument();
  });

  it('должен иметь правильную структуру ARIA', () => {
    const { container } = render(
      <KpiComparisonCard
        label="Общая сумма закупок"
        icon="💰"
        periodAValue={1000}
        periodBValue={1100}
        change={mockChangeGrowth}
        isMoney={false}
      />
    );
    
    const card = container.querySelector('[role="article"]');
    expect(card).toHaveAttribute('aria-label', 'Общая сумма закупок');
  });

  it('должен иметь data-testid атрибут', () => {
    render(
      <KpiComparisonCard
        label="Общая сумма закупок"
        icon="💰"
        periodAValue={1000}
        periodBValue={1100}
        change={mockChangeGrowth}
        isMoney={false}
      />
    );
    
    expect(screen.getByTestId('kpi-card-общая-сумма-закупок')).toBeInTheDocument();
  });

  it('должен отображать метку "Период А"', () => {
    render(
      <KpiComparisonCard
        label="Тест"
        icon="💰"
        periodAValue={1000}
        periodBValue={1100}
        change={mockChangeGrowth}
        isMoney={false}
      />
    );
    
    expect(screen.getByText('Период А')).toBeInTheDocument();
  });

  it('должен отображать метку "Период Б"', () => {
    render(
      <KpiComparisonCard
        label="Тест"
        icon="💰"
        periodAValue={1000}
        periodBValue={1100}
        change={mockChangeGrowth}
        isMoney={false}
      />
    );
    
    expect(screen.getByText('Период Б')).toBeInTheDocument();
  });
});
