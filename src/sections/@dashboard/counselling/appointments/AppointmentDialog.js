import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import useResponsive from '../../../../hooks/useResponsive';
import { tr, useUiLanguage, currentLocale } from '../../../../locales/translate';
import { domainLabel } from '../../../../locales/domainLabels';
import { COUNSELLORS, SESSION_MODES } from '../cases/create/constants';
import { appointmentService, appointmentErrorMessage, FIELD_ERROR_MESSAGES, hasEnded, validateAppointment } from '../../../../services/appointmentService';

const HISTORY_FIELDS = [
  ['case_id', 'Related case ID'], ['case_number', 'Case number'], ['client_initials', 'Client initials'],
  ['phone', 'Phone'], ['date', 'Appointment date'], ['start_time', 'Start time'], ['end_time', 'End time'],
  ['counsellor', 'Counsellor'], ['mode', 'Session mode'], ['location', 'Location'], ['status', 'Status'],
];
const historyValue = (key, value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (key === 'status' || key === 'mode') return domainLabel(value);
  if (key === 'start_time' || key === 'end_time') return value.slice(0, 5);
  return String(value);
};
function OperationHistory({ history }) {
  useUiLanguage();
  return <Stack spacing={2}>
    <Typography variant="h6">{tr('Appointment history')}</Typography>
    {history.map((entry) => <Box key={entry.id} sx={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
      <Typography variant="subtitle2">{tr({ create: 'Appointment created', update: 'Appointment edited', status: 'Appointment status changed' }[entry.action])}</Typography>
      <Typography variant="caption">{entry.actorName} · {new Intl.DateTimeFormat(currentLocale(), { timeZone: 'Asia/Kuala_Lumpur', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(entry.createdAt))}</Typography>
      {HISTORY_FIELDS.filter(([key]) => !entry.before || entry.before[key] !== entry.after[key]).map(([key, label]) =>
        <Typography key={key} variant="body2">{tr('{{field}}: {{before}} → {{after}}', {
          field: tr(label), before: historyValue(key, entry.before?.[key]), after: historyValue(key, entry.after[key]),
        })}</Typography>)}
      {entry.reason && <Typography variant="body2">{tr('Cancellation reason')}: {entry.reason}</Typography>}
    </Box>)}
  </Stack>;
}
OperationHistory.propTypes = { history: PropTypes.array.isRequired };

export default function AppointmentDialog({ initial, items, onClose, onSave, onStatus }) {
  useUiLanguage();
  const mobile = !useResponsive('up', 'sm');
  const [form, setForm] = useState(initial);
  const [baseline, setBaseline] = useState(initial);
  const [editing, setEditing] = useState(!initial.id);
  const [errors, setErrors] = useState({});
  const [operationError, setOperationError] = useState(null);
  const [conflict, setConflict] = useState(null);
  const [confirmation, setConfirmation] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [detailLoading, setDetailLoading] = useState(!!initial.id);
  const [detailReady, setDetailReady] = useState(!initial.id);
  const [detailError, setDetailError] = useState(null);
  const [reload, setReload] = useState(0);
  const [caseSearch, setCaseSearch] = useState('');
  const [casePage, setCasePage] = useState(0);
  const [caseResult, setCaseResult] = useState({ data: [], total: 0 });
  const [caseLoading, setCaseLoading] = useState(false);
  const [caseError, setCaseError] = useState(null);
  const [caseRetry, setCaseRetry] = useState(0);
  const { id } = initial;
  useEffect(() => {
    if (!id) return undefined;
    const controller = new AbortController();
    setDetailLoading(true); setDetailReady(false); setDetailError(null);
    appointmentService.get(id, { signal: controller.signal }).then((data) => {
      if (controller.signal.aborted) return;
      setForm(data); setBaseline(data); setDetailReady(true); setEditing(false);
      setErrors({}); setOperationError(null); setConflict(null); setConfirmation(''); setReason('');
    }).catch((error) => { if (!controller.signal.aborted) setDetailError(error); })
      .finally(() => { if (!controller.signal.aborted) setDetailLoading(false); });
    return () => controller.abort();
  }, [id, reload]);
  useEffect(() => {
    if (!editing) return undefined;
    const controller = new AbortController();
    setCaseLoading(true); setCaseError(null);
    const timer = setTimeout(() => {
      appointmentService.cases({ search: caseSearch, page: casePage, pageSize: 20 }, { signal: controller.signal }).then((data) => {
        if (!controller.signal.aborted) setCaseResult(data);
      }).catch((error) => { if (!controller.signal.aborted) setCaseError(error); })
        .finally(() => { if (!controller.signal.aborted) setCaseLoading(false); });
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [editing, caseSearch, casePage, caseRetry]);
  const dirty = JSON.stringify(baseline) !== JSON.stringify(form);
  const locked = busy || detailLoading || !detailReady;
  const change = (key, value) => {
    setForm((old) => ({ ...old, [key]: value })); setErrors({}); setConflict(null);
  };
  const close = () => {
    if (pending.current) return;
    if (dirty && editing) setConfirmation('discard'); else onClose();
  };
  const run = async (operation) => {
    if (pending.current || locked) return;
    pending.current = true; setBusy(true); setOperationError(null); setErrors({});
    try { await operation(); }
    catch (error) {
      setOperationError(error);
      setErrors(Object.fromEntries(Object.entries(error.fields || {}).map(([key, code]) => [key, FIELD_ERROR_MESSAGES[code] || 'Please check the appointment fields.'])));
    } finally { pending.current = false; setBusy(false); }
  };
  const save = (event) => {
    event.preventDefault();
    if (pending.current || locked) return;
    const clean = { ...form, clientInitials: form.clientInitials.trim(), phone: form.phone.trim(), location: form.location.trim() };
    const result = validateAppointment(clean, items);
    setErrors(result.errors); setConflict(result.conflict);
    if (!Object.keys(result.errors).length && !result.conflict) run(() => onSave(clean));
  };
  const status = (value) => run(() => onStatus(form.id, value, form.version, value === 'cancelled' ? reason : ''));
  const field = (key, label, type = 'text') => <TextField disabled={locked} required fullWidth type={type} label={tr(label)} value={form[key]}
    onChange={(e) => change(key, e.target.value)} error={!!errors[key]} helperText={errors[key] ? tr(errors[key]) : undefined}
    InputLabelProps={type !== 'text' ? { shrink: true } : undefined} />;
  const select = (key, label, values, render = (v) => v) => <TextField disabled={locked} select required fullWidth label={tr(label)} value={form[key]}
    onChange={(e) => change(key, e.target.value)} error={!!errors[key]} helperText={errors[key] ? tr(errors[key]) : undefined}>
    {values.map((value) => <MenuItem key={value} value={value}>{render(value)}</MenuItem>)}
  </TextField>;
  const choices = [...caseResult.data];
  if (form.caseId && !choices.some((c) => c.id === form.caseId)) choices.unshift({ id: form.caseId, caseNumber: form.caseNumber, clientInitials: form.clientInitials, phone: form.phone });
  const reloadDetails = () => {
    if (dirty && editing) setConfirmation('reload'); else setReload((value) => value + 1);
  };
  let title = 'New appointment';
  if (id) title = editing ? 'Edit appointment' : 'Appointment details';
  return <>
    <Dialog open fullWidth maxWidth="sm" fullScreen={mobile} onClose={close}>
      <DialogTitle>{tr(title)}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} component={editing ? 'form' : 'div'} id="appointment-form" onSubmit={save} noValidate>
          {detailLoading && <Alert severity="info">{tr('Loading appointment details…')}</Alert>}
          {(detailError || operationError) && <Alert severity="error">
            {tr(appointmentErrorMessage(detailError || operationError))}
            {id && <Button disabled={busy || detailLoading} onClick={reloadDetails}>{tr('Reload appointment details')}</Button>}
          </Alert>}
          {conflict && <Alert severity="error">{tr('Counsellor has another appointment at {{start}}–{{end}}.', { start: conflict.start, end: conflict.end })}</Alert>}
          {editing ? <Box component="fieldset" disabled={locked} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
            <Stack spacing={2}>
              <TextField disabled={locked} fullWidth label={tr('Search related cases')} value={caseSearch} inputProps={{ maxLength: 100 }}
                onChange={(e) => { setCaseSearch(e.target.value); setCasePage(0); }} />
              {caseLoading && <Typography>{tr('Loading related cases…')}</Typography>}
              {caseError && <Alert severity="error" action={<Button onClick={() => setCaseRetry((value) => value + 1)}>{tr('Retry appointments')}</Button>}>{tr(appointmentErrorMessage(caseError))}</Alert>}
              <TextField disabled={locked} select fullWidth label={tr('Related case')} value={form.caseId} error={!!errors.caseId} helperText={errors.caseId ? tr(errors.caseId) : undefined}
                onChange={(e) => {
                  const selected = choices.find((c) => c.id === e.target.value);
                  setForm((old) => ({ ...old, caseId: selected?.id || '', caseNumber: selected?.caseNumber || '', clientInitials: selected?.clientInitials || '', phone: selected?.phone || '' }));
                  setErrors({}); setConflict(null);
                }}>
                <MenuItem value="">{tr('New visitor')}</MenuItem>
                {choices.map((c) => <MenuItem key={c.id} value={c.id} sx={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}>{c.caseNumber} · {c.clientInitials}{c.date ? ` · ${c.date}` : ''} · {c.id}</MenuItem>)}
              </TextField>
              <Stack direction="row" spacing={1}>
                <Button disabled={locked || caseLoading || casePage === 0} onClick={() => setCasePage((value) => value - 1)}>{tr('Previous cases')}</Button>
                <Button disabled={locked || caseLoading || (casePage + 1) * 20 >= caseResult.total} onClick={() => setCasePage((value) => value + 1)}>{tr('Next cases')}</Button>
              </Stack>
              {field('clientInitials', 'Client initials')}{field('phone', 'Phone', 'tel')}{field('date', 'Appointment date', 'date')}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>{field('start', 'Start time', 'time')}{field('end', 'End time', 'time')}</Stack>
              {select('counsellor', 'Counsellor', COUNSELLORS)}{select('mode', 'Session mode', SESSION_MODES, domainLabel)}{field('location', 'Location')}
            </Stack>
          </Box> : <>
            {[
              ['Client initials', form.clientInitials], ['Phone', form.phone], ['Case number', form.caseNumber || tr('New visitor')],
              ['Appointment date', new Intl.DateTimeFormat(currentLocale(), { timeZone: 'Asia/Kuala_Lumpur', dateStyle: 'long' }).format(new Date(`${form.date}T12:00:00+08:00`))],
              ['Time', `${form.start}–${form.end}`], ['Counsellor', form.counsellor], ['Session mode', domainLabel(form.mode)], ['Location', form.location], ['Status', domainLabel(form.status)],
            ].map(([label, value]) => <Stack key={label} spacing={0.5}><Typography variant="caption" color="text.secondary">{tr(label)}</Typography><Typography sx={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>{value}</Typography></Stack>)}
            {form.status === 'scheduled' && !hasEnded(form) && <Alert severity="info">{tr('Mark completion or absence after the appointment ends.')}</Alert>}
            {detailReady && <OperationHistory history={form.history || []} />}
          </>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1, p: 2 }}>
        {!editing && (form.status === 'scheduled' ? <>
          <Button color="error" disabled={locked} onClick={() => setConfirmation('cancel')}>{tr('Cancel appointment')}</Button>
          <Button disabled={locked} onClick={() => setEditing(true)}>{tr('Edit appointment')}</Button>
          <Button disabled={locked || !hasEnded(form)} onClick={() => status('completed')}>{tr('Mark completed')}</Button>
          <Button disabled={locked || !hasEnded(form)} onClick={() => status('no_show')}>{tr('Mark no-show')}</Button>
        </> : <Button disabled={locked} onClick={() => status('scheduled')}>{tr('Restore scheduled')}</Button>)}
        <Button disabled={busy} onClick={close}>{tr('Close')}</Button>
        {editing && <Button disabled={locked} variant="contained" type="submit" form="appointment-form">{tr(busy ? 'Saving appointment…' : 'Save appointment')}</Button>}
      </DialogActions>
    </Dialog>
    <Dialog open={!!confirmation} onClose={() => { if (!busy) setConfirmation(''); }} fullWidth maxWidth="xs">
      <DialogTitle>{tr(confirmation === 'cancel' ? 'Cancel this appointment?' : 'Discard unsaved changes?')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography>{tr(confirmation === 'cancel' ? 'The cancellation will be kept in the appointment history and this time slot will be released.' : 'Your unsaved appointment changes will be lost.')}</Typography>
          {confirmation === 'cancel' && <TextField multiline fullWidth label={tr('Cancellation reason (optional)')} value={reason} onChange={(e) => setReason(e.target.value)} inputProps={{ maxLength: 1000 }} disabled={busy} />}
          {confirmation === 'cancel' && operationError && <Alert severity="error">{tr(appointmentErrorMessage(operationError))}
            <Button disabled={busy} onClick={() => { setConfirmation(''); reloadDetails(); }}>{tr('Reload appointment details')}</Button>
          </Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={() => setConfirmation('')}>{tr('Go back')}</Button>
        <Button color="error" disabled={busy} onClick={() => {
          if (confirmation === 'cancel') status('cancelled');
          else if (confirmation === 'reload') { setConfirmation(''); setReload((value) => value + 1); }
          else onClose();
        }}>{tr(confirmation === 'cancel' ? 'Confirm cancellation' : 'Discard changes')}</Button>
      </DialogActions>
    </Dialog>
  </>;
}
AppointmentDialog.propTypes = {
  initial: PropTypes.object.isRequired, items: PropTypes.array.isRequired, onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired, onStatus: PropTypes.func.isRequired,
};
