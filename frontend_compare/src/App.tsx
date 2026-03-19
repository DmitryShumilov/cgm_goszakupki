import { useState, useEffect } from 'react';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  IconButton,
  Tooltip,
} from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useComparisonStore } from './stores/comparisonStore';
import { PeriodFilters } from './components/PeriodFilters';
import { ComparisonKpiPanel } from './components/ComparisonKpiPanel';
import { ComparisonTable } from './components/ComparisonCharts';
import { exportToPdf } from './utils/exportToPdf';

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
  const [isExporting, setIsExporting] = useState(false);

  // Загрузка доступных значений
  const {
    setAvailableYears,
    setAvailableRegions,
    setAvailableProducts,
  } = useComparisonStore();

  useEffect(() => {
    const loadAvailableData = async () => {
      try {
        const [years, regions, products] = await Promise.all([
          fetch('/api/filters/years').then((r) => r.json()),
          fetch('/api/filters/regions').then((r) => r.json()),
          fetch('/api/filters/products').then((r) => r.json()),
        ]);

        setAvailableYears(years);
        setAvailableRegions(regions);
        setAvailableProducts(products);
      } catch (error) {
        console.error('Failed to load filters:', error);
      }
    };

    loadAvailableData();
  }, [setAvailableYears, setAvailableRegions, setAvailableProducts]);

  // Экспорт в PDF
  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await exportToPdf(document.getElementById('dashboard-content')!, {
        filename: `cgm_comparison_${new Date().toISOString().split('T')[0]}.pdf`,
        orientation: 'landscape',
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Не удалось экспортировать в PDF. Попробуйте ещё раз.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        overflow: 'auto',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      }}
    >
      <CssBaseline />

      {/* Skip link для навигации */}
      <a href="#main-content" className="skip-link">
        Перейти к основному содержимому
      </a>

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'transparent',
          boxShadow: 'none',
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(15, 12, 41, 0.8)',
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              color: '#FFFFFF',
            }}
          >
            📊 CGM Dashboard — Сравнение периодов
          </Typography>

          {/* Кнопка экспорта PDF */}
          <Tooltip title="Экспорт в PDF (A4, альбомная)">
            <IconButton
              onClick={handleExportPdf}
              disabled={isExporting}
              sx={{
                color: '#fff',
                mr: 1,
                '&:hover': {
                  background: 'rgba(255,255,255,0.1)',
                },
              }}
              aria-label="Экспорт в PDF"
              data-testid="export-pdf-button"
            >
              <PictureAsPdfIcon />
            </IconButton>
          </Tooltip>

          <Typography
            variant="caption"
            sx={{ mr: 2, color: 'rgba(255,255,255,0.7)' }}
          >
            {new Date().toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Основной контент */}
      <Box
        component="main"
        id="main-content"
        sx={{
          flexGrow: 1,
          p: 3,
          background: 'transparent',
          overflow: 'auto',
        }}
      >
        <Toolbar />
        <Container maxWidth="xl">
          <Box id="dashboard-content">
            {/* Фильтры периодов */}
            <PeriodFilters />

            {/* KPI Panel с индикаторами */}
            <ComparisonKpiPanel />

            {/* Таблица сравнения */}
            <Box sx={{ mt: 3 }}>
              <ComparisonTable />
            </Box>
          </Box>
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
