import { useMemo } from 'react';

interface RegionData {
  region: string;
  sum: number;
  count: number;
}

interface MapLegendProps {
  regionData: RegionData[];
}

export const MapLegend: React.FC<MapLegendProps> = ({ regionData }) => {
  const { maxSum, minSum, hasDataCount, noDataCount } = useMemo(() => {
    const sums = regionData.map(r => r.sum).filter(s => s > 0);
    const max = sums.length > 0 ? Math.max(...sums) : 0;
    const min = sums.length > 0 ? Math.min(...sums) : 0;
    
    return {
      maxSum: max,
      minSum: min,
      hasDataCount: regionData.filter(r => r.sum > 0).length,
      noDataCount: regionData.filter(r => r.sum === 0).length,
    };
  }, [regionData]);

  const formatMoney = (value: number) => {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(1)} млрд ₽`;
    }
    if (value >= 1e6) {
      return `${(value / 1e6).toFixed(0)} млн ₽`;
    }
    return `${(value / 1e3).toFixed(0)} тыс ₽`;
  };

  const getColorForIntensity = (intensity: number) => {
    const baseOpacity = 0.3;
    const maxOpacity = 0.9;
    const opacity = baseOpacity + (maxOpacity - baseOpacity) * intensity;
    return `rgba(51, 136, 255, ${opacity})`;
  };

  return (
    <div className="map-legend" role="complementary" aria-label="Легенда карты">
      <h4>Сумма закупок</h4>
      <div className="legend-gradient">
        <div className="legend-step">
          <div
            className="legend-color"
            style={{ background: getColorForIntensity(1) }}
          />
          <span>{formatMoney(maxSum)}</span>
        </div>
        <div className="legend-step">
          <div
            className="legend-color"
            style={{ background: getColorForIntensity(0.66) }}
          />
          <span>{formatMoney(maxSum * 0.66)}</span>
        </div>
        <div className="legend-step">
          <div
            className="legend-color"
            style={{ background: getColorForIntensity(0.33) }}
          />
          <span>{formatMoney(maxSum * 0.33)}</span>
        </div>
        <div className="legend-step">
          <div
            className="legend-color"
            style={{ background: getColorForIntensity(0) }}
          />
          <span>{formatMoney(minSum)}</span>
        </div>
        <div className="legend-step legend-separator">
          <div className="legend-color" style={{ background: 'rgba(100, 100, 100, 0.2)' }} />
          <span>Нет данных ({noDataCount})</span>
        </div>
      </div>
    </div>
  );
};
