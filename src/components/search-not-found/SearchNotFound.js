import PropTypes from 'prop-types';
// @mui
import { Paper, Typography } from '@mui/material';
import { tr, useUiLanguage } from '../../locales/translate';

// ----------------------------------------------------------------------

SearchNotFound.propTypes = {
  query: PropTypes.string,
  sx: PropTypes.object,
};

export default function SearchNotFound({ query, sx, ...other }) {
  useUiLanguage();
  return query ? (
    <Paper
      sx={{
        textAlign: 'center',
        ...sx,
      }}
      {...other}
    >
      <Typography variant="h6" paragraph>{tr("Not found")}</Typography>

      <Typography variant="body2">{tr("No results found for")}<strong>&quot;{query}&quot;</strong>.
        <br />{tr("Try checking for typos or using complete words.")}</Typography>
    </Paper>
  ) : (
    <Typography variant="body2" sx={sx}>{tr("Please enter keywords")}</Typography>
  );
}
