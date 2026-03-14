import React from 'react';
import ReactDOM from 'react-dom/client';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';

// Подключаем шрифт Inter
const interFont = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#00B4DB',
      light: '#E0F7FA',
      dark: '#0083A8',
    },
    secondary: {
      main: '#FF9500',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    success: {
      main: '#00B894',
      light: '#55EFC4',
      dark: '#009174',
    },
    warning: {
      main: '#FFA502',
      light: '#FFC048',
      dark: '#E17055',
    },
    error: {
      main: '#FF416C',
      light: '#FF6B8A',
      dark: '#FF4B2B',
    },
    info: {
      main: '#2193b0',
      light: '#6dd5ed',
      dark: '#006584',
    },
    background: {
      default: '#0f0c29',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: interFont.fontFamily,
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h6: {
      fontWeight: 600,
      fontSize: '16px',
    },
    subtitle2: {
      fontWeight: 500,
      letterSpacing: '0.3px',
    },
    body2: {
      fontSize: '13px',
    },
    caption: {
      fontSize: '11px',
      letterSpacing: '0.4px',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        },
        rounded: {
          borderRadius: 20,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
