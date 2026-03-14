import { Box, Typography } from '@mui/material';

interface InfoSectionProps {
  title: string;
  children: React.ReactNode;
}

export const InfoSection: React.FC<InfoSectionProps> = ({ title, children }) => {
  return (
    <Box className="info-section">
      <Typography className="info-section-title">
        {title}
      </Typography>
      <Box className="info-section-content">
        {children}
      </Box>
    </Box>
  );
};
