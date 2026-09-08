import PropTypes from 'prop-types';
import { Box, Grid, Stack } from '@mui/material';
import { tr, useUiLanguage } from '../../../../../locales/translate';
import CaseAiTip from './CaseAiTip';
import CaseOverviewCard from './CaseOverviewCard';
import CaseQuickActions from './CaseQuickActions';
import CaseRecordCard from './CaseRecordCard';
import CaseStatusCard from './CaseStatusCard';
import CaseTextCard from './CaseTextCard';

const equalCardStackSx = {
  height: '100%',
  minHeight: 0,
  '& > .MuiCard-root': { flex: { md: 1 }, minHeight: 0 },
};

const fullHeightCardSx = {
  width: 1,
  '& > .MuiCard-root': { height: '100%' },
};

const adviceCardStackSx = {
  width: 1,
  height: { md: '100%' },
  minHeight: 0,
  '& > .MuiCard-root:last-of-type': {
    flex: { md: 1 },
    minHeight: 0,
  },
};

export default function CaseDetailContent({ session, onBack }) {
  useUiLanguage();
  return (
    <Stack spacing={2.5}>
      <CaseOverviewCard session={session} />

      <Grid container spacing={2.5} alignItems="stretch">
        <Grid item xs={12} md={6}>
          <Stack spacing={2.5} sx={equalCardStackSx}>
            <CaseTextCard icon="eva:file-text-outline" title={tr("Client Statement Summary")}>
              {session.client_summary}
            </CaseTextCard>
            <CaseTextCard icon="eva:activity-outline" title={tr("Volunteer Actions")}>
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

      <Grid container spacing={2.5} alignItems="stretch" sx={{ minHeight: { md: 820 } }}>
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Box sx={fullHeightCardSx}>
            <CaseRecordCard session={session} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Stack spacing={2.5} sx={adviceCardStackSx}>
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
