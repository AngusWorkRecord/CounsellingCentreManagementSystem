import PropTypes from 'prop-types';
import { Box, Button, Stack, Typography } from '@mui/material';
import Iconify from '../../../../../components/iconify';
import { CounsellingPeriodFilter } from '../..';

export default function CaseListHeader({ filteredCount, onCreateCase, periodFilter, periodLabel }) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'flex-start', md: 'center' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography variant="h3" gutterBottom>个案列表</Typography>
        <Typography variant="body2" color="text.secondary">
          样本期间：{periodLabel} ｜ 数据笔数：{filteredCount}
        </Typography>
      </Box>

      <Stack alignItems={{ xs: 'stretch', md: 'flex-end' }} spacing={2}>
        <CounsellingPeriodFilter {...periodFilter} />
        <Button
          variant="contained"
          size="large"
          startIcon={<Iconify icon="eva:plus-circle-outline" />}
          onClick={onCreateCase}
        >
          新增个案
        </Button>
      </Stack>
    </Stack>
  );
}

CaseListHeader.propTypes = {
  filteredCount: PropTypes.number.isRequired,
  onCreateCase: PropTypes.func.isRequired,
  periodFilter: PropTypes.object.isRequired,
  periodLabel: PropTypes.string.isRequired,
};
