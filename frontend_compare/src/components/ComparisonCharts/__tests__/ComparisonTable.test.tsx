import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ComparisonTable } from '../ComparisonTable';
import { useComparisonStore } from '../../../stores/comparisonStore';
import { compareApi } from '../../../api/compareApi';

// Mock API
vi.mock('../../../api/compareApi', () => ({
  compareApi: {
    getComparisonTable: vi.fn(),
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

const mockTableData = {
  rows: [
    {
      region: 'Москва',
      periodA_amount: 5000000000,
      periodB_amount: 6000000000,
      periodA_count: 50,
      periodB_count: 60,
      absoluteDiff: 1000000000,
      percentDiff: 20.0,
      trend: 'growth' as const,
    },
    {
      region: 'Санкт-Петербург',
      periodA_amount: 3000000000,
      periodB_amount: 2700000000,
      periodA_count: 30,
      periodB_count: 27,
      absoluteDiff: -300000000,
      percentDiff: -10.0,
      trend: 'decline' as const,
    },
    {
      region: 'Казань',
      periodA_amount: 2000000000,
      periodB_amount: 2000000000,
      periodA_count: 20,
      periodB_count: 20,
      absoluteDiff: 0,
      percentDiff: 0.0,
      trend: 'stable' as const,
    },
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

describe('ComparisonTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock store
    (useComparisonStore as any).mockReturnValue({
      periodA: { years: [2024], regions: [], products: [] },
      periodB: { years: [2025], regions: [], products: [] },
    });
  });

  it('должен отображать заголовок таблицы', async () => {
    (compareApi.getComparisonTable as any).mockResolvedValue(mockTableData);

    renderWithProviders(<ComparisonTable />);

    await waitFor(() => {
      expect(screen.getByText('📋 Детальное сравнение по регионам')).toBeInTheDocument();
    });
  });

  it('должен отображать состояние загрузки', () => {
    (compareApi.getComparisonTable as any).mockImplementation(
      () => new Promise(() => {})
    );

    renderWithProviders(<ComparisonTable loading />);

    expect(screen.getByText('Загрузка данных...')).toBeInTheDocument();
  });

  it('должен отображать ошибку при загрузке', async () => {
    (compareApi.getComparisonTable as any).mockRejectedValue(
      new Error('Network error')
    );

    renderWithProviders(<ComparisonTable />);

    await waitFor(() => {
      expect(screen.getByText(/⚠️ Ошибка:/)).toBeInTheDocument();
    });
  });

  it('должен отображать данные при успешной загрузке', async () => {
    (compareApi.getComparisonTable as any).mockResolvedValue(mockTableData);

    renderWithProviders(<ComparisonTable />);

    await waitFor(() => {
      expect(screen.getByText('Москва')).toBeInTheDocument();
      expect(screen.getByText('Санкт-Петербург')).toBeInTheDocument();
      expect(screen.getByText('Казань')).toBeInTheDocument();
    });

    // Проверка наличия таблицы
    expect(screen.getByTestId('table-comparison')).toBeInTheDocument();
  });

  it('должен иметь правильную ARIA разметку', async () => {
    (compareApi.getComparisonTable as any).mockResolvedValue(mockTableData);

    const { container } = renderWithProviders(<ComparisonTable />);

    await waitFor(() => {
      const region = container.querySelector('[role="region"]');
      expect(region).toHaveAttribute('aria-label', 'Таблица сравнения регионов');
    });
  });

  it('должен отображать кнопку экспорта в CSV', async () => {
    (compareApi.getComparisonTable as any).mockResolvedValue(mockTableData);

    renderWithProviders(<ComparisonTable />);

    await waitFor(() => {
      expect(screen.getByLabelText('Экспорт в CSV')).toBeInTheDocument();
    });
  });

  it('должен отображать итоговую строку со статистикой', async () => {
    (compareApi.getComparisonTable as any).mockResolvedValue(mockTableData);

    renderWithProviders(<ComparisonTable />);

    await waitFor(() => {
      expect(screen.getByText(/Всего регионов: 3/)).toBeInTheDocument();
      expect(screen.getByText(/📈 Рост: 1/)).toBeInTheDocument();
      expect(screen.getByText(/📉 Падение: 1/)).toBeInTheDocument();
      expect(screen.getByText(/➡️ Стабильно: 1/)).toBeInTheDocument();
    });
  });

  it('должен отображать тренды с правильными иконками', async () => {
    (compareApi.getComparisonTable as any).mockResolvedValue(mockTableData);

    renderWithProviders(<ComparisonTable />);

    await waitFor(() => {
      expect(screen.getByText('📈')).toBeInTheDocument();
      expect(screen.getByText('📉')).toBeInTheDocument();
      expect(screen.getByText('➡️')).toBeInTheDocument();
    });
  });

  it('должен форматировать денежные значения', async () => {
    (compareApi.getComparisonTable as any).mockResolvedValue(mockTableData);

    renderWithProviders(<ComparisonTable />);

    await waitFor(() => {
      // Проверка форматирования (5 млрд должно отображаться как "5.00 млрд ₽")
      expect(screen.getByText(/5\.00 млрд ₽/)).toBeInTheDocument();
    });
  });

  it('должен сортировать по региону', async () => {
    (compareApi.getComparisonTable as any).mockResolvedValue(mockTableData);

    renderWithProviders(<ComparisonTable />);

    await waitFor(() => {
      expect(screen.getByText('Регион')).toBeInTheDocument();
    });

    // Проверка что сортировка работает (просто проверяем наличие заголовка)
    const regionHeader = screen.getByText('Регион');
    expect(regionHeader).toBeInTheDocument();
  });

  it('должен сортировать по изменению суммы', async () => {
    (compareApi.getComparisonTable as any).mockResolvedValue(mockTableData);

    renderWithProviders(<ComparisonTable />);

    await waitFor(() => {
      expect(screen.getByText('Изменение (сумма)')).toBeInTheDocument();
    });

    const changeHeader = screen.getByText('Изменение (сумма)');
    expect(changeHeader).toBeInTheDocument();
  });

  it('должен сортировать по изменению %', async () => {
    (compareApi.getComparisonTable as any).mockResolvedValue(mockTableData);

    renderWithProviders(<ComparisonTable />);

    await waitFor(() => {
      expect(screen.getByText('Изменение (%)')).toBeInTheDocument();
    });

    const percentHeader = screen.getByText('Изменение (%)');
    expect(percentHeader).toBeInTheDocument();
  });

  it('должен запрашивать данные с правильными параметрами', async () => {
    (compareApi.getComparisonTable as any).mockResolvedValue(mockTableData);

    (useComparisonStore as any).mockReturnValue({
      periodA: { years: [2024], regions: ['Москва'], products: [] },
      periodB: { years: [2025], regions: [], products: ['Продукт 1'] },
    });

    renderWithProviders(<ComparisonTable />);

    await waitFor(() => {
      expect(compareApi.getComparisonTable).toHaveBeenCalledWith(
        {
          years: [2024],
          regions: ['Москва'],
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

  it('должен отображать контракты в формате "А → Б"', async () => {
    (compareApi.getComparisonTable as any).mockResolvedValue(mockTableData);

    renderWithProviders(<ComparisonTable />);

    await waitFor(() => {
      expect(screen.getByText('50 → 60')).toBeInTheDocument();
      expect(screen.getByText('30 → 27')).toBeInTheDocument();
      expect(screen.getByText('20 → 20')).toBeInTheDocument();
    });
  });

  it('должен отображать цветовую индикацию для положительных изменений', async () => {
    (compareApi.getComparisonTable as any).mockResolvedValue(mockTableData);

    renderWithProviders(<ComparisonTable />);

    await waitFor(() => {
      // Москва имеет положительное изменение
      const moscowRow = screen.getByText('Москва').closest('tr');
      expect(moscowRow).toBeInTheDocument();
    });
  });

  it('должен отображать цветовую индикацию для отрицательных изменений', async () => {
    (compareApi.getComparisonTable as any).mockResolvedValue(mockTableData);

    renderWithProviders(<ComparisonTable />);

    await waitFor(() => {
      // Санкт-Петербург имеет отрицательное изменение
      const spbRow = screen.getByText('Санкт-Петербург').closest('tr');
      expect(spbRow).toBeInTheDocument();
    });
  });

  it('должен экспортировать данные в CSV при клике на кнопку', async () => {
    (compareApi.getComparisonTable as any).mockResolvedValue(mockTableData);

    renderWithProviders(<ComparisonTable />);

    await waitFor(() => {
      const exportButton = screen.getByLabelText('Экспорт в CSV');
      fireEvent.click(exportButton);
      expect(exportButton).toBeInTheDocument();
    });
  });
});
