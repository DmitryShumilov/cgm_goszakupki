/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiPanel } from '../KpiPanel';

describe('KpiPanel', () => {
  const mockKpiData = {
    total_amount: 15000000000,
    contract_count: 1250,
    avg_contract_amount: 12000000,
    total_quantity: 50000,
    avg_price_per_unit: 300000,
    customer_count: 45,
  };

  it('отображает 6 KPI карточек с данными', () => {
    render(<KpiPanel data={mockKpiData} loading={false} />);

    expect(screen.getByText('Общая сумма закупок')).toBeInTheDocument();
    expect(screen.getByText('Количество контрактов')).toBeInTheDocument();
    expect(screen.getByText('Средняя сумма контракта')).toBeInTheDocument();
    expect(screen.getByText('Общий объём (шт)')).toBeInTheDocument();
    expect(screen.getByText('Средняя цена за единицу')).toBeInTheDocument();
    expect(screen.getByText('Заказчиков')).toBeInTheDocument();
  });

  it('отображает правильные значения KPI', () => {
    render(<KpiPanel data={mockKpiData} loading={false} />);

    expect(screen.getByText('15.00 млрд ₽')).toBeInTheDocument();
    // Число 1250 отображается как "1 250" с неразрывным пробелом
    expect(screen.getByText((content) => content.includes('250') && content.includes('1'))).toBeInTheDocument();
    expect(screen.getByText('12.00 млн ₽')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('отображает скелетон при loading=true', () => {
    render(<KpiPanel data={null} loading={true} />);

    // Ищем элементы с классом MuiSkeleton
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('отображает тире при null data', () => {
    render(<KpiPanel data={null} loading={false} />);

    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBe(6);
  });

  it('форматирует сумму в млрд для больших чисел', () => {
    const largeData = {
      ...mockKpiData,
      total_amount: 25000000000,
    };

    render(<KpiPanel data={largeData} loading={false} />);

    expect(screen.getByText('25.00 млрд ₽')).toBeInTheDocument();
  });

  it('форматирует сумму в млн для средних чисел', () => {
    const mediumData = {
      ...mockKpiData,
      total_amount: 50000000,
      avg_contract_amount: 25000000,
    };

    render(<KpiPanel data={mediumData} loading={false} />);

    expect(screen.getByText('50.00 млн ₽')).toBeInTheDocument();
  });

  it('отображает количество контрактов с разделителями', () => {
    render(<KpiPanel data={mockKpiData} loading={false} />);

    // Число отображается с неразрывным пробелом: "1 250"
    expect(screen.getByText((content) => content.includes('250'))).toBeInTheDocument();
  });

  it('отображает общий объём в тыс для больших чисел', () => {
    render(<KpiPanel data={mockKpiData} loading={false} />);

    expect(screen.getByText('50.0 тыс')).toBeInTheDocument();
  });
});
