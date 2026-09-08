import PropTypes from 'prop-types';
import { Box, Card, Chip, Grid, Stack, Typography } from '@mui/material';
import { domainLabel } from '../../../../../locales/domainLabels';
import { tr, useUiLanguage } from '../../../../../locales/translate';
import Iconify from '../../../../../components/iconify';
import { formatDate, formatTime, valueOrDash } from './utils';

function DetailItem({ icon, label, value }) {
  useUiLanguage();
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Iconify icon={icon} width={24} sx={{ color: 'primary.main', mt: 0.25 }} />
      <Box>
        <Typography variant="caption" color="text.secondary">{tr(label)}</Typography>
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
  useUiLanguage();
  const amount = Number(session.amount_received_rm || 0);
  const details = [
    // 中文原文：案主简称、个案类别、辅导类型、辅导员、日期、时间、时长、分钟、联系电话
    ['eva:person-outline', 'Client Initials', session.client_initials],
    ['eva:briefcase-outline', 'Case Category', domainLabel(session.case_category)],
    ['eva:message-square-outline', 'Session Mode', domainLabel(session.session_mode)],
    ['eva:people-outline', 'Counsellor', session.counsellor],
    ['eva:calendar-outline', 'Date', formatDate(session.counselling_date)],
    ['eva:clock-outline', 'Time', `${formatTime(session.session_start)} – ${formatTime(session.session_end)}`],
    ['eva:pie-chart-outline', 'Duration', tr("{{p0}} min", { p0: valueOrDash(session.duration_minutes) })],
    ['eva:phone-outline', 'Contact Number', session.client_phone],
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
          {/* 中文原文：当前状态 */}<Typography variant="caption" color="text.secondary">{tr("Current Status")}</Typography>
          <Chip
            color={session.report_url ? 'success' : 'warning'}
            label={session.report_url ? tr("Detailed Report Submitted") : tr("In Progress")}
          />
          <Chip color="info" variant="outlined" label={tr("Paid RM{{p0}}", { p0: amount.toFixed(2) })} />
        </Stack>
      </Stack>
    </Card>
  );
}

CaseOverviewCard.propTypes = { session: PropTypes.object.isRequired };
