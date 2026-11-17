import PropTypes from 'prop-types';
import { Box, Stack, Typography } from '@mui/material';
import { tr, useUiLanguage } from '../../locales/translate';
import { STAGE_KEYS, stageTitles, reasoningTitles } from './model';
import FeedbackDetails, { FeedbackItems, FeedbackSources } from './FeedbackDetails';

export default function PreparationCards({ result, expanded, onChange }) {
  useUiLanguage();
  const details = { expanded, onChange };
  return <Stack spacing={3}>
    <Box><Typography variant="h6" sx={{ mb: 2 }}>{tr('What to focus on')}</Typography>
      <FeedbackItems items={result.priorities} /></Box>
    <Box><Typography variant="h6">{tr('Your next-session route')}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>{tr('Use these as flexible options. Follow the client’s pace and adapt the questions to their response.')}</Typography>
      <Stack spacing={2}>{STAGE_KEYS.map((key, index) => {
        const stage = result.sessionRoute[key];
        return <Box component="section" key={key} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, sm: 2.5 }, minWidth: 0 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
            <Box component="span" aria-hidden="true" sx={{ display: 'grid', placeItems: 'center', flexShrink: 0, width: 28, height: 28, borderRadius: 1, bgcolor: 'primary.lighter', color: 'primary.dark', fontWeight: 700 }}>{index + 1}</Box>
            <Typography variant="subtitle1" component="h3">{tr(stageTitles[key])}</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{stage.aim}</Typography>
          <Typography variant="caption" color="text.secondary">{tr('A question you could ask')}</Typography>
          <Typography component="p" variant="subtitle1" sx={{ mt: 0.5, mb: 2, pl: 1.5, borderLeft: 3, borderColor: 'primary.main', whiteSpace: 'pre-wrap' }}>{stage.question}</Typography>
          <FeedbackDetails name={`route-${key}`} title="Purpose, evidence and follow-up questions" {...details}>
            <Box><Typography variant="subtitle2">{tr('Why ask this?')}</Typography><Typography variant="body2" sx={{ mt: 0.5 }}>{stage.rationale}</Typography><FeedbackSources sourceRefs={stage.sourceRefs} /></Box>
            {stage.followUps.length > 0 && <Stack spacing={2}>
              <Typography variant="caption" color="text.secondary">{tr('Possible follow-ups, not assumed client responses')}</Typography>
              {stage.followUps.map((branch, branchIndex) => <Box key={branchIndex} sx={{ bgcolor: 'background.neutral', borderRadius: 1, p: 1.5 }}>
                <Typography variant="caption" color="text.secondary">{tr('If the client responds this way')}</Typography><Typography variant="body2">{branch.when}</Typography>
                <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1 }}>{tr('You could follow up with')}</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{branch.question}</Typography>
              </Box>)}
            </Stack>}
          </FeedbackDetails>
        </Box>;
      })}</Stack>
    </Box>
    <FeedbackDetails name="reasoning" title="Why these suggestions?" {...details}>
      {Object.entries(reasoningTitles).map(([key, title]) => <Box key={key}><Typography variant="subtitle2" sx={{ mb: 1 }}>{tr(title)}</Typography><FeedbackItems items={result.reasoning[key]} /></Box>)}
    </FeedbackDetails>
    <FeedbackDetails name="supervision" title="Discussion with your supervisor" {...details}><FeedbackItems items={result.supervision} /></FeedbackDetails>
    <FeedbackDetails name="limitations" title="Limitations" {...details}>
      <Box component="ul" sx={{ m: 0, pl: 2.5 }}>{result.limitations.map((text, index) => <Typography key={index} component="li" variant="body2" sx={{ mb: 1 }}>{text}</Typography>)}</Box>
    </FeedbackDetails>
  </Stack>;
}
PreparationCards.propTypes = { result: PropTypes.object.isRequired, expanded: PropTypes.object.isRequired, onChange: PropTypes.func.isRequired };
