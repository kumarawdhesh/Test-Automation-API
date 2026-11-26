import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0EA5E9',
    },
    secondary: {
      main: '#0F172A',
    },
    warning:{
      main: '#FFC700',
    },
    error:{
      main: '#E80005',
    },
    success:{
      main: '#3FB802',
    },
    text: {
      primary: '#0F172A', // Default text color
      secondary: '#37476C', // Optional: Color for secondary text
    },
    border: {
      main: 'rgba(0,0,0,0.12)', // Custom primary border color
    },
  },
  typography: {
    fontFamily: 'Inter',
    allVariants: {
      textTransform: 'none',
      // color: '#0F172A',
    },
    h0:{
      fontSize: '2rem', // 32 px
      fontWeight: 500,
    },
    h1: {
      fontSize: '2.75rem', // 44 px
      fontWeight: 700,
    },
    h2: {
      fontSize: '2.25rem', // 36 px
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.75rem', // 28 px
      fontWeight: 600, 
    },
    h7: {
      fontSize: '1.5rem', // 24 px
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.375rem', // 22 px
      fontWeight: 500,
    },
    h8: {
      fontSize: '1.25rem', // 20 px
      fontWeight: 500,
    },
    h9: {
      fontSize: '1.125rem', // 18 px
      fontWeight: 400,
    },
    h5: {
      fontSize: '0.9375rem', // 15 px
      fontWeight: 400,
    },
    h6: {
      fontSize: '1rem', // 16 px
      fontWeight: 400,
    },
    body1: {
      fontSize: '1rem', // 16 px
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem', // 14px small
      fontWeight: 400,
    },
    subtitle2: {
      fontSize: '0.75rem', // 12px Extra small
      fontWeight: 400,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevent automatic capitalization
        },
        contained: {
          color: '#FFFFFF',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          height: '54px !important', // Set the toolbar height to 54px
          minHeight : '54px !important',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          height: '54px !important', // Set the Toolbar height to 54px
          minHeight : '54px !important',
        },
      },
    },
  },
  // Other theme configuration options go here
});

export default theme;
