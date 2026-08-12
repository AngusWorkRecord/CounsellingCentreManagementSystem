import PropTypes from 'prop-types';
import { Box, Card, Divider, Grid, Link, Stack, Typography } from '@mui/material';
import Iconify from '../../../../../components/iconify';
import { valueOrDash } from './utils';

export default function CaseRecordCard({ session }) {
  const rows = [
    ['数据库 ID', session.id],
    ['Respondent ID', session.respondent_id],
    ['Submission ID', session.submission_id],
    ['报告状态', session.report_completed ? '已完成' : '未完成'],
    ['通知状态', session.notification_sent ? '已发送' : '未发送'],
    ['收到款项', `RM${Number(session.amount_received_rm || 0).toFixed(2)}`],
  ];

  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Iconify icon="eva:file-text-outline" width={22} sx={{ color: 'primary.main' }} />
        <Typography variant="h6">个案记录</Typography>
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
          <Grid item xs={5} sm={4} sx={{ p: 1.5, bgcolor: 'background.neutral' }}><Typography variant="subtitle2">详细报告链接</Typography></Grid>
          <Grid item xs={7} sm={8} sx={{ p: 1.5, minWidth: 0 }}>
            {session.report_url ? <Link href={session.report_url} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: 'break-all' }}>{session.report_url}</Link> : <Typography variant="body2">-</Typography>}
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
}

CaseRecordCard.propTypes = { session: PropTypes.object.isRequired };
