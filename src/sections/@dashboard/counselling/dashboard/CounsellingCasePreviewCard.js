import PropTypes from 'prop-types';
import { Box, Button, Card, Chip, Grid, Stack, Typography } from '@mui/material';
import Iconify from '../../../../components/iconify';
import { formatDuration } from '../utils';

function formatDate(value) {
  return String(value || '').slice(0, 10) || '-';
}

function formatTime(value) {
  return String(value || '').slice(0, 5) || '-';
}

function Info({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Iconify icon={icon} width={19} sx={{ color: 'text.secondary' }} />
      <Typography variant="body2">
        <Box component="span" sx={{ color: 'text.secondary' }}>{label}：</Box>
        {value || '-'}
      </Typography>
    </Stack>
  );
}

Info.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};

export default function CounsellingCasePreviewCard({ onView, session }) {
  const hasId = Boolean(String(session.id || '').trim());

  return (
    <Card variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Typography variant="h6" color="primary.main" sx={{ wordBreak: 'break-word' }}>
            {session.case_number || `个案 #${session.id || '-'}`}
          </Typography>
          <Typography variant="subtitle1" color="primary.main" sx={{ mt: 1 }}>
            {session.client_initials || '-'} · {session.case_category || '未分类'}
          </Typography>
        </Grid>

        <Grid item xs={12} md={9}>
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <Info icon="eva:person-outline" label="辅导员" value={session.counsellor} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Info icon="eva:calendar-outline" label="日期" value={formatDate(session.counselling_date)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Info
                icon="eva:clock-outline"
                label="时间"
                value={`${formatTime(session.session_start)} – ${formatTime(session.session_end)}`}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Info
                icon="eva:pie-chart-outline"
                label="辅导时长"
                value={formatDuration(session.duration_minutes)}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>



      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mt: 2 }}
      >
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>个案摘要</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {session.client_summary || '-'}
          </Typography>
        </Box>

        <Button
          variant="contained"
          disabled={!hasId}
          onClick={() => onView(session.id)}
          endIcon={<Iconify icon="eva:arrow-forward-outline" />}
        >
          查看个案详情
        </Button>
      </Stack>
    </Card>
  );
}

CounsellingCasePreviewCard.propTypes = {
  onView: PropTypes.func.isRequired,
  session: PropTypes.object.isRequired,
};
