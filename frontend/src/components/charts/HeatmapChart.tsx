import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Box } from '@mui/material';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface HeatmapChartProps {
  data: {
    products: string[];
    months: string[];
    matrix: Array<Record<string, number | string>>;
  } | null;
  loading?: boolean;
}

export const HeatmapChart = ({ data, loading = false }: HeatmapChartProps) => {
  // Показываем загрузку только если loading=true И данных ещё нет
  if (loading && !data) {
    return (
      <Paper sx={{ p: 2, minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">Загрузка данных...</Typography>
      </Paper>
    );
  }

  // Показываем сообщение если данных нет
  if (!data || !data.products || data.products.length === 0) {
    return (
      <Paper sx={{ p: 2, minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">Нет данных для отображения</Typography>
      </Paper>
    );
  }

  // Функция для получения цвета ячейки на основе процента (для тёмной темы)
  const getCellColor = (pct: number): string => {
    if (pct === 0) return 'rgba(255, 255, 255, 0.05)';
    if (pct <= 10) return 'rgba(0, 180, 219, 0.3)';
    if (pct <= 25) return 'rgba(0, 180, 219, 0.5)';
    if (pct <= 50) return 'rgba(0, 180, 219, 0.7)';
    if (pct <= 75) return 'rgba(0, 180, 219, 0.85)';
    return 'rgba(0, 180, 219, 1)';
  };

  const getTextColor = (pct: number): string => {
    return pct > 25 ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
  };

  // Сокращаем названия месяцев для отображения
  const monthNames = [
    'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
    'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
  ];

  // Группируем данные по месяцам (1-12) суммируя по всем годам
  const displayMonths = monthNames;
  
  // Считаем общую сумму по всем товарам и месяцам для расчёта долей
  const grandTotal = data.matrix.reduce((sum, row) => {
    return sum + data.months.reduce((monthSum, month) => monthSum + (row[month] as number || 0), 0);
  }, 0);

  // Создаём сгруппированную матрицу: продукты × 12 месяцев
  const groupedMatrix = data.matrix.map((row) => {
    const groupedRow: Record<string, number | string> = {
      product: row.product,
    };

    // Инициализируем месяцы нулями
    const monthValues = Array(12).fill(0);

    // Суммируем данные по месяцам из всех лет
    data.months.forEach((monthStr) => {
      const monthIndex = parseInt(monthStr.split('-')[1], 10) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        const value = row[monthStr] as number || 0;
        monthValues[monthIndex] += value;
      }
    });

    // Добавляем значения месяцев в строку
    monthValues.forEach((val, idx) => {
      groupedRow[idx] = val;
    });

    // Считаем сумму по товару за все месяцы
    const productTotal = monthValues.reduce((sum, val) => sum + val, 0);
    
    // Считаем итоговую долю товара в общих закупках (%)
    const totalPct = grandTotal > 0 ? (productTotal / grandTotal) * 100 : 0;
    groupedRow['total_pct'] = parseFloat(totalPct.toFixed(2));

    return groupedRow;
  });

  // Сортируем матрицу по убыванию итоговой доли
  const sortedMatrix = [...groupedMatrix].sort((a, b) => {
    return (b['total_pct'] as number) - (a['total_pct'] as number);
  });

  // Ограничиваем топ-15 товаров для отображения
  const displayProducts = data.products.slice(0, 15);

  return (
    <Paper sx={{ p: 2, overflow: 'auto', background: 'rgba(15, 12, 41, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)' }} role="region" aria-label="Тепловая карта доли по месяцам">
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          fontSize: '11px',
          mb: 1,
          pb: 1,
          borderBottom: '2px solid #FF5722',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.85)',
        }}
      >
        🔥 Доля по месяцам (%)
      </Typography>
      <TableContainer>
        <Table size="small" sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', position: 'sticky', left: 0, bgcolor: 'rgba(15, 12, 41, 0.95)', zIndex: 1, color: 'rgba(255, 255, 255, 0.85)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                Товар
              </TableCell>
              {displayMonths.map((month) => (
                <TableCell
                  key={month}
                  align="center"
                  sx={{ fontWeight: 'bold', minWidth: 40, color: 'rgba(255, 255, 255, 0.85)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                >
                  {month}
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'rgba(15, 12, 41, 0.95)', color: 'rgba(255, 255, 255, 0.85)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }} align="center">
                Итого
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'rgba(15, 12, 41, 0.95)', color: 'rgba(255, 255, 255, 0.85)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', minWidth: 100 }} align="center">
                📈 Тренд
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedMatrix
              .filter((row) => displayProducts.includes(row.product as string))
              .map((row, rowIndex) => {
                // Считаем сумму по всем месяцам для этой строки
                const rowTotal = Array.from({ length: 12 }, (_, i) => row[i] as number).reduce((sum, val) => sum + val, 0);

                return (
                  <TableRow key={rowIndex} hover>
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: 0,
                        bgcolor: 'rgba(15, 12, 41, 0.95)',
                        zIndex: 1,
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: 'rgba(255, 255, 255, 0.85)',
                      }}
                    >
                      <Tooltip title={row.product as string}>
                        <span>{(row.product as string).length > 30 ? (row.product as string).slice(0, 30) + '...' : row.product}</span>
                      </Tooltip>
                    </TableCell>
                    {Array.from({ length: 12 }, (_, monthIndex) => {
                      const value = row[monthIndex] as number || 0;
                      const pct = rowTotal > 0 ? (value / rowTotal) * 100 : 0;

                      return (
                        <TableCell
                          key={monthIndex}
                          align="center"
                          sx={{
                            bgcolor: 'transparent',
                            minWidth: 40,
                            py: 0.5,
                            px: 0.25,
                          }}
                        >
                          <Box
                            sx={{
                              width: '100%',
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: getCellColor(pct),
                              borderRadius: 6,
                              color: getTextColor(pct),
                              fontWeight: pct > 50 ? 'bold' : 'normal',
                              fontSize: '11px',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                              },
                            }}
                          >
                            <Tooltip title={`${displayMonths[monthIndex]}: ${pct.toFixed(2)}%`}>
                              <span>{pct > 0 ? `${pct.toFixed(0)}%` : '—'}</span>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      );
                    })}
                    <TableCell align="center" sx={{ py: 0.5, px: 0.25 }}>
                      <Box
                        sx={{
                          width: '100%',
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'rgba(0, 180, 219, 0.4)',
                          borderRadius: 6,
                          color: '#FFFFFF',
                          fontWeight: 'bold',
                          fontSize: '11px',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                          },
                        }}
                      >
                        {row['total_pct']}%
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 0.5, px: 0.25, minWidth: 100 }}>
                      <Box
                        sx={{
                          width: '100%',
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={Array.from({ length: 12 }, (_, i) => ({
                              month: i,
                              value: row[i] as number || 0,
                            }))}
                          >
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#00B4DB"
                              strokeWidth={2}
                              dot={false}
                              isAnimationActive={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
