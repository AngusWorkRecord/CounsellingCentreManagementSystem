import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { tr, useUiLanguage } from '../../locales/translate';
import { validateShift } from './rosterModel';
import { METHODS, LABELS, groupPeople } from './autoRoster';

export default function DutyShiftDialog({
  initial,
  shifts,
  people,
  knownPeople,
  loading,
  loadError,
  onReload,
  onClose,
  onSave,
  onDelete,
  onSwap,
  rules,
  period,
}) {
  useUiLanguage();
  const [draft, setDraft] = useState(() => ({
    ...initial,
    method: initial.method || 'phone',
    groupId: initial.groupId || '',
  }));
  const [editing, setEditing] = useState(!initial.id);
  const [errors, setErrors] = useState([]);
  const [confirmation, setConfirmation] = useState('');
  const group = rules.groups.find((g) => g.id === draft.groupId);
  const { personIds } = draft;
  const value = { ...draft, personIds };
  const names = (ids) => ids.map((id) => knownPeople[id]?.name || id).join(', ');
  const update = (key, next) => {
    setDraft((old) => ({ ...old, [key]: next }));
  };
  const close = () => {
    if (
      editing &&
      JSON.stringify(draft) !==
        JSON.stringify({
          ...initial,
          method: initial.method || 'phone',
          groupId: initial.groupId || '',
        })
    )
      setConfirmation('discard');
    else onClose();
  };
  const save = (event) => {
    event.preventDefault();
    const issues = Object.values(validateShift(value));
    if (
      initial.id &&
      JSON.stringify(shifts.find((s) => s.id === initial.id)) !== JSON.stringify(initial)
    )
      issues.push('Assignments changed. Recheck the selection before confirming.');
    setErrors([...new Set(issues)]);
    if (!issues.length && !loading && !loadError) {
      onSave({ ...value, manualAssignment: { type: 'manualEdit' } });
    }
  };
  let title = 'Shift details';
  if (!initial.id) title = 'Add shift';
  else if (editing) title = 'Edit shift';
  return (
    <>
      <Dialog open fullWidth maxWidth="sm" onClose={close}>
        <form onSubmit={save} noValidate>
          <DialogTitle>{tr(title)}</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {(loading || loadError) && (
                <Alert
                  severity="warning"
                  action={<Button onClick={onReload}>{tr('Retry')}</Button>}
                >
                  {tr('Personnel could not be loaded. Retry before adding or editing shifts.')}
                </Alert>
              )}
              {errors.map((error) => (
                <Alert key={error} severity="error">
                  {tr(error)}
                </Alert>
              ))}
              <TextField
                disabled={!editing}
                type="date"
                label={tr('Shift date')}
                value={draft.date}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => update('date', e.target.value)}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {['start', 'end'].map((key) => (
                  <TextField
                    fullWidth
                    key={key}
                    disabled={!editing}
                    type="time"
                    label={tr(key === 'start' ? 'Start time' : 'End time')}
                    value={draft[key]}
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) => update(key, e.target.value)}
                  />
                ))}
              </Stack>
              <TextField
                select
                disabled={!editing}
                label={tr('Duty type')}
                value={draft.method}
                onChange={(e) => update('method', e.target.value)}
              >
                {METHODS.map((method) => (
                  <MenuItem key={method} value={method}>
                    {tr(LABELS[method])}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                disabled={!editing}
                label={tr('Fixed group')}
                value={draft.groupId}
                onChange={(e) => {
                  const id = e.target.value;
                  const selected = rules.groups.find((g) => g.id === id);
                  if (id !== draft.groupId) {
                    setDraft((old) => ({
                      ...old,
                      groupId: id,
                      personIds: selected ? groupPeople(selected) : [],
                      manualAssignment: undefined,
                    }));
                  }
                }}
              >
                <MenuItem value="">{tr('Choose a fixed group.')}</MenuItem>
                {rules.groups.map((g) => (
                  <MenuItem
                    key={g.id}
                    value={g.id}
                    sx={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}
                  >
                    {names(groupPeople(g))}
                  </MenuItem>
                ))}
                {draft.groupId && !group && (
                  <MenuItem value={draft.groupId}>{tr('Unavailable group')}</MenuItem>
                )}
              </TextField>
              <Typography sx={{ overflowWrap: 'anywhere' }}>{names(personIds)}</Typography>
              {editing && (
                <TextField
                  select
                  SelectProps={{ native: true, multiple: true }}
                  label={tr('Duty personnel')}
                  InputLabelProps={{ shrink: true }}
                  value={personIds}
                  onChange={(e) =>
                    update(
                      'personIds',
                      Array.from(e.target.selectedOptions, (o) => o.value)
                    )
                  }
                >
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </TextField>
              )}
              <TextField
                disabled={!editing}
                multiline
                minRows={3}
                label={tr('Shift notes (optional)')}
                value={draft.note}
                onChange={(e) => update('note', e.target.value)}
                inputProps={{ maxLength: 2000 }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ flexWrap: 'wrap' }}>
            {initial.id && !editing && onSwap && (
              <Button onClick={onSwap} disabled={loading || !!loadError}>
                {tr('Swap personnel')}
              </Button>
            )}
            {initial.id && (
              <Button color="error" onClick={() => setConfirmation('delete')}>
                {tr('Delete shift')}
              </Button>
            )}
            <Button onClick={close}>{tr('Close')}</Button>
            {editing ? (
              <Button type="submit" variant="contained" disabled={loading || !!loadError}>
                {tr('Save shift')}
              </Button>
            ) : (
              <Button onClick={() => setEditing(true)}>{tr('Edit shift')}</Button>
            )}
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={!!confirmation} onClose={() => setConfirmation('')}>
        <DialogTitle>
          {tr(confirmation === 'delete' ? 'Delete this shift?' : 'Discard unsaved changes?')}
        </DialogTitle>
        <DialogContent>
          {tr(
            confirmation === 'delete'
              ? 'This temporary shift will be deleted. This cannot be undone.'
              : 'Your unsaved changes will be lost.'
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmation('')}>{tr('Go back')}</Button>
          <Button
            color="error"
            onClick={() => (confirmation === 'delete' ? onDelete(initial.id) : onClose())}
          >
            {tr('Confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

DutyShiftDialog.propTypes = {
  initial: PropTypes.object.isRequired,
  shifts: PropTypes.array.isRequired,
  people: PropTypes.array.isRequired,
  knownPeople: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  loadError: PropTypes.object,
  onReload: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSwap: PropTypes.func,
  rules: PropTypes.object.isRequired,
  period: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};
