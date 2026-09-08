import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { zhCN, enUS } from '@mui/x-date-pickers/locales';
import { zhCN as cnGrid, enUS as enGrid } from '@mui/x-data-grid';
import PropTypes from 'prop-types';
// @mui
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
//
import useLocales from './useLocales';

// ----------------------------------------------------------------------

ThemeLocalization.propTypes = {
  children: PropTypes.node,
};

export default function ThemeLocalization({ children }) {
  const outerTheme = useTheme();

  const { currentLang } = useLocales();

  const theme = createTheme(outerTheme, currentLang.systemValue, currentLang.value === 'cn' ? cnGrid : enGrid);

  return <ThemeProvider theme={theme}><LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={currentLang.dateLocale} localeText={(currentLang.value === 'cn' ? zhCN : enUS).components.MuiLocalizationProvider.defaultProps.localeText}>{children}</LocalizationProvider></ThemeProvider>;
}
