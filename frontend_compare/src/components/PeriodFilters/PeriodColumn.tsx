import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { useComparisonStore } from '../../stores/comparisonStore';

interface PeriodColumnProps {
  period: 'A' | 'B';
  title: string;
  color: string;
}

export const PeriodColumn: React.FC<PeriodColumnProps> = ({
  period,
  title,
  color,
}) => {
  const {
    periodA,
    periodB,
    availableYears,
    availableRegions,
    availableProducts,
    togglePeriodAYear,
    togglePeriodBYear,
    togglePeriodARegion,
    togglePeriodBRegion,
    togglePeriodAProduct,
    togglePeriodBProduct,
    resetPeriodA,
    resetPeriodB,
  } = useComparisonStore();

  const currentPeriod = period === 'A' ? periodA : periodB;
  const toggleYear = period === 'A' ? togglePeriodAYear : togglePeriodBYear;
  const toggleRegion = period === 'A' ? togglePeriodARegion : togglePeriodBRegion;
  const toggleProduct = period === 'A' ? togglePeriodAProduct : togglePeriodBProduct;
  const resetPeriod = period === 'A' ? resetPeriodA : resetPeriodB;

  // Обрезка длинных названий
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  return (
    <Box
      sx={{
        border: `2px solid ${color}`,
        borderRadius: 3,
        p: 3,
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0 0 20px ${color}40`,
        },
      }}
    >
      {/* Заголовок периода */}
      <Typography
        variant="h6"
        sx={{
          color,
          mb: 3,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          textAlign: 'center',
        }}
      >
        {title}
      </Typography>

      {/* Годы */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle2"
          sx={{ color: 'rgba(255,255,255,0.85)', mb: 1.5, fontSize: '14px' }}
        >
          📅 Годы:
        </Typography>
        <Grid container spacing={1}>
          {availableYears.map((year) => {
            const isSelected = currentPeriod.years.includes(year);
            return (
              <Grid size="auto" key={year}>
                <Button
                  variant={isSelected ? 'contained' : 'outlined'}
                  onClick={() => toggleYear(year)}
                  sx={{
                    minWidth: '60px',
                    fontWeight: 600,
                    textTransform: 'none',
                    ...(isSelected
                      ? {
                          background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
                          color: '#fff',
                          border: 'none',
                          boxShadow: `0 0 15px ${color}80`,
                          '&:hover': {
                            background: `linear-gradient(135deg, ${color}cc 0%, ${color} 100%)`,
                            boxShadow: `0 0 25px ${color}`,
                          },
                        }
                      : {
                          color: 'rgba(255,255,255,0.8)',
                          borderColor: 'rgba(255,255,255,0.2)',
                          '&:hover': {
                            borderColor: color,
                            color,
                            background: `${color}10`,
                          },
                        }),
                  }}
                  data-testid={`period-${period}-year-${year}`}
                >
                  {year}
                </Button>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Регионы */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle2"
          sx={{ color: 'rgba(255,255,255,0.85)', mb: 1.5, fontSize: '14px' }}
        >
          🌍 Регионы:
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.75,
            maxHeight: '300px',
            overflow: 'auto',
            p: 1,
            borderRadius: 2,
            background: 'rgba(0,0,0,0.2)',
          }}
        >
          {availableRegions.map((region) => {
            const isSelected = currentPeriod.regions.includes(region);
            return (
              <Button
                key={region}
                variant={isSelected ? 'contained' : 'outlined'}
                onClick={() => toggleRegion(region)}
                size="small"
                sx={{
                  fontSize: '12px',
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 1.5,
                  py: 0.5,
                  minWidth: 'auto',
                  ...(isSelected
                    ? {
                        background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
                        color: '#fff',
                        border: 'none',
                        boxShadow: `0 0 10px ${color}60`,
                      }
                    : {
                        color: 'rgba(255,255,255,0.7)',
                        borderColor: 'rgba(255,255,255,0.15)',
                        '&:hover': {
                          borderColor: color,
                          color,
                          background: `${color}10`,
                        },
                      }),
                }}
              >
                {truncateText(region, 25)}
              </Button>
            );
          })}
        </Box>
      </Box>

      {/* Продукты */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle2"
          sx={{ color: 'rgba(255,255,255,0.85)', mb: 1.5, fontSize: '14px' }}
        >
          💊 Продукты:
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.75,
            maxHeight: '120px',
            overflow: 'auto',
            p: 1,
            borderRadius: 2,
            background: 'rgba(0,0,0,0.2)',
          }}
        >
          {availableProducts.map((product) => {
            const isSelected = currentPeriod.products.includes(product);
            return (
              <Button
                key={product}
                variant={isSelected ? 'contained' : 'outlined'}
                onClick={() => toggleProduct(product)}
                size="small"
                sx={{
                  fontSize: '12px',
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 1.5,
                  py: 0.5,
                  minWidth: 'auto',
                  ...(isSelected
                    ? {
                        background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
                        color: '#fff',
                        border: 'none',
                        boxShadow: `0 0 10px ${color}60`,
                      }
                    : {
                        color: 'rgba(255,255,255,0.7)',
                        borderColor: 'rgba(255,255,255,0.15)',
                        '&:hover': {
                          borderColor: color,
                          color,
                          background: `${color}10`,
                        },
                      }),
                }}
              >
                {truncateText(product, 20)}
              </Button>
            );
          })}
        </Box>
      </Box>

      {/* Кнопка сброса */}
      <Button
        fullWidth
        variant="outlined"
        onClick={resetPeriod}
        sx={{
          mt: 2,
          color: 'rgba(255,255,255,0.7)',
          borderColor: 'rgba(255,255,255,0.3)',
          textTransform: 'none',
          fontWeight: 500,
          '&:hover': {
            borderColor: 'rgba(255,255,255,0.6)',
            background: 'rgba(255,255,255,0.05)',
            color: '#fff',
          },
        }}
      >
        🔄 Сбросить фильтры
      </Button>
    </Box>
  );
};
