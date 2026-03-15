import { Box, Typography, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

interface KpiCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  tooltip?: string;
  loading?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  highlight = false,
  tooltip,
  loading = false,
}) => {
  return (
    <Box className="kpi-card">
      <Typography className="kpi-label">
        {label}
        {tooltip && (
          <Tooltip title={tooltip} arrow>
            <InfoIcon fontSize="small" className="kpi-info" />
          </Tooltip>
        )}
      </Typography>
      <Typography className={`kpi-value ${highlight ? 'highlight' : ''}`}>
        {loading ? (
          <Box className="skeleton skeleton-value" />
        ) : (
          value
        )}
      </Typography>
    </Box>
  );
};
