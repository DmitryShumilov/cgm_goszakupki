import type { RegionData } from '../../api/mapApi';
import { KpiCard } from '../ui/KpiCard';
import { InfoSection } from '../ui/InfoSection';
import { Button, Box } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface RegionDetailProps {
  region: string;
  data: RegionData | null;
  onClose: () => void;
  isLoading?: boolean;
}

export const RegionDetail: React.FC<RegionDetailProps> = ({ region, data, onClose, isLoading = false }) => {
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

        {/* Заглушка для будущей детализации */}
        <InfoSection title="Детализация">
          <div className="info-section-placeholder">
            <p className="info-section-placeholder-title">
              🔜 Топ поставщиков и категорий будет здесь
            </p>
            <p className="info-section-placeholder-subtitle">
              (данные будут загружены на следующем этапе)
            </p>
          </div>
        </InfoSection>
      </div>
    </div>
  );
};
