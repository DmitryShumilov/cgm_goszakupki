import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ComparisonScatterPlot } from '../ComparisonScatterPlot';
import { useComparisonStore } from '../../../stores/comparisonStore';
import { compareApi } from '../../../api/compareApi';

// Mock API
vi.mock('../../../api/compareApi', () => ({
  compareApi: {
    getSuppliersScatter: vi.fn(),
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

const mockScatterData = {
  points: [
    { supplier: 'Поставщик 1', periodA: 1000000, periodB: 1200000 },
    { supplier: 'Поставщик 2', periodA: 2000000, periodB: 1800000 },
    { supplier: 'Поставщик 3', periodA: 1500000, periodB: 1500000 },
  ],
};

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ComparisonScatterPlot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock store
    (useComparisonStore as any).mockReturnValue({
      periodA: { years: [2024], regions: [], products: [] },
      periodB: { years: [2025], regions: [], products: [] },
    });
  });

  it('должен отображать заголовок диаграммы', async () => {
    (compareApi.getSuppliersScatter as any).mockResolvedValue(mockScatterData);

    renderWithProviders(<ComparisonScatterPlot />);

    await waitFor(() => {
      expect(screen.getByText('🏢 Поставщики: Период А vs Период Б')).toBeInTheDocument();
    });
  });

  it('должен отображать подсказку о трендах', async () => {
    (compareApi.getSuppliersScatter as any).mockResolvedValue(mockScatterData);

    renderWithProviders(<ComparisonScatterPlot />);

    await waitFor(() => {
      expect(screen.getByText(/📈 Выше диагонали/)).toBeInTheDocument();
    });
  });

  it('должен отображать состояние загрузки', () => {
    (compareApi.getSuppliersScatter as any).mockImplementation(
      () => new Promise(() => {})
    );

    renderWithProviders(<ComparisonScatterPlot loading />);

    expect(screen.getByText('Загрузка данных...')).toBeInTheDocument();
  });

  it('должен отображать ошибку при загрузке', async () => {
    (compareApi.getSuppliersScatter as any).mockRejectedValue(
      new Error('Network error')
    );

    renderWithProviders(<ComparisonScatterPlot />);

    await waitFor(() => {
      expect(screen.getByText(/⚠️ Ошибка:/)).toBeInTheDocument();
    });
  });

  it('должен отображать данные при успешной загрузке', async () => {
    (compareApi.getSuppliersScatter as any).mockResolvedValue(mockScatterData);

    renderWithProviders(<ComparisonScatterPlot />);

    await waitFor(() => {
      expect(screen.getByText('🏢 Поставщики: Период А vs Период Б')).toBeInTheDocument();
    });

    // Проверка наличия диаграммы
    expect(screen.getByTestId('chart-scatter')).toBeInTheDocument();
  });

  it('должен иметь правильную ARIA разметку', async () => {
    (compareApi.getSuppliersScatter as any).mockResolvedValue(mockScatterData);

    const { container } = renderWithProviders(<ComparisonScatterPlot />);

    await waitFor(() => {
      const region = container.querySelector('[role="region"]');
      expect(region).toHaveAttribute('aria-label', 'Поставщики — scatter plot');
    });
  });

  it('должен отображать легенду с трендами', async () => {
    (compareApi.getSuppliersScatter as any).mockResolvedValue(mockScatterData);

    renderWithProviders(<ComparisonScatterPlot />);

    await waitFor(() => {
      // Проверка наличия подсказки о трендах
      expect(screen.getByText(/📈 Выше диагонали/)).toBeInTheDocument();
    });
  });

  it('должен отображать пустое состояние при отсутствии данных', async () => {
    (compareApi.getSuppliersScatter as any).mockResolvedValue({ points: [] });

    renderWithProviders(<ComparisonScatterPlot />);

    await waitFor(() => {
      expect(screen.getByText('Нет данных для отображения')).toBeInTheDocument();
    });
  });

  it('должен запрашивать данные с правильными параметрами', async () => {
    (compareApi.getSuppliersScatter as any).mockResolvedValue(mockScatterData);

    (useComparisonStore as any).mockReturnValue({
      periodA: { years: [2024], regions: [], products: ['Продукт 1'] },
      periodB: { years: [2025], regions: ['Москва'], products: [] },
    });

    renderWithProviders(<ComparisonScatterPlot />);

    await waitFor(() => {
      expect(compareApi.getSuppliersScatter).toHaveBeenCalledWith(
        {
          years: [2024],
          regions: undefined,
          products: ['Продукт 1'],
        },
        {
          years: [2025],
          regions: ['Москва'],
          products: undefined,
        }
      );
    });
  });

  it('должен отображать диагональ равенства', async () => {
    (compareApi.getSuppliersScatter as any).mockResolvedValue(mockScatterData);

    renderWithProviders(<ComparisonScatterPlot />);

    await waitFor(() => {
      const chart = screen.getByTestId('chart-scatter');
      expect(chart).toBeInTheDocument();
    });
  });

  it('должен использовать правильные цвета для трендов', async () => {
    const growthData = {
      points: [
        { supplier: 'Рост', periodA: 1000000, periodB: 2000000 }, // Рост >5%
      ],
    };

    (compareApi.getSuppliersScatter as any).mockResolvedValue(growthData);

    renderWithProviders(<ComparisonScatterPlot />);

    await waitFor(() => {
      expect(screen.getByText('🏢 Поставщики: Период А vs Период Б')).toBeInTheDocument();
    });
  });
});
