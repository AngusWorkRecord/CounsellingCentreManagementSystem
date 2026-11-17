import PropTypes from 'prop-types';
import { useId } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Stack, Typography } from '@mui/material';
import { tr, useUiLanguage } from '../../locales/translate';
import fields from './fields.json';

export function FeedbackSources({ sourceRefs }) {
  useUiLanguage();
  return <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1, overflowWrap: 'anywhere' }}>
    {tr('Sources:')} {sourceRefs.map((ref) => fields[ref.replace('field:', '')] ? tr(fields[ref.replace('field:', '')].label) : ref).join(', ')}
  </Typography>;
}
FeedbackSources.propTypes = { sourceRefs: PropTypes.array.isRequired };

export function FeedbackItems({ items, warning = false }) {
  useUiLanguage();
  if (!items.length) return <Typography variant="body2" color="text.secondary">{tr('No additional points were returned for this section.')}</Typography>;
  return <Stack spacing={2}>{items.map((item, index) => {
    const content = <><Typography variant="subtitle2">{item.title}</Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{item.detail}</Typography><FeedbackSources sourceRefs={item.sourceRefs} /></>;
    return warning ? <Alert key={index} severity="warning">{content}</Alert> : <Box key={index}>{content}</Box>;
  })}</Stack>;
}
FeedbackItems.propTypes = { items: PropTypes.array.isRequired, warning: PropTypes.bool };

export default function FeedbackDetails({ name, title, expanded, onChange, children }) {
  useUiLanguage();
  const id = useId();
  const open = Boolean(expanded[name]);
  return <Accordion disableGutters elevation={0} expanded={open} onChange={(_, value) => onChange(name, value)}
    TransitionProps={{ unmountOnExit: true }} sx={{ border: 1, borderColor: 'divider', borderRadius: '8px !important', '&:before': { display: 'none' }, overflowWrap: 'anywhere' }}>
    <AccordionSummary id={`${id}-heading`} aria-controls={`${id}-content`}
      expandIcon={<Box component="span" aria-hidden="true" sx={{ fontSize: 20 }}>{open ? '−' : '+'}</Box>}>
      <Typography variant="subtitle2" sx={{ minWidth: 0, pr: 1 }}>{tr(title)}</Typography>
    </AccordionSummary>
    <AccordionDetails><Stack spacing={2}>{children}</Stack></AccordionDetails>
  </Accordion>;
}
FeedbackDetails.propTypes = { name: PropTypes.string.isRequired, title: PropTypes.string.isRequired,
  expanded: PropTypes.object.isRequired, onChange: PropTypes.func.isRequired, children: PropTypes.node };
