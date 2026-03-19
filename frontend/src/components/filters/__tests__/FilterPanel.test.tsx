/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPanel } from '../FilterPanel';
import { useFilterStore } from '../../../stores/filterStore';

describe('FilterPanel', () => {
  const mockOnRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Настройка store с тестовыми данными
    useFilterStore.setState({
      availableYears: [2024, 2025, 2026],
      availableMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      availableRegions: ['Москва', 'Санкт-Петербург', 'Казань'],
      availableSuppliers: ['Поставщик 1', 'Поставщик 2'],
      availableProducts: ['Товар 1', 'Товар 2'],
      selectedYears: [2024],
      selectedMonths: [],
      selectedRegions: [],
      selectedSuppliers: [],
      selectedProducts: [],
    });
  });

  it('отображает кнопку "Обновить данные"', () => {
    render(<FilterPanel onRefresh={mockOnRefresh} />);

    expect(screen.getByText('Обновить данные')).toBeInTheDocument();
  });

  it('вызывает onRefresh при клике на кнопку обновления', () => {
    render(<FilterPanel onRefresh={mockOnRefresh} />);

    const refreshButton = screen.getByText('Обновить данные');
    fireEvent.click(refreshButton);

    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  it('отображает фильтр по годам', () => {
    render(<FilterPanel onRefresh={mockOnRefresh} />);

    expect(screen.getByText('Год')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
  });

  it('отображает фильтр по месяцам', () => {
    render(<FilterPanel onRefresh={mockOnRefresh} />);

    expect(screen.getByText('Месяц')).toBeInTheDocument();
    expect(screen.getByText('Янв')).toBeInTheDocument();
    expect(screen.getByText('Дек')).toBeInTheDocument();
  });

  it('переключает год при клике', () => {
    render(<FilterPanel onRefresh={mockOnRefresh} />);

    const year2025 = screen.getByText('2025');
    fireEvent.click(year2025);

    expect(useFilterStore.getState().selectedYears).toContain(2025);
  });

  it('переключает месяц при клике', () => {
    render(<FilterPanel onRefresh={mockOnRefresh} />);

    const monthJan = screen.getByText('Янв');
    fireEvent.click(monthJan);

    expect(useFilterStore.getState().selectedMonths).toContain(1);
  });

  it('отображает кнопку "Сбросить фильтры"', () => {
    render(<FilterPanel onRefresh={mockOnRefresh} />);

    expect(screen.getByText('Сбросить фильтры')).toBeInTheDocument();
  });

  it('вызывает resetFilters при клике на сброс', () => {
    render(<FilterPanel onRefresh={mockOnRefresh} />);

    // Сначала изменим фильтры
    useFilterStore.getState().toggleRegion('Москва');
    useFilterStore.getState().toggleYear(2025);

    const resetButton = screen.getByText('Сбросить фильтры');
    fireEvent.click(resetButton);

    expect(useFilterStore.getState().selectedRegions).toEqual([]);
    expect(useFilterStore.getState().selectedYears).toEqual([2024]);
  });

  it('отображает выбранный год как активный', () => {
    render(<FilterPanel onRefresh={mockOnRefresh} />);

    const year2024 = screen.getByText('2024');
    // Проверяем, что кнопка имеет variant="contained"
    expect(year2024.closest('button')).toHaveClass('MuiButton-contained');
  });

  it('отображает иконку "Выбрать все" для года', () => {
    render(<FilterPanel onRefresh={mockOnRefresh} />);

    // Иконка имеет data-testid="DoneAllIcon" - используем getAll, так как их несколько
    const selectAllButtons = screen.getAllByTestId('DoneAllIcon');
    expect(selectAllButtons.length).toBeGreaterThan(0);
  });

  it('отображает мобильное меню на маленьких экранах', () => {
    // Устанавливаем мобильный viewport
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 600 });
    
    render(<FilterPanel onRefresh={mockOnRefresh} />);

    // Проверяем наличие кнопки открытия мобильного меню
    expect(screen.getByRole('button', { name: /фильтр/i })).toBeInTheDocument();
  });

  it('корректно обрабатывает пустые списки фильтров', () => {
    // Устанавливаем пустые списки
    useFilterStore.setState({
      availableYears: [],
      availableMonths: [],
      availableRegions: [],
      availableSuppliers: [],
      availableProducts: [],
    });

    const { container } = render(<FilterPanel onRefresh={mockOnRefresh} />);

    // Проверяем, что компонент не падает
    expect(container).toBeInTheDocument();
  });

  it('отображает годы как выбранные при наличии в selectedYears', () => {
    useFilterStore.setState({
      selectedYears: [2025],
      availableYears: [2024, 2025, 2026],
    });

    render(<FilterPanel onRefresh={mockOnRefresh} />);

    // Проверяем, что 2025 отображается как выбранный
    const year2025 = screen.getByText('2025');
    expect(year2025.closest('button')).toHaveClass('MuiButton-contained');
  });

  it('отображает годы как невыбранные при отсутствии в selectedYears', () => {
    useFilterStore.setState({
      selectedYears: [],
      availableYears: [2024, 2025, 2026],
    });

    render(<FilterPanel onRefresh={mockOnRefresh} />);

    // Проверяем, что 2024 отображается как невыбранный
    const year2024 = screen.getByText('2024');
    expect(year2024.closest('button')).toHaveClass('MuiButton-outlined');
  });

  it('отображает месяцы как выбранные при наличии в selectedMonths', () => {
    useFilterStore.setState({
      selectedMonths: [1],
      availableMonths: [1, 2, 3],
    });

    render(<FilterPanel onRefresh={mockOnRefresh} />);

    // Проверяем, что Янв отображается как выбранный
    const monthJan = screen.getByText('Янв');
    expect(monthJan.closest('button')).toHaveClass('MuiButton-contained');
  });

  it('отображает месяцы как невыбранные при отсутствии в selectedMonths', () => {
    useFilterStore.setState({
      selectedMonths: [],
      availableMonths: [1, 2, 3],
    });

    render(<FilterPanel onRefresh={mockOnRefresh} />);

    // Проверяем, что Фев отображается как невыбранный
    const monthFeb = screen.getByText('Фев');
    expect(monthFeb.closest('button')).toHaveClass('MuiButton-outlined');
  });
});
