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
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    }}>
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
          color: 'rgba(0, 0, 0, 0.7)',
        }}
      >
        📦 Продукты
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart layout="vertical" data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
          <XAxis 
            type="number" 
            tickFormatter={formatXAxis}
            tick={{ fontSize: 10, fill: '#666666' }}
            axisLine={{ stroke: '#E0E0E0' }}
            tickLine={{ stroke: '#E0E0E0' }}
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={200} 
            tick={{ fontSize: 10, fill: '#666666' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(255, 255, 255, 0.98)',
              border: 'none',
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: '500',
            }}
            formatter={(value) => [formatValue(Number(value) || 0), 'Сумма']}
            labelFormatter={(label) => chartData.find(d => d.name === label)?.fullName || label}
          />
          <Bar 
            dataKey="value" 
            name="Сумма (₽)" 
            fill="#00B4DB"
            radius={[0, 8, 8, 0]}
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
