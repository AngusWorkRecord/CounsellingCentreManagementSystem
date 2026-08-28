import PropTypes from 'prop-types';
import { Box, Card, Divider, Grid, Link, Stack, Typography } from '@mui/material';
import Iconify from '../../../../../components/iconify';
import { valueOrDash } from './utils';

export default function CaseRecordCard({ session }) {
  const rows = [
    // 中文原文：数据库 ID、报告状态、已完成、未完成、通知状态、已发送、未发送、收到款项
    ['Database ID', session.id],
    ['Respondent ID', session.respondent_id],
    ['Submission ID', session.submission_id],
    ['Report Status', session.report_completed ? 'Completed' : 'Incomplete'],
    ['Notification Status', session.notification_sent ? 'Sent' : 'Not Sent'],
    ['Payment Received', `RM${Number(session.amount_received_rm || 0).toFixed(2)}`],
  ];

  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Iconify icon="eva:file-text-outline" width={22} sx={{ color: 'primary.main' }} />
        {/* 中文原文：个案记录 */}<Typography variant="h6">Case Record</Typography>
      </Stack>
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
        {rows.map(([label, value]) => (
          <Box key={label}>
            <Grid container>
              <Grid item xs={5} sm={4} sx={{ p: 1.5, bgcolor: 'background.neutral' }}><Typography variant="subtitle2">{label}</Typography></Grid>
              <Grid item xs={7} sm={8} sx={{ p: 1.5 }}><Typography variant="body2">{valueOrDash(value)}</Typography></Grid>
            </Grid>
            <Divider />
          </Box>
        ))}
        <Grid container>
          <Grid item xs={5} sm={4} sx={{ p: 1.5, bgcolor: 'background.neutral' }}><Typography variant="subtitle2">Detailed Report Link</Typography></Grid>
          <Grid item xs={7} sm={8} sx={{ p: 1.5, minWidth: 0 }}>
            {session.report_url ? <Link href={session.report_url} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: 'break-all' }}>{session.report_url}</Link> : <Typography variant="body2">-</Typography>}
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
}

CaseRecordCard.propTypes = { session: PropTypes.object.isRequired };
