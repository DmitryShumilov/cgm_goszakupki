import React from 'react';
import { Box, Grid, Skeleton, Typography } from '@mui/material';
import { KpiComparisonCard } from './KpiComparisonCard';
import { useQuery } from '@tanstack/react-query';
import { compareApi } from '../../api/compareApi';
import { useComparisonStore } from '../../stores/comparisonStore';
import type { ComparisonKpiResult } from '../../types';

interface ComparisonKpiPanelProps {
  loading?: boolean;
}

export const ComparisonKpiPanel: React.FC<ComparisonKpiPanelProps> = ({ loading }) => {
  const { periodA, periodB } = useComparisonStore();

  // Подготовка параметров для API
  const paramsA = {
    years: periodA.years.length > 0 ? periodA.years : undefined,
    regions: periodA.regions.length > 0 ? periodA.regions : undefined,
    products: periodA.products.length > 0 ? periodA.products : undefined,
  };

  const paramsB = {
    years: periodB.years.length > 0 ? periodB.years : undefined,
    regions: periodB.regions.length > 0 ? periodB.regions : undefined,
    products: periodB.products.length > 0 ? periodB.products : undefined,
  };

  // Загрузка данных сравнения KPI
  const { data, isLoading, error } = useQuery<ComparisonKpiResult>({
    queryKey: ['kpi-comparison', periodA, periodB],
    queryFn: () => compareApi.getKpiComparison(paramsA, paramsB),
    enabled: !loading,
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  if (loading || isLoading) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{
            color: '#fff',
            mb: 2,
            fontWeight: 700,
          }}
        >
          📈 KPI Метрики с индикаторами изменений
        </Typography>
        <Grid container spacing={2}>
          {[...Array(6)].map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index}>
              <Skeleton
                variant="rectangular"
                height={220}
                sx={{
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.05)',
                }}
                data-testid="skeleton-kpi"
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 2,
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid rgba(255, 107, 107, 0.3)',
        }}
      >
        <Typography sx={{ color: '#FF6B6B' }}>
          ⚠️ Ошибка загрузки KPI: {(error as Error).message}
        </Typography>
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  const { periodA: kpiA, periodB: kpiB, changes } = data;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h6"
        sx={{
          color: '#fff',
          mb: 2,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        📈 KPI Метрики с индикаторами изменений
      </Typography>

      <Grid container spacing={2}>
        {/* Общая сумма контрактов */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KpiComparisonCard
            label="Общая сумма контрактов"
            icon="💰"
            periodAValue={kpiA.total_amount}
            periodBValue={kpiB.total_amount}
            change={changes.total_amount}
            isMoney={true}
          />
        </Grid>

        {/* Количество контрактов */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KpiComparisonCard
            label="Количество контрактов"
            icon="📄"
            periodAValue={kpiA.contract_count}
            periodBValue={kpiB.contract_count}
            change={changes.contract_count}
            isMoney={false}
          />
        </Grid>

        {/* Средняя сумма контракта */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KpiComparisonCard
            label="Средняя сумма контракта"
            icon="📊"
            periodAValue={kpiA.avg_contract_amount}
            periodBValue={kpiB.avg_contract_amount}
            change={changes.avg_contract_amount}
            isMoney={true}
          />
        </Grid>

        {/* Общий объём (шт) */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KpiComparisonCard
            label="Общий объём (шт)"
            icon="📦"
            periodAValue={kpiA.total_quantity}
            periodBValue={kpiB.total_quantity}
            change={changes.total_quantity}
            isMoney={false}
          />
        </Grid>

        {/* Средняя цена за единицу */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KpiComparisonCard
            label="Средняя цена за единицу"
            icon="🏷️"
            periodAValue={kpiA.avg_price_per_unit}
            periodBValue={kpiB.avg_price_per_unit}
            change={changes.avg_price_per_unit}
            isMoney={false}
            decimalPlaces={2}
          />
        </Grid>

        {/* Количество заказчиков */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KpiComparisonCard
            label="Количество заказчиков"
            icon="🏢"
            periodAValue={kpiA.customer_count}
            periodBValue={kpiB.customer_count}
            change={changes.customer_count ?? { absolute: 0, percent: 0, trend: 'stable' }}
            isMoney={false}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
