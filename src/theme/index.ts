import { createTheme, ThemeOptions } from '@mui/material/styles';

// Light theme colors
const lightColors = {
  primary: {
    main: '#667eea',
    light: '#9bb5ff',
    dark: '#4c63d2',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#764ba2',
    light: '#a478d4',
    dark: '#5a3d7a',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f8fafc',
    paper: '#ffffff',
  },
  text: {
    primary: '#1a202c',
    secondary: '#718096',
  },
  divider: '#e2e8f0',
  success: {
    main: '#48bb78',
    light: '#68d391',
    dark: '#38a169',
  },
  warning: {
    main: '#ed8936',
    light: '#f6ad55',
    dark: '#dd6b20',
  },
  error: {
    main: '#f56565',
    light: '#fc8181',
    dark: '#e53e3e',
  },
  info: {
    main: '#4299e1',
    light: '#63b3ed',
    dark: '#3182ce',
  },
};

// Dark theme colors
const darkColors = {
  primary: {
    main: '#8b5cf6',
    light: '#a78bfa',
    dark: '#7c3aed',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#06b6d4',
    light: '#22d3ee',
    dark: '#0891b2',
    contrastText: '#ffffff',
  },
  background: {
    default: '#0f0f23',
    paper: '#1a1a2e',
  },
        text: {
          primary: '#e2e8f0',
          secondary: '#94a3b8',
        },
  divider: '#334155',
  success: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
  },
  info: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
  },
};

const createCustomTheme = (isDark: boolean): ThemeOptions => {
  const colors = isDark ? darkColors : lightColors;
  
  return {
    palette: {
      mode: isDark ? 'dark' : 'light',
      ...colors,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
      },
      h2: {
        fontWeight: 700,
        fontSize: '2rem',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
            padding: '8px 16px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: isDark 
              ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
            border: isDark ? '1px solid rgba(139, 92, 246, 0.1)' : 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundImage: 'none',
            backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
            border: isDark ? '1px solid rgba(139, 92, 246, 0.1)' : 'none',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 0,
              backgroundColor: isDark ? 'rgba(139, 92, 246, 0.05)' : 'transparent',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? '#8b5cf6' : '#667eea',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? '#8b5cf6' : '#667eea',
                borderWidth: '2px',
              },
            },
            '& .MuiInputLabel-root': {
              color: isDark ? '#94a3b8' : '#374151',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(102, 126, 234, 0.1)',
            color: isDark ? '#cbd5e1' : '#667eea',
            border: isDark ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid rgba(102, 126, 234, 0.2)',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(102, 126, 234, 0.1)',
            border: isDark ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid rgba(102, 126, 234, 0.2)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            color: isDark ? '#e2e8f0' : '#374151',
            borderColor: isDark ? '#334155' : '#e5e7eb',
          },
          head: {
            color: isDark ? '#e2e8f0' : '#374151',
            fontWeight: 'bold',
          },
        },
      },
    },
  };
};

export const lightTheme = createTheme(createCustomTheme(false));
export const darkTheme = createTheme(createCustomTheme(true));
