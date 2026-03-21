import { Paper, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CategoriesChartProps {
  data: {
    labels: string[];
    amounts: number[];
  } | null;
  loading?: boolean;
}

export const CategoriesChart = ({ data, loading = false }: CategoriesChartProps) => {
  if (loading || !data) {
    return (
      <Paper sx={{ p: 2, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">Загрузка данных...</Typography>
      </Paper>
    );
  }

  const total = data.amounts.reduce((sum, val) => sum + val, 0);

  const chartData = data.labels.map((label, index) => ({
    name: label.length > 30 ? label.slice(0, 30) + '...' : label,
    fullName: label,
    value: data.amounts[index],
    percentage: ((data.amounts[index] / total) * 100).toFixed(1),
  }));

  const formatValue = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)} млрд ₽`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)} млн ₽`;
    return `${(value / 1e3).toFixed(0)} тыс ₽`;
  };

  const formatXAxis = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)} млрд`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)} млн`;
    return `${(value / 1e3).toFixed(0)} тыс`;
  };

  return (
    <Paper sx={{
      p: 3,
      height: 400,
      background: 'rgba(15, 12, 41, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    }} role="region" aria-label="Диаграмма продуктов">
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
        📦 Продукты
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart layout="vertical" data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.15)" vertical={false} />
          <XAxis
            type="number"
            tickFormatter={formatXAxis}
            tick={{ fontSize: 10, fill: 'rgba(255, 255, 255, 0.7)' }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
            tickLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={200}
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
            formatter={(value) => [formatValue(Number(value) || 0), 'Сумма']}
            labelFormatter={(label) => chartData.find(d => d.name === label)?.fullName || label}
          />
          <Bar
            dataKey="value"
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
              <Cell key={`cell-${index}`} fill={`rgba(0, 180, 219, ${0.4 + (index / chartData.length) * 0.6})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};
