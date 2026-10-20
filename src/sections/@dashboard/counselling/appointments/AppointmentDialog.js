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
import useResponsive from '../../../../hooks/useResponsive';
import { tr, useUiLanguage, currentLocale } from '../../../../locales/translate';
import { domainLabel } from '../../../../locales/domainLabels';
import { COUNSELLORS, SESSION_MODES } from '../cases/create/constants';
import { MOCK_CASES, hasEnded, validateAppointment } from '../../../../services/appointmentService';

export default function AppointmentDialog({ initial, items, onClose, onSave, onStatus, onDelete }) {
  useUiLanguage();
  const mobile = !useResponsive('up', 'sm');
  const [form, setForm] = useState(initial);
  const [editing, setEditing] = useState(!initial.id);
  const [errors, setErrors] = useState({});
  const [conflict, setConflict] = useState(null);
  const [confirmation, setConfirmation] = useState('');
  const dirty = JSON.stringify(initial) !== JSON.stringify(form);
  const change = (key, value) => {
    setForm((old) => ({ ...old, [key]: value }));
    setErrors({});
    setConflict(null);
  };
  const close = () => {
    if (dirty && editing) setConfirmation('discard');
    else onClose();
  };
  const save = (event) => {
    event.preventDefault();
    const clean = {
      ...form,
      clientInitials: form.clientInitials.trim(),
      phone: form.phone.trim(),
      location: form.location.trim(),
    };
    const result = validateAppointment(clean, items);
    setErrors(result.errors);
    setConflict(result.conflict);
    if (!Object.keys(result.errors).length && !result.conflict) onSave(clean);
  };
  const field = (key, label, type = 'text') => (
    <TextField
      required
      fullWidth
      type={type}
      label={tr(label)}
      value={form[key]}
      onChange={(e) => change(key, e.target.value)}
      error={!!errors[key]}
      helperText={errors[key] ? tr(errors[key]) : undefined}
      InputLabelProps={type !== 'text' ? { shrink: true } : undefined}
    />
  );
  const select = (key, label, values, render = (v) => v) => (
    <TextField
      select
      required
      fullWidth
      label={tr(label)}
      value={form[key]}
      onChange={(e) => change(key, e.target.value)}
      error={!!errors[key]}
      helperText={errors[key] ? tr(errors[key]) : undefined}
    >
      {values.map((value) => (
        <MenuItem key={value} value={value}>
          {render(value)}
        </MenuItem>
      ))}
    </TextField>
  );
  const status = (value) => {
    try {
      onStatus(form.id, value);
    } catch {
      setErrors({ operation: 'Unable to update appointment' });
    }
  };
  return (
    <>
      <Dialog open fullWidth maxWidth="sm" fullScreen={mobile} onClose={close}>
        <DialogTitle>
          {initial.id
            ? tr(editing ? 'Edit appointment' : 'Appointment details')
            : tr('New appointment')}
        </DialogTitle>
        <DialogContent dividers>
          <Stack
            spacing={2}
            component={editing ? 'form' : 'div'}
            id="appointment-form"
            onSubmit={save}
            noValidate
          >
            {errors.operation && <Alert severity="error">{tr(errors.operation)}</Alert>}
            {conflict && (
              <Alert severity="error">
                {tr('Counsellor has another appointment at {{start}}–{{end}}.', {
                  start: conflict.start,
                  end: conflict.end,
                })}
              </Alert>
            )}
            {editing ? (
              <>
                <TextField
                  select
                  fullWidth
                  label={tr('Related case')}
                  value={form.caseId}
                  onChange={(e) => {
                    const selected = MOCK_CASES.find((c) => c.id === e.target.value);
                    setForm((old) => ({
                      ...old,
                      caseId: selected?.id || '',
                      caseNumber: selected?.caseNumber || '',
                      clientInitials: selected?.clientInitials || '',
                      phone: selected?.phone || '',
                    }));
                    setErrors({});
                    setConflict(null);
                  }}
                >
                  <MenuItem value="">{tr('New visitor')}</MenuItem>
                  {MOCK_CASES.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.caseNumber} · {c.clientInitials}
                    </MenuItem>
                  ))}
                </TextField>
                {field('clientInitials', 'Client initials')}
                {field('phone', 'Phone', 'tel')}
                {field('date', 'Appointment date', 'date')}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  {field('start', 'Start time', 'time')}
                  {field('end', 'End time', 'time')}
                </Stack>
                {select('counsellor', 'Counsellor', COUNSELLORS)}
                {select('mode', 'Session mode', SESSION_MODES, domainLabel)}
                {field('location', 'Location')}
              </>
            ) : (
              <>
                {[
                  ['Client initials', form.clientInitials],
                  ['Phone', form.phone],
                  ['Case number', form.caseNumber || tr('New visitor')],
                  [
                    'Appointment date',
                    new Intl.DateTimeFormat(currentLocale(), {
                      timeZone: 'Asia/Kuala_Lumpur',
                      dateStyle: 'long',
                    }).format(new Date(`${form.date}T12:00:00+08:00`)),
                  ],
                  ['Time', `${form.start}–${form.end}`],
                  ['Counsellor', form.counsellor],
                  ['Session mode', domainLabel(form.mode)],
                  ['Location', form.location],
                  ['Status', domainLabel(form.status)],
                ].map(([label, value]) => (
                  <Stack key={label} spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      {tr(label)}
                    </Typography>
                    <Typography sx={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
                      {value}
                    </Typography>
                  </Stack>
                ))}
                {form.status === 'scheduled' && !hasEnded(form) && (
                  <Alert severity="info">
                    {tr('Mark completion or absence after the appointment ends.')}
                  </Alert>
                )}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 1, p: 2 }}>
          {!editing && (
            <>
              <Button color="error" onClick={() => setConfirmation('delete')}>
                {tr('Cancel appointment')}
              </Button>
              {form.status === 'scheduled' ? (
                <>
                  <Button onClick={() => setEditing(true)}>{tr('Edit appointment')}</Button>
                  <Button disabled={!hasEnded(form)} onClick={() => status('completed')}>
                    {tr('Mark completed')}
                  </Button>
                  <Button disabled={!hasEnded(form)} onClick={() => status('no_show')}>
                    {tr('Mark no-show')}
                  </Button>
                </>
              ) : (
                <Button onClick={() => status('scheduled')}>{tr('Restore scheduled')}</Button>
              )}
            </>
          )}
          <Button onClick={close}>{tr('Close')}</Button>
          {editing && (
            <Button variant="contained" type="submit" form="appointment-form">
              {tr('Save appointment')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <Dialog open={!!confirmation} onClose={() => setConfirmation('')} fullWidth maxWidth="xs">
        <DialogTitle>
          {tr(confirmation === 'delete' ? 'Delete this appointment?' : 'Discard unsaved changes?')}
        </DialogTitle>
        <DialogContent>
          {tr(
            confirmation === 'delete'
              ? 'This appointment will be removed. No cancellation history will be kept.'
              : 'Your unsaved appointment changes will be lost.'
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmation('')}>{tr('Go back')}</Button>
          <Button
            color="error"
            onClick={() => (confirmation === 'delete' ? onDelete(form.id) : onClose())}
          >
            {tr(confirmation === 'delete' ? 'Delete' : 'Discard changes')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
AppointmentDialog.propTypes = {
  initial: PropTypes.object.isRequired,
  items: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onStatus: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
