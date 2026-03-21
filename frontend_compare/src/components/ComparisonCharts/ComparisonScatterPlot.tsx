import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { compareApi } from '../../api/compareApi';
import { useComparisonStore } from '../../stores/comparisonStore';
import { formatCurrency } from '../../utils/formatters';
import type { SuppliersScatterData } from '../../types';

interface ComparisonScatterPlotProps {
  loading?: boolean;
}

export const ComparisonScatterPlot: React.FC<ComparisonScatterPlotProps> = ({ loading }) => {
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

  // Загрузка данных сравнения поставщиков
  const { data, isLoading, error } = useQuery<SuppliersScatterData>({
    queryKey: ['suppliers-scatter', periodA, periodB],
    queryFn: () => compareApi.getSuppliersScatter(paramsA, paramsB),
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

  if (!data || data.points.length === 0) {
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
          Нет данных для отображения
        </Typography>
      </Paper>
    );
  }

  // Преобразование данных для графика
  const chartData = data.points.map((point) => ({
    x: point.periodA,
    y: point.periodB,
    z: 0,
    supplier: point.supplier,
  }));

  // Определение цвета точки на основе тренда
  const getPointColor = (x: number, y: number) => {
    if (y > x * 1.05) return '#38EF7D';  // Рост (>5%)
    if (y < x * 0.95) return '#FF6B6B';  // Падение (<-5%)
    return '#FFD93D';  // Стабильно
  };

  // Нахождение максимального значения для масштаба
  const maxValue = Math.max(
    ...data.points.map((p) => Math.max(p.periodA, p.periodB))
  );

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
          boxShadow: '0 0 30px rgba(56, 239, 125, 0.2)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
      }}
      data-testid="chart-scatter"
      role="region"
      aria-label="Поставщики — scatter plot"
    >
      {/* Заголовок */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            color: '#fff',
            fontWeight: 700,
            fontSize: '16px',
            mb: 1,
          }}
        >
          🏢 Поставщики: Период А vs Период Б
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}
        >
          📈 Выше диагонали — рост | 📉 Ниже диагонали — падение | ➡️ На диагонали — стабильно
        </Typography>
      </Box>

      {/* Диаграмма */}
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255, 255, 255, 0.1)"
          />
          <XAxis
            type="number"
            dataKey="x"
            name="Период А"
            stroke="rgba(255, 255, 255, 0.6)"
            fontSize={12}
            tickFormatter={(value) => formatCurrency(value).replace(' ₽', '')}
            tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
            label={{
              value: 'Период А (сумма)',
              position: 'insideBottomRight',
              offset: -10,
              fill: 'rgba(255, 255, 255, 0.6)',
              fontSize: 12,
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Период Б"
            stroke="rgba(255, 255, 255, 0.6)"
            fontSize={12}
            tickFormatter={(value) => formatCurrency(value).replace(' ₽', '')}
            tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
            label={{
              value: 'Период Б (сумма)',
              angle: -90,
              position: 'insideLeft',
              fill: 'rgba(255, 255, 255, 0.6)',
              fontSize: 12,
            }}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(15, 12, 41, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 8,
              backdropFilter: 'blur(10px)',
            }}
            labelStyle={{ color: '#fff', fontWeight: 600 }}
            formatter={(value) => {
              const numValue = Number(value);
              return [formatCurrency(numValue), 'Сумма'];
            }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
            }}
            content={({ payload }: any) => {
              if (payload && payload.length) {
                return (
                  <Box sx={{ display: 'flex', gap: 3, pt: 3, justifyContent: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#38EF7D' }} />
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        📈 Рост
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#FF6B6B' }} />
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        📉 Падение
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#FFD93D' }} />
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        ➡️ Стабильно
                      </Typography>
                    </Box>
                  </Box>
                );
              }
              return null;
            }}
          />
          {/* Диагональ равенства */}
          <ReferenceLine
            segment={[{ x: 0, y: 0 }, { x: maxValue, y: maxValue }]}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeDasharray="3 3"
          />
          <Scatter
            name="Поставщики"
            data={chartData}
            fill="#8884d8"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getPointColor(entry.x, entry.y)}
                fillOpacity={0.8}
                stroke={getPointColor(entry.x, entry.y)}
                strokeWidth={2}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </Paper>
  );
};
