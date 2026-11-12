import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import useResponsive from '../../hooks/useResponsive';
import { currentLocale, tr, useUiLanguage } from '../../locales/translate';
import { domainLabel } from '../../locales/domainLabels';
import { activeStaff, overlappingShifts, validateShift } from './rosterModel';

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
}) {
  useUiLanguage();
  const desktop = useResponsive('up', 'sm');
  const [draft, setDraft] = useState(() => ({ ...initial, personIds: [...initial.personIds] }));
  const [editing, setEditing] = useState(!initial.id);
  const [submitted, setSubmitted] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const candidates = activeStaff(people);
  const blocked = loading || !!loadError;
  const errors = submitted ? validateShift(draft, people) : {};
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const personName = (id) => knownPeople[id]?.name || tr('Unavailable person #{{id}}', { id });
  const choices = [...new Set([...candidates.map((person) => person.id), ...draft.personIds])];
  const update = (key, value) => setDraft((old) => ({ ...old, [key]: value }));
  const close = () => {
    if (editing && dirty) setConfirmation({ action: 'discard' });
    else onClose();
  };
  const save = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (blocked || Object.keys(validateShift(draft, people)).length) return;
    const overlaps = overlappingShifts(draft, shifts);
    if (overlaps.length)
      setConfirmation({
        action: 'overlap',
        draft: { ...draft, personIds: [...draft.personIds] },
        overlaps,
      });
    else onSave(draft);
  };
  const confirm = () => {
    if (confirmation.action === 'delete') {
      onDelete(initial.id);
      return;
    }
    if (confirmation.action === 'discard') {
      onClose();
      return;
    }
    if (blocked || Object.keys(validateShift(confirmation.draft, people)).length) {
      setSubmitted(true);
      setConfirmation(null);
      return;
    }
    onSave(confirmation.draft);
  };
  const title = () => {
    if (!initial.id) return tr('Add shift');
    return editing ? tr('Edit shift') : tr('Shift details');
  };
  const confirmTitle = () => {
    if (confirmation?.action === 'delete') return tr('Delete this shift?');
    if (confirmation?.action === 'discard') return tr('Discard unsaved changes?');
    return tr('Overlapping duty times');
  };
  const confirmText = () => {
    if (confirmation?.action === 'delete')
      return tr('This temporary shift will be deleted. This cannot be undone.');
    if (confirmation?.action === 'discard') return tr('Your unsaved changes will be lost.');
    return tr(
      'Some selected people already have a shift during this time. Save this overlapping shift anyway?'
    );
  };
  const formatDate = (value) =>
    new Intl.DateTimeFormat(currentLocale(), {
      timeZone: 'Asia/Kuala_Lumpur',
      dateStyle: 'full',
    }).format(new Date(`${value}T12:00:00+08:00`));
  const formatTime = (value) =>
    new Intl.DateTimeFormat(currentLocale(), {
      timeZone: 'Asia/Kuala_Lumpur',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(`${draft.date}T${value}:00+08:00`));
  return (
    <>
      <Dialog
        open
        onClose={close}
        fullWidth
        maxWidth="sm"
        fullScreen={!desktop}
        aria-labelledby="duty-shift-title"
      >
        <Box
          component="form"
          noValidate
          onSubmit={save}
          sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
        >
          <DialogTitle id="duty-shift-title">{title()}</DialogTitle>
          <DialogContent dividers>
            {editing ? (
              <Stack spacing={2.5} sx={{ pt: 1 }}>
                {blocked && (
                  <Alert
                    severity={loadError ? 'error' : 'info'}
                    action={loadError && <Button onClick={onReload}>{tr('Retry')}</Button>}
                  >
                    {tr(
                      loadError
                        ? 'Personnel could not be loaded. Retry before adding or editing shifts.'
                        : 'Loading personnel...'
                    )}
                  </Alert>
                )}
                {!blocked && !candidates.length && (
                  <Alert severity="info">
                    {tr(
                      'No active counsellors or volunteers. Add an active person in personnel management first.'
                    )}
                  </Alert>
                )}
                <TextField
                  required
                  type="date"
                  label={tr('Shift date')}
                  value={draft.date}
                  onChange={(event) => update('date', event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.date}
                  helperText={errors.date ? tr(errors.date) : ''}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    required
                    fullWidth
                    type="time"
                    label={tr('Start time')}
                    value={draft.start}
                    onChange={(event) => update('start', event.target.value)}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.start}
                    helperText={errors.start ? tr(errors.start) : ''}
                  />
                  <TextField
                    required
                    fullWidth
                    type="time"
                    label={tr('End time')}
                    value={draft.end}
                    onChange={(event) => update('end', event.target.value)}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.end}
                    helperText={errors.end ? tr(errors.end) : ''}
                  />
                </Stack>
                <FormControl required fullWidth disabled={blocked} error={!!errors.personIds}>
                  <InputLabel id="shift-people-label">{tr('Duty personnel')}</InputLabel>
                  <Select
                    multiple
                    labelId="shift-people-label"
                    label={tr('Duty personnel')}
                    value={draft.personIds}
                    onChange={(event) =>
                      update(
                        'personIds',
                        typeof event.target.value === 'string'
                          ? event.target.value.split(',')
                          : event.target.value
                      )
                    }
                    renderValue={(ids) => ids.map(personName).join(', ')}
                    sx={{
                      '& .MuiSelect-select': { whiteSpace: 'normal', overflowWrap: 'anywhere' },
                    }}
                  >
                    {choices.map((id) => (
                      <MenuItem
                        key={id}
                        value={id}
                        disabled={!candidates.some((person) => person.id === id)}
                        sx={{ whiteSpace: 'normal' }}
                      >
                        <Checkbox checked={draft.personIds.includes(id)} />
                        <ListItemText
                          primary={personName(id)}
                          secondary={knownPeople[id] ? domainLabel(knownPeople[id].type) : ''}
                          sx={{ overflowWrap: 'anywhere' }}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {errors.personIds
                      ? tr(errors.personIds)
                      : tr('Select one or more active counsellors and volunteers.')}
                  </FormHelperText>
                </FormControl>
                {draft.personIds.some((id) => !candidates.some((person) => person.id === id)) && (
                  <Button
                    onClick={() =>
                      update(
                        'personIds',
                        draft.personIds.filter((id) =>
                          candidates.some((person) => person.id === id)
                        )
                      )
                    }
                  >
                    {tr('Remove unavailable personnel')}
                  </Button>
                )}
                <TextField
                  multiline
                  minRows={3}
                  label={tr('Shift notes (optional)')}
                  value={draft.note}
                  onChange={(event) => update('note', event.target.value)}
                  inputProps={{ maxLength: 2000 }}
                  error={!!errors.note}
                  helperText={errors.note ? tr(errors.note) : ''}
                />
              </Stack>
            ) : (
              <Stack spacing={2.5} sx={{ overflowWrap: 'anywhere' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    {tr('Shift date')}
                  </Typography>
                  <Typography variant="h6">{formatDate(draft.date)}</Typography>
                  <Typography>
                    {formatTime(draft.start)}–{formatTime(draft.end)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {tr('Duty personnel')}
                  </Typography>
                  {draft.personIds.map((id) => (
                    <Typography key={id}>{personName(id)}</Typography>
                  ))}
                </Box>
                <Box>
                  <Typography variant="subtitle2">{tr('Shift notes (optional)')}</Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{draft.note || '—'}</Typography>
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1, flexWrap: 'wrap' }}>
            {initial.id && (
              <Button color="error" onClick={() => setConfirmation({ action: 'delete' })}>
                {tr('Delete shift')}
              </Button>
            )}
            <Box sx={{ flex: 1 }} />
            <Button onClick={close}>{tr('Close')}</Button>
            {editing ? (
              <Button variant="contained" type="submit" disabled={blocked || !candidates.length}>
                {tr('Save shift')}
              </Button>
            ) : (
              <Button variant="contained" disabled={blocked} onClick={() => setEditing(true)}>
                {tr('Edit shift')}
              </Button>
            )}
          </DialogActions>
        </Box>
      </Dialog>
      <Dialog
        open={!!confirmation}
        onClose={() => setConfirmation(null)}
        fullWidth
        maxWidth="xs"
        aria-labelledby="shift-confirm-title"
      >
        <DialogTitle id="shift-confirm-title">{confirmTitle()}</DialogTitle>
        <DialogContent>
          <Typography>{confirmText()}</Typography>
          {confirmation?.overlaps?.map((shift) => (
            <Alert key={shift.id} severity="warning" sx={{ mt: 1, overflowWrap: 'anywhere' }}>
              {shift.start}–{shift.end} ·{' '}
              {shift.personIds
                .filter((id) => draft.personIds.includes(id))
                .map(personName)
                .join(', ')}
            </Alert>
          ))}
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap' }}>
          <Button onClick={() => setConfirmation(null)}>{tr('Go back')}</Button>
          <Button
            variant="contained"
            color={confirmation?.action === 'overlap' ? 'warning' : 'error'}
            onClick={confirm}
            disabled={confirmation?.action === 'overlap' && blocked}
          >
            {confirmation?.action === 'overlap' ? tr('Save anyway') : tr('Confirm')}
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
};
