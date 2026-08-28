import PropTypes from 'prop-types';
import { Box, Stack, Typography } from '@mui/material';
import CounsellingPeriodFilter from '../CounsellingPeriodFilter';

export default function CounsellingDashboardHeader({ filteredCount, periodFilter, periodLabel }) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'flex-start', md: 'center' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box>
        {/* 中文原文：辅导个案管理 Dashboard */}<Typography variant="h3" gutterBottom>Counselling Case Management Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">
          {/* 中文原文：样本期间、数据笔数 */}Period: {periodLabel} | Records: {filteredCount}
        </Typography>
      </Box>
      <CounsellingPeriodFilter {...periodFilter} />
    </Stack>
  );
}

CounsellingDashboardHeader.propTypes = {
  filteredCount: PropTypes.number.isRequired,
  periodFilter: PropTypes.object.isRequired,
  periodLabel: PropTypes.string.isRequired,
};
