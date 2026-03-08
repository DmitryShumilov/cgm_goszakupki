import { useState } from 'react';
import {
  Box,
  Drawer,
  Toolbar,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  Chip,
  Autocomplete,
  TextField,
  SwipeableDrawer,
  useMediaQuery,
  useTheme,
  AppBar,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckAllIcon from '@mui/icons-material/DoneAll';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useFilterStore } from '../../stores/filterStore';

interface FilterPanelProps {
  onRefresh: () => void;
}

export const FilterPanel = ({ onRefresh }: FilterPanelProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const {
    selectedYears,
    selectedMonths,
    selectedRegions,
    selectedCustomers,
    selectedSuppliers,
    selectedProducts,
    availableYears,
    availableMonths,
    availableRegions,
    availableCustomers,
    availableSuppliers,
    availableProducts,
    toggleYear,
    toggleMonth,
    toggleRegion,
    toggleCustomer,
    toggleSupplier,
    toggleProduct,
    selectAllYears,
    selectAllMonths,
    resetFilters,
  } = useFilterStore();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const monthNames = [
    'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
    'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
  ];

  const sidebarContent = (
    <Box sx={{
      height: '100%',
      color: '#FFFFFF',
    }}>
      <Box sx={{ p: 2, minHeight: '100%' }}>
        <Box sx={{ mb: 3 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            fullWidth
            sx={{ 
              mb: 2,
              background: 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)',
              boxShadow: '0 4px 15px rgba(0, 180, 219, 0.4)',
              py: 1.2,
              fontWeight: 600,
            }}
          >
            Обновить данные
          </Button>
        </Box>

        <Paper sx={{
          p: 2,
          mb: 2,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '13px', color: '#FFFFFF' }}>Год</Typography>
            <IconButton size="small" onClick={selectAllYears} sx={{ color: '#00B4DB' }}>
              <CheckAllIcon fontSize="small" />
            </IconButton>
          </Box>
          <Grid container spacing={0.5}>
            {availableYears.map((year) => (
              <Grid size={{ xs: 3 }} key={year}>
                <Button
                  size="small"
                  variant={selectedYears.includes(year) ? 'contained' : 'outlined'}
                  onClick={() => toggleYear(year)}
                  fullWidth
                  sx={{ 
                    minWidth: 'auto', 
                    p: 0.5, 
                    fontSize: '11px',
                    fontWeight: 500,
                    background: selectedYears.includes(year) 
                      ? 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)' 
                      : 'transparent',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#FFFFFF',
                    '&:hover': {
                      background: selectedYears.includes(year) 
                        ? 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)' 
                        : 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  {year}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Paper sx={{
          p: 2,
          mb: 2,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '13px', color: '#FFFFFF' }}>Месяц</Typography>
            <IconButton size="small" onClick={selectAllMonths} sx={{ color: '#00B4DB' }}>
              <CheckAllIcon fontSize="small" />
            </IconButton>
          </Box>
          <Grid container spacing={0.5}>
            {availableMonths.map((month) => (
              <Grid size={{ xs: 3 }} key={month}>
                <Button
                  size="small"
                  variant={selectedMonths.includes(month) ? 'contained' : 'outlined'}
                  onClick={() => toggleMonth(month)}
                  fullWidth
                  sx={{ 
                    minWidth: 'auto', 
                    p: 0.5, 
                    fontSize: '10px',
                    fontWeight: 500,
                    background: selectedMonths.includes(month) 
                      ? 'linear-gradient(135deg, #11998E 0%, #38EF7D 100%)' 
                      : 'transparent',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#FFFFFF',
                    '&:hover': {
                      background: selectedMonths.includes(month) 
                        ? 'linear-gradient(135deg, #11998E 0%, #38EF7D 100%)' 
                        : 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  {monthNames[month - 1]}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Paper sx={{
          p: 2,
          mb: 2,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '13px', mb: 1, color: '#FFFFFF' }}>Продукты</Typography>
          <Autocomplete
            multiple
            size="small"
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
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Выберите продукты"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#FFFFFF',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.6)',
                  },
                }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.slice(0, 2).map((option, index) => (
                <Chip
                  label={option.length > 25 ? option.slice(0, 25) + '...' : option}
                  {...getTagProps({ index })}
                  size="small"
                  sx={{
                    background: 'rgba(0, 180, 219, 0.3)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                />
              ))
            }
            slotProps={{
              paper: {
                sx: {
                  background: 'linear-gradient(180deg, #1a3a5c 0%, #0D2B4A 100%)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '& .MuiAutocomplete-option': {
                    color: '#FFFFFF',
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
          />
        </Paper>

        <Paper sx={{
          p: 2,
          mb: 2,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '13px', mb: 1, color: '#FFFFFF' }}>Регион</Typography>
          <Autocomplete
            multiple
            size="small"
            options={availableRegions}
            value={selectedRegions}
            onChange={(_, newValue) => {
              availableRegions.forEach((r) => {
                if (!newValue.includes(r) && selectedRegions.includes(r)) {
                  toggleRegion(r);
                }
              });
              newValue.forEach((r) => {
                if (!selectedRegions.includes(r)) {
                  toggleRegion(r);
                }
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Выберите регионы"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#FFFFFF',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.6)',
                  },
                }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.slice(0, 3).map((option, index) => (
                <Chip
                  label={option.length > 15 ? option.slice(0, 15) + '...' : option}
                  {...getTagProps({ index })}
                  size="small"
                  sx={{
                    background: 'rgba(0, 180, 219, 0.3)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                />
              ))
            }
            slotProps={{
              paper: {
                sx: {
                  background: 'linear-gradient(180deg, #1a3a5c 0%, #0D2B4A 100%)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '& .MuiAutocomplete-option': {
                    color: '#FFFFFF',
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
          />
        </Paper>

        <Paper sx={{
          p: 2,
          mb: 2,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '13px', mb: 1, color: '#FFFFFF' }}>Заказчик</Typography>
          <Autocomplete
            multiple
            size="small"
            options={availableCustomers}
            value={selectedCustomers}
            onChange={(_, newValue) => {
              availableCustomers.forEach((c) => {
                if (!newValue.includes(c) && selectedCustomers.includes(c)) {
                  toggleCustomer(c);
                }
              });
              newValue.forEach((c) => {
                if (!selectedCustomers.includes(c)) {
                  toggleCustomer(c);
                }
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Выберите заказчиков"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#FFFFFF',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.6)',
                  },
                }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.slice(0, 3).map((option, index) => (
                <Chip
                  label={option.length > 15 ? option.slice(0, 15) + '...' : option}
                  {...getTagProps({ index })}
                  size="small"
                  sx={{
                    background: 'rgba(0, 180, 219, 0.3)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                />
              ))
            }
            slotProps={{
              paper: {
                sx: {
                  background: 'linear-gradient(180deg, #1a3a5c 0%, #0D2B4A 100%)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '& .MuiAutocomplete-option': {
                    color: '#FFFFFF',
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
          />
        </Paper>

        <Paper sx={{
          p: 2,
          mb: 2,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '13px', mb: 1, color: '#FFFFFF' }}>Поставщик</Typography>
          <Autocomplete
            multiple
            size="small"
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
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Выберите поставщиков"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#FFFFFF',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.6)',
                  },
                }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.slice(0, 2).map((option, index) => (
                <Chip
                  label={option.length > 20 ? option.slice(0, 20) + '...' : option}
                  {...getTagProps({ index })}
                  size="small"
                  sx={{
                    background: 'rgba(0, 180, 219, 0.3)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                />
              ))
            }
            slotProps={{
              paper: {
                sx: {
                  background: 'linear-gradient(180deg, #1a3a5c 0%, #0D2B4A 100%)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '& .MuiAutocomplete-option': {
                    color: '#FFFFFF',
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
          />
        </Paper>

        <Button
          variant="outlined"
          startIcon={<ClearAllIcon />}
          onClick={resetFilters}
          fullWidth
          sx={{ 
            mt: 2,
            color: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(255,255,255,0.3)',
            '&:hover': {
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.5)',
            },
          }}
        >
          Сбросить фильтры
        </Button>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <AppBar position="fixed" sx={{ 
          top: 64, 
          zIndex: (theme) => theme.zIndex.drawer - 1,
          background: 'linear-gradient(135deg, #0D2B4A 0%, #1a3a5c 100%)',
        }}>
          <Toolbar variant="dense">
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
              <FilterListIcon />
            </IconButton>
            <Typography variant="body2" noWrap sx={{ fontSize: '12px' }}>
              Фильтры: {selectedYears.length} лет, {selectedMonths.length} мес, {selectedProducts.length} прод
            </Typography>
          </Toolbar>
        </AppBar>
        <SwipeableDrawer
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          onOpen={handleDrawerToggle}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              background: 'linear-gradient(180deg, #0D2B4A 0%, #1a3a5c 100%)',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255,255,255,0.05)',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(255,255,255,0.3)',
              },
            },
          }}
        >
          <Toolbar />
          {sidebarContent}
        </SwipeableDrawer>
      </>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          border: 'none',
          height: '100vh',
          overflow: 'auto',
          background: 'linear-gradient(180deg, #0D2B4A 0%, #1a3a5c 100%)',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.05)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(255,255,255,0.3)',
          },
        },
      }}
    >
      <Toolbar />
      {sidebarContent}
    </Drawer>
  );
};
