import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { PeriodColumn } from './PeriodColumn';
import { SwapButton } from '../ui/SwapButton';
import { useComparisonStore } from '../../stores/comparisonStore';

export const PeriodFilters: React.FC = () => {
  const {
    periodA,
    periodB,
    setAvailableYears,
    setAvailableRegions,
    setAvailableProducts,
  } = useComparisonStore();

  // Загрузка доступных значений при монтировании
  React.useEffect(() => {
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
        console.error('Failed to load available data:', error);
      }
    };

    loadAvailableData();
  }, [setAvailableYears, setAvailableRegions, setAvailableProducts]);

  return (
    <Box
      sx={{
        mb: 4,
      }}
    >
      {/* Заголовок */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: '#fff',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          📊 Режим сравнения периодов
        </Typography>
        <SwapButton />
      </Box>

      {/* Две колонки фильтров */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <PeriodColumn
            period="A"
            title="Ⓐ Период А"
            color="#3388ff"  // Синий
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <PeriodColumn
            period="B"
            title="Ⓑ Период Б"
            color="#ff6b6b"  // Красный
          />
        </Grid>
      </Grid>

      {/* Индикатор выбранных фильтров */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}
        >
          📋 Текущие фильтры:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography
              variant="caption"
              sx={{ color: '#3388ff', fontWeight: 600 }}
            >
              Период А:
            </Typography>{' '}
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {periodA.years.length > 0
                ? `Годы: ${periodA.years.join(', ')}`
                : 'Все годы'}{' '}
              {periodA.regions.length > 0 &&
                `| Регионы: ${periodA.regions.length}`}{' '}
              {periodA.products.length > 0 &&
                `| Продукты: ${periodA.products.length}`}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              sx={{ color: '#ff6b6b', fontWeight: 600 }}
            >
              Период Б:
            </Typography>{' '}
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {periodB.years.length > 0
                ? `Годы: ${periodB.years.join(', ')}`
                : 'Все годы'}{' '}
              {periodB.regions.length > 0 &&
                `| Регионы: ${periodB.regions.length}`}{' '}
              {periodB.products.length > 0 &&
                `| Продукты: ${periodB.products.length}`}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
