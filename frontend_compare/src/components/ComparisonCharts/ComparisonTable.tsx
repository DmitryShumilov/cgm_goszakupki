import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { compareApi } from '../../api/compareApi';
import { useComparisonStore } from '../../stores/comparisonStore';
import { formatCurrency, formatNumber, getTrendIcon, getTrendColor } from '../../utils/formatters';
import type { ComparisonTableData } from '../../types';
import DownloadIcon from '@mui/icons-material/Download';

interface ComparisonTableProps {
  loading?: boolean;
}

type Order = 'asc' | 'desc';
type OrderBy = 'region' | 'periodA_amount' | 'periodB_amount' | 'absoluteDiff' | 'percentDiff';

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ loading }) => {
  const { periodA, periodB } = useComparisonStore();
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('absoluteDiff');

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

  // Загрузка данных таблицы сравнения
  const { data, isLoading, error } = useQuery<ComparisonTableData>({
    queryKey: ['comparison-table', periodA, periodB],
    queryFn: () => compareApi.getComparisonTable(paramsA, paramsB),
    enabled: !loading,
    staleTime: 5 * 60 * 1000,
  });

  // Сортировка данных
  const sortedData = useMemo(() => {
    if (!data?.rows) return [];

    return [...data.rows].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (orderBy) {
        case 'region':
          aValue = a.region.toLowerCase();
          bValue = b.region.toLowerCase();
          break;
        case 'periodA_amount':
          aValue = a.periodA_amount;
          bValue = b.periodA_amount;
          break;
        case 'periodB_amount':
          aValue = a.periodB_amount;
          bValue = b.periodB_amount;
          break;
        case 'absoluteDiff':
          aValue = Math.abs(a.absoluteDiff);
          bValue = Math.abs(b.absoluteDiff);
          break;
        case 'percentDiff':
          aValue = Math.abs(a.percentDiff);
          bValue = Math.abs(b.percentDiff);
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return order === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [data, order, orderBy]);

  // Экспорт в CSV
  const handleExportCsv = () => {
    if (!data?.rows) return;

    const headers = ['Регион', 'Период А (сумма)', 'Период Б (сумма)', 'Период А (контракты)', 'Период Б (контракты)', 'Изменение (сумма)', 'Изменение (%)', 'Тренд'];
    const csvRows = sortedData.map((row) => [
      row.region,
      row.periodA_amount,
      row.periodB_amount,
      row.periodA_count,
      row.periodB_count,
      row.absoluteDiff,
      row.percentDiff,
      row.trend,
    ]);

    const csv = [
      headers.join(','),
      ...csvRows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cgm_comparison_regions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

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

  const createSortHandler = (property: OrderBy) => () => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(15, 12, 41, 0.95) 0%, rgba(48, 43, 99, 0.85) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
      }}
      data-testid="table-comparison"
      role="region"
      aria-label="Таблица сравнения регионов"
    >
      {/* Заголовок */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
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
          📋 Детальное сравнение по регионам
        </Typography>
        <Tooltip title="Экспорт в CSV">
          <IconButton
            onClick={handleExportCsv}
            sx={{
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
              },
            }}
            aria-label="Экспорт в CSV"
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Таблица */}
      <TableContainer sx={{ maxHeight: 500 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                sortDirection={orderBy === 'region' ? order : false}
                sx={{
                  color: 'rgba(255,255,255,0.85)',
                  fontWeight: 600,
                  fontSize: '13px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  bgcolor: 'rgba(15, 12, 41, 0.95)',
                }}
              >
                <TableSortLabel
                  active={orderBy === 'region'}
                  direction={orderBy === 'region' ? order : 'asc'}
                  onClick={createSortHandler('region')}
                  sx={{
                    '& .MuiTableSortLabel-icon': {
                      color: 'rgba(255,255,255,0.5) !important',
                    },
                    '&.Mui-active': {
                      color: '#fff !important',
                    },
                    '& .MuiTableSortLabel-iconContainer': {
                      color: 'inherit',
                    },
                  }}
                >
                  Регион
                </TableSortLabel>
              </TableCell>
              <TableCell
                sortDirection={orderBy === 'periodA_amount' ? order : false}
                sx={{
                  color: 'rgba(255,255,255,0.85)',
                  fontWeight: 600,
                  fontSize: '13px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  bgcolor: 'rgba(15, 12, 41, 0.95)',
                  textAlign: 'right',
                }}
              >
                <TableSortLabel
                  active={orderBy === 'periodA_amount'}
                  direction={orderBy === 'periodA_amount' ? order : 'asc'}
                  onClick={createSortHandler('periodA_amount')}
                  sx={{
                    '& .MuiTableSortLabel-icon': {
                      color: 'rgba(255,255,255,0.5) !important',
                    },
                    '&.Mui-active': {
                      color: '#fff !important',
                    },
                    '& .MuiTableSortLabel-iconContainer': {
                      color: 'inherit',
                    },
                  }}
                >
                  Период А (сумма)
                </TableSortLabel>
              </TableCell>
              <TableCell
                sortDirection={orderBy === 'periodB_amount' ? order : false}
                sx={{
                  color: 'rgba(255,255,255,0.85)',
                  fontWeight: 600,
                  fontSize: '13px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  bgcolor: 'rgba(15, 12, 41, 0.95)',
                  textAlign: 'right',
                }}
              >
                <TableSortLabel
                  active={orderBy === 'periodB_amount'}
                  direction={orderBy === 'periodB_amount' ? order : 'asc'}
                  onClick={createSortHandler('periodB_amount')}
                  sx={{
                    '& .MuiTableSortLabel-icon': {
                      color: 'rgba(255,255,255,0.5) !important',
                    },
                    '&.Mui-active': {
                      color: '#fff !important',
                    },
                    '& .MuiTableSortLabel-iconContainer': {
                      color: 'inherit',
                    },
                  }}
                >
                  Период Б (сумма)
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  color: 'rgba(255,255,255,0.85)',
                  fontWeight: 600,
                  fontSize: '13px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  bgcolor: 'rgba(15, 12, 41, 0.95)',
                  textAlign: 'center',
                }}
              >
                Контракты
              </TableCell>
              <TableCell
                sortDirection={orderBy === 'absoluteDiff' ? order : false}
                sx={{
                  color: 'rgba(255,255,255,0.85)',
                  fontWeight: 600,
                  fontSize: '13px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  bgcolor: 'rgba(15, 12, 41, 0.95)',
                  textAlign: 'right',
                }}
              >
                <TableSortLabel
                  active={orderBy === 'absoluteDiff'}
                  direction={orderBy === 'absoluteDiff' ? order : 'asc'}
                  onClick={createSortHandler('absoluteDiff')}
                  sx={{
                    '& .MuiTableSortLabel-icon': {
                      color: 'rgba(255,255,255,0.5) !important',
                    },
                    '&.Mui-active': {
                      color: '#fff !important',
                    },
                    '& .MuiTableSortLabel-iconContainer': {
                      color: 'inherit',
                    },
                  }}
                >
                  Изменение (сумма)
                </TableSortLabel>
              </TableCell>
              <TableCell
                sortDirection={orderBy === 'percentDiff' ? order : false}
                sx={{
                  color: 'rgba(255,255,255,0.85)',
                  fontWeight: 600,
                  fontSize: '13px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  bgcolor: 'rgba(15, 12, 41, 0.95)',
                  textAlign: 'right',
                }}
              >
                <TableSortLabel
                  active={orderBy === 'percentDiff'}
                  direction={orderBy === 'percentDiff' ? order : 'asc'}
                  onClick={createSortHandler('percentDiff')}
                  sx={{
                    '& .MuiTableSortLabel-icon': {
                      color: 'rgba(255,255,255,0.5) !important',
                    },
                    '&.Mui-active': {
                      color: '#fff !important',
                    },
                    '& .MuiTableSortLabel-iconContainer': {
                      color: 'inherit',
                    },
                  }}
                >
                  Изменение (%)
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  color: 'rgba(255,255,255,0.85)',
                  fontWeight: 600,
                  fontSize: '13px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  bgcolor: 'rgba(15, 12, 41, 0.95)',
                  textAlign: 'center',
                }}
              >
                Тренд
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((row) => {
              const trendColor = getTrendColor(row.trend);
              const trendIcon = getTrendIcon(row.trend);

              return (
                <TableRow
                  key={row.region}
                  sx={{
                    '&:hover': {
                      background: 'rgba(255,255,255,0.05)',
                    },
                    '&:last-child td, &:last-child th': {
                      border: 0,
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      color: '#fff',
                      fontSize: '14px',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {row.region}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      textAlign: 'right',
                    }}
                  >
                    {formatCurrency(row.periodA_amount)}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      textAlign: 'right',
                    }}
                  >
                    {formatCurrency(row.periodB_amount)}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '13px',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      textAlign: 'center',
                    }}
                  >
                    {row.periodA_count} → {row.periodB_count}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: row.absoluteDiff > 0 ? '#38EF7D' : row.absoluteDiff < 0 ? '#FF6B6B' : 'rgba(255,255,255,0.8)',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      textAlign: 'right',
                    }}
                  >
                    {row.absoluteDiff > 0 ? '+' : ''}{formatNumber(Math.abs(row.absoluteDiff))} ₽
                  </TableCell>
                  <TableCell
                    sx={{
                      color: row.percentDiff > 0 ? '#38EF7D' : row.percentDiff < 0 ? '#FF6B6B' : 'rgba(255,255,255,0.8)',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      textAlign: 'right',
                    }}
                  >
                    {row.percentDiff > 0 ? '+' : ''}{row.percentDiff.toFixed(1)}%
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: 'center',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <Typography
                      sx={{
                        color: trendColor,
                        fontWeight: 700,
                        fontSize: '16px',
                      }}
                    >
                      {trendIcon}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Итоговая строка */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          Всего регионов: {sortedData.length}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          📈 Рост: {sortedData.filter((r) => r.trend === 'growth').length} |
          📉 Падение: {sortedData.filter((r) => r.trend === 'decline').length} |
          ➡️ Стабильно: {sortedData.filter((r) => r.trend === 'stable').length}
        </Typography>
      </Box>
    </Paper>
  );
};
