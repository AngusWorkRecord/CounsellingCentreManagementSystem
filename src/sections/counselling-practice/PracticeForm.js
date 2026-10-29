import PropTypes from 'prop-types';
import { Box, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { tr, useUiLanguage } from '../../locales/translate';
import { domainLabel } from '../../locales/domainLabels';
import { CASE_CATEGORIES } from '../@dashboard/counselling/cases/create/constants';
import fields from './fields.json';

export default function PracticeForm({ record, onChange, errors }) {
  useUiLanguage();
  return <Stack spacing={3}>
    {[
      ['Case background', ['caseCode', 'caseCategory', 'background']],
      ['Session record', ['summary', 'actions']],
      ['Learning and reflection', ['understanding', 'questions']],
    ].map(([title, keys], index) => <Box key={title}>
      <Typography variant="overline" color="primary.main">{tr('Practice section {{p0}}', { p0: index + 1 })}</Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>{tr(title)}</Typography>
      <Stack spacing={2}>{keys.map((key) => <TextField key={key} name={key} fullWidth
        label={tr(fields[key].label)} value={record[key]} required={key === 'summary'}
        select={key === 'caseCategory'} multiline={!['caseCode', 'caseCategory'].includes(key)}
        minRows={key === 'summary' ? 6 : 3}
        inputProps={{ maxLength: fields[key].limit }}
        error={Boolean(errors[key])}
        helperText={errors[key] ? tr(errors[key]) : tr('{{p0}} / {{p1}} characters', { p0: record[key].length, p1: fields[key].limit })}
        onChange={(event) => onChange({ ...record, [key]: event.target.value })}>
        {key === 'caseCategory' && [<MenuItem key="empty" value="">{tr('Not specified')}</MenuItem>, ...CASE_CATEGORIES.map((category) => <MenuItem key={category} value={category}>{domainLabel(category)}</MenuItem>)]}
      </TextField>)}</Stack>
    </Box>)}
  </Stack>;
}
PracticeForm.propTypes = { record: PropTypes.object.isRequired, onChange: PropTypes.func.isRequired, errors: PropTypes.object.isRequired };
