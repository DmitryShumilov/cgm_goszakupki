import { useEffect, useState, useRef } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { normalizeRegionName } from '../../utils/regionMapping';

// Компонент управления зумом
const ZoomControl: React.FC = () => {
  const map = useMap();

  const zoomIn = () => map.zoomIn();
  const zoomOut = () => map.zoomOut();

  const handleZoomInKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      zoomIn();
    }
  };

  const handleZoomOutKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      zoomOut();
    }
  };

  return (
    <div className="leaflet-bar leaflet-control leaflet-control-custom-zoom">
      <button
        onClick={zoomIn}
        onKeyDown={handleZoomInKeyDown}
        aria-label="Увеличить масштаб"
        tabIndex={0}
        className="leaflet-control-zoom-in"
      >
        +
      </button>
      <button
        onClick={zoomOut}
        onKeyDown={handleZoomOutKeyDown}
        aria-label="Уменьшить масштаб"
        tabIndex={0}
        className="leaflet-control-zoom-out"
      >
        −
      </button>
    </div>
  );
};

// Исправление иконки маркера Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Преобразование координат для корректного отображения регионов с переходом через 180-й меридиан
// Разделяем полигоны, пересекающие 180-й меридиан, на две части
function normalizeCoordinates(geojson: any): any {
  if (!geojson || !geojson.features) return geojson;
  
  return {
    ...geojson,
    features: geojson.features.map((feature: any) => {
      const geom = feature.geometry;
      if (!geom) return feature;
      
      const splitCoords = (coords: any[]): any[] => {
        if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
          return coords;
        }
        
        // Проверяем, пересекает ли полигон 180-й меридиан
        const longitudes = coords.flat(2).filter((c: any) => typeof c[0] === 'number').map((c: any) => c[0]);
        const hasNegative = longitudes.some((lon: number) => lon < 0);
        const hasPositive = longitudes.some((lon: number) => lon > 0);
        
        if (hasNegative && hasPositive) {
          // Полигон пересекает 180-й меридиан - сдвигаем отрицательные на +360
          const adjustCoords = (c: any[]): any[] => {
            if (typeof c[0] === 'number' && typeof c[1] === 'number') {
              return c[0] < 0 ? [c[0] + 360, c[1]] : c;
            }
            return c.map(adjustCoords);
          };
          return coords.map(adjustCoords);
        }
        
        return coords.map(splitCoords);
      };
      
      return {
        ...feature,
        geometry: {
          ...geom,
          coordinates: splitCoords(geom.coordinates)
        }
      };
    })
  };
}

interface RegionData {
  region: string;
  sum: number;
  count: number;
  quantity: number;
}

interface MapProps {
  onRegionSelect: (region: string) => void;
  regionData: RegionData[];
  selectedRegion: string | null;
}

const getRegionColor = (regionName: string, regionData: RegionData[], maxSum: number): string => {
  const normalizedDbName = normalizeRegionName(regionName);
  const data = regionData.find(r => r.region === normalizedDbName);
  
  if (!data || data.sum === 0) {
    return 'rgba(100, 100, 100, 0.3)';
  }
  
  const intensity = maxSum > 0 ? data.sum / maxSum : 0;
  return `rgba(51, 136, 255, ${0.4 + (0.8 - 0.4) * intensity})`;
};

export const Map: React.FC<MapProps> = ({ onRegionSelect, regionData, selectedRegion }) => {
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [maxSum, setMaxSum] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Используем ref для доступа к актуальному selectedRegion в обработчиках событий
  const selectedRegionRef = useRef(selectedRegion);
  useEffect(() => {
    selectedRegionRef.current = selectedRegion;
  }, [selectedRegion]);

  useEffect(() => {
    fetch('/russia_regions.geojson')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('✅ GeoJSON loaded:', data.features?.length, 'features');
        console.log('CRS:', data.crs?.properties?.name || 'WGS84 (default)');
        
        // Нормализуем координаты для корректного отображения
        const normalized = normalizeCoordinates(data);
        console.log('✅ Coordinates normalized');
        
        // russia_regions.geojson уже в WGS84, преобразование не нужно
        setGeojsonData(normalized);
      })
      .catch(err => {
        console.error('❌ Failed to load GeoJSON:', err);
        setLoadError('Не удалось загрузить карту');
      });
  }, []);

  useEffect(() => {
    if (regionData.length > 0) {
      const max = Math.max(...regionData.map(r => r.sum));
      setMaxSum(max);
    }
  }, [regionData]);

  const onEachFeature = (feature: any, layer: any) => {
    const geojsonRegionName = feature.properties.region || feature.properties.name;
    const normalizedDbName = normalizeRegionName(geojsonRegionName);
    const data = regionData.find(r => r.region === normalizedDbName);

    // Устанавливаем cursor pointer для всех регионов
    layer.on('add', () => {
      layer.setStyle({ cursor: 'pointer' });
    });

    // Используем mouseover и mouseout события Leaflet
    layer.on('mouseover', function(e: any) {
      const layer = e.target;
      const isSelected = selectedRegionRef.current === normalizedDbName;

      layer.setStyle({
        fillOpacity: 0.9,
        weight: 3,
        color: isSelected ? '#ff9800' : '#ffffff',
        fillColor: isSelected ? 'rgba(255, 152, 0, 0.9)' : layer.options.fillColor
      });

      layer.bringToFront();

      if (data && data.sum > 0) {
        const tooltipContent = `<b>${geojsonRegionName}</b><br/>${(data.sum / 1e6).toFixed(1)} млн ₽<br/>${data.count} контрактов`;
        layer.bindTooltip(tooltipContent, {
          sticky: true,
          direction: 'top',
          offset: [0, -10]
        }).openTooltip();
      }
    });

    layer.on('mouseout', function() {
      layer.setStyle({ fillOpacity: 0.4, weight: 1, color: '#ffffff' });
      layer.closeTooltip();
    });

    layer.on('click', () => {
      console.log('📍 Clicked:', geojsonRegionName, '-> normalized:', normalizedDbName);
      console.log('   Data found:', data);
      onRegionSelect(normalizedDbName);
    });
  };

  const style = (feature: any): L.PathOptions => {
    const geojsonRegionName = feature.properties.region || feature.properties.name;
    const normalizedDbName = normalizeRegionName(geojsonRegionName);
    const isSelected = selectedRegion === normalizedDbName;
    const data = regionData.find(r => r.region === normalizedDbName);
    const hasData = data && data.sum > 0;

    const fillColor = isSelected ? 'rgba(255, 152, 0, 0.8)' : hasData ? getRegionColor(geojsonRegionName, regionData, maxSum) : 'rgba(100, 100, 100, 0.3)';
    const fillOpacity = isSelected ? 0.8 : 0.4;
    const strokeColor = isSelected ? '#ff9800' : '#ffffff';
    const weight = isSelected ? 3 : 1;

    return {
      fillColor,
      fillOpacity,
      color: strokeColor,
      weight,
    };
  };

  if (loadError) {
    return <div className="map-loading"><p className="map-loading-error">⚠️ {loadError}</p></div>;
  }

  if (!geojsonData) {
    return <div className="map-loading"><div className="map-loading-spinner" /><p>Загрузка карты...</p></div>;
  }

  return (
    <MapContainer
      center={[64, 100]}
      zoom={3}
      minZoom={3}
      maxZoom={8}
      scrollWheelZoom={true}
      doubleClickZoom={false}
      dragging={true}
      zoomControl={false}
      attributionControl={false}
      className="map-container"
      worldCopyJump={false}
    >
      <GeoJSON 
        data={geojsonData} 
        onEachFeature={onEachFeature} 
        style={style}
      />
      
      {/* Кастомные кнопки зума */}
      <ZoomControl />
    </MapContainer>
  );
};
