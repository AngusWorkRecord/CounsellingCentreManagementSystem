import PropTypes from 'prop-types';
import { Box, Button, Stack, Typography } from '@mui/material';
import { tr, useUiLanguage } from '../../../../../locales/translate';
import Iconify from '../../../../../components/iconify';
import { CounsellingPeriodFilter } from '../..';

export default function CaseListHeader({ filteredCount, onCreateCase, periodFilter, periodLabel }) {
  useUiLanguage();
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'flex-start', md: 'center' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box>
        {/* 中文原文：个案列表 */}
        <Typography variant="h3" gutterBottom>{tr("Case List")}</Typography>
        <Typography variant="body2" color="text.secondary">
          {/* 中文原文：样本期间、数据笔数 */}{tr("Period:")}{periodLabel} {tr("| Records:")} {filteredCount}
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
          {/* 中文原文：新增个案 */}{tr("Create Case")}</Button>
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
