import { useEffect } from 'react';
import {
  Box,
  Button,
  Autocomplete,
  TextField,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { useFilterStore } from '../stores/filterStore';
import { mapApi } from '../api/mapApi';

interface HeaderFiltersProps {
  onFiltersChange: () => void;
  regionCount: number;
}

export const HeaderFilters = ({ onFiltersChange, regionCount }: HeaderFiltersProps) => {
  const {
    selectedYears,
    selectedRegions,
    selectedSuppliers,
    selectedProducts,
    availableYears,
    availableRegions,
    availableSuppliers,
    availableProducts,
    setAvailableYears,
    setAvailableRegions,
    setAvailableSuppliers,
    setAvailableProducts,
    toggleYear,
    toggleRegion,
    toggleSupplier,
    toggleProduct,
    resetFilters,
  } = useFilterStore();

  // Загрузка доступных значений для фильтров
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [years, regions, suppliers, products] = await Promise.all([
          mapApi.getYears(),
          mapApi.getRegionsList(),
          mapApi.getSuppliers(),
          mapApi.getProducts(),
        ]);

        setAvailableYears(years);
        setAvailableRegions(regions);
        setAvailableSuppliers(suppliers);
        setAvailableProducts(products);
      } catch (error) {
        console.error('Ошибка загрузки фильтров:', error);
      }
    };

    loadFilterOptions();
  }, []);

  // Уведомление родительского компонента об изменении фильтров
  useEffect(() => {
    onFiltersChange();
  }, [selectedYears, selectedRegions, selectedSuppliers, selectedProducts, onFiltersChange]);

  const handleReset = () => {
    resetFilters();
  };

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      flexWrap: 'nowrap',
      backdropFilter: 'none !important',
    }}>
      {/* Фильтр: Год */}
      <Autocomplete
        multiple
        size="small"
        aria-label="Фильтр по году"
        options={availableYears}
        value={selectedYears}
        onChange={(_, newValue) => {
          availableYears.forEach((y) => {
            if (!newValue.includes(y) && selectedYears.includes(y)) {
              toggleYear(y);
            }
          });
          newValue.forEach((y) => {
            if (!selectedYears.includes(y)) {
              toggleYear(y);
            }
          });
        }}
        slotProps={{
          paper: {
            sx: {
              background: 'linear-gradient(180deg, #1a3a5c 0%, #0D2B4A 100%)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.2)',
              '& .MuiAutocomplete-option': {
                color: '#FFFFFF',
                fontSize: '14px',
                '&:hover': {
                  background: 'rgba(0, 180, 219, 0.2)',
                },
                '&[aria-selected="true"]': {
                  background: 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)',
                  color: '#FFFFFF',
                },
              },
            },
          },
        }}
        renderOption={(props, option, { selected }) => {
          const allSelected = selectedYears.length === availableYears.length && availableYears.length > 0;
          const isFirstOption = option === availableYears[0];
          
          // Первая опция - "Выбрать всё"
          if (isFirstOption) {
            return (
              <Box
                key="select-all"
                onClick={() => {
                  if (allSelected) {
                    availableYears.forEach(y => toggleYear(y));
                  } else {
                    availableYears.forEach(y => {
                      if (!selectedYears.includes(y)) toggleYear(y);
                    });
                  }
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  fontWeight: 600,
                  backgroundColor: 'rgba(51, 136, 255, 0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(51, 136, 255, 0.25)',
                  },
                }}
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  readOnly
                  style={{ marginRight: 8, accentColor: '#3388ff', pointerEvents: 'none' }}
                  onClick={(e) => e.stopPropagation()}
                />
                {allSelected ? 'Сбросить всё' : 'Выбрать всё'}
              </Box>
            );
          }
          
          // Остальные опции - годы
          return (
            <li {...props}>
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleYear(option);
                }}
                style={{ marginRight: 8, accentColor: '#3388ff' }}
              />
              {option}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Год"
            InputProps={{
              ...params.InputProps,
              sx: {
                color: '#ffffff !important',
                fontSize: '14px',
                backgroundColor: 'rgba(51, 136, 255, 0.2)',
                '&::placeholder': {
                  color: 'rgba(255,255,255,0.82) !important',
                  opacity: 1,
                },
              },
            }}
            sx={{
              minWidth: 140,
              '& .MuiOutlinedInput-root': {
                background: 'rgba(51, 136, 255, 0.2)',
                borderRadius: '8px',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '& input': {
                  color: '#ffffff !important',
                  WebkitTextFillColor: '#ffffff !important',
                  '&::placeholder': {
                    color: 'rgba(255,255,255,0.82) !important',
                    opacity: 1,
                  },
                },
              },
            }}
          />
        )}
        renderValue={(selected) => {
          if (selected.length === 0) return null;

          return (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'nowrap', alignItems: 'center' }}>
              {selected.slice(0, 2).map((year) => (
                <Chip
                  key={year}
                  label={year}
                  size="small"
                  onDelete={() => toggleYear(year)}
                  sx={{
                    bgcolor: 'rgba(51, 136, 255, 0.2)',
                    color: '#ffffff',
                    border: '1px solid rgba(51, 136, 255, 0.3)',
                    height: '24px',
                    '& .MuiChip-deleteIcon': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&:hover': { color: '#ffffff' },
                    },
                  }}
                />
              ))}
              {selected.length > 2 && (
                <Chip
                  label={`+${selected.length - 2}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(51, 136, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(51, 136, 255, 0.2)',
                    height: '24px',
                    minWidth: '32px',
                  }}
                />
              )}
            </Box>
          );
        }}
      />

      {/* Фильтр: Продукты */}
      <Autocomplete
        multiple
        size="small"
        aria-label="Фильтр по продуктам"
        options={availableProducts}
        value={selectedProducts}
        onChange={(_, newValue) => {
          availableProducts.forEach((p) => {
            if (!newValue.includes(p) && selectedProducts.includes(p)) {
              toggleProduct(p);
            }
          });
          newValue.forEach((p) => {
            if (!selectedProducts.includes(p)) {
              toggleProduct(p);
            }
          });
        }}
        slotProps={{
          paper: {
            sx: {
              background: 'linear-gradient(180deg, #1a3a5c 0%, #0D2B4A 100%)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.2)',
              '& .MuiAutocomplete-option': {
                color: '#FFFFFF',
                fontSize: '14px',
                '&:hover': {
                  background: 'rgba(0, 180, 219, 0.2)',
                },
                '&[aria-selected="true"]': {
                  background: 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)',
                  color: '#FFFFFF',
                },
              },
            },
          },
        }}
        renderValue={() => null}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={selectedProducts.length === 0 ? 'Продукты' : undefined}
            InputProps={{
              ...params.InputProps,
              sx: {
                color: '#ffffff !important',
                fontSize: '14px',
                backgroundColor: selectedProducts.length > 0 ? 'transparent !important' : 'rgba(51, 136, 255, 0.2)',
                '&::placeholder': {
                  color: 'rgba(255,255,255,0.82) !important',
                  opacity: 1,
                },
              },
            }}
            sx={{
              minWidth: 220,
              '& .MuiOutlinedInput-root': {
                background: 'rgba(51, 136, 255, 0.2)',
                borderRadius: '8px',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '& input': {
                  color: '#ffffff !important',
                  WebkitTextFillColor: '#ffffff !important',
                  '&::placeholder': {
                    color: 'rgba(255,255,255,0.82) !important',
                    opacity: 1,
                  },
                },
              },
            }}
          />
        )}
      />

      {/* Фильтр: Поставщик */}
      <Autocomplete
        multiple
        size="small"
        aria-label="Фильтр по поставщику"
        options={availableSuppliers}
        value={selectedSuppliers}
        onChange={(_, newValue) => {
          availableSuppliers.forEach((s) => {
            if (!newValue.includes(s) && selectedSuppliers.includes(s)) {
              toggleSupplier(s);
            }
          });
          newValue.forEach((s) => {
            if (!selectedSuppliers.includes(s)) {
              toggleSupplier(s);
            }
          });
        }}
        slotProps={{
          paper: {
            sx: {
              background: 'linear-gradient(180deg, #1a3a5c 0%, #0D2B4A 100%)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.2)',
              '& .MuiAutocomplete-option': {
                color: '#FFFFFF',
                fontSize: '14px',
                '&:hover': {
                  background: 'rgba(0, 180, 219, 0.2)',
                },
                '&[aria-selected="true"]': {
                  background: 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)',
                  color: '#FFFFFF',
                },
              },
            },
          },
        }}
        renderValue={() => null}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={selectedSuppliers.length === 0 ? 'Поставщик' : undefined}
            InputProps={{
              ...params.InputProps,
              sx: {
                color: '#ffffff !important',
                fontSize: '14px',
                backgroundColor: selectedSuppliers.length > 0 ? 'transparent !important' : 'rgba(51, 136, 255, 0.2)',
                '&::placeholder': {
                  color: 'rgba(255,255,255,0.82) !important',
                  opacity: 1,
                },
              },
            }}
            sx={{
              minWidth: 220,
              '& .MuiOutlinedInput-root': {
                background: 'rgba(51, 136, 255, 0.2)',
                borderRadius: '8px',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '& input': {
                  color: '#ffffff !important',
                  WebkitTextFillColor: '#ffffff !important',
                  '&::placeholder': {
                    color: 'rgba(255,255,255,0.82) !important',
                    opacity: 1,
                  },
                },
              },
            }}
          />
        )}
      />

      {/* Кнопка сброса фильтров */}
      <Tooltip title="Сбросить фильтры">
        <IconButton
          onClick={handleReset}
          size="small"
          aria-label="Сбросить все фильтры"
          tabIndex={0}
          sx={{
            color: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(255,255,255,0.3)',
            '&:hover': {
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.5)',
            },
          }}
        >
          <ClearAllIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Счётчик регионов */}
      <Box
        className="region-count-badge"
        role="status"
        aria-live="polite"
        aria-label={`Показано ${regionCount} регионов с данными`}
        sx={{
          padding: '8px 16px',
          background: 'rgba(51, 136, 255, 0.2)',
          border: '1px solid rgba(51, 136, 255, 0.3)',
          borderRadius: '8px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '12px',
          whiteSpace: 'nowrap',
        }}
      >
        Регионов: {regionCount}
      </Box>
    </Box>
  );
};
