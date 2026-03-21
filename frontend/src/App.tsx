import { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Container, CircularProgress, Alert, Skeleton, Chip } from '@mui/material';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { dashboardApi } from './api';
import { useFilterStore } from './stores/filterStore';
import { FilterPanel } from './components/filters/FilterPanel';
import { KpiPanel } from './components/kpi/KpiPanel';

// Lazy loading для диаграмм
const DynamicsChart = lazy(() => import('./components/charts/DynamicsChart').then(module => ({ default: module.DynamicsChart })));
const RegionsChart = lazy(() => import('./components/charts/RegionsChart').then(module => ({ default: module.RegionsChart })));
const SuppliersChart = lazy(() => import('./components/charts/SuppliersChart').then(module => ({ default: module.SuppliersChart })));
const CategoriesChart = lazy(() => import('./components/charts/CategoriesChart').then(module => ({ default: module.CategoriesChart })));
const HeatmapChart = lazy(() => import('./components/charts/HeatmapChart').then(module => ({ default: module.HeatmapChart })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const DashboardContent = () => {
  const {
    selectedYears,
    selectedMonths,
    selectedRegions,
    selectedCustomers,
    selectedSuppliers,
    selectedProducts,
    availableYears,
    availableMonths,
    availableRegions,
    availableCustomers,
    availableSuppliers,
    availableProducts,
    setAvailableYears,
    setAvailableMonths,
    setAvailableRegions,
    setAvailableCustomers,
    setAvailableSuppliers,
    setAvailableProducts,
    toggleYear,
    toggleMonth,
    toggleRegion,
    toggleCustomer,
    toggleSupplier,
    toggleProduct,
  } = useFilterStore();

  const [refreshKey, setRefreshKey] = useState(0);
  const [initError, setInitError] = useState<string | null>(null);

  // Загрузка справочников
  useEffect(() => {
    const loadFilters = async () => {
      try {
        setInitError(null);
        const [years, months, regions, customers, suppliers, products] = await Promise.all([
          dashboardApi.getYears(),
          dashboardApi.getMonths(),
          dashboardApi.getRegionsList(),
          dashboardApi.getCustomersList(),
          dashboardApi.getSuppliersList(),
          dashboardApi.getProductsList(),
        ]);

        setAvailableYears(years);
        setAvailableMonths(months);
        setAvailableRegions(regions);
        setAvailableCustomers(customers);
        setAvailableSuppliers(suppliers);
        setAvailableProducts(products);
      } catch (error) {
        console.error('Failed to load filters:', error);
        setInitError('Не удалось загрузить фильтры. Проверьте подключение к API.');
      }
    };

    loadFilters();
  }, [setAvailableYears, setAvailableMonths, setAvailableRegions, setAvailableCustomers, setAvailableSuppliers, setAvailableProducts]);

  const filterParams = {
    years: selectedYears.length > 0 ? selectedYears.filter(y => y != null) : undefined,
    months: selectedMonths.length > 0 ? selectedMonths.filter(m => m != null) : undefined,
    regions: selectedRegions.length > 0 ? selectedRegions.filter(r => r != null) : undefined,
    customers: selectedCustomers.length > 0 ? selectedCustomers.filter(c => c != null) : undefined,
    suppliers: selectedSuppliers.length > 0 ? selectedSuppliers.filter(s => s != null) : undefined,
    products: selectedProducts.length > 0 ? selectedProducts.filter(p => p != null) : undefined,
  };

  const { data: kpiData, isLoading: kpiLoading, error: kpiError, refetch: refetchKpi } = useQuery({
    queryKey: ['kpi', filterParams, refreshKey],
    queryFn: () => dashboardApi.getKpi(filterParams),
    enabled: !initError,
    refetchInterval: 5 * 60 * 1000, // Автообновление каждые 5 минут
  });

  const { data: dynamicsData, isLoading: dynamicsLoading } = useQuery({
    queryKey: ['dynamics', filterParams, refreshKey],
    queryFn: () => dashboardApi.getDynamics(filterParams),
    enabled: !initError,
  });

  const { data: regionsData, isLoading: regionsLoading } = useQuery({
    queryKey: ['regions', filterParams, refreshKey],
    queryFn: () => dashboardApi.getRegions(filterParams),
    enabled: !initError,
  });

  const { data: suppliersData, isLoading: suppliersLoading } = useQuery({
    queryKey: ['suppliers', filterParams, refreshKey],
    queryFn: () => dashboardApi.getSuppliers(filterParams),
    enabled: !initError,
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', filterParams, refreshKey],
    queryFn: () => dashboardApi.getCategories(filterParams),
    enabled: !initError,
  });

  const { data: heatmapData, isLoading: heatmapLoading, error: heatmapError } = useQuery({
    queryKey: ['heatmap', filterParams, refreshKey],
    queryFn: () => dashboardApi.getHeatmap(filterParams),
    enabled: !initError,
  });

  // Логируем ошибку heatmap
  if (heatmapError) {
    console.error('Heatmap error:', heatmapError);
  }

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    refetchKpi();
  }, [refetchKpi]);

  if (initError) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {initError}
          <br />
          Убедитесь, что backend запущен на http://localhost:8000
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      height: '100vh',
      overflow: 'auto',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
    }}>
      <CssBaseline />

      {/* Skip link для навигации */}
      <a href="#main-content" className="skip-link">
        Перейти к основному содержимому
      </a>

      <AppBar position="fixed" sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'transparent',
        boxShadow: 'none',
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(15, 12, 41, 0.8)',
      }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600, color: '#FFFFFF' }}>
            📊 CGM Госзакупки
          </Typography>
          <Typography variant="caption" sx={{ mr: 2, color: 'rgba(255,255,255,0.7)' }}>
            {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Toolbar>
      </AppBar>

      <FilterPanel onRefresh={handleRefresh} />

      <Box component="main" id="main-content" sx={{
        flexGrow: 1,
        p: 3,
        background: 'transparent',
        overflow: 'auto',
      }}>
        <Toolbar />
        <Container maxWidth="xl">
          {(kpiLoading || dynamicsLoading || regionsLoading || suppliersLoading || categoriesLoading || heatmapLoading) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {kpiError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Ошибка загрузки KPI: {(kpiError as Error).message}
            </Alert>
          )}

          <KpiPanel data={kpiData || null} loading={kpiLoading} />

          {/* Индикаторы активных фильтров */}
          {/* Показываем только если выбраны НЕ все значения фильтра */}
          {(() => {
            // Проверяем, есть ли фильтры где выбраны не все значения
            const isYearsFiltered = selectedYears.length > 0 && selectedYears.length < availableYears.length;
            const isMonthsFiltered = selectedMonths.length > 0 && selectedMonths.length < availableMonths.length;
            const isRegionsFiltered = selectedRegions.length > 0 && selectedRegions.length < availableRegions.length;
            const isCustomersFiltered = selectedCustomers.length > 0 && selectedCustomers.length < availableCustomers.length;
            const isSuppliersFiltered = selectedSuppliers.length > 0 && selectedSuppliers.length < availableSuppliers.length;
            const isProductsFiltered = selectedProducts.length > 0 && selectedProducts.length < availableProducts.length;

            const hasActiveFilters = isYearsFiltered || isMonthsFiltered || isRegionsFiltered || 
                                     isCustomersFiltered || isSuppliersFiltered || isProductsFiltered;

            if (!hasActiveFilters) return null;

            return (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.85)' }}>
                  🏷️ Активные фильтры:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {isYearsFiltered && selectedYears.map(year => (
                    <Chip
                      key={year}
                      label={`Год: ${year}`}
                      onDelete={() => toggleYear(year)}
                      sx={{
                        bgcolor: 'rgba(0, 180, 219, 0.3)',
                        color: '#fff',
                        border: '1px solid rgba(0, 180, 219, 0.5)',
                        '& .MuiChip-deleteIcon': {
                          color: '#fff',
                          '&:hover': { color: '#fff' }
                        }
                      }}
                    />
                  ))}
                  {isMonthsFiltered && selectedMonths.map(month => (
                    <Chip
                      key={month}
                      label={`Месяц: ${month}`}
                      onDelete={() => toggleMonth(month)}
                      sx={{
                        bgcolor: 'rgba(79, 195, 247, 0.3)',
                        color: '#fff',
                        border: '1px solid rgba(79, 195, 247, 0.5)',
                        '& .MuiChip-deleteIcon': {
                          color: '#fff',
                          '&:hover': { color: '#fff' }
                        }
                      }}
                    />
                  ))}
                  {isRegionsFiltered && selectedRegions.map(region => (
                    <Chip
                      key={region}
                      label={`Регион: ${region.length > 25 ? region.substring(0, 25) + '...' : region}`}
                      onDelete={() => toggleRegion(region)}
                      sx={{
                        bgcolor: 'rgba(255, 152, 0, 0.3)',
                        color: '#fff',
                        border: '1px solid rgba(255, 152, 0, 0.5)',
                        '& .MuiChip-deleteIcon': {
                          color: '#fff',
                          '&:hover': { color: '#fff' }
                        }
                      }}
                    />
                  ))}
                  {isCustomersFiltered && selectedCustomers.map(customer => (
                    <Chip
                      key={customer}
                      label={`Заказчик: ${customer.length > 25 ? customer.substring(0, 25) + '...' : customer}`}
                      onDelete={() => toggleCustomer(customer)}
                      sx={{
                        bgcolor: 'rgba(76, 175, 80, 0.3)',
                        color: '#fff',
                        border: '1px solid rgba(76, 175, 80, 0.5)',
                        '& .MuiChip-deleteIcon': {
                          color: '#fff',
                          '&:hover': { color: '#fff' }
                        }
                      }}
                    />
                  ))}
                  {isSuppliersFiltered && selectedSuppliers.map(supplier => (
                    <Chip
                      key={supplier}
                      label={`Поставщик: ${supplier.length > 25 ? supplier.substring(0, 25) + '...' : supplier}`}
                      onDelete={() => toggleSupplier(supplier)}
                      sx={{
                        bgcolor: 'rgba(156, 39, 176, 0.3)',
                        color: '#fff',
                        border: '1px solid rgba(156, 39, 176, 0.5)',
                        '& .MuiChip-deleteIcon': {
                          color: '#fff',
                          '&:hover': { color: '#fff' }
                        }
                      }}
                    />
                  ))}
                  {isProductsFiltered && selectedProducts.map(product => (
                    <Chip
                      key={product}
                      label={`Продукт: ${product.length > 25 ? product.substring(0, 25) + '...' : product}`}
                      onDelete={() => toggleProduct(product)}
                      sx={{
                        bgcolor: 'rgba(233, 30, 99, 0.3)',
                        color: '#fff',
                        border: '1px solid rgba(233, 30, 99, 0.5)',
                        '& .MuiChip-deleteIcon': {
                          color: '#fff',
                          '&:hover': { color: '#fff' }
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            );
          })()}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2, mb: 2 }} role="region" aria-label="Диаграммы динамики и регионов">
            <Suspense fallback={<Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, background: 'rgba(15, 12, 41, 0.95)' }} />}>
              <DynamicsChart data={dynamicsData || null} loading={dynamicsLoading} />
            </Suspense>
            <Suspense fallback={<Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, background: 'rgba(15, 12, 41, 0.95)' }} />}>
              <RegionsChart data={regionsData || null} loading={regionsLoading} />
            </Suspense>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2, mb: 2 }} role="region" aria-label="Диаграммы поставщиков и категорий">
            <Suspense fallback={<Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, background: 'rgba(15, 12, 41, 0.95)' }} />}>
              <SuppliersChart data={suppliersData || null} loading={suppliersLoading} />
            </Suspense>
            <Suspense fallback={<Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, background: 'rgba(15, 12, 41, 0.95)' }} />}>
              <CategoriesChart data={categoriesData || null} loading={categoriesLoading} />
            </Suspense>
          </Box>

          <Suspense fallback={<Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, background: 'rgba(15, 12, 41, 0.95)' }} />}>
            <HeatmapChart data={heatmapData || null} loading={heatmapLoading} />
          </Suspense>
        </Container>
      </Box>
    </Box>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
};

export default App;
