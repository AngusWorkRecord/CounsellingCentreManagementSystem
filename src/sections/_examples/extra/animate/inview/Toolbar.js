import PropTypes from 'prop-types';
// @mui
import { Box, Paper, FormControlLabel, Switch, IconButton } from '@mui/material';
import { tr, useUiLanguage } from '../../../../../locales/translate';
// components
import Iconify from '../../../../../components/iconify';

// ----------------------------------------------------------------------

Toolbar.propTypes = {
  isText: PropTypes.bool,
  isMulti: PropTypes.bool,
  onRefresh: PropTypes.func,
  onChangeText: PropTypes.func,
  onChangeMulti: PropTypes.func,
};

export default function Toolbar({
  isText,
  isMulti,
  onChangeText,
  onChangeMulti,
  onRefresh,
  ...other
}) {
  useUiLanguage();
  return (
    <Paper
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
      {...other}
    >
      <FormControlLabel
        control={<Switch checked={isText} onChange={onChangeText} />}
        label={tr("Text Object")}
      />

      <Box sx={{ flexGrow: 1 }} />

      {!isText && (
        <FormControlLabel
          control={<Switch checked={isMulti} onChange={onChangeMulti} />}
          label={tr("Multi Item")}
        />
      )}

      <IconButton onClick={onRefresh}>
        <Iconify icon="eva:refresh-fill" />
      </IconButton>
    </Paper>
  );
}
