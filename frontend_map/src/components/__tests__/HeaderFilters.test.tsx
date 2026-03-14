/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HeaderFilters } from '../HeaderFilters';
import { useFilterStore } from '../../stores/filterStore';
import { mapApi } from '../../api/mapApi';

// Мокаем mapApi
vi.mock('../../api/mapApi', () => ({
  mapApi: {
    getYears: vi.fn(),
    getRegionsList: vi.fn(),
    getSuppliers: vi.fn(),
    getProducts: vi.fn(),
  },
}));

describe('HeaderFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Сбрасываем store перед каждым тестом
    useFilterStore.setState({
      selectedYears: [],
      selectedRegions: [],
      selectedSuppliers: [],
      selectedProducts: [],
      availableYears: [],
      availableRegions: [],
      availableSuppliers: [],
      availableProducts: [],
    });
  });

  it('отображает кнопку сброса фильтров', () => {
    render(<HeaderFilters onFiltersChange={vi.fn()} regionCount={85} />);

    expect(screen.getByRole('button', { name: /сбросить/i })).toBeInTheDocument();
  });

  it('отображает счётчик регионов', () => {
    render(<HeaderFilters onFiltersChange={vi.fn()} regionCount={85} />);

    expect(screen.getByText(/85/i)).toBeInTheDocument();
  });

  it('загружает опции фильтров при монтировании', async () => {
    // Настраиваем моки
    vi.mocked(mapApi.getYears).mockResolvedValue([2024, 2025]);
    vi.mocked(mapApi.getRegionsList).mockResolvedValue(['Москва', 'СПб']);
    vi.mocked(mapApi.getSuppliers).mockResolvedValue(['Поставщик 1']);
    vi.mocked(mapApi.getProducts).mockResolvedValue(['Продукт 1']);

    render(<HeaderFilters onFiltersChange={vi.fn()} regionCount={85} />);

    await waitFor(() => {
      expect(mapApi.getYears).toHaveBeenCalled();
      expect(mapApi.getRegionsList).toHaveBeenCalled();
      expect(mapApi.getSuppliers).toHaveBeenCalled();
      expect(mapApi.getProducts).toHaveBeenCalled();
    });
  });

  it('сбрасывает фильтры по кнопке "Сбросить"', () => {
    const onFiltersChangeMock = vi.fn();

    render(<HeaderFilters onFiltersChange={onFiltersChangeMock} regionCount={85} />);

    // Устанавливаем фильтры
    useFilterStore.getState().toggleYear(2024);
    useFilterStore.getState().toggleRegion('Москва');

    // Кликаем сброс
    const resetButton = screen.getByRole('button', { name: /сбросить/i });
    resetButton.click();

    // Проверяем, что фильтры сброшены
    const state = useFilterStore.getState();
    expect(state.selectedYears).toEqual([]);
    expect(state.selectedRegions).toEqual([]);
  });

  it('отображает контейнер для фильтров', () => {
    // Recharts/MUI Autocomplete не работает в jsdom, тестируем только базовую структуру
    render(<HeaderFilters onFiltersChange={vi.fn()} regionCount={85} />);

    // Проверяем наличие базовых элементов
    expect(screen.getByRole('button', { name: /сбросить/i })).toBeInTheDocument();
  });
});
