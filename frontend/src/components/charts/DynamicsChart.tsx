import { Paper, Typography } from '@mui/material';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DynamicsChartProps {
  data: {
    labels: string[];
    amounts: number[];
    quantities: number[];
  } | null;
  loading?: boolean;
}

export const DynamicsChart = ({ data, loading = false }: DynamicsChartProps) => {
  if (loading || !data) {
    return (
      <Paper sx={{ p: 2, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">Загрузка данных...</Typography>
      </Paper>
    );
  }

  // Группировка данных по месяцам (1-12) с суммированием по годам
  const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  
  const groupedData = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    name: monthNames[i],
    amount: 0,
    quantity: 0,
  }));

  data.labels.forEach((label, index) => {
    const month = parseInt(label.split('-')[1], 10) - 1;
    if (month >= 0 && month < 12) {
      groupedData[month].amount += data.amounts[index];
      groupedData[month].quantity += data.quantities[index];
    }
  });

  const formatAmount = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)} млрд ₽`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)} млн ₽`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)} тыс ₽`;
    return value.toLocaleString('ru-RU') + ' ₽';
  };

  const formatQuantity = (value: number) => {
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)} млн`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)} тыс`;
    return value.toLocaleString('ru-RU');
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
        📈 Объём закупок
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart data={groupedData}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00B4DB" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#00B4DB" stopOpacity={0.4}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11, fill: '#666666' }}
            axisLine={{ stroke: '#E0E0E0' }}
            tickLine={{ stroke: '#E0E0E0' }}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            tickFormatter={formatAmount}
            tick={{ fontSize: 10, fill: '#666666' }}
            axisLine={{ stroke: '#E0E0E0' }}
            tickLine={{ stroke: '#E0E0E0' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={formatQuantity}
            tick={{ fontSize: 10, fill: '#666666' }}
            axisLine={{ stroke: '#E0E0E0' }}
            tickLine={{ stroke: '#E0E0E0' }}
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
            formatter={(value, name) => {
              const numValue = Number(value) || 0;
              if (name === 'amount') return [formatAmount(numValue), 'Сумма'];
              if (name === 'quantity') return [`${formatQuantity(numValue)} шт`, 'Количество'];
              return [value, name];
            }}
            labelFormatter={(label) => `Месяц: ${label}`}
          />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '10px',
              fontSize: '12px',
            }} 
          />
          <Bar
            yAxisId="left"
            dataKey="amount"
            name="Сумма закупок"
            fill="url(#colorAmount)"
            radius={[8, 8, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="quantity"
            name="Количество"
            stroke="#FF9500"
            strokeWidth={3}
            dot={{ fill: '#FFFFFF', stroke: '#FF9500', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Paper>
  );
};
