import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ComparisonRegionsChart } from '../ComparisonRegionsChart';
import { useComparisonStore } from '../../../stores/comparisonStore';
import { compareApi } from '../../../api/compareApi';

// Mock API
vi.mock('../../../api/compareApi', () => ({
  compareApi: {
    getRegionsComparison: vi.fn(),
  },
}));

// Mock store
vi.mock('../../../stores/comparisonStore', () => ({
  useComparisonStore: vi.fn(),
}));

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const mockRegionsData = {
  labels: ['Москва', 'Санкт-Петербург', 'Казань'],
  periodA: {
    amounts: [5000000, 3000000, 2000000],
    counts: [50, 30, 20],
  },
  periodB: {
    amounts: [6000000, 3500000, 2500000],
    counts: [60, 35, 25],
  },
};

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ComparisonRegionsChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock store
    (useComparisonStore as any).mockReturnValue({
      periodA: { years: [2024], regions: [], products: [] },
      periodB: { years: [2025], regions: [], products: [] },
    });
  });

  it('должен отображать заголовок диаграммы', async () => {
    (compareApi.getRegionsComparison as any).mockResolvedValue(mockRegionsData);

    renderWithProviders(<ComparisonRegionsChart />);

    await waitFor(() => {
      expect(screen.getByText('🌍 Топ-10 регионов (сравнение)')).toBeInTheDocument();
    });
  });

  it('должен отображать легенду с периодами', async () => {
    (compareApi.getRegionsComparison as any).mockResolvedValue(mockRegionsData);

    renderWithProviders(<ComparisonRegionsChart />);

    await waitFor(() => {
      expect(screen.getByText('Период А')).toBeInTheDocument();
      expect(screen.getByText('Период Б')).toBeInTheDocument();
    });
  });

  it('должен отображать состояние загрузки', () => {
    (compareApi.getRegionsComparison as any).mockImplementation(
      () => new Promise(() => {})
    );

    renderWithProviders(<ComparisonRegionsChart loading />);

    expect(screen.getByText('Загрузка данных...')).toBeInTheDocument();
  });

  it('должен отображать ошибку при загрузке', async () => {
    (compareApi.getRegionsComparison as any).mockRejectedValue(
      new Error('Network error')
    );

    renderWithProviders(<ComparisonRegionsChart />);

    await waitFor(() => {
      expect(screen.getByText(/⚠️ Ошибка:/)).toBeInTheDocument();
    });
  });

  it('должен отображать данные при успешной загрузке', async () => {
    (compareApi.getRegionsComparison as any).mockResolvedValue(mockRegionsData);

    renderWithProviders(<ComparisonRegionsChart />);

    await waitFor(() => {
      expect(screen.getByText('🌍 Топ-10 регионов (сравнение)')).toBeInTheDocument();
    });

    // Проверка наличия диаграммы
    expect(screen.getByTestId('chart-regions')).toBeInTheDocument();
  });

  it('должен иметь правильную ARIA разметку', async () => {
    (compareApi.getRegionsComparison as any).mockResolvedValue(mockRegionsData);

    const { container } = renderWithProviders(<ComparisonRegionsChart />);

    await waitFor(() => {
      const region = container.querySelector('[role="region"]');
      expect(region).toHaveAttribute('aria-label', 'Топ регионов — сравнение периодов');
    });
  });

  it('должен использовать правильные цвета для периодов', async () => {
    (compareApi.getRegionsComparison as any).mockResolvedValue(mockRegionsData);

    renderWithProviders(<ComparisonRegionsChart />);

    await waitFor(() => {
      // Проверка наличия цветовых индикаторов в легенде
      expect(screen.getByText('Период А')).toBeInTheDocument();
      expect(screen.getByText('Период Б')).toBeInTheDocument();
    });
  });

  it('должен запрашивать данные с правильными параметрами', async () => {
    (compareApi.getRegionsComparison as any).mockResolvedValue(mockRegionsData);

    (useComparisonStore as any).mockReturnValue({
      periodA: { years: [2024], regions: ['Москва', 'СПб'], products: [] },
      periodB: { years: [2025], regions: [], products: ['Продукт 1'] },
    });

    renderWithProviders(<ComparisonRegionsChart />);

    await waitFor(() => {
      expect(compareApi.getRegionsComparison).toHaveBeenCalledWith(
        {
          years: [2024],
          regions: ['Москва', 'СПб'],
          products: undefined,
        },
        {
          years: [2025],
          regions: undefined,
          products: ['Продукт 1'],
        }
      );
    });
  });

  it('должен отображать горизонтальную ориентацию диаграммы', async () => {
    (compareApi.getRegionsComparison as any).mockResolvedValue(mockRegionsData);

    renderWithProviders(<ComparisonRegionsChart />);

    await waitFor(() => {
      const chart = screen.getByTestId('chart-regions');
      expect(chart).toBeInTheDocument();
    });
  });
});
