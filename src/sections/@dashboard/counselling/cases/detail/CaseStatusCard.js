import PropTypes from 'prop-types';
import { Box, Card, Stack, Typography } from '@mui/material';
import Iconify from '../../../../../components/iconify';
import { formatDate, formatTime } from './utils';

export default function CaseStatusCard({ session }) {
  const steps = [
    { label: '个案预约', complete: true, detail: `${formatDate(session.counselling_date)} ${formatTime(session.session_start)}` },
    {
      label: '辅导已完成',
      complete: Boolean(String(session.session_end || '').trim()),
      detail: session.session_end ? `${formatDate(session.counselling_date)} ${formatTime(session.session_end)}` : '',
    },
    { label: '简要报告已提交', complete: Boolean(String(session.volunteer_actions || '').trim()), detail: '' },
    { label: '详细报告已提交', complete: Boolean(String(session.report_url || '').trim()), detail: '' },
  ];

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2.5 }}>个案状态</Typography>
      <Stack>
        {steps.map((step, index) => (
          <Stack key={step.label} direction="row" spacing={1.5} sx={{ minHeight: 70 }}>
            <Stack alignItems="center">
              <Box sx={{ width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', color: step.complete ? 'common.white' : 'text.disabled', bgcolor: step.complete ? 'primary.main' : 'grey.200', fontWeight: 700 }}>
                {index + 1}
              </Box>
              {index < steps.length - 1 && <Box sx={{ width: 2, flexGrow: 1, bgcolor: step.complete ? 'primary.light' : 'divider' }} />}
            </Stack>
            <Box sx={{ flexGrow: 1, pt: 0.25 }}>
              <Typography variant="subtitle2">{step.label}</Typography>
              {step.detail && <Typography variant="caption" color="text.secondary">{step.detail}</Typography>}
            </Box>
            <Iconify icon={step.complete ? 'eva:checkmark-circle-2-fill' : 'eva:clock-outline'} width={22} sx={{ color: step.complete ? 'success.main' : 'text.disabled', mt: 0.5 }} />
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}

CaseStatusCard.propTypes = { session: PropTypes.object.isRequired };
