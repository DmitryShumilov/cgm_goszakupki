import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { useComparisonStore } from '../../stores/comparisonStore';

export const SwapButton: React.FC = () => {
  const { swapPeriods } = useComparisonStore();
  const [isAnimating, setIsAnimating] = React.useState(false);

  const handleSwap = () => {
    setIsAnimating(true);
    swapPeriods();
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <Tooltip title="Поменять периоды местами">
      <Button
        variant="outlined"
        onClick={handleSwap}
        disabled={isAnimating}
        startIcon={
          <span
            style={{
              display: 'inline-block',
              transform: isAnimating ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s ease',
            }}
          >
            🔄
          </span>
        }
        sx={{
          color: 'rgba(255,255,255,0.9)',
          borderColor: 'rgba(255,255,255,0.3)',
          textTransform: 'none',
          fontWeight: 600,
          px: 2,
          py: 1,
          '&:hover': {
            borderColor: 'rgba(255,255,255,0.6)',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            transform: 'scale(1.05)',
          },
          '&:disabled': {
            opacity: 0.5,
          },
        }}
        data-testid="swap-button"
      >
        Поменять местами
      </Button>
    </Tooltip>
  );
};
