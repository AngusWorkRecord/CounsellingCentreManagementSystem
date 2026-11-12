import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { currentLocale, tr, useUiLanguage } from '../../locales/translate';
import { DAYS, METHODS, LABELS } from './autoRoster';
import { groupPreferences, preferenceSignature } from './preferenceGroups';

function PreferenceFields({ value, onChange, people, preferences, months, excludeIds }) {
  useUiLanguage();
  const toggle = (key, item) =>
    onChange({
      [key]: value[key].includes(item)
        ? value[key].filter((v) => v !== item)
        : [...value[key], item],
    });
  const leaders = people.filter(
    (p) =>
      !excludeIds.includes(p.id) && preferences[p.id]?.leader && preferences[p.id]?.participating
  );
  const leaderIds = [
    ...new Set([...leaders.map((p) => p.id), ...(value.preset ? [value.preset] : [])]),
  ];
  return (
    <Stack spacing={1}>
      <Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={value.participating}
              onChange={(e) => onChange({ participating: e.target.checked })}
            />
          }
          label={tr('Participate in roster')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={value.leader}
              onChange={(e) => onChange({ leader: e.target.checked })}
            />
          }
          label={tr('Group leader qualification')}
        />
      </Box>
      <Box>
        {DAYS.map((day) => (
          <FormControlLabel
            key={day}
            control={
              <Checkbox checked={value.days.includes(day)} onChange={() => toggle('days', day)} />
            }
            label={tr(LABELS[day])}
          />
        ))}
      </Box>
      <Box>
        {METHODS.map((method) => (
          <FormControlLabel
            key={method}
            control={
              <Checkbox
                checked={value.methods.includes(method)}
                onChange={() => toggle('methods', method)}
              />
            }
            label={tr(LABELS[method])}
          />
        ))}
      </Box>
      <Box>
        {months.map((monthValue, month) => (
          <FormControlLabel
            key={monthValue}
            control={
              <Checkbox
                checked={value.months.includes(month)}
                onChange={() => toggle('months', month)}
              />
            }
            label={tr('Available in {{month}}', {
              month: new Intl.DateTimeFormat(currentLocale(), {
                timeZone: 'Asia/Kuala_Lumpur',
                year: 'numeric',
                month: 'long',
              }).format(new Date(`${monthValue}-01T12:00:00Z`)),
            })}
          />
        ))}
      </Box>
      <TextField
        select
        fullWidth
        label={tr('Preset group leader')}
        value={value.preset}
        onChange={(e) => onChange({ preset: e.target.value })}
      >
        <MenuItem value="">{tr('None')}</MenuItem>
        {leaderIds.map((id) => (
          <MenuItem key={id} value={id} sx={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
            {people.find((p) => p.id === id)?.name || id}
          </MenuItem>
        ))}
      </TextField>
      {value.leave.map((leave, index) => (
        <Stack key={index} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {['from', 'to'].map((key) => (
            <TextField
              key={key}
              type="date"
              label={tr(key === 'from' ? 'Unavailable from' : 'Unavailable until')}
              InputLabelProps={{ shrink: true }}
              value={leave[key]}
              onChange={(e) =>
                onChange({
                  leave: value.leave.map((v, i) =>
                    i === index ? { ...v, [key]: e.target.value } : v
                  ),
                })
              }
            />
          ))}
          <Button onClick={() => onChange({ leave: value.leave.filter((_, i) => i !== index) })}>
            {tr('Remove range')}
          </Button>
        </Stack>
      ))}
      <Button
        sx={{ alignSelf: 'flex-start' }}
        onClick={() => onChange({ leave: [...value.leave, { from: '', to: '' }] })}
      >
        {tr('Add unavailable dates')}
      </Button>
    </Stack>
  );
}

export default function PersonnelConditions({ people, preferences, months, onChangePeople }) {
  useUiLanguage();
  const [editing, setEditing] = useState(null);
  const groups = groupPreferences(people, preferences);
  const individual = editing && people.find((p) => p.id === editing.id);
  const changed =
    editing && (!individual || editing.original !== preferenceSignature(preferences[editing.id]));
  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {tr(
          'People with identical conditions share one card. Card changes apply to everyone listed; click a name for individual settings.'
        )}
      </Typography>
      {groups.map((group) => {
        const ids = group.people.map((p) => p.id);
        return (
          <Box
            key={group.id}
            data-preference-group
            sx={{
              p: { xs: 1.5, sm: 2 },
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              minWidth: 0,
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="subtitle1">
                {tr('{{count}} people share these conditions', {
                  count: new Intl.NumberFormat(currentLocale()).format(ids.length),
                })}
              </Typography>
              <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1}>
                {group.people.map((person) => (
                  <Chip
                    key={person.id}
                    label={person.name}
                    onClick={() =>
                      setEditing({
                        id: person.id,
                        original: preferenceSignature(preferences[person.id]),
                        draft: JSON.parse(JSON.stringify(preferences[person.id])),
                      })
                    }
                    title={tr('Individual settings for {{person}}', { person: person.name })}
                    sx={{
                      maxWidth: '100%',
                      height: 'auto',
                      '& .MuiChip-label': {
                        whiteSpace: 'normal',
                        overflowWrap: 'anywhere',
                        py: 0.5,
                      },
                    }}
                  />
                ))}
              </Stack>
              <PreferenceFields
                value={group.value}
                onChange={(patch) => onChangePeople(ids, patch)}
                people={people}
                preferences={preferences}
                months={months}
                excludeIds={ids}
              />
            </Stack>
          </Box>
        );
      })}
      {editing && (
        <Dialog open onClose={() => setEditing(null)} fullWidth maxWidth="md">
          <DialogTitle sx={{ overflowWrap: 'anywhere' }}>
            {tr('Individual settings for {{person}}', { person: individual?.name || editing.id })}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <Alert severity="info">
                {tr(
                  'These changes apply only to this person. Matching conditions are merged automatically after saving.'
                )}
              </Alert>
              {changed && (
                <Alert severity="warning">
                  {tr('Personnel conditions changed. Reopen this editor before saving.')}
                </Alert>
              )}
              <PreferenceFields
                value={editing.draft}
                onChange={(patch) =>
                  setEditing((old) => ({ ...old, draft: { ...old.draft, ...patch } }))
                }
                people={people}
                preferences={preferences}
                months={months}
                excludeIds={[editing.id]}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditing(null)}>{tr('Cancel')}</Button>
            <Button
              variant="contained"
              disabled={!!changed}
              onClick={() => {
                onChangePeople([editing.id], editing.draft);
                setEditing(null);
              }}
            >
              {tr('Save personnel conditions')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
}

PreferenceFields.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  people: PropTypes.array.isRequired,
  preferences: PropTypes.object.isRequired,
  months: PropTypes.array.isRequired,
  excludeIds: PropTypes.array.isRequired,
};
PersonnelConditions.propTypes = {
  people: PropTypes.array.isRequired,
  preferences: PropTypes.object.isRequired,
  months: PropTypes.array.isRequired,
  onChangePeople: PropTypes.func.isRequired,
};
