import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { currentLocale, tr, useUiLanguage } from '../../locales/translate';
import { LABELS } from './autoRoster';
import { calculatePersonSwap, swapContextSnapshot } from './personSwap';

export function swapIssueText(item, knownPeople) {
  if (!item.date) return tr(item.reason);
  return tr('{{person}} · {{date}} {{method}}: {{reason}}', {
    person: knownPeople[item.personId]?.name || tr('Duty roster'),
    date: item.date,
    method: tr(LABELS[item.method] || 'Duty roster'),
    reason: tr(item.reason),
  });
}

export default function PersonSwapDialog({
  sourceShiftId,
  sourcePersonId = '',
  targetShiftId = '',
  targetPersonId = '',
  initialSnapshot,
  shifts,
  people,
  knownPeople,
  rules,
  period,
  blocked,
  onConfirm,
  onClose,
}) {
  useUiLanguage();
  const context = { shifts, people, rules, period };
  const currentSnapshot = swapContextSnapshot(shifts, people, rules, period);
  const [snapshot, setSnapshot] = useState(initialSnapshot || currentSnapshot);
  const [selection, setSelection] = useState({
    sourceShiftId,
    sourcePersonId,
    targetShiftId,
    targetPersonId,
  });
  const [submitErrors, setSubmitErrors] = useState([]);
  const source = shifts.find((s) => s.id === sourceShiftId);
  const target = shifts.find((s) => s.id === selection.targetShiftId);
  const complete = !!(
    selection.sourcePersonId &&
    selection.targetShiftId &&
    selection.targetPersonId
  );
  const result = complete
    ? calculatePersonSwap(context, selection)
    : { errors: [], warnings: [], updated: [] };
  const stale = (() => {
    let previous;
    try {
      previous = JSON.parse(snapshot);
    } catch {
      return true;
    }
    return [selection.sourceShiftId, selection.targetShiftId]
      .filter(Boolean)
      .some(
        (id) =>
          JSON.stringify(previous.find((s) => s.id === id)) !==
          JSON.stringify(shifts.find((s) => s.id === id))
      );
  })();
  const names = (ids) =>
    ids.map((id) => knownPeople[id]?.name || tr('Unavailable person #{{id}}', { id })).join(', ');
  const shiftLabel = (s) =>
    tr('{{date}} {{start}}–{{end}} · {{method}} · {{people}}', {
      date: new Intl.DateTimeFormat(currentLocale(), {
        timeZone: 'Asia/Kuala_Lumpur',
        dateStyle: 'medium',
      }).format(new Date(`${s.date}T12:00:00Z`)),
      start: s.start,
      end: s.end,
      method: tr(LABELS[s.method] || 'Duty roster'),
      people: names(s.personIds),
    });
  const change = (patch) => {
    setSelection((old) => ({ ...old, ...patch }));
    setSubmitErrors([]);
  };
  const candidates = shifts
    .filter((s) => s.id !== sourceShiftId)
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        a.start.localeCompare(b.start) ||
        a.method.localeCompare(b.method)
    );
  const confirm = () => {
    if (blocked || stale || !complete || result.errors.length) return;
    const response = onConfirm(selection, snapshot);
    if (!response.ok) {
      setSubmitErrors(response.errors);
    }
  };
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{tr('Swap personnel')}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1, '& .MuiTypography-root': { overflowWrap: 'anywhere' } }}>
          <Alert severity="info">
            {tr(
              'Only these two shifts will change. Fixed groups and other dates remain unchanged.'
            )}
          </Alert>
          {blocked && <Alert severity="warning">{tr('Loading personnel...')}</Alert>}
          {stale && (
            <Alert
              severity="warning"
              action={
                <Button
                  color="inherit"
                  onClick={() => {
                    setSnapshot(currentSnapshot);
                    setSubmitErrors([]);
                    setSelection((old) => ({
                      ...old,
                      sourcePersonId: '',
                      targetShiftId: '',
                      targetPersonId: '',
                    }));
                  }}
                >
                  {tr('Recheck selection')}
                </Button>
              }
            >
              {tr('Assignments changed. Recheck the selection before confirming.')}
            </Alert>
          )}
          {!source && (
            <Alert severity="error">
              {tr('The selected shift or person is no longer available.')}
            </Alert>
          )}
          {source && <Typography>{shiftLabel(source)}</Typography>}
          <TextField
            select
            fullWidth
            SelectProps={{ native: true }}
            InputLabelProps={{ shrink: true }}
            label={tr('Person to swap')}
            value={selection.sourcePersonId}
            onChange={(e) => change({ sourcePersonId: e.target.value })}
          >
            <option value="">{tr('Choose a person')}</option>
            {(source?.personIds || []).map((id) => (
              <option key={id} value={id}>
                {names([id])}
              </option>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            SelectProps={{ native: true }}
            InputLabelProps={{ shrink: true }}
            label={tr('Target shift')}
            value={selection.targetShiftId}
            onChange={(e) => change({ targetShiftId: e.target.value, targetPersonId: '' })}
          >
            <option value="">{tr('Choose a shift')}</option>
            {candidates.map((s) => (
              <option key={s.id} value={s.id}>
                {shiftLabel(s)}
              </option>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            SelectProps={{ native: true }}
            InputLabelProps={{ shrink: true }}
            label={tr('Person in target shift')}
            value={selection.targetPersonId}
            disabled={!target}
            onChange={(e) => change({ targetPersonId: e.target.value })}
          >
            <option value="">{tr('Choose a person')}</option>
            {(target?.personIds || []).map((id) => (
              <option key={id} value={id}>
                {names([id])}
              </option>
            ))}
          </TextField>
          {result.updated.map((after, index) => {
            const before = index === 0 ? source : target;
            return (
              <Stack
                key={after.id}
                spacing={0.5}
                sx={{ border: 1, borderColor: 'divider', p: 1.5, borderRadius: 1 }}
              >
                <Typography variant="subtitle2">{shiftLabel(before)}</Typography>
                <Typography>
                  {tr('Before: {{people}}', { people: names(before.personIds) })}
                </Typography>
                <Typography>
                  {tr('After: {{people}}', { people: names(after.personIds) })}
                </Typography>
              </Stack>
            );
          })}
          {[...result.errors, ...submitErrors].map((item, i) => (
            <Alert key={`${item.id}:${i}`} severity="error">
              {swapIssueText(item, knownPeople)}
            </Alert>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap' }}>
        <Button onClick={onClose}>{tr('Cancel')}</Button>
        <Button
          variant="contained"
          onClick={confirm}
          disabled={blocked || stale || !complete || !!result.errors.length}
        >
          {tr('Confirm swap')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

PersonSwapDialog.propTypes = {
  sourceShiftId: PropTypes.string.isRequired,
  sourcePersonId: PropTypes.string,
  targetShiftId: PropTypes.string,
  targetPersonId: PropTypes.string,
  initialSnapshot: PropTypes.string,
  shifts: PropTypes.array.isRequired,
  people: PropTypes.array.isRequired,
  knownPeople: PropTypes.object.isRequired,
  rules: PropTypes.object.isRequired,
  period: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  blocked: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
