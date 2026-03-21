import { Paper, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface RegionsChartProps {
  data: {
    labels: string[];
    amounts: number[];
    counts: number[];
    total: number;
  } | null;
  loading?: boolean;
}

export const RegionsChart = ({ data, loading = false }: RegionsChartProps) => {
  if (loading || !data) {
    return (
      <Paper sx={{ p: 2, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">Загрузка данных...</Typography>
      </Paper>
    );
  }

  const chartData = data.labels.map((label, index) => ({
    name: label.length > 20 ? label.slice(0, 20) + '...' : label,
    fullName: label,
    amount: data.amounts[index],
    count: data.counts[index],
  }));

  // Вычисляем сумму топ-10 регионов
  const top10Sum = data.amounts.reduce((sum, val) => sum + val, 0);
  
  // Вычисляем процент: (сумма топ-10 / общая сумма) * 100
  const percentage = data.total > 0 ? ((top10Sum / data.total) * 100).toFixed(1) : '0';

  const formatAmount = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)} млрд. ₽`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)} млн. ₽`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)} тыс. ₽`;
    return value.toLocaleString('ru-RU') + ' ₽';
  };

  return (
    <Paper sx={{
      p: 3,
      height: 400,
      background: 'rgba(15, 12, 41, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    }} role="region" aria-label="Диаграмма топ-10 регионов">
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          fontSize: '11px',
          mb: 1,
          pb: 1,
          borderBottom: '2px solid #00B4DB',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.85)',
        }}
      >
        📍 Топ-10 регионов ({percentage}%)
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart layout="vertical" data={chartData} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.15)" vertical={false} fill="none" />
          <XAxis
            type="number"
            tickFormatter={formatAmount}
            tick={{ fontSize: 10, fill: 'rgba(255, 255, 255, 0.7)' }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
            tickLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={150}
            tick={{ fontSize: 10, fill: 'rgba(255, 255, 255, 0.7)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(26, 58, 92, 0.98)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: '500',
              color: '#FFFFFF',
            }}
            formatter={(value, name) => {
              const numValue = Number(value) || 0;
              if (name === 'amount') return [formatAmount(numValue), 'Сумма'];
              if (name === 'count') return [numValue.toLocaleString('ru-RU'), 'Контрактов'];
              return [value, name];
            }}
            labelFormatter={(label) => chartData.find(d => d.name === label)?.fullName || label}
          />
          <Bar
            dataKey="amount"
            name="Сумма (₽)"
            fill="#00B4DB"
            radius={[0, 8, 8, 0]}
            activeBar={{
              fill: '#00D4FF',
              stroke: '#FFFFFF',
              strokeWidth: 2,
            }}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`rgba(0, 180, 219, ${0.4 + (index / chartData.length) * 0.6})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};
