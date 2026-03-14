/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMapStore } from '../mapStore';
import { mapApi } from '../../api/mapApi';

// Мокаем mapApi
vi.mock('../../api/mapApi', () => ({
  mapApi: {
    getRegions: vi.fn(),
  },
}));

describe('mapStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Сбрасываем состояние перед каждым тестом
    useMapStore.setState({
      selectedRegion: null,
      regionData: [],
      isLoading: false,
      error: null,
    });
  });

  it('инициализируется с null выбранным регионом', () => {
    const state = useMapStore.getState();
    expect(state.selectedRegion).toBeNull();
  });

  it('устанавливает выбранный регион', () => {
    useMapStore.getState().setSelectedRegion('Москва');

    const state = useMapStore.getState();
    expect(state.selectedRegion).toBe('Москва');
  });

  it('очищает выбранный регион при clearSelection', () => {
    useMapStore.getState().setSelectedRegion('Москва');
    useMapStore.getState().clearSelection();

    const state = useMapStore.getState();
    expect(state.selectedRegion).toBeNull();
  });

  it('загружает данные региона при loadRegionData', async () => {
    const mockData = [
      { region: 'Москва', sum: 1000000, count: 10, quantity: 100, avg_price: 100000 },
      { region: 'СПб', sum: 500000, count: 5, quantity: 50, avg_price: 100000 },
    ];

    vi.mocked(mapApi.getRegions).mockResolvedValue(mockData);

    await useMapStore.getState().loadRegionData();

    const state = useMapStore.getState();
    expect(mapApi.getRegions).toHaveBeenCalled();
    expect(state.regionData).toEqual(mockData);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('устанавливает isLoading=true во время загрузки', async () => {
    vi.mocked(mapApi.getRegions).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
    );

    const loadPromise = useMapStore.getState().loadRegionData();
    expect(useMapStore.getState().isLoading).toBe(true);

    await loadPromise;
    expect(useMapStore.getState().isLoading).toBe(false);
  });

  it('устанавливает ошибку при неудачной загрузке', async () => {
    vi.mocked(mapApi.getRegions).mockRejectedValue(new Error('Network error'));

    await useMapStore.getState().loadRegionData();

    const state = useMapStore.getState();
    expect(state.error).toBe('Не удалось загрузить данные карты');
    expect(state.isLoading).toBe(false);
  });

  it('передаёт параметры фильтрации в API', async () => {
    const mockData = [{ region: 'Москва', sum: 1000000, count: 10, quantity: 100, avg_price: 100000 }];
    vi.mocked(mapApi.getRegions).mockResolvedValue(mockData);

    await useMapStore.getState().loadRegionData({
      years: [2024, 2025],
      regions: ['Москва'],
    });

    expect(mapApi.getRegions).toHaveBeenCalledWith({
      years: [2024, 2025],
      regions: ['Москва'],
      suppliers: [],
      products: [],
    });
  });

  it('refreshData вызывает loadRegionData', async () => {
    const mockData = [{ region: 'Москва', sum: 1000000, count: 10, quantity: 100, avg_price: 100000 }];
    vi.mocked(mapApi.getRegions).mockResolvedValue(mockData);

    await useMapStore.getState().refreshData();

    expect(mapApi.getRegions).toHaveBeenCalled();
  });
});
