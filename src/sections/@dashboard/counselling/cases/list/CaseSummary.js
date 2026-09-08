import PropTypes from 'prop-types';
import { Box, Grid, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { tr, useUiLanguage } from '../../../../../locales/translate';
import Iconify from '../../../../../components/iconify';

const items = [
  // 中文原文：总个案、待简要报告、待详细报告、全部完成
  { key: 'total', get label() { return tr("Total Cases"); }, icon: 'eva:folder-outline', color: 'primary' },
  { key: 'briefPending', get label() { return tr("Brief Report Pending"); }, icon: 'eva:file-text-outline', color: 'warning' },
  { key: 'detailedPending', get label() { return tr("Detailed Report Pending"); }, icon: 'eva:clock-outline', color: 'error' },
  { key: 'completed', get label() { return tr("Completed"); }, icon: 'eva:checkmark-circle-2-outline', color: 'success' },
];

export default function CaseSummary({ total, briefPending, detailedPending, completed }) {
  useUiLanguage();
  const values = { total, briefPending, detailedPending, completed };

  return (
    <Grid container spacing={2} sx={{ mt: 0.5 }}>
      {items.map((item) => (
        <Grid item xs={12} sm={6} lg={3} key={item.key}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, minHeight: 88 }}>
            <Box sx={(theme) => ({ width: 52, height: 52, borderRadius: '50%', display: 'grid', placeItems: 'center', color: theme.palette[item.color].main, bgcolor: alpha(theme.palette[item.color].main, 0.1) })}>
              <Iconify icon={item.icon} width={28} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">{item.label}</Typography>
              <Typography variant="h4">{values[item.key]}</Typography>
            </Box>
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
}

CaseSummary.propTypes = {
  briefPending: PropTypes.number.isRequired,
  completed: PropTypes.number.isRequired,
  detailedPending: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};
