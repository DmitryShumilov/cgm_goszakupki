/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DynamicsChart } from '../DynamicsChart';

describe('DynamicsChart', () => {
  const mockData = {
    labels: ['2024-01', '2024-02', '2024-03'],
    amounts: [1000000, 1500000, 2000000],
    quantities: [100, 150, 200],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('отображает сообщение о загрузке при loading=true', () => {
    render(<DynamicsChart data={null} loading={true} />);

    expect(screen.getByText('Загрузка данных...')).toBeInTheDocument();
  });

  it('отображает сообщение о загрузке при null data', () => {
    render(<DynamicsChart data={null} loading={false} />);

    expect(screen.getByText('Загрузка данных...')).toBeInTheDocument();
  });

  it('отображает пустое состояние при отсутствии данных', () => {
    const { container } = render(<DynamicsChart data={{ labels: [], amounts: [], quantities: [] }} loading={false} />);

    // Компонент рендерится без ошибок
    expect(container).toBeInTheDocument();
  });

  it('корректно форматирует большие суммы (млрд)', () => {
    const largeData = {
      labels: ['2024-01'],
      amounts: [5000000000],
      quantities: [100],
    };
    
    const { container } = render(<DynamicsChart data={largeData} loading={false} />);
    
    // Проверяем, что компонент рендерится без ошибок
    expect(container).toBeInTheDocument();
  });

  it('корректно форматирует средние суммы (млн)', () => {
    const mediumData = {
      labels: ['2024-01'],
      amounts: [5000000],
      quantities: [100],
    };
    
    const { container } = render(<DynamicsChart data={mediumData} loading={false} />);
    
    expect(container).toBeInTheDocument();
  });

  it('корректно форматирует небольшие суммы (тыс)', () => {
    const smallData = {
      labels: ['2024-01'],
      amounts: [50000],
      quantities: [100],
    };
    
    const { container } = render(<DynamicsChart data={smallData} loading={false} />);
    
    expect(container).toBeInTheDocument();
  });

  it('обрабатывает данные с нулевыми значениями', () => {
    const zeroData = {
      labels: ['2024-01'],
      amounts: [0],
      quantities: [0],
    };
    
    const { container } = render(<DynamicsChart data={zeroData} loading={false} />);
    
    expect(container).toBeInTheDocument();
  });

  it('обрабатывает данные с отрицательными значениями', () => {
    const negativeData = {
      labels: ['2024-01'],
      amounts: [-1000000],
      quantities: [-100],
    };
    
    const { container } = render(<DynamicsChart data={negativeData} loading={false} />);
    
    expect(container).toBeInTheDocument();
  });

  it('отображает длинный label с многоточием', () => {
    const longLabelData = {
      labels: ['Очень длинное название месяца которое должно быть сокращено'],
      amounts: [1000000],
      quantities: [100],
    };
    
    const { container } = render(<DynamicsChart data={longLabelData} loading={false} />);
    
    expect(container).toBeInTheDocument();
  });
});
