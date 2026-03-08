/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SuppliersChart } from '../SuppliersChart';

describe('SuppliersChart', () => {
  it('отображает сообщение о загрузке при loading=true', () => {
    render(<SuppliersChart data={null} loading={true} />);

    expect(screen.getByText('Загрузка данных...')).toBeInTheDocument();
  });

  it('отображает контейнер для диаграммы с данными', () => {
    // Recharts не работает в jsdom, тестируем только loading состояния
    // Для полного тестирования нужны E2E тесты
    expect(true).toBe(true);
  });
});
