import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { getTrendIcon, getTrendColor, formatCurrency } from '../../utils/formatters';
import type { ChangeData } from '../../types';

interface KpiComparisonCardProps {
  label: string;
  icon: string;
  periodAValue: number;
  periodBValue: number;
  change: ChangeData;
  isMoney?: boolean;
  decimalPlaces?: number;  // Количество знаков после запятой
}

export const KpiComparisonCard: React.FC<KpiComparisonCardProps> = ({
  label,
  icon,
  periodAValue,
  periodBValue,
  change,
  isMoney = true,
  decimalPlaces = 0,  // По умолчанию без знаков после запятой
}) => {
  const trendColor = getTrendColor(change.trend);
  const trendIcon = getTrendIcon(change.trend);

  // Форматирование значений
  const formatValue = (value: number) => {
    if (isMoney) {
      return formatCurrency(value);
    }
    // Форматирование числа с разделителями и знаками после запятой
    // Для средней цены за единицу добавляем символ рубля
    const formatted = value.toLocaleString('ru-RU', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
    return decimalPlaces > 0 ? `${formatted} ₽` : formatted;
  };

  // Форматирование абсолютного изменения
  const formatAbsolute = (value: number) => {
    const sign = value > 0 ? '+' : '';
    if (isMoney) {
      if (Math.abs(value) >= 1_000_000_000) {
        return `${sign}${(Math.abs(value) / 1_000_000_000).toFixed(2)} млрд`;
      }
      if (Math.abs(value) >= 1_000_000) {
        return `${sign}${(Math.abs(value) / 1_000_000).toFixed(2)} млн`;
      }
      return `${sign}${value.toLocaleString('ru-RU')}`;
    }
    return `${sign}${value.toLocaleString('ru-RU')}`;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(15, 12, 41, 0.95) 0%, rgba(48, 43, 99, 0.85) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px) scale(1.02)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${trendColor} 0%, transparent 100%)`,
          opacity: 0.8,
        },
      }}
      data-testid={`kpi-card-${label.replace(/\s+/g, '-').toLowerCase()}`}
      role="article"
      aria-label={label}
    >
      {/* Заголовок карточки */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography
          sx={{
            fontSize: '20px',
            mr: 1,
          }}
          aria-hidden="true"
        >
          {icon}
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{
            color: 'rgba(255, 255, 255, 0.85)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '13px',
          }}
        >
          {label}
        </Typography>
      </Box>

      {/* Значение периода А */}
      <Box sx={{ mb: 1.5 }}>
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '11px',
            mb: 0.25,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Период А
        </Typography>
        <Typography
          sx={{
            color: '#fff',
            fontSize: '20px',
            fontWeight: 700,
            fontFamily: 'monospace',
            letterSpacing: '0.5px',
          }}
        >
          {formatValue(periodAValue)}
        </Typography>
      </Box>

      {/* Значение периода Б */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '11px',
            mb: 0.25,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Период Б
        </Typography>
        <Typography
          sx={{
            color: '#fff',
            fontSize: '20px',
            fontWeight: 700,
            fontFamily: 'monospace',
            letterSpacing: '0.5px',
          }}
        >
          {formatValue(periodBValue)}
        </Typography>
      </Box>

      {/* Разделитель */}
      <Box
        sx={{
          height: '1px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
          mb: 2,
        }}
      />

      {/* Изменения */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        }}
      >
        {/* Процентное изменение */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 700,
              color: trendColor,
              fontFamily: 'monospace',
              letterSpacing: '0.5px',
            }}
          >
            {trendIcon} {change.percent > 0 ? '+' : ''}{change.percent.toFixed(1)}%
          </Typography>
        </Box>

        {/* Абсолютное изменение */}
        <Typography
          sx={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontFamily: 'monospace',
            letterSpacing: '0.3px',
          }}
        >
          ({formatAbsolute(change.absolute)}{isMoney ? ' ₽' : ''})
        </Typography>
      </Box>

      {/* Декоративный элемент - свечение в углу */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle, ${trendColor}20 0%, transparent 70%)`,
          pointerEvents: 'none',
          opacity: 0.5,
        }}
        aria-hidden="true"
      />
    </Paper>
  );
};
