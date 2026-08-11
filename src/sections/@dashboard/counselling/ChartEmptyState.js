import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import Iconify from '../../../components/iconify';

ChartEmptyState.propTypes = {
  height: PropTypes.number,
};

export default function ChartEmptyState({ height = 300 }) {
  return (
    <Box
      sx={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.disabled',
      }}
    >
      <Iconify icon="eva:bar-chart-2-outline" width={40} sx={{ mb: 1 }} />
      <Typography variant="body2">该月份暂无数据</Typography>
    </Box>
  );
}

