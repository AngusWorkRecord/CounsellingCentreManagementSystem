import PropTypes from 'prop-types';
import { useState } from 'react';
import { Alert, Box, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { tr, useUiLanguage, currentLocale } from '../../locales/translate';
import { domainLabel } from '../../locales/domainLabels';
import { validFeedbackResult } from './model';
import PreparationCards from './PreparationCards';
import { FeedbackItems } from './FeedbackDetails';

export default function PracticeFeedback({ feedback, stale, loading, error }) {
  const language = useUiLanguage();
  const [expandedByFeedback, setExpandedByFeedback] = useState({});
  const valid = feedback && validFeedbackResult(feedback.result);
  const identity = feedback?.key || JSON.stringify([feedback?.language, feedback?.generatedAt]);
  const details = { expanded: expandedByFeedback[identity] || {}, onChange: (name, value) => {
    setExpandedByFeedback((previous) => ({ ...previous, [identity]: { ...previous[identity], [name]: value } }));
  } };
  return <Stack spacing={2} aria-live="polite" sx={{ overflowWrap: 'anywhere' }}>
    <Box><Chip size="small" label={tr('For learning and reflection')} color="primary" variant="outlined" sx={{ mb: 1 }} />
      <Typography variant="h5">{tr('Next-session preparation')}</Typography></Box>
    {loading && <Box><LinearProgress /><Typography variant="body2" sx={{ mt: 1 }}>{tr('Preparing feedback. You can cancel at any time.')}</Typography></Box>}
    {error && <Alert severity="error">{tr(error)}</Alert>}
    {stale && <Alert severity="warning">{tr('Your record has changed. This feedback is outdated; generate new feedback before using it.')}</Alert>}
    {!feedback && <Box sx={{ py: 4 }}><Typography variant="h6" gutterBottom>{tr('A space to think about your next session')}</Typography>
      <Typography color="text.secondary">{tr('Enter a session summary, then generate feedback to explore missing information, next-session questions and points for supervision. AI only runs when you ask.')}</Typography>
      {!loading && <Typography variant="body2" sx={{ mt: 2 }}>{tr('No feedback in {{language}} yet. Click Generate AI feedback to create it.', { language: domainLabel(language) })}</Typography>}</Box>}
    {feedback && !valid && <Alert severity="error">{tr('This feedback could not be read. Generate new feedback to continue.')}</Alert>}
    {valid && <>
      <Typography variant="caption" color="text.secondary">{tr('Generated:')} {new Date(feedback.generatedAt).toLocaleString(currentLocale())} · {tr('Feedback language')}: {domainLabel(feedback.language)}</Typography>
      {feedback.result.humanReview.length > 0 && <Box component="section">
        <Typography variant="h6" sx={{ mb: 1 }}>{tr('Points requiring human attention')}</Typography>
        <FeedbackItems items={feedback.result.humanReview} warning />
      </Box>}
      <PreparationCards result={feedback.result} {...details} />
    </>}
    <Alert severity="info">{tr('AI feedback supports learning. It is not a diagnosis, a final risk assessment or a replacement for supervision. Review suggestions with your supervisor; no listed concerns does not establish safety.')}</Alert>
  </Stack>;
}
PracticeFeedback.propTypes = { feedback: PropTypes.object, stale: PropTypes.bool, loading: PropTypes.bool, error: PropTypes.string };
