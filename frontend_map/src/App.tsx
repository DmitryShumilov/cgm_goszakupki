import { useEffect, useState, useCallback } from 'react';
import { Box, Chip } from '@mui/material';
import { useMapStore } from './stores/mapStore';
import { useFilterStore } from './stores/filterStore';
import { Map } from './components/Map/Map';
import { MapLegend } from './components/Map/MapLegend';
import { RegionDetail } from './components/RegionDetail/RegionDetail';
import { HeaderFilters } from './components/HeaderFilters';
import './styles/map.css';

function App() {
  const {
    selectedRegion,
    regionData,
    setSelectedRegion,
    clearSelection,
    loadRegionData,
    isLoading,
  } = useMapStore();

  const {
    selectedYears,
    selectedRegions,
    selectedSuppliers,
    selectedProducts,
  } = useFilterStore();

  const {
    toggleYear,
    toggleRegion,
    toggleSupplier,
    toggleProduct,
  } = useFilterStore();

  const [displayedRegionData, setDisplayedRegionData] = useState(regionData);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadRegionData();
  }, []);

  // Обработка клавиши Escape для закрытия панели региона
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedRegion) {
        clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRegion, clearSelection]);

  // Фильтрация данных при изменении фильтров
  useEffect(() => {
    let filtered = [...regionData];

    // Фильтрация по регионам
    if (selectedRegions.length > 0) {
      filtered = filtered.filter(r => selectedRegions.includes(r.region));
    }

    // В прототипе фильтрация по годам/поставщикам/продуктам не влияет на данные
    // так как в mockData нет этих полей. В будущем будет реальная фильтрация из БД.

    setDisplayedRegionData(filtered);
  }, [regionData, selectedYears, selectedRegions, selectedSuppliers, selectedProducts]);

  const selectedRegionData = displayedRegionData.find(r => r.region === selectedRegion) || null;

  // Проверка наличия активных фильтров
  const hasActiveFilters = selectedYears.length > 0 || selectedRegions.length > 0 ||
                           selectedSuppliers.length > 0 || selectedProducts.length > 0;

  // Обработчик изменения фильтров (перезагрузка данных)
  const handleFiltersChange = useCallback(() => {
    loadRegionData();
  }, [loadRegionData]);

  // Автоматическая загрузка данных при изменении фильтров
  useEffect(() => {
    loadRegionData();
  }, [selectedYears, selectedRegions, selectedSuppliers, selectedProducts]);

  return (
    <div className="map-wrapper">
      {/* Skip link для навигации с клавиатуры */}
      <a href="#main-content" className="skip-link">
        Перейти к основному содержимому
      </a>

      {/* Заголовок */}
      <header className="map-header" role="banner" aria-label="Заголовок страницы">
        <div className="map-header-content">
          <div className="map-header-title-group">
            <h1 className="map-header-title">
              🗺️ CGM Dashboard — Карта закупок
            </h1>
            <p className="map-header-subtitle">
              Интерактивная карта госзакупок по регионам России
            </p>
          </div>

          <div className="map-header-filters">
            {isLoading && (
              <div className="map-header-loading">
                <div className="map-header-loading-spinner" />
                Загрузка...
              </div>
            )}

            {/* Фильтры в хедере */}
            <HeaderFilters
              onFiltersChange={handleFiltersChange}
              regionCount={displayedRegionData.filter(r => r.sum > 0).length}
            />
          </div>
        </div>

        {/* Панель активных фильтров */}
        {hasActiveFilters && (
          <Box className="active-filters-panel">
            <Box className="active-filters-title">
              Активные фильтры:
            </Box>
            <Box className="active-filters-chips">
              {selectedYears.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  <Box sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', textTransform: 'uppercase' }}>Год:</Box>
                  {selectedYears.map((year) => (
                    <Chip
                      key={year}
                      label={year}
                      onDelete={() => toggleYear(year)}
                      className="active-filter-chip"
                      size="small"
                    />
                  ))}
                </Box>
              )}
              {selectedRegions.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  <Box sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', textTransform: 'uppercase' }}>Регион:</Box>
                  {selectedRegions.map((region) => (
                    <Chip
                      key={region}
                      label={region.length > 30 ? `${region.slice(0, 30)}...` : region}
                      onDelete={() => toggleRegion(region)}
                      className="active-filter-chip"
                      size="small"
                    />
                  ))}
                </Box>
              )}
              {selectedSuppliers.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  <Box sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', textTransform: 'uppercase' }}>Поставщик:</Box>
                  {selectedSuppliers.map((supplier) => (
                    <Chip
                      key={supplier}
                      label={supplier.length > 30 ? `${supplier.slice(0, 30)}...` : supplier}
                      onDelete={() => toggleSupplier(supplier)}
                      className="active-filter-chip"
                      size="small"
                    />
                  ))}
                </Box>
              )}
              {selectedProducts.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  <Box sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', textTransform: 'uppercase' }}>Продукт:</Box>
                  {selectedProducts.map((product) => (
                    <Chip
                      key={product}
                      label={product.length > 30 ? `${product.slice(0, 30)}...` : product}
                      onDelete={() => toggleProduct(product)}
                      className="active-filter-chip"
                      size="small"
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        )}
      </header>

      {/* Карта */}
      <main id="main-content" className="map-container-wrapper">
        <Map
          onRegionSelect={setSelectedRegion}
          regionData={displayedRegionData}
          selectedRegion={selectedRegion}
        />
      </main>

      {/* Легенда */}
      <MapLegend regionData={displayedRegionData} />

      {/* Панель региона */}
      {selectedRegion && (
        <RegionDetail
          region={selectedRegion}
          data={selectedRegionData}
          onClose={clearSelection}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

export default App;
