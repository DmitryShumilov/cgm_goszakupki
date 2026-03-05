import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Box } from '@mui/material';

interface HeatmapChartProps {
  data: {
    products: string[];
    months: string[];
    matrix: Array<Record<string, number | string>>;
  } | null;
  loading?: boolean;
}

export const HeatmapChart = ({ data, loading = false }: HeatmapChartProps) => {
  if (loading || !data) {
    return (
      <Paper sx={{ p: 2, minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">Загрузка данных...</Typography>
      </Paper>
    );
  }

  // Функция для получения цвета ячейки на основе процента
  const getCellColor = (pct: number): string => {
    if (pct === 0) return '#f5f5f5';
    if (pct <= 10) return '#bbdefb';
    if (pct <= 25) return '#64b5f6';
    if (pct <= 50) return '#1976d2';
    if (pct <= 75) return '#0d47a1';
    return '#002171';
  };

  const getTextColor = (pct: number): string => {
    return pct > 50 ? '#ffffff' : '#000000';
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
    <Paper sx={{ p: 2, overflow: 'auto' }}>
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
          color: 'rgba(0, 0, 0, 0.7)',
        }}
      >
        🔥 Доля по месяцам (%)
      </Typography>
      <TableContainer>
        <Table size="small" sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', position: 'sticky', left: 0, bgcolor: 'grey.100', zIndex: 1 }}>
                Товар
              </TableCell>
              {displayMonths.map((month) => (
                <TableCell
                  key={month}
                  align="center"
                  sx={{ fontWeight: 'bold', minWidth: 40 }}
                >
                  {month}
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }} align="center">
                Итого
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
                        bgcolor: 'background.paper',
                        zIndex: 1,
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
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
                    <TableCell align="center" sx={{ bgcolor: 'transparent', py: 0.5, px: 0.25 }}>
                      <Box
                        sx={{
                          width: '100%',
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#E3F2FD',
                          borderRadius: 6,
                          color: '#0D47A1',
                          fontWeight: 'bold',
                          fontSize: '11px',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                          },
                        }}
                      >
                        {row['total_pct']}%
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
