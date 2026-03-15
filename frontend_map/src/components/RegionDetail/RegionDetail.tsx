import { useState, useEffect } from 'react';
import type { RegionData, SupplierData, CategoryData } from '../../api/mapApi';
import { mapApi } from '../../api/mapApi';
import { KpiCard } from '../ui/KpiCard';
import { InfoSection } from '../ui/InfoSection';
import { Button, Box, List, ListItem, ListItemText, Skeleton } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';

interface RegionDetailProps {
  region: string;
  data: RegionData | null;
  onClose: () => void;
  isLoading?: boolean;
}

// Цвета для диаграммы категорий (в стиле CGM Dashboard)
const CHART_COLORS = [
  '#3388ff', // Синий
  '#4fc3f7', // Голубой
  '#29b6f6', // Светло-голубой
  '#00bcd4', // Циан
  '#ff9800', // Оранжевый
  '#ff5722', // Красно-оранжевый
  '#795548', // Коричневый
  '#9c27b0', // Фиолетовый
];

export const RegionDetail: React.FC<RegionDetailProps> = ({ 
  region, 
  data, 
  onClose, 
  isLoading = false 
}) => {
  // Состояния для детализации
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const formatMoney = (value: number) => {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)} млрд ₽`;
    }
    if (value >= 1e6) {
      return `${(value / 1e6).toFixed(1)} млн ₽`;
    }
    if (value >= 1e3) {
      return `${(value / 1e3).toFixed(0)} тыс ₽`;
    }
    return `${value.toFixed(0)} ₽`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('ru-RU');
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  // Загрузка детализации при открытии региона
  useEffect(() => {
    if (!region) return;
    
    const loadDetail = async () => {
      setDetailLoading(true);
      try {
        const [suppliersData, categoriesData] = await Promise.all([
          mapApi.getRegionSuppliers(region, { limit: 5 }),
          mapApi.getRegionCategories(region, { limit: 7 })
        ]);
        setSuppliers(suppliersData);
        setCategories(categoriesData);
        console.log('✅ Region detail loaded:', {
          suppliers: suppliersData.length,
          categories: categoriesData.length
        });
      } catch (error) {
        console.error('❌ Error loading region detail:', error);
      } finally {
        setDetailLoading(false);
      }
    };

    loadDetail();
  }, [region]);

  const handleExport = () => {
    if (!data) return;

    const csvContent = [
      ['Метрика', 'Значение'],
      ['Регион', region],
      ['Общая сумма', data.sum],
      ['Количество контрактов', data.count],
      ['Средний контракт', data.count > 0 ? data.sum / data.count : 0],
      ['Объём (шт)', data.quantity],
      ['Дата экспорта', new Date().toISOString().split('T')[0]],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${region.replace(/[^a-zA-Zа-яА-ЯёЁ0-9]/g, '_')}_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Вычисление общей суммы для процентов в категориях
  const totalCategoriesAmount = categories.reduce((sum, c) => sum + c.amount, 0);

  // Данные для диаграммы
  const chartData = categories.map((c, index) => ({
    name: c.what_purchased.length > 25 
      ? c.what_purchased.substring(0, 25) + '...' 
      : c.what_purchased,
    value: c.amount,
    percentage: formatPercentage(c.amount, totalCategoriesAmount),
    color: CHART_COLORS[index % CHART_COLORS.length]
  }));

  return (
    <div className="region-info-panel" role="dialog" aria-label={`Панель региона: ${region}`} aria-modal="true">
      <div className="region-info-header">
        <h2>{region}</h2>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleExport}
            startIcon={<FileDownloadIcon />}
            disabled={!data}
            sx={{
              color: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              fontSize: '11px',
              textTransform: 'none',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
                background: 'rgba(255, 255, 255, 0.1)',
              },
              '&:disabled': {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            Экспорт CSV
          </Button>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label={`Закрыть панель региона ${region}`}
            tabIndex={0}
          >
            ✕
          </button>
        </Box>
      </div>

      <div className="region-info-content">
        {/* KPI карточки */}
        <div className="region-kpi-grid">
          {isLoading ? (
            <>
              <KpiCard label="Общая сумма" value="—" loading />
              <KpiCard label="Контрактов" value="—" loading />
              <KpiCard label="Средний контракт" value="—" loading />
              <KpiCard label="Объём (шт)" value="—" loading />
            </>
          ) : (
            <>
              <KpiCard
                label="Общая сумма"
                value={data ? formatMoney(data.sum) : '—'}
                highlight
                tooltip="Общая сумма всех закупок в регионе"
              />
              <KpiCard
                label="Контрактов"
                value={data ? formatNumber(data.count) : '—'}
                tooltip="Количество заключённых контрактов"
              />
              <KpiCard
                label="Средний контракт"
                value={data && data.count > 0 ? formatMoney(data.sum / data.count) : '—'}
                tooltip="Рассчитывается как: Общая сумма / Количество контрактов"
              />
              <KpiCard
                label="Объём (шт)"
                value={data ? formatNumber(data.quantity) : '—'}
                tooltip="Общий объём закупленных товаров в штуках"
              />
            </>
          )}
        </div>

        {/* InfoSection #1: Топ поставщиков */}
        <InfoSection title="Топ поставщиков">
          {detailLoading ? (
            <div className="suppliers-skeleton">
              {[1, 2, 3, 4, 5].map((i) => (
                <Box key={i} className="supplier-skeleton-line">
                  <Skeleton variant="text" width="70%" height={14} />
                  <Skeleton variant="text" width="25%" height={12} />
                </Box>
              ))}
            </div>
          ) : suppliers.length > 0 ? (
            <List className="suppliers-list" dense>
              {suppliers.map((supplier, index) => (
                <ListItem 
                  key={supplier.distributor} 
                  className="supplier-item"
                  sx={{ 
                    px: 0,
                    py: 1,
                    alignItems: 'flex-start'
                  }}
                >
                  <Box 
                    className="supplier-rank"
                    sx={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#ffffff',
                      background: CHART_COLORS[index % CHART_COLORS.length],
                      minWidth: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                      flexShrink: 0
                    }}
                  >
                    {index + 1}
                  </Box>
                  <ListItemText
                    primary={supplier.distributor}
                    secondary={formatMoney(supplier.amount)}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#ffffff !important',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      },
                      '& .MuiListItemText-secondary': {
                        fontSize: '11px',
                        color: 'rgba(255, 255, 255, 0.65) !important',
                        fontWeight: 600,
                        mt: 0.5
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <div className="info-section-placeholder">
              <p className="info-section-placeholder-title">📭 Нет данных</p>
              <p className="info-section-placeholder-subtitle">
                По выбранному региону нет данных о поставщиках
              </p>
            </div>
          )}
        </InfoSection>

        {/* InfoSection #2: Категории продуктов */}
        <InfoSection title="Категории продуктов">
          {detailLoading ? (
            <Skeleton variant="rectangular" width="100%" height={200} className="chart-skeleton" />
          ) : categories.length > 0 ? (
            <Box>
              <ResponsiveContainer width="100%" height={Math.max(200, categories.length * 36)}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={150}
                    tick={{
                      fill: 'rgba(255, 255, 255, 0.82)',
                      fontSize: 11,
                      fontFamily: 'Inter, sans-serif'
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    formatter={(value) => formatMoney(Number(value))}
                    contentStyle={{
                      background: 'rgba(15, 12, 41, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    itemStyle={{ color: '#ffffff' }}
                    labelStyle={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: 11 }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[0, 4, 4, 0]}
                    barSize={24}
                    animationDuration={600}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              {/* Легенда с процентами под диаграммой */}
              <Box className="categories-legend">
                {chartData.map((entry, index) => (
                  <Box
                    key={entry.name}
                    className="legend-item"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      cursor: 'default',
                      transition: 'background var(--duration-fast) var(--ease-out)',
                      padding: 'var(--space-1) var(--space-2)',
                      borderRadius: 'var(--radius-sm)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.05)'
                      }
                    }}
                  >
                    <Box
                      className="legend-color"
                      sx={{
                        width: '14px',
                        height: '14px',
                        borderRadius: 'var(--radius-sm)',
                        flexShrink: 0,
                        backgroundColor: entry.color,
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                    />
                    <Box
                      className="legend-label"
                      sx={{
                        flex: 1,
                        fontSize: '11px',
                        color: 'rgba(255, 255, 255, 0.82) !important',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: 500
                      }}
                    >
                      {entry.name}
                    </Box>
                    <Box
                      className="legend-value"
                      sx={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--accent-secondary) !important',
                        whiteSpace: 'nowrap',
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      {formatMoney(entry.value)}
                    </Box>
                    <Box
                      className="legend-percentage"
                      sx={{
                        fontSize: '10px',
                        color: 'rgba(255, 255, 255, 0.5)',
                        ml: 'var(--space-1)',
                        fontWeight: 500
                      }}
                    >
                      ({entry.percentage})
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            <div className="info-section-placeholder">
              <p className="info-section-placeholder-title">📭 Нет данных</p>
              <p className="info-section-placeholder-subtitle">
                По выбранному региону нет данных о категориях
              </p>
            </div>
          )}
        </InfoSection>
      </div>
    </div>
  );
};
