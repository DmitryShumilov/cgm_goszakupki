/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InfoSection } from '../ui/InfoSection';

describe('InfoSection', () => {
  it('отображает заголовок и содержимое', () => {
    render(
      <InfoSection title="Тестовый раздел">
        <div>Тестовое содержимое</div>
      </InfoSection>
    );

    expect(screen.getByText('Тестовый раздел')).toBeInTheDocument();
    expect(screen.getByText('Тестовое содержимое')).toBeInTheDocument();
  });

  it('отображает несколько дочерних элементов', () => {
    render(
      <InfoSection title="Раздел">
        <div>Элемент 1</div>
        <div>Элемент 2</div>
        <div>Элемент 3</div>
      </InfoSection>
    );

    expect(screen.getByText('Раздел')).toBeInTheDocument();
    expect(screen.getByText('Элемент 1')).toBeInTheDocument();
    expect(screen.getByText('Элемент 2')).toBeInTheDocument();
    expect(screen.getByText('Элемент 3')).toBeInTheDocument();
  });

  it('отображает пустое содержимое', () => {
    const { container } = render(<InfoSection title="Пустой раздел"><></></InfoSection>);

    expect(screen.getByText('Пустой раздел')).toBeInTheDocument();
    const content = container.querySelector('.info-section-content');
    expect(content).toBeInTheDocument();
    expect(content?.children.length).toBe(0);
  });
});
