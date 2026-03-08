import { Box, Grid, Paper, Typography, Skeleton } from '@mui/material';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  gradient: string;
  loading?: boolean;
}

const KpiCard = ({ title, value, subtitle, gradient, loading = false }: KpiCardProps) => {
  if (loading) {
    return (
      <Paper sx={{ 
        height: 140, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.05)',
      }}>
        <Skeleton variant="text" width="60%" height={28} sx={{ mb: 1, ml: 3 }} />
        <Skeleton variant="text" width="50%" height={40} sx={{ ml: 3 }} />
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        height: 140,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: gradient,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
          transition: 'all 0.3s ease',
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1, px: 3 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.85)',
            fontWeight: 600,
            letterSpacing: '0.5px',
            mb: 1,
            textTransform: 'uppercase',
            fontSize: '11px',
          }} 
          gutterBottom
        >
          {title}
        </Typography>
        <Typography 
          variant="h4" 
          component="div" 
          sx={{ 
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.5px',
            fontSize: '32px',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '11px',
              mt: 0.5,
              display: 'block',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

interface KpiPanelProps {
  data: {
    total_amount: number;
    contract_count: number;
    avg_contract_amount: number;
    total_quantity: number;
    avg_price_per_unit: number;
    customer_count: number;
  } | null;
  loading?: boolean;
}

const formatNumber = (num: number): string => {
  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(2)} млрд`;
  }
  if (num >= 1e6) {
    return `${(num / 1e6).toFixed(2)} млн`;
  }
  if (num >= 1e3) {
    return `${(num / 1e3).toFixed(1)} тыс`;
  }
  return num.toFixed(0);
};

export const KpiPanel = ({ data, loading = false }: KpiPanelProps) => {
  const formatCurrency = (num: number) => {
    if (num >= 1e9) {
      return `${(num / 1e9).toFixed(2)} млрд ₽`;
    }
    if (num >= 1e6) {
      return `${(num / 1e6).toFixed(2)} млн ₽`;
    }
    return `${num.toLocaleString('ru-RU')} ₽`;
  };

  // Градиенты для каждой карточки (как в образце)
  const gradients = [
    'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)',  // Сумма - синий
    'linear-gradient(135deg, #11998E 0%, #38EF7D 100%)',  // Контракты - зелёный
    'linear-gradient(135deg, #4A00E0 0%, #8E2DE2 100%)',  // Ср.сумма - фиолетовый
    'linear-gradient(135deg, #007991 0%, #78FFD5 100%)',  // Объём - бирюзовый
    'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)',  // Ср.цена - красно-оранжевый
    'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',  // Заказчики - голубой
  ];

  const kpiCards = [
    {
      title: 'Общая сумма закупок',
      value: data ? formatCurrency(data.total_amount) : '—',
    },
    {
      title: 'Количество контрактов',
      value: data ? data.contract_count.toLocaleString('ru-RU') : '—',
    },
    {
      title: 'Средняя сумма контракта',
      value: data ? formatCurrency(data.avg_contract_amount) : '—',
    },
    {
      title: 'Общий объём (шт)',
      value: data ? formatNumber(data.total_quantity) : '—',
    },
    {
      title: 'Средняя цена за единицу',
      value: data ? `${data.avg_price_per_unit.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽` : '—',
    },
    {
      title: 'Заказчиков',
      value: data ? data.customer_count.toLocaleString('ru-RU') : '—',
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2.5}>
        {kpiCards.map((card, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index}>
            <KpiCard
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              gradient={gradients[index]}
              loading={loading}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
