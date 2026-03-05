import { Paper, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface PieLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

interface SuppliersChartProps {
  data: {
    top5: {
      labels: string[];
      amounts: number[];
    };
    others: number;
    total: number;
  } | null;
  loading?: boolean;
}

export const SuppliersChart = ({ data, loading = false }: SuppliersChartProps) => {
  if (loading || !data) {
    return (
      <Paper sx={{ p: 2, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">Загрузка данных...</Typography>
      </Paper>
    );
  }

  const COLORS = ['#00B4DB', '#00B894', '#FFA502', '#A55EEA', '#2193b0', '#9E9E9E'];

  const chartData = [
    ...data.top5.labels.map((label, index) => ({
      name: label.length > 30 ? label.slice(0, 30) + '...' : label,
      fullName: label,
      value: data.top5.amounts[index],
      percentage: ((data.top5.amounts[index] / data.total) * 100).toFixed(1),
    })),
    {
      name: 'Остальные',
      fullName: 'Остальные поставщики',
      value: data.others,
      percentage: ((data.others / data.total) * 100).toFixed(1),
    },
  ];

  const formatValue = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)} млрд ₽`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)} млн ₽`;
    return `${(value / 1e3).toFixed(0)} тыс ₽`;
  };

  const renderCustomizedLabel = (props: PieLabelProps) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;

    if (cx === undefined || cy === undefined || midAngle === undefined || 
        innerRadius === undefined || outerRadius === undefined || percent === undefined) {
      return null;
    }

    const angle = percent * 360;
    if (angle < 10) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={14}
        fontWeight="bold"
        style={{ pointerEvents: 'none' }}
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
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
        🏢 Топ-5 Поставщиков
      </Typography>
      <Box sx={{ display: 'flex', height: 'calc(100% - 50px)', alignItems: 'center' }}>
        <Box sx={{ flex: '0 0 280px', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={renderCustomizedLabel}
                labelLine={false}
                stroke="#FFFFFF"
                strokeWidth={2}
              >
                {chartData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
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
            </PieChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ flex: 1, ml: 3, overflow: 'auto' }}>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold" sx={{ fontSize: '13px', mb: 1.5 }}>
            Легенда
          </Typography>
          {chartData.map((entry, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  bgcolor: COLORS[index % COLORS.length],
                  mr: 1,
                  flexShrink: 0,
                  borderRadius: '3px',
                  mt: 0.25,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontSize: '11px',
                  lineHeight: 1.4,
                  color: '#666666',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                }}
              >
                {entry.fullName} ({entry.percentage}%)
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};
