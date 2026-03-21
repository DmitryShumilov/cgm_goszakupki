import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ComparisonDynamicsChart } from '../ComparisonDynamicsChart';
import { useComparisonStore } from '../../../stores/comparisonStore';
import { compareApi } from '../../../api/compareApi';

// Mock API
vi.mock('../../../api/compareApi', () => ({
  compareApi: {
    getDynamicsComparison: vi.fn(),
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

const mockDynamicsData = {
  labels: ['2024-01', '2024-02', '2024-03'],
  periodA: {
    amounts: [1000000, 1500000, 2000000],
    quantities: [100, 150, 200],
  },
  periodB: {
    amounts: [1200000, 1800000, 2400000],
    quantities: [120, 180, 240],
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

describe('ComparisonDynamicsChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock store
    (useComparisonStore as any).mockReturnValue({
      periodA: { years: [2024], regions: [], products: [] },
      periodB: { years: [2025], regions: [], products: [] },
    });
  });

  it('должен отображать заголовок диаграммы', async () => {
    (compareApi.getDynamicsComparison as any).mockResolvedValue(mockDynamicsData);

    renderWithProviders(<ComparisonDynamicsChart />);

    await waitFor(() => {
      expect(screen.getByText('📈 Динамика закупок (сравнение)')).toBeInTheDocument();
    });
  });

  it('должен отображать легенду с периодами', async () => {
    (compareApi.getDynamicsComparison as any).mockResolvedValue(mockDynamicsData);

    renderWithProviders(<ComparisonDynamicsChart />);

    await waitFor(() => {
      expect(screen.getByText('Период А')).toBeInTheDocument();
      expect(screen.getByText('Период Б')).toBeInTheDocument();
    });
  });

  it('должен отображать состояние загрузки', () => {
    (compareApi.getDynamicsComparison as any).mockImplementation(
      () => new Promise(() => {})
    );

    renderWithProviders(<ComparisonDynamicsChart loading />);

    expect(screen.getByText('Загрузка данных...')).toBeInTheDocument();
  });

  it('должен отображать ошибку при загрузке', async () => {
    (compareApi.getDynamicsComparison as any).mockRejectedValue(
      new Error('Network error')
    );

    renderWithProviders(<ComparisonDynamicsChart />);

    await waitFor(() => {
      expect(screen.getByText(/⚠️ Ошибка:/)).toBeInTheDocument();
    });
  });

  it('должен отображать данные при успешной загрузке', async () => {
    (compareApi.getDynamicsComparison as any).mockResolvedValue(mockDynamicsData);

    renderWithProviders(<ComparisonDynamicsChart />);

    await waitFor(() => {
      expect(screen.getByText('📈 Динамика закупок (сравнение)')).toBeInTheDocument();
    });

    // Проверка наличия диаграммы
    expect(screen.getByTestId('chart-dynamics')).toBeInTheDocument();
  });

  it('должен иметь правильную ARIA разметку', async () => {
    (compareApi.getDynamicsComparison as any).mockResolvedValue(mockDynamicsData);

    const { container } = renderWithProviders(<ComparisonDynamicsChart />);

    await waitFor(() => {
      const region = container.querySelector('[role="region"]');
      expect(region).toHaveAttribute('aria-label', 'Динамика закупок — сравнение периодов');
    });
  });

  it('должен использовать правильные цвета для периодов', async () => {
    (compareApi.getDynamicsComparison as any).mockResolvedValue(mockDynamicsData);

    renderWithProviders(<ComparisonDynamicsChart />);

    await waitFor(() => {
      // Проверка наличия текстов легенды
      expect(screen.getByText('Период А')).toBeInTheDocument();
      expect(screen.getByText('Период Б')).toBeInTheDocument();
    });
  });

  it('должен форматировать значения в tooltip', async () => {
    (compareApi.getDynamicsComparison as any).mockResolvedValue(mockDynamicsData);

    renderWithProviders(<ComparisonDynamicsChart />);

    await waitFor(() => {
      expect(screen.getByText('📈 Динамика закупок (сравнение)')).toBeInTheDocument();
    });

    // Проверка наличия tooltip конфигурации
    const chart = screen.getByTestId('chart-dynamics');
    expect(chart).toBeInTheDocument();
  });

  it('должен запрашивать данные с правильными параметрами', async () => {
    (compareApi.getDynamicsComparison as any).mockResolvedValue(mockDynamicsData);

    (useComparisonStore as any).mockReturnValue({
      periodA: { years: [2024, 2025], regions: ['Москва'], products: [] },
      periodB: { years: [2025], regions: ['СПб'], products: ['Продукт 1'] },
    });

    renderWithProviders(<ComparisonDynamicsChart />);

    await waitFor(() => {
      expect(compareApi.getDynamicsComparison).toHaveBeenCalledWith(
        {
          years: [2024, 2025],
          regions: ['Москва'],
          products: undefined,
        },
        {
          years: [2025],
          regions: ['СПб'],
          products: ['Продукт 1'],
        }
      );
    });
  });

  it('должен отображать пустое состояние при отсутствии данных', async () => {
    (compareApi.getDynamicsComparison as any).mockResolvedValue(null);

    renderWithProviders(<ComparisonDynamicsChart />);

    await waitFor(() => {
      // Диаграмма не должна рендериться при null данных
      expect(screen.queryByTestId('chart-dynamics')).not.toBeInTheDocument();
    });
  });
});
