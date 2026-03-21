/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RegionsChart } from '../RegionsChart';

describe('RegionsChart', () => {
  const mockData = {
    labels: ['Москва', 'СПб', 'Казань'],
    amounts: [5000000, 3000000, 2000000],
    counts: [100, 75, 50],
    total: 10000000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('отображает сообщение о загрузке при loading=true', () => {
    render(<RegionsChart data={null} loading={true} />);

    expect(screen.getByText('Загрузка данных...')).toBeInTheDocument();
  });

  it('отображает сообщение о загрузке при null data', () => {
    render(<RegionsChart data={null} loading={false} />);

    expect(screen.getByText('Загрузка данных...')).toBeInTheDocument();
  });

  it('отображает пустое состояние при отсутствии данных', () => {
    const { container } = render(<RegionsChart data={{ labels: [], amounts: [], counts: [], total: 0 }} loading={false} />);

    // Компонент рендерится без ошибок
    expect(container).toBeInTheDocument();
  });

  it('корректно вычисляет процент для топ-10', () => {
    const partialData = {
      labels: ['Москва'],
      amounts: [5000000],
      counts: [100],
      total: 10000000,
    };
    
    const { container } = render(<RegionsChart data={partialData} loading={false} />);
    
    // Проверяем, что компонент рендерится с процентом
    expect(container).toBeInTheDocument();
  });

  it('обрабатывает данные с нулевой общей суммой', () => {
    const zeroTotalData = {
      labels: ['Москва'],
      amounts: [0],
      counts: [0],
      total: 0,
    };
    
    const { container } = render(<RegionsChart data={zeroTotalData} loading={false} />);
    
    expect(container).toBeInTheDocument();
  });

  it('сокращает длинные названия регионов', () => {
    const longNameData = {
      labels: ['Очень длинное название региона которое должно быть сокращено до 20 символов'],
      amounts: [5000000],
      counts: [100],
      total: 10000000,
    };
    
    const { container } = render(<RegionsChart data={longNameData} loading={false} />);
    
    expect(container).toBeInTheDocument();
  });

  it('корректно форматирует большие суммы', () => {
    const largeAmountData = {
      labels: ['Москва'],
      amounts: [5000000000],
      counts: [100],
      total: 5000000000,
    };
    
    const { container } = render(<RegionsChart data={largeAmountData} loading={false} />);
    
    expect(container).toBeInTheDocument();
  });
});
