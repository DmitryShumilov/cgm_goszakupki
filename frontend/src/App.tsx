import { useEffect, useState, useCallback } from 'react';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Container, CircularProgress, Alert } from '@mui/material';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { dashboardApi } from './api';
import { useFilterStore } from './stores/filterStore';
import { FilterPanel } from './components/filters/FilterPanel';
import { KpiPanel } from './components/kpi/KpiPanel';
import { DynamicsChart } from './components/charts/DynamicsChart';
import { RegionsChart } from './components/charts/RegionsChart';
import { SuppliersChart } from './components/charts/SuppliersChart';
import { CategoriesChart } from './components/charts/CategoriesChart';
import { HeatmapChart } from './components/charts/HeatmapChart';

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
    setAvailableYears,
    setAvailableMonths,
    setAvailableRegions,
    setAvailableCustomers,
    setAvailableSuppliers,
    setAvailableProducts,
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
    years: selectedYears,
    months: selectedMonths,
    regions: selectedRegions,
    customers: selectedCustomers,
    suppliers: selectedSuppliers,
    products: selectedProducts,
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

  const { data: heatmapData, isLoading: heatmapLoading } = useQuery({
    queryKey: ['heatmap', filterParams, refreshKey],
    queryFn: () => dashboardApi.getHeatmap(filterParams),
    enabled: !initError,
  });

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

      <Box component="main" sx={{ 
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

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2, mb: 2 }}>
            <DynamicsChart data={dynamicsData || null} loading={dynamicsLoading} />
            <RegionsChart data={regionsData || null} loading={regionsLoading} />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2, mb: 2 }}>
            <SuppliersChart data={suppliersData || null} loading={suppliersLoading} />
            <CategoriesChart data={categoriesData || null} loading={categoriesLoading} />
          </Box>

          <HeatmapChart data={heatmapData || null} loading={heatmapLoading} />
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
