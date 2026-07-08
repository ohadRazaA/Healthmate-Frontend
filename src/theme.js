import { createTheme } from '@mui/material/styles';

export const getTheme = (mode = 'light') => createTheme({
  palette: {
    mode,
    background: {
      default: mode === 'dark' ? '#121821' : '#f8fbfd',
      paper: mode === 'dark' ? '#1d2733' : '#ffffff',
      secondary: '#346A57',
      primary: '#40826D',
      light: '#E6F0ED',
      medium: '#59A18C',
      error: 'red',
      success: 'green'
    },
    text: {
      primary: mode === 'dark' ? '#f8fafc' : '#000000',
      secondary: mode === 'dark' ? '#cbd5e1' : '#555555',
      light: '#FFFFFF',
      medium: '#59A18C',
      disabled: '#999999',
      error: 'red',
      success: 'green'
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: mode === 'dark' ? '#121821' : '#f8fbfd',
          color: mode === 'dark' ? '#f8fafc' : '#000000'
        }
      }
    }
  }
});