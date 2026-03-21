import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { compareApi } from '../../api/compareApi';
import { useComparisonStore } from '../../stores/comparisonStore';
import { formatCurrency } from '../../utils/formatters';
import type { RegionsData } from '../../types';

interface ComparisonRegionsChartProps {
  loading?: boolean;
}

export const ComparisonRegionsChart: React.FC<ComparisonRegionsChartProps> = ({ loading }) => {
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

  // Загрузка данных сравнения регионов
  const { data, isLoading, error } = useQuery<RegionsData>({
    queryKey: ['regions-comparison', periodA, periodB],
    queryFn: () => compareApi.getRegionsComparison(paramsA, paramsB),
    enabled: !loading,
    staleTime: 5 * 60 * 1000,
  });

  if (loading || isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          background: 'rgba(15, 12, 41, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
          Загрузка данных...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ color: '#FF6B6B' }}>
          ⚠️ Ошибка: {(error as Error).message}
        </Typography>
      </Paper>
    );
  }

  if (!data) {
    return null;
  }

  // Преобразование данных для графика
  const chartData = data.labels.map((label, index) => ({
    name: label.length > 20 ? label.substring(0, 20) + '...' : label,
    fullName: label,
    periodA: data.periodA.amounts[index] || 0,
    periodB: data.periodB.amounts[index] || 0,
  }));

  // Цвета периодов
  const colorA = '#3388ff';  // Синий
  const colorB = '#ff6b6b';  // Красный

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(15, 12, 41, 0.95) 0%, rgba(48, 43, 99, 0.85) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 0 30px rgba(255, 107, 107, 0.2)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
      }}
      data-testid="chart-regions"
      role="region"
      aria-label="Топ регионов — сравнение периодов"
    >
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            color: '#fff',
            fontWeight: 700,
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          🌍 Топ-10 регионов (сравнение)
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: 1,
                background: colorA,
              }}
            />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Период А
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: 1,
                background: colorB,
              }}
            />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Период Б
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Диаграмма */}
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255, 255, 255, 0.1)"
          />
          <XAxis
            type="number"
            stroke="rgba(255, 255, 255, 0.6)"
            fontSize={12}
            tickFormatter={(value) => formatCurrency(value).replace(' ₽', '')}
            tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="rgba(255, 255, 255, 0.6)"
            fontSize={11}
            width={150}
            tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(15, 12, 41, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 8,
              backdropFilter: 'blur(10px)',
            }}
            labelStyle={{ color: '#fff', fontWeight: 600 }}
            formatter={(value) => [formatCurrency(Number(value)), 'Сумма']}
            labelFormatter={(label) => `Регион: ${label}`}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
            }}
          />
          <Bar
            dataKey="periodA"
            name="Период А"
            fill={colorA}
            radius={[0, 4, 4, 0]}
            maxBarSize={20}
          />
          <Bar
            dataKey="periodB"
            name="Период Б"
            fill={colorB}
            radius={[0, 4, 4, 0]}
            maxBarSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};
