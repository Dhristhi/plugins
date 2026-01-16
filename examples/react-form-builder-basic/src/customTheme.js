import { createTheme } from '@mui/material/styles';

const getCustomTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#9c27b0',
        light: '#ba68c8',
        dark: '#7b1fa2',
      },
      secondary: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00',
      },
      error: {
        main: '#f44336',
        light: '#e57373',
        dark: '#d32f2f',
      },
      warning: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00',
      },
      info: {
        main: '#2196f3',
        light: '#64b5f6',
        dark: '#1976d2',
      },
      success: {
        main: '#4caf50',
        light: '#81c784',
        dark: '#388e3c',
      },
      background: {
        default: mode === 'dark' ? '#1a0d1f' : '#fce4ec',
        paper: mode === 'dark' ? '#2d1b69' : '#ffffff',
      },
      grey:
        mode === 'dark'
          ? {
              50: '#212121',
              100: '#424242',
              200: '#616161',
              300: '#757575',
              400: '#9e9e9e',
              500: '#bdbdbd',
              600: '#e0e0e0',
              700: '#eeeeee',
              800: '#f5f5f5',
              900: '#fafafa',
            }
          : {
              50: '#fafafa',
              100: '#f5f5f5',
              200: '#eeeeee',
              300: '#e0e0e0',
              400: '#bdbdbd',
              500: '#9e9e9e',
              600: '#757575',
              700: '#616161',
              800: '#424242',
              900: '#212121',
            },
      drawerLabel: mode === 'dark' ? '#e1bee7' : '#6a1b9a',
      // Custom color for layout text in light mode
      layoutText: mode === 'light' ? '#ffffff' : undefined,
      gradient:
        mode === 'dark'
          ? {
              stop1: '#7b1fa2',
              stop2: '#9c27b0',
              stop3: '#ba68c8',
              stop4: '#e1bee7',
            }
          : {
              stop1: '#e1bee7',
              stop2: '#ba68c8',
              stop3: '#9c27b0',
              stop4: '#7b1fa2',
            },
    },
    typography: {
      fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.125rem',
      },
      h2: {
        fontWeight: 600,
        fontSize: '1.875rem',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h4: {
        fontWeight: 500,
        fontSize: '1.25rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.125rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
      },
      body1: {
        fontSize: '0.875rem',
      },
      body2: {
        fontSize: '0.75rem',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            // Global CSS for layout containers
            '& .layout-container, & [data-layout="vertical"], & [data-layout="horizontal"]': {
              '& *': mode === 'light' ? { color: 'white !important' } : {},
              '& .MuiTypography-root': mode === 'light' ? { color: 'white !important' } : {},
              '& .MuiChip-root':
                mode === 'light'
                  ? {
                      color: 'white !important',
                      backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
                    }
                  : {},
              '& .MuiChip-label': mode === 'light' ? { color: 'white !important' } : {},
              '& span': mode === 'light' ? { color: 'white !important' } : {},
              '& div': mode === 'light' ? { color: 'white !important' } : {},
              '& p': mode === 'light' ? { color: 'white !important' } : {},
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 12,
            padding: '8px 24px',
            boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
          },
          contained: {
            background: 'linear-gradient(45deg, #9c27b0 30%, #ba68c8 90%)',
            border: 0,
            color: 'white',
            boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #7b1fa2 30%, #9c27b0 90%)',
              boxShadow: '0 6px 16px rgba(156, 39, 176, 0.4)',
            },
            '&:disabled': {
              background: '#e0e0e0',
              color: 'rgba(0, 0, 0, 0.26)',
              boxShadow: 'none',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(156, 39, 176, 0.1), 0 8px 32px rgba(156, 39, 176, 0.08)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: mode === 'dark' ? 'rgba(186, 104, 200, 0.1)' : 'transparent',
              '& fieldset': {
                borderColor: mode === 'dark' ? '#ba68c8' : '#e1bee7',
              },
              '&:hover fieldset': {
                borderColor: mode === 'dark' ? '#e1bee7' : '#ba68c8',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#9c27b0',
              },
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow:
              mode === 'dark'
                ? '0 8px 24px rgba(186, 104, 200, 0.3), 0 0 20px rgba(156, 39, 176, 0.2)'
                : '0 8px 24px rgba(156, 39, 176, 0.12)',
            border:
              mode === 'dark'
                ? '1px solid rgba(186, 104, 200, 0.3)'
                : '1px solid rgba(156, 39, 176, 0.1)',
            backgroundColor: mode === 'dark' ? 'rgba(45, 27, 105, 0.8)' : undefined,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
          colorPrimary: {
            background:
              mode === 'dark'
                ? 'linear-gradient(45deg, #7b1fa2 30%, #9c27b0 90%)'
                : 'linear-gradient(45deg, #ba68c8 30%, #e1bee7 90%)',
            color: mode === 'dark' ? '#e1bee7' : '#7b1fa2',
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            marginBottom: '8px',
            '&:before': {
              display: 'none',
            },
            boxShadow:
              mode === 'dark'
                ? '0 2px 8px rgba(186, 104, 200, 0.3)'
                : '0 2px 8px rgba(156, 39, 176, 0.1)',
            backgroundColor: mode === 'dark' ? 'rgba(45, 27, 105, 0.6)' : undefined,
          },
        },
      },
      // Custom component styling for layout components
      MuiGrid: {
        styleOverrides: {
          root: {
            // Apply white text color for vertical and horizontal layouts in light mode
            '&.layout-container': {
              color: mode === 'light' ? 'white !important' : undefined,
              // Target all text elements within layout containers
              '& *': {
                color: mode === 'light' ? 'white !important' : undefined,
              },
              '& .MuiTypography-root': {
                color: mode === 'light' ? 'white !important' : undefined,
              },
              '& .MuiFormLabel-root': {
                color: mode === 'light' ? 'white !important' : undefined,
              },
              '& .MuiInputLabel-root': {
                color: mode === 'light' ? 'white !important' : undefined,
              },
              '& .MuiFormControlLabel-label': {
                color: mode === 'light' ? 'white !important' : undefined,
              },
              '& .MuiFormHelperText-root': {
                color: mode === 'light' ? 'rgba(255, 255, 255, 0.7) !important' : undefined,
              },
              '& .MuiChip-label': {
                color: mode === 'light' ? 'white !important' : undefined,
              },
              '& .MuiChip-root': {
                color: mode === 'light' ? 'white !important' : undefined,
                backgroundColor:
                  mode === 'light' ? 'rgba(255, 255, 255, 0.1) !important' : undefined,
              },
              // Target span elements that might contain text
              '& span': {
                color: mode === 'light' ? 'white !important' : undefined,
              },
              // Target div elements that might contain text
              '& div': {
                color: mode === 'light' ? 'white !important' : undefined,
              },
              // Target p elements
              '& p': {
                color: mode === 'light' ? 'white !important' : undefined,
              },
            },
            '&.vertical-layout-container, &.horizontal-layout-container': {
              color: mode === 'light' ? 'white !important' : undefined,
              '& *': {
                color: mode === 'light' ? 'white !important' : undefined,
              },
            },
            // Also target by data attributes
            '&[data-layout="vertical"], &[data-layout="horizontal"]': {
              color: mode === 'light' ? 'white !important' : undefined,
              '& *': {
                color: mode === 'light' ? 'white !important' : undefined,
              },
            },
          },
        },
      },
      // Chip specific overrides
      MuiChip: {
        styleOverrides: {
          root: {
            '.layout-container &': {
              color: mode === 'light' ? 'white !important' : undefined,
              backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.1) !important' : undefined,
              '& .MuiChip-label': {
                color: mode === 'light' ? 'white !important' : undefined,
              },
            },
            // Also for data attribute targeting
            '[data-layout] &': {
              color: mode === 'light' ? 'white !important' : undefined,
              backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.1) !important' : undefined,
              '& .MuiChip-label': {
                color: mode === 'light' ? 'white !important' : undefined,
              },
            },
          },
          colorPrimary: {
            '.layout-container &, [data-layout] &': {
              background: mode === 'light' ? 'rgba(255, 255, 255, 0.2) !important' : undefined,
              color: mode === 'light' ? 'white !important' : undefined,
              '& .MuiChip-label': {
                color: mode === 'light' ? 'white !important' : undefined,
              },
            },
          },
        },
      },
      // Global overrides for layout containers
      MuiFormControl: {
        styleOverrides: {
          root: {
            '.layout-container &, [data-layout] &': {
              color: mode === 'light' ? 'white !important' : undefined,
              '& .MuiFormLabel-root': {
                color: mode === 'light' ? 'white !important' : undefined,
              },
              '& .MuiInputLabel-root': {
                color: mode === 'light' ? 'white !important' : undefined,
              },
              '& *': {
                color: mode === 'light' ? 'white !important' : undefined,
              },
            },
          },
        },
      },
      // Typography overrides for layout containers
      MuiTypography: {
        styleOverrides: {
          root: {
            '.layout-container &, [data-layout] &': {
              color: mode === 'light' ? 'white !important' : undefined,
            },
            // Global override for layout typography
            '&.layout-text': {
              color: mode === 'light' ? 'white !important' : undefined,
            },
          },
        },
      },
    },
  });

export const lightTheme = getCustomTheme('light');
export const darkTheme = getCustomTheme('dark');
export const customTheme = lightTheme; // Default export for backward compatibility
