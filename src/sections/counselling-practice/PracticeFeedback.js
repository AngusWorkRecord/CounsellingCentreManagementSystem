import PropTypes from 'prop-types';
import { Alert, Box, Chip, Divider, LinearProgress, Stack, Typography } from '@mui/material';
import { tr, useUiLanguage, currentLocale } from '../../locales/translate';
import fields from './fields.json';
import { sections } from './model';

export default function PracticeFeedback({ feedback, stale, loading, error }) {
  useUiLanguage();
  return <Stack spacing={2} aria-live="polite" sx={{ overflowWrap: 'anywhere' }}>
    <Box><Chip size="small" label={tr('For learning and reflection')} color="primary" variant="outlined" sx={{ mb: 1 }} />
      <Typography variant="h5">{tr('AI feedback')}</Typography></Box>
    {loading && <Box><LinearProgress /><Typography variant="body2" sx={{ mt: 1 }}>{tr('Preparing feedback. You can cancel at any time.')}</Typography></Box>}
    {error && <Alert severity="error">{tr(error)}</Alert>}
    {stale && <Alert severity="warning">{tr('Your record has changed. This feedback is outdated; generate new feedback before using it.')}</Alert>}
    {!feedback && <Box sx={{ py: 4 }}><Typography variant="h6" gutterBottom>{tr('A space to think about your next session')}</Typography>
      <Typography color="text.secondary">{tr('Enter a session summary, then generate feedback to explore missing information, next-session questions and points for supervision. AI only runs when you ask.')}</Typography></Box>}
    {feedback && <>
      <Typography variant="caption" color="text.secondary">{tr('Generated:')} {new Date(feedback.generatedAt).toLocaleString(currentLocale())} · {tr('Feedback language')}: {feedback.language === 'cn' ? '中文' : 'English'}</Typography>
      {Object.entries(sections).map(([key, title]) => {
        const items = feedback.result[key];
        if (key === 'humanReview' && !items.length) return null;
        return <Box key={key}>
          <Typography variant="subtitle1" gutterBottom>{tr(title)}</Typography>
          {items.length ? items.map((item, index) => <Box key={`${key}-${index}`} sx={{ mb: 2 }}>
            {key === 'humanReview' ? <Alert severity="warning"><b>{item.title}</b><br />{item.detail}</Alert> : <><Typography variant="subtitle2">{item.title}</Typography><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{item.detail}</Typography></>}
            <Typography variant="caption" color="text.secondary">{tr('Sources:')} {item.sourceRefs.map((ref) => fields[ref.replace('field:', '')] ? tr(fields[ref.replace('field:', '')].label) : ref).join(', ')}</Typography>
          </Box>) : <Typography variant="body2" color="text.secondary">{tr('No additional points were returned for this section.')}</Typography>}
          <Divider sx={{ mt: 2 }} />
        </Box>;
      })}
      <Box><Typography variant="subtitle1">{tr('Limitations')}</Typography>{feedback.result.limitations.map((text, index) => <Typography key={index} variant="body2" sx={{ mt: 1 }}>{text}</Typography>)}</Box>
    </>}
    <Alert severity="info">{tr('AI feedback supports learning. It is not a diagnosis, a final risk assessment or a replacement for supervision. Review suggestions with your supervisor; no listed concerns does not establish safety.')}</Alert>
  </Stack>;
}
PracticeFeedback.propTypes = { feedback: PropTypes.object, stale: PropTypes.bool, loading: PropTypes.bool, error: PropTypes.string };
