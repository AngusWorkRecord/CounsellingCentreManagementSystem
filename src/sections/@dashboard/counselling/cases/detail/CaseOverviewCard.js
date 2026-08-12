import PropTypes from 'prop-types';
import { Box, Card, Chip, Grid, Stack, Typography } from '@mui/material';
import Iconify from '../../../../../components/iconify';
import { formatDate, formatTime, valueOrDash } from './utils';

function DetailItem({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Iconify icon={icon} width={24} sx={{ color: 'primary.main', mt: 0.25 }} />
      <Box>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="subtitle2">{valueOrDash(value)}</Typography>
      </Box>
    </Stack>
  );
}

DetailItem.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};

export default function CaseOverviewCard({ session }) {
  const amount = Number(session.amount_received_rm || 0);
  const details = [
    ['eva:person-outline', '案主简称', session.client_initials],
    ['eva:briefcase-outline', '个案类别', session.case_category],
    ['eva:message-square-outline', '辅导类型', session.session_mode],
    ['eva:people-outline', '辅导员', session.counsellor],
    ['eva:calendar-outline', '日期', formatDate(session.counselling_date)],
    ['eva:clock-outline', '时间', `${formatTime(session.session_start)} – ${formatTime(session.session_end)}`],
    ['eva:pie-chart-outline', '时长', `${valueOrDash(session.duration_minutes)} 分钟`],
    ['eva:phone-outline', '联系电话', session.client_phone],
  ];

  return (
    <Card sx={{ p: { xs: 2.5, md: 4 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={3}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" color="primary.main" sx={{ mb: 3 }}>
            {valueOrDash(session.case_number)}
          </Typography>
          <Grid container spacing={3}>
            {details.map(([icon, label, value]) => (
              <Grid item xs={12} sm={6} lg={3} key={label}>
                <DetailItem icon={icon} label={label} value={value} />
              </Grid>
            ))}
          </Grid>
        </Box>
        <Stack alignItems={{ xs: 'flex-start', md: 'flex-end' }} spacing={1} sx={{ minWidth: 170 }}>
          <Typography variant="caption" color="text.secondary">当前状态</Typography>
          <Chip
            color={session.report_url ? 'success' : 'warning'}
            label={session.report_url ? '详细报告已提交' : '处理中'}
          />
          <Chip color="info" variant="outlined" label={`已收款 RM${amount.toFixed(2)}`} />
        </Stack>
      </Stack>
    </Card>
  );
}

CaseOverviewCard.propTypes = { session: PropTypes.object.isRequired };
