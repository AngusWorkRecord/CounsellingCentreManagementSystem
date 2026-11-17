import PropTypes from 'prop-types';
import { Alert, Box, Stack, Typography } from '@mui/material';
import { tr, useUiLanguage } from '../../locales/translate';
import { sections } from './model';
import FeedbackDetails, { FeedbackItems } from './FeedbackDetails';

export default function LegacyFeedback({ result, expanded, onChange }) {
  useUiLanguage();
  return <Stack spacing={2}>
    <Alert severity="info">{tr('This response uses the earlier feedback format. Its original content is preserved; the session route is not included.')}</Alert>
    {Object.entries(sections).filter(([key]) => key !== 'humanReview').map(([key, title]) =>
      <FeedbackDetails key={key} name={`legacy-${key}`} title={title} expanded={expanded} onChange={onChange}><FeedbackItems items={result[key]} /></FeedbackDetails>)}
    <FeedbackDetails name="legacy-limitations" title="Limitations" expanded={expanded} onChange={onChange}>
      <Box component="ul" sx={{ m: 0, pl: 2.5 }}>{result.limitations.map((text, index) => <Typography key={index} component="li" variant="body2">{text}</Typography>)}</Box>
    </FeedbackDetails>
  </Stack>;
}
LegacyFeedback.propTypes = { result: PropTypes.object.isRequired, expanded: PropTypes.object.isRequired, onChange: PropTypes.func.isRequired };
