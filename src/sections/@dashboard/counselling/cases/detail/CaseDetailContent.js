import PropTypes from 'prop-types';
import { Box, Grid, Stack } from '@mui/material';
import CaseAiTip from './CaseAiTip';
import CaseOverviewCard from './CaseOverviewCard';
import CaseQuickActions from './CaseQuickActions';
import CaseRecordCard from './CaseRecordCard';
import CaseStatusCard from './CaseStatusCard';
import CaseTextCard from './CaseTextCard';

const equalCardStackSx = {
  height: '100%',
  '& > .MuiCard-root': { flex: { md: 1 } },
};

const fullHeightCardSx = {
  width: 1,
  '& > .MuiCard-root': { height: '100%' },
};

export default function CaseDetailContent({ session, onBack }) {
  return (
    <Stack spacing={2.5}>
      <CaseOverviewCard session={session} />

      <Grid container spacing={2.5} alignItems="stretch">
        <Grid item xs={12} md={6}>
          <Stack spacing={2.5} sx={equalCardStackSx}>
            <CaseTextCard icon="eva:file-text-outline" title="案主自述摘要">
              {session.client_summary}
            </CaseTextCard>
            <CaseTextCard icon="eva:activity-outline" title="志工处理步骤">
              {session.volunteer_actions}
            </CaseTextCard>
          </Stack>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Box sx={fullHeightCardSx}>
            <CaseStatusCard session={session} />
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} alignItems="stretch">
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Box sx={fullHeightCardSx}>
            <CaseRecordCard session={session} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={2.5} sx={equalCardStackSx}>
            <CaseQuickActions session={session} onBack={onBack} />
            <CaseAiTip session={session} />
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}

CaseDetailContent.propTypes = {
  onBack: PropTypes.func.isRequired,
  session: PropTypes.object.isRequired,
};
