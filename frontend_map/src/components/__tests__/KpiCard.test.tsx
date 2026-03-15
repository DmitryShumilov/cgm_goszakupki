/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiCard } from '../ui/KpiCard';

describe('KpiCard', () => {
  it('отображает label и значение', () => {
    render(<KpiCard label="Тестовая метка" value={123} />);

    expect(screen.getByText('Тестовая метка')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('отображает skeleton при загрузке', () => {
    const { container } = render(<KpiCard label="Тестовая метка" value={123} loading={true} />);

    expect(screen.getByText('Тестовая метка')).toBeInTheDocument();
    expect(screen.queryByText('123')).not.toBeInTheDocument();
    expect(container.querySelector('.skeleton-value')).toBeInTheDocument();
  });

  it('отображает tooltip при наличии подсказки', () => {
    render(<KpiCard label="Тестовая метка" value={123} tooltip="Подсказка" />);

    expect(screen.getByText('Тестовая метка')).toBeInTheDocument();
    // Tooltip рендерится через Portal, проверяем наличие иконки
    const infoIcon = screen.getByTestId('InfoIcon');
    expect(infoIcon).toBeInTheDocument();
  });

  it('применяет highlight класс при highlight=true', () => {
    const { container } = render(<KpiCard label="Тестовая метка" value={123} highlight={true} />);

    const valueElement = container.querySelector('.kpi-value.highlight');
    expect(valueElement).toBeInTheDocument();
  });

  it('не применяет highlight класс при highlight=false', () => {
    const { container } = render(<KpiCard label="Тестовая метка" value={123} highlight={false} />);

    const valueElement = container.querySelector('.kpi-value.highlight');
    expect(valueElement).not.toBeInTheDocument();
  });
});
