import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { tr, useUiLanguage, currentLocale } from '../../locales/translate';
import { rosterErrorMessage } from '../../services/dutyRosterService';
import ManualRosterTools, { ManualRosterSlot } from './ManualRosterTools';
import PersonnelConditions from './PersonnelConditions';
import { patchPreferences } from './preferenceGroups';
import PersonSwapDialog from './PersonSwapDialog';
import { commitPersonSwap, undoPersonSwap } from './personSwap';
import usePersonDragSwap from './usePersonDragSwap';
import RosterPersonChip, { DragSwapFeedback } from './RosterPersonChip';
import { mergeHolidays } from './malaysiaHolidays';
import { activeStaff, periodRange, periodMonths } from './rosterModel';
import {
  DAYS,
  METHODS,
  LABELS,
  defaultPreference,
  createFixedGroups,
  generateAutoRoster,
  groupErrors,
  unassignedPeople,
  setGroupMember,
} from './autoRoster';

export default function AutoRosterPanel({
  people,
  period,
  rules,
  setRules,
  shifts,
  onApply,
  blocked,
  appliedRevision = 0,
  saveError = null,
  retryApply = null,
  nationalCalendar = { holidays: [], missingYears: [] },
}) {
  useUiLanguage();
  const [errors, setErrors] = useState([]);
  const [preview, setPreviewState] = useState(null);
  const [previewGeneration, setPreviewGeneration] = useState(0);
  const previewRef = useRef(null);
  const [swapRequest, setSwapRequest] = useState(null);
  const [regenerateConfirm, setRegenerateConfirm] = useState(false);
  const setPreview = useCallback((next) => {
    previewRef.current = next;
    setPreviewState(next);
    if (!next) setSwapRequest(null);
  }, []);
  const [confirm, setConfirm] = useState(false);
  const [applyExpected, setApplyExpected] = useState([]);
  const [applying, setApplying] = useState(false);
  const peopleSignature = JSON.stringify(people.map((p) => [p.id, p.status, p.type]));
  const previousPeople = useRef(people.length ? peopleSignature : null);
  useEffect(() => {
    setPreview(null);
    setConfirm(false);
  }, [appliedRevision, setPreview]);
  useEffect(() => {
    setConfirm(false);
    if (previousPeople.current !== null && previousPeople.current !== peopleSignature)
      setRules((old) => ({ ...old, stale: true }));
    if (people.length || previousPeople.current !== null) previousPeople.current = peopleSignature;
  }, [peopleSignature, people.length, period, setRules]);
  const { preferences, groups, holidays, start, end, stale } = rules;
  const candidates = activeStaff(people);
  const months = periodMonths(period);
  const prefs = {
    ...preferences,
    ...Object.fromEntries(
      candidates.map((p) => [p.id, preferences[p.id] || defaultPreference(months.length)])
    ),
  };
  const names = (ids) => ids.map((id) => people.find((p) => p.id === id)?.name || id).join(', ');
  const change = (patch) => {
    setRules((old) => ({ ...old, ...patch, stale: true }));
  };
  const groupChange = (index, patch) => {
    setRules((old) => ({
      ...old,
      groups: old.groups.map((g, i) => (i === index ? { ...g, ...patch } : g)),
    }));
  };
  const buildGroups = () => {
    const result = createFixedGroups(people, prefs);
    setErrors(result.errors);
    if (!result.errors.length) {
      setRules((old) => ({
        ...old,
        preferences: prefs,
        groups: result.groups,
        stale: false,
        period,
      }));
    }
  };
  const generatePreview = () => {
    setPreviewGeneration((old) => old + 1);
    setSwapRequest(null);
    setRegenerateConfirm(false);
    const result = generateAutoRoster({
      ...rules,
      holidays: mergeHolidays(nationalCalendar.holidays, holidays),
      preferences: prefs,
      period,
      people,
    });
    setErrors(result.errors);
    if (!result.errors.length) setPreview({ ...result, period, start, end });
  };
  const buildPreview = () => {
    if (preview?.shifts.some((shift) => shift.manualAssignment)) setRegenerateConfirm(true);
    else generatePreview();
  };
  const previewRules = {
    ...rules,
    preferences: prefs,
    holidays: mergeHolidays(nationalCalendar.holidays, holidays),
  };
  const previewRows = [
    ...new Map(
      [
        ...(preview?.rows || []),
        ...(preview?.shifts || []).map((shift) => ({
          date: shift.date,
          holiday: previewRules.holidays.find((h) => h.date === shift.date)?.name,
        })),
      ].map((row) => [row.date, row])
    ).values(),
  ].sort((a, b) => a.date.localeCompare(b.date));
  const commitPreviewSwap = (selection, snapshot, accepted) => {
    const { current } = previewRef;
    const result = commitPersonSwap(
      { shifts: current?.shifts || [], people, rules: previewRules, period },
      selection,
      snapshot,
      accepted
    );
    if (result.ok && current) setPreview({ ...current, shifts: result.shifts });
    return result;
  };
  const drag = usePersonDragSwap({
    scope: 'preview',
    context: {
      shifts: preview?.shifts || [],
      people,
      rules: previewRules,
      period,
      targets:
        previewRows.flatMap((row) =>
          METHODS.map(
            (method) =>
              preview.shifts.find((s) => s.date === row.date && s.method === method) || {
                id: `manual-${row.date}-${method}`,
                date: row.date,
                method,
                start: preview.start,
                end: preview.end,
                groupId: '',
                personIds: [],
                note: '',
              }
          )
        ) || [],
    },
    blocked: blocked || !preview,
    cancelKey: JSON.stringify(period),
    resetKey: `${previewGeneration}:${!!preview}`,
    onCommit: commitPreviewSwap,
    onConfirm: setSwapRequest,
    onUndo: (record) => {
      const { current } = previewRef;
      const result = undoPersonSwap(
        { shifts: current?.shifts || [], people, rules: previewRules, period },
        record
      );
      if (result.ok && current) setPreview({ ...current, shifts: result.shifts });
      return result;
    },
  });
  const previewPeople = Object.fromEntries(people.map((person) => [person.id, person]));
  const personCounts = {};
  preview?.shifts.forEach((shift) =>
    shift.personIds.forEach((id) => {
      personCounts[id] = (personCounts[id] || 0) + 1;
    })
  );
  const groupProblems = groupErrors(groups, prefs, people);
  const unassigned = unassignedPeople(groups, people, prefs);
  const range = periodRange(period);
  const previewRange = periodRange(preview?.period || period);
  const number = (value) => new Intl.NumberFormat(currentLocale()).format(value);
  const dateLabel = (value) =>
    new Intl.DateTimeFormat(currentLocale(), {
      timeZone: 'Asia/Kuala_Lumpur',
      dateStyle: 'medium',
    }).format(new Date(`${value}T12:00:00Z`));
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">{tr('Automatic roster planning')}</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            type="time"
            label={tr('Start time')}
            value={start}
            InputLabelProps={{ shrink: true }}
            onChange={(e) => change({ start: e.target.value })}
          />
          <TextField
            type="time"
            label={tr('End time')}
            value={end}
            InputLabelProps={{ shrink: true }}
            onChange={(e) => change({ end: e.target.value })}
          />
        </Stack>
        <Typography>{tr('Personnel conditions')}</Typography>
        <Alert severity="info">
          {tr(
            'Each duty group needs at least two people. Unpaired personnel will not be scheduled.'
          )}
        </Alert>
        <Alert severity="info">
          {tr(
            'Two qualified leaders may form one group. Set one person’s preset group leader, or choose a solo leader as a group member below. Both retain their leader qualification.'
          )}
        </Alert>
        <PersonnelConditions
          people={candidates}
          preferences={prefs}
          months={months}
          onChangePeople={(ids, patch) =>
            change({ preferences: patchPreferences(prefs, ids, patch) })
          }
        />
        <Typography variant="h6">{tr('Sarawak public holidays')}</Typography>
        <Alert severity="info">
          {tr(
            'Sarawak public holidays for 2026-2027 are included automatically, including replacement days. Add special holidays and centre closures below. Future dates remain subject to official announcements.'
          )}
        </Alert>
        {!!nationalCalendar.missingYears.length && (
          <Alert severity="warning">
            {tr(
              'No built-in holiday calendar for {{years}}. Add the holidays for these years manually before planning.',
              { years: nationalCalendar.missingYears.join(', ') }
            )}
          </Alert>
        )}
        {nationalCalendar.holidays.map((holiday) => (
          <Typography key={holiday.date} sx={{ overflowWrap: 'anywhere' }}>
            {dateLabel(holiday.date)} &middot; {tr(holiday.name)}
          </Typography>
        ))}
        <Typography>{tr('Additional holidays')}</Typography>
        {holidays.map((holiday, i) => (
          <Stack key={i} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              type="date"
              label={tr('Holiday date')}
              InputLabelProps={{ shrink: true }}
              value={holiday.date}
              onChange={(e) =>
                change({
                  holidays: holidays.map((h, j) => (j === i ? { ...h, date: e.target.value } : h)),
                })
              }
            />
            <TextField
              label={tr('Holiday name')}
              value={holiday.name}
              onChange={(e) =>
                change({
                  holidays: holidays.map((h, j) => (j === i ? { ...h, name: e.target.value } : h)),
                })
              }
            />
            <Button onClick={() => change({ holidays: holidays.filter((_, j) => j !== i) })}>
              {tr('Remove holiday')}
            </Button>
          </Stack>
        ))}
        <Button onClick={() => change({ holidays: [...holidays, { date: '', name: '' }] })}>
          {tr('Add holiday')}
        </Button>
        <Button
          variant="contained"
          disabled={blocked || !range || !candidates.length}
          onClick={buildGroups}
        >
          {tr('Generate fixed groups')}
        </Button>
        {stale && !!groups.length && (
          <Alert severity="warning">
            {tr('Conditions changed. Regenerate groups before previewing.')}
          </Alert>
        )}
        {[...new Set([...errors, ...groupProblems])].map((error) => (
          <Alert severity="error" key={error}>
            {tr(error)}
          </Alert>
        ))}
        {groups.map((group, index) => (
          <Stack key={group.id} spacing={1} direction={{ xs: 'column', md: 'row' }}>
            <Typography sx={{ flex: 1, overflowWrap: 'anywhere' }}>
              {names([group.leaderId])}
            </Typography>
            <TextField
              select
              label={tr('Group member')}
              value={group.memberIds[0] || ''}
              sx={{ minWidth: 200 }}
              onChange={(e) => {
                const memberId = e.target.value;
                setRules((old) => ({
                  ...old,
                  groups: setGroupMember(old.groups, index, memberId, prefs),
                }));
              }}
            >
              <MenuItem value="">{tr('None')}</MenuItem>
              {[
                ...new Set([
                  ...candidates
                    .filter(
                      (p) =>
                        p.id !== group.leaderId &&
                        prefs[p.id].participating &&
                        !groups.some(
                          (g) =>
                            g.id !== group.id &&
                            (g.memberIds.includes(p.id) ||
                              (g.leaderId === p.id && g.memberIds.length))
                        )
                    )
                    .map((p) => p.id),
                  ...group.memberIds,
                ]),
              ].map((id) => (
                <MenuItem key={id} value={id}>
                  {names([id])}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label={tr('Group weekday')}
              value={group.day}
              sx={{ minWidth: 180 }}
              onChange={(e) => groupChange(index, { day: e.target.value })}
            >
              {DAYS.map((day) => (
                <MenuItem key={day} value={day}>
                  {tr(LABELS[day])}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        ))}
        <Button
          variant="outlined"
          disabled={
            blocked ||
            !range ||
            stale ||
            JSON.stringify(rules.period) !== JSON.stringify(period) ||
            !groups.length ||
            !!groupProblems.length
          }
          onClick={buildPreview}
        >
          {tr('Preview roster')}
        </Button>
        {preview && (
          <>
            <ManualRosterTools drag={drag} priorityIds={unassigned.map((p) => p.id)} />
            <DragSwapFeedback drag={drag} knownPeople={previewPeople} />
            <Typography>
              {tr('{{count}} duty shifts', { count: number(preview.shifts.length) })}
            </Typography>
            <Box
              sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 96, overflowY: 'auto' }}
            >
              {Object.entries(personCounts).map(([id, total]) => (
                <Typography key={id}>
                  {tr('{{person}}: {{count}} duty shifts', {
                    person: names([id]),
                    count: number(total),
                  })}
                </Typography>
              ))}
            </Box>
            {[...new Set(previewRows.map((r) => r.date.slice(0, 7)))].map((month) => (
              <Box key={month}>
                <Typography variant="h6">
                  {new Intl.DateTimeFormat(currentLocale(), {
                    timeZone: 'Asia/Kuala_Lumpur',
                    year: 'numeric',
                    month: 'long',
                  }).format(new Date(`${month}-01T12:00:00Z`))}
                </Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table
                    size="small"
                    sx={{
                      minWidth: 650,
                      '& th, & td': { border: 1, borderColor: 'divider', verticalAlign: 'top' },
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>{tr('Shift date')}</TableCell>
                        {METHODS.map((m) => (
                          <TableCell key={m}>{tr(LABELS[m])}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewRows
                        .filter((r) => r.date.startsWith(month))
                        .map((row) => (
                          <TableRow key={row.date}>
                            <TableCell>{dateLabel(row.date)}</TableCell>
                            {METHODS.map((m) => {
                              const shift = preview.shifts.find(
                                (item) => item.date === row.date && item.method === m
                              ) || {
                                id: `manual-${row.date}-${m}`,
                                date: row.date,
                                start: preview.start,
                                end: preview.end,
                                method: m,
                                groupId: '',
                                personIds: [],
                                note: '',
                              };
                              return (
                                <TableCell key={m}>
                                  {row.holiday && (
                                    <Typography variant="caption">
                                      {nationalCalendar.holidays.some(
                                        (h) => h.date === row.date && h.name === row.holiday
                                      )
                                        ? tr(row.holiday)
                                        : row.holiday}
                                    </Typography>
                                  )}
                                  <ManualRosterSlot shift={shift} drag={drag}>
                                    {shift.manualAssignment && (
                                      <Typography variant="caption">
                                        {tr('Manual adjustment')}
                                      </Typography>
                                    )}
                                    {shift.personIds.map((id) => (
                                      <RosterPersonChip
                                        key={id}
                                        shiftId={shift.id}
                                        personId={id}
                                        name={names([id])}
                                        drag={drag}
                                        blocked={blocked}
                                        onChoose={() =>
                                          drag.edit({ sourceShiftId: shift.id, sourcePersonId: id })
                                        }
                                      />
                                    ))}
                                  </ManualRosterSlot>
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            ))}
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                disabled={blocked}
                onClick={() => {
                  setApplyExpected(
                    shifts
                      .filter((s) => s.date >= previewRange.from && s.date <= previewRange.to)
                      .map(({ id, version }) => ({ id, version }))
                  );
                  setConfirm(true);
                }}
              >
                {tr('Apply roster')}
              </Button>
              <Button onClick={() => setPreview(null)}>{tr('Cancel preview')}</Button>
            </Stack>
          </>
        )}
      </Stack>
      {preview && swapRequest && (
        <PersonSwapDialog
          {...swapRequest}
          shifts={preview.shifts}
          people={people}
          knownPeople={previewPeople}
          rules={previewRules}
          period={period}
          blocked={blocked}
          onClose={() => setSwapRequest(null)}
          onConfirm={async (selection, snapshot, accepted) => {
            const result = await drag.commit(selection, snapshot, accepted);
            if (result.ok) setSwapRequest(null);
            return result;
          }}
        />
      )}
      <Dialog
        open={regenerateConfirm}
        onClose={() => setRegenerateConfirm(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{tr('Regenerate and discard manual adjustments?')}</DialogTitle>
        <DialogContent>
          {tr(
            'Regenerating the preview discards its manual adjustments. Applied calendar shifts remain unchanged until you apply the new roster.'
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegenerateConfirm(false)}>{tr('Cancel')}</Button>
          <Button onClick={generatePreview}>{tr('Confirm')}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirm && !!preview} onClose={() => setConfirm(false)} fullWidth maxWidth="xs">
        <DialogTitle>{tr('Replace shifts in this planning period?')}</DialogTitle>
        <DialogContent>
          {saveError && <Alert severity="error">{tr(rosterErrorMessage(saveError))}</Alert>}
          {shifts.some(
            (shift) =>
              previewRange &&
              shift.date >= previewRange.from &&
              shift.date <= previewRange.to &&
              shift.manualAssignment
          ) && (
            <Alert severity="warning">
              {tr('Applying this roster replaces manual adjustments in this date range.')}
            </Alert>
          )}
          {tr(
            'Replace {{old}} existing shifts with {{next}} planned shifts. Shifts outside this period are retained.',
            {
              old: number(
                previewRange
                  ? shifts.filter((s) => s.date >= previewRange.from && s.date <= previewRange.to)
                      .length
                  : 0
              ),
              next: number(preview?.shifts.length || 0),
            }
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(false)}>{tr('Go back')}</Button>
          <Button
            disabled={(blocked && !retryApply) || applying}
            onClick={async () => {
              setApplying(true);
              try {
                const result = retryApply
                  ? await retryApply()
                  : await onApply(preview.shifts, periodRange(preview.period), applyExpected);
                if (result?.ok) {
                  setConfirm(false);
                  setPreview(null);
                }
              } finally {
                setApplying(false);
              }
            }}
          >
            {tr('Confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

AutoRosterPanel.propTypes = {
  saveError: PropTypes.object,
  retryApply: PropTypes.func,
  appliedRevision: PropTypes.number,
  nationalCalendar: PropTypes.object,
  people: PropTypes.array.isRequired,
  period: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  rules: PropTypes.object.isRequired,
  setRules: PropTypes.func.isRequired,
  shifts: PropTypes.array.isRequired,
  onApply: PropTypes.func.isRequired,
  blocked: PropTypes.bool.isRequired,
};
