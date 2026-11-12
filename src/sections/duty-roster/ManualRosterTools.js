import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { tr, useUiLanguage } from '../../locales/translate';
import RosterPersonChip from './RosterPersonChip';
import { LABELS } from './autoRoster';

export function CalendarDaySlot({ date, shifts, drag, dayNumberText }) {
  useUiLanguage();
  const [method, setMethod] = useState('phone');
  const allShifts = drag.context?.shifts || shifts;
  const holiday = drag.context?.holidayLabels?.find((h) => h.date === date);
  const missing = ['phone', 'f2f', 'zoom'].filter(
    (m) => !allShifts.some((s) => s.date === date && s.method === m)
  );
  const chosen = missing.includes(method) ? method : missing[0];
  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Typography variant="caption">{dayNumberText}</Typography>
      {holiday && (
        <Typography
          variant="caption"
          sx={{ display: 'block', bgcolor: 'warning.light', overflowWrap: 'anywhere' }}
        >
          {holiday.name}
        </Typography>
      )}
      {!!missing.length && (
        <Box
          sx={{ fontSize: 11 }}
          onMouseDownCapture={(event) => event.stopPropagation()}
          onPointerDownCapture={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <select
            aria-label={tr('Duty type')}
            value={chosen}
            onChange={(event) => setMethod(event.target.value)}
            style={{ maxWidth: '100%' }}
          >
            {missing.map((m) => (
              <option key={m} value={m}>
                {tr(LABELS[m])}
              </option>
            ))}
          </select>
          <ManualRosterSlot
            drag={drag}
            shift={{
              id: `manual-${date}-${chosen}`,
              date,
              method: chosen,
              start: '09:00',
              end: '10:00',
              personIds: [],
              note: '',
              groupId: '',
            }}
          />
        </Box>
      )}
    </Box>
  );
}

export function ManualRosterSlot({ shift, drag, children }) {
  useUiLanguage();
  const [over, setOver] = useState(false);
  const status = over ? drag.inspect(shift).status : 'none';
  const borderColor = { valid: 'success.main', invalid: 'error.main' }[status] || 'transparent';
  return (
    <Box
      data-roster-slot={shift.id}
      onDragOver={(event) => {
        if (drag.session) {
          event.preventDefault();
          event.stopPropagation();
          setOver(true);
        }
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOver(false);
      }}
      onDrop={(event) => {
        setOver(false);
        drag.drop(event, shift);
      }}
      sx={{
        minHeight: 64,
        minWidth: 0,
        p: 0.5,
        border: '1px dashed',
        borderColor,
        borderRadius: 1,
      }}
    >
      {children}
      <Button
        size="small"
        onMouseDownCapture={(event) => event.stopPropagation()}
        onPointerDownCapture={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          drag.edit({ targetShift: shift });
        }}
      >
        {tr('Add person')}
      </Button>
    </Box>
  );
}

export default function ManualRosterTools({ drag, priorityIds = [] }) {
  useUiLanguage();
  const [search, setSearch] = useState('');
  const { people, shifts } = drag.context;
  const peopleList = [...people].sort(
    (a, b) => Number(priorityIds.includes(b.id)) - Number(priorityIds.includes(a.id))
  );
  const request = drag.editor;
  const [personId, setPersonId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [targetPersonId, setTargetPersonId] = useState('');
  const [kind, setKind] = useState('move');
  const [newDate, setNewDate] = useState('');
  const [newMethod, setNewMethod] = useState('phone');
  const [errors, setErrors] = useState([]);
  const targets = drag.context.targets || shifts;
  const target =
    request?.targetShift ||
    (targetId === 'new'
      ? shifts.find((s) => s.date === newDate && s.method === newMethod) || {
          id: `manual-${request.token}`,
          date: newDate,
          method: newMethod,
          start: '09:00',
          end: '10:00',
          personIds: [],
          note: '',
          groupId: '',
        }
      : targets.find((s) => s.id === targetId));
  const isSource = !!request?.sourceShiftId;
  const label = (shift) => `${shift.date} ${shift.start}-${shift.end} ${tr(LABELS[shift.method])}`;
  const close = () => {
    drag.edit(null);
    setPersonId('');
    setTargetId('');
    setTargetPersonId('');
    setKind('move');
    setNewDate('');
    setErrors([]);
  };
  const submit = () => {
    const result = drag.apply(
      {
        kind: isSource ? kind : 'add',
        sourceShiftId: request.sourceShiftId,
        sourcePersonId: request.sourcePersonId || personId,
        targetShiftId: target.id,
        targetShift: target,
        targetPersonId,
      },
      request.snapshot
    );
    if (result.ok) close();
    else setErrors(result.errors || []);
  };
  return (
    <Stack
      spacing={1}
      sx={{
        position: { md: 'sticky' },
        top: 72,
        zIndex: 5,
        bgcolor: 'background.paper',
        p: 1,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Typography variant="subtitle1">{tr('Personnel bank')}</Typography>
      <Typography variant="body2">
        {tr(
          'Automatic rules apply only when generating. Add, move, swap or remove people freely afterwards.'
        )}
      </Typography>
      <TextField
        size="small"
        label={tr('Search personnel')}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', maxHeight: 120, overflowY: 'auto' }}>
        {peopleList
          .filter((person) => person.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
          .map((person) => (
            <Box key={person.id} sx={{ maxWidth: '100%' }}>
              <RosterPersonChip
                shiftId=""
                personId={person.id}
                name={person.name}
                drag={drag}
                onChoose={() => drag.edit({ sourcePersonId: person.id })}
              />
              {priorityIds.includes(person.id) && (
                <Typography variant="caption">{tr('Not automatically grouped')}</Typography>
              )}
            </Box>
          ))}
      </Box>
      {request && (
        <Dialog open fullWidth maxWidth="sm" onClose={close}>
          <DialogTitle>{tr(isSource ? 'Move or swap person' : 'Add person')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {errors.map((item) => (
                <Alert severity="error" key={item.id}>
                  {tr(item.reason)}
                </Alert>
              ))}
              {request.sourcePersonId && (
                <Typography sx={{ overflowWrap: 'anywhere' }}>
                  {people.find((p) => p.id === request.sourcePersonId)?.name ||
                    request.sourcePersonId}
                </Typography>
              )}
              {isSource && (
                <TextField
                  select
                  SelectProps={{ native: true }}
                  label={tr('Action')}
                  value={kind}
                  onChange={(event) => setKind(event.target.value)}
                >
                  <option value="move">{tr('Move person')}</option>
                  <option value="swap">{tr('Swap personnel')}</option>
                </TextField>
              )}
              {!isSource && !request.sourcePersonId && (
                <TextField
                  select
                  SelectProps={{ native: true }}
                  InputLabelProps={{ shrink: true }}
                  label={tr('Duty personnel')}
                  value={personId}
                  onChange={(event) => setPersonId(event.target.value)}
                >
                  <option value="">{tr('Choose a person')}</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </TextField>
              )}
              {!request.targetShift && (
                <TextField
                  select
                  SelectProps={{ native: true }}
                  InputLabelProps={{ shrink: true }}
                  label={tr('Target shift')}
                  value={targetId}
                  onChange={(event) => {
                    setTargetId(event.target.value);
                    setTargetPersonId('');
                  }}
                >
                  <option value="">{tr('Choose a shift')}</option>
                  <option value="new">{tr('Add shift')}</option>
                  {targets
                    .filter((s) => s.id !== request.sourceShiftId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {label(s)}
                      </option>
                    ))}
                </TextField>
              )}
              {targetId === 'new' && (
                <>
                  <TextField
                    type="date"
                    label={tr('Shift date')}
                    InputLabelProps={{ shrink: true }}
                    value={newDate}
                    onChange={(event) => setNewDate(event.target.value)}
                  />
                  <TextField
                    select
                    SelectProps={{ native: true }}
                    label={tr('Duty type')}
                    value={newMethod}
                    onChange={(event) => setNewMethod(event.target.value)}
                  >
                    {['phone', 'f2f', 'zoom'].map((m) => (
                      <option key={m} value={m}>
                        {tr(LABELS[m])}
                      </option>
                    ))}
                  </TextField>
                </>
              )}
              {isSource && kind === 'swap' && (
                <TextField
                  select
                  SelectProps={{ native: true }}
                  InputLabelProps={{ shrink: true }}
                  label={tr('Person in target shift')}
                  value={targetPersonId}
                  onChange={(event) => setTargetPersonId(event.target.value)}
                >
                  <option value="">{tr('Choose a person')}</option>
                  {target?.personIds.map((id) => (
                    <option key={id} value={id}>
                      {people.find((p) => p.id === id)?.name || id}
                    </option>
                  ))}
                </TextField>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={close}>{tr('Cancel')}</Button>
            <Button
              onClick={submit}
              disabled={
                !target ||
                (!isSource && !(request.sourcePersonId || personId)) ||
                (isSource && kind === 'swap' && !targetPersonId)
              }
            >
              {tr('Confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
}

CalendarDaySlot.propTypes = {
  date: PropTypes.string.isRequired,
  shifts: PropTypes.array.isRequired,
  drag: PropTypes.object.isRequired,
  dayNumberText: PropTypes.string,
};
ManualRosterSlot.propTypes = {
  shift: PropTypes.object.isRequired,
  drag: PropTypes.object.isRequired,
  children: PropTypes.node,
};
ManualRosterTools.propTypes = { drag: PropTypes.object.isRequired, priorityIds: PropTypes.array };
