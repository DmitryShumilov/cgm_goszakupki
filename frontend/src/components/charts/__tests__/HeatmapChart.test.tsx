/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeatmapChart } from '../HeatmapChart';

describe('HeatmapChart', () => {
  const mockData = {
    products: ['Товар 1', 'Товар 2', 'Товар 3'],
    months: ['2024-01', '2024-02', '2024-03'],
    matrix: [
      { product: 'Товар 1', '2024-01': 100, '2024-02': 200, '2024-03': 150 },
      { product: 'Товар 2', '2024-01': 50, '2024-02': 100, '2024-03': 75 },
      { product: 'Товар 3', '2024-01': 25, '2024-02': 50, '2024-03': 30 },
    ],
  };

  it('отображает сообщение о загрузке при loading=true и отсутствии данных', () => {
    render(<HeatmapChart data={null} loading={true} />);

    expect(screen.getByText('Загрузка данных...')).toBeInTheDocument();
  });

  it('отображает сообщение при отсутствии данных', () => {
    render(<HeatmapChart data={null} loading={false} />);

    expect(screen.getByText('Нет данных для отображения')).toBeInTheDocument();
  });

  it('отображает сообщение при пустом массиве продуктов', () => {
    render(<HeatmapChart data={{ products: [], months: [], matrix: [] }} loading={false} />);

    expect(screen.getByText('Нет данных для отображения')).toBeInTheDocument();
  });

  it('отображает таблицу с данными', () => {
    render(<HeatmapChart data={mockData} loading={false} />);

    // Проверка заголовка
    expect(screen.getByText(/🔥 Доля по месяцам/i)).toBeInTheDocument();

    // Проверка заголовков месяцев
    expect(screen.getByText('Янв')).toBeInTheDocument();
    expect(screen.getByText('Фев')).toBeInTheDocument();
    expect(screen.getByText('Мар')).toBeInTheDocument();

    // Проверка товаров
    expect(screen.getByText('Товар 1')).toBeInTheDocument();
    expect(screen.getByText('Товар 2')).toBeInTheDocument();
    expect(screen.getByText('Товар 3')).toBeInTheDocument();
  });

  it('отображает итоговую колонку', () => {
    render(<HeatmapChart data={mockData} loading={false} />);

    expect(screen.getByText('Итого')).toBeInTheDocument();
  });

  it('сокращает длинные названия товаров', () => {
    const longData = {
      products: ['Очень длинное название товара которое должно быть сокращено'],
      months: ['2024-01'],
      matrix: [
        { product: 'Очень длинное название товара которое должно быть сокращено', '2024-01': 100 },
      ],
    };

    render(<HeatmapChart data={longData} loading={false} />);

    // Проверяем, что длинное название сокращено
    const shortenedText = screen.getByText(/Очень длинное название товара.*\.\.\./);
    expect(shortenedText).toBeInTheDocument();
  });

  it('не показывает загрузку при наличии данных', () => {
    render(<HeatmapChart data={mockData} loading={true} />);

    expect(screen.queryByText('Загрузка данных...')).not.toBeInTheDocument();
  });
});
