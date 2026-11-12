import { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Iconify from '../../components/iconify';
import useResponsive from '../../hooks/useResponsive';
import { currentLocale, tr, useUiLanguage } from '../../locales/translate';
import { domainLabel } from '../../locales/domainLabels';
import { malaysiaHolidays, mergeHolidays } from '../../sections/duty-roster/malaysiaHolidays';
import useRosterSettings from '../../sections/duty-roster/useRosterSettings';
import useRosterNavigationGuard from '../../sections/duty-roster/useRosterNavigationGuard';
import { rosterErrorMessage } from '../../services/dutyRosterService';
import useDutyRoster from '../../sections/duty-roster/useDutyRoster';
import { unassignedPeople } from '../../sections/duty-roster/autoRoster';
import AutoRosterPanel from '../../sections/duty-roster/AutoRosterPanel';
import ManualRosterTools from '../../sections/duty-roster/ManualRosterTools';
import usePersonDragSwap from '../../sections/duty-roster/usePersonDragSwap';
import { DragSwapFeedback } from '../../sections/duty-roster/RosterPersonChip';
import PersonSwapDialog from '../../sections/duty-roster/PersonSwapDialog';
import DutyCalendar from '../../sections/duty-roster/DutyCalendar';
import DutyShiftDialog from '../../sections/duty-roster/DutyShiftDialog';
import { printDutyRoster } from '../../sections/duty-roster/rosterPrint';
import {
  emptyShift,
  malaysiaDateTime,
  periodRange,
  validDate,
  visibleShifts,
} from '../../sections/duty-roster/rosterModel';

export default function DutyRosterPage() {
  useUiLanguage();
  const desktop = useResponsive('up', 'md');
  const [date, setDate] = useState(() => malaysiaDateTime().date);
  const [period, setPeriod] = useState(() => periodRange(malaysiaDateTime().date.slice(0, 7)));
  const [selectedView, setSelectedView] = useState(null);
  const [personId, setPersonId] = useState('');
  const [dialog, setDialog] = useState(null);
  const [swapRequest, setSwapRequest] = useState(null);
  const [notice, setNotice] = useState('');
  const [printError, setPrintError] = useState(false);
  const [visibleRange, setVisibleRange] = useState(null);
  const updateVisibleRange = useCallback(
    (next) =>
      setVisibleRange((old) => (old?.from === next.from && old?.to === next.to ? old : next)),
    []
  );
  const roster = useDutyRoster(period, visibleRange);
  const settings = useRosterSettings(period);
  const { rules, setRules } = settings;
  const navigation = useRosterNavigationGuard(
    settings.dirty || settings.uncertain || roster.uncertain,
    settings.saving || roster.saving,
    settings.save
  );
  const busy = roster.loading || roster.saving || roster.blocked || !!roster.error;
  const nationalCalendar = malaysiaHolidays(period);
  const effectiveRules = {
    ...rules,
    holidays: mergeHolidays(nationalCalendar.holidays, rules.holidays),
  };
  const view = selectedView || (desktop ? 'timeGridWeek' : 'listDay');
  const calendarDrag = usePersonDragSwap({
    scope: 'applied',
    context: {
      shifts: roster.shifts,
      people: roster.people,
      rules: effectiveRules,
      period,
      loadRange: roster.loadRange,
      holidayLabels: effectiveRules.holidays.map((h) => ({
        ...h,
        name: rules.holidays.some((manual) => manual.date === h.date) ? h.name : tr(h.name),
      })),
    },
    blocked: busy,
    externalUndo: roster.lastUndo,
    cancelKey: JSON.stringify({ date, view, period }),
    resetKey: 'applied',
    onCommit: (selection, snapshot, accepted) =>
      roster.swap(selection, snapshot, accepted, effectiveRules, period),
    onConfirm: setSwapRequest,
    onUndo: (record) => roster.undoSwap(record, effectiveRules, period),
  });
  const range = periodRange(period);
  const displayedShifts = visibleShifts(roster.shifts, personId);
  const periodShifts = range
    ? displayedShifts.filter((shift) => shift.date >= range.from && shift.date <= range.to)
    : [];
  const periodPeople = new Set(periodShifts.flatMap((shift) => shift.personIds)).size;
  const formatDate = (value) =>
    new Intl.DateTimeFormat(currentLocale(), {
      timeZone: 'Asia/Kuala_Lumpur',
      dateStyle: 'medium',
    }).format(new Date(`${value}T12:00:00+08:00`));
  const count = (value) => new Intl.NumberFormat(currentLocale()).format(value);
  const add = (day, start = '09:00') => {
    if (roster.loading || roster.error || !roster.people.length) return;
    setNotice('');
    setDialog(emptyShift(day, start));
  };
  const print = () => {
    const opened = printDutyRoster({
      period,
      language: currentLocale() === 'zh-CN' ? 'cn' : 'en',
      shifts: periodShifts,
      knownPeople: roster.knownPeople,
      personName: personId ? roster.knownPeople[personId]?.name || '' : '',
      holidays: effectiveRules.holidays.map((holiday) => ({
        ...holiday,
        name: rules.holidays.some((h) => h.date === holiday.date) ? holiday.name : tr(holiday.name),
      })),
      labels: {
        centre: tr('Kuching Buddhist Lodge Bodhi Counselling Centre'),
        title: tr('Counselling volunteer duty roster'),
        date: tr('Date'),
        phone: tr('Telephone'),
        f2f: tr('Face-to-face'),
        zoom: 'Zoom',
        manualAdjustment: tr('Manual adjustment'),
        unavailablePerson: (id) => tr('Unavailable person #{{id}}', { id }),
        continued: tr('Continued'),
        noDutyDates: tr('No duty dates in this month.'),
        print: tr('Print / Save PDF'),
        close: tr('Close'),
        instructions: tr(
          'Choose Save as PDF in the print dialog. Use A4 landscape, enable background graphics and turn off browser headers and footers.'
        ),
      },
    });
    setPrintError(!opened);
  };
  return (
    <>
      <Helmet>
        <title>{tr('Duty roster')}</title>
      </Helmet>
      <Container maxWidth="xl" sx={{ pb: 4 }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ sm: 'center' }}
            spacing={2}
          >
            <Box>
              <Typography variant="h4">{tr('Duty roster')}</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {tr('Plan counsellor and volunteer duty shifts, one day at a time.')}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Button
                variant="outlined"
                onClick={print}
                disabled={roster.loading || !!roster.error || !range || !periodShifts.length}
                startIcon={<Iconify icon="eva:printer-outline" />}
              >
                {tr('Print / Save PDF')}
              </Button>
              <Button
                variant="contained"
                onClick={() => add(date)}
                disabled={roster.loading || !!roster.error || !roster.people.length}
                startIcon={<Iconify icon="eva:plus-fill" />}
                sx={{ flexShrink: 0, alignSelf: { xs: 'flex-start', sm: 'center' } }}
              >
                {tr('Add shift')}
              </Button>
            </Stack>
          </Stack>
          <Alert severity="info">
            {tr(
              'Applied shifts are saved automatically. Preview changes remain temporary until applied; save planning settings separately.'
            )}
          </Alert>
          {(roster.saving || settings.saving) && (
            <Alert severity="info" role="status">
              {tr('Saving roster data...')}
            </Alert>
          )}
          {roster.saved && !roster.saving && !roster.saveError && (
            <Alert severity="success">{tr('Calendar changes saved.')}</Alert>
          )}
          {roster.saveError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" disabled={roster.saving} onClick={roster.retry}>
                  {tr('Retry')}
                </Button>
              }
            >
              {tr(rosterErrorMessage(roster.saveError))}
            </Alert>
          )}
          {roster.loading && (
            <Alert severity="info" role="status">
              {tr('Loading personnel...')}
            </Alert>
          )}
          {roster.error && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" onClick={roster.reload}>
                  {tr('Retry')}
                </Button>
              }
            >
              {tr(rosterErrorMessage(roster.error))}
            </Alert>
          )}
          {!roster.loading && !roster.error && !roster.people.length && (
            <Alert severity="warning">
              {tr(
                'No active counsellors or volunteers. Add an active person in personnel management first.'
              )}
            </Alert>
          )}
          {notice && (
            <Alert severity="success" onClose={() => setNotice('')}>
              {tr(notice)}
            </Alert>
          )}
          {printError && (
            <Alert severity="warning" onClose={() => setPrintError(false)}>
              {tr('Allow pop-ups for this site, then try printing again.')}
            </Alert>
          )}
          <Box sx={{ p: { xs: 2, md: 2.5 }, border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={2.5}
              alignItems={{ lg: 'center' }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ minWidth: 0 }}>
                {['from', 'to'].map((key) => (
                  <TextField
                    key={key}
                    type="date"
                    label={tr(key === 'from' ? 'Roster start date' : 'Roster end date')}
                    value={period[key]}
                    onChange={(event) => {
                      const next = event.target.value;
                      navigation.request(() => {
                        setPeriod((old) => ({ ...old, [key]: next }));
                        if (key === 'from' && validDate(next)) setDate(next);
                      });
                    }}
                    InputLabelProps={{ shrink: true }}
                    inputProps={
                      key === 'to'
                        ? { min: period.from || undefined, max: '9999-12-31' }
                        : { max: '9999-12-31' }
                    }
                    error={!range}
                    helperText={
                      !range
                        ? tr(
                            'Choose valid start and end dates. The end date must be on or after the start date.'
                          )
                        : undefined
                    }
                    sx={{ minWidth: { sm: 180 }, flex: 1 }}
                  />
                ))}
              </Stack>
              <TextField
                select
                label={tr('Duty personnel')}
                value={personId}
                onChange={(event) => setPersonId(event.target.value)}
                sx={{ minWidth: { md: 240 }, maxWidth: { md: 320 } }}
              >
                <MenuItem value="">{tr('All duty personnel')}</MenuItem>
                {Object.values(roster.knownPeople).map((person) => (
                  <MenuItem
                    key={person.id}
                    value={person.id}
                    sx={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}
                  >
                    {person.name} · {domainLabel(person.type)}
                  </MenuItem>
                ))}
              </TextField>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="overline" color="text.secondary">
                  {tr('Planning date range')}
                </Typography>
                <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere' }}>
                  {range
                    ? tr('{{from}} – {{to}}', {
                        from: formatDate(range.from),
                        to: formatDate(range.to),
                      })
                    : '—'}
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                  <Chip
                    size="small"
                    label={tr('{{count}} duty shifts', { count: count(periodShifts.length) })}
                  />
                  <Chip
                    size="small"
                    label={tr('{{count}} duty personnel', { count: count(periodPeople) })}
                  />
                </Stack>
              </Box>
              <Button variant="outlined" disabled={roster.loading} onClick={roster.reload}>
                {tr('Reload personnel')}
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              {tr(
                'Changing the planning period moves the calendar without clearing shifts. You may also browse dates outside this period.'
              )}
            </Typography>
          </Box>
          <Box
            component="fieldset"
            disabled={settings.loading || settings.saving || roster.saving}
            sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              useFlexGap
              flexWrap="wrap"
              sx={{ mb: 2 }}
            >
              <Button
                variant="contained"
                disabled={!settings.ready || !settings.dirty || settings.saving}
                onClick={settings.save}
              >
                {tr('Save planning settings')}
              </Button>
              <Button
                disabled={settings.saving}
                onClick={() => navigation.request(settings.reload)}
              >
                {tr('Reload planning settings')}
              </Button>
              <Typography variant="body2">
                {tr(
                  settings.dirty
                    ? 'Planning settings have unsaved changes.'
                    : 'Planning settings are saved separately from calendar shifts.'
                )}
              </Typography>
            </Stack>
            {settings.loading && (
              <Alert severity="info">{tr('Loading planning settings...')}</Alert>
            )}
            {settings.error && (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    onClick={
                      settings.uncertain ? settings.save : () => navigation.request(settings.reload)
                    }
                  >
                    {tr('Retry')}
                  </Button>
                }
              >
                {tr(settings.errorText)}
              </Alert>
            )}
            {settings.ready && (
              <AutoRosterPanel
                key={JSON.stringify(period)}
                appliedRevision={roster.appliedRevision}
                saveError={roster.saveError}
                retryApply={roster.uncertain ? roster.retry : null}
                people={roster.people}
                period={period}
                rules={rules}
                nationalCalendar={nationalCalendar}
                setRules={setRules}
                shifts={roster.shifts}
                blocked={busy || settings.saving}
                onApply={async (incoming, appliedRange, expected) => {
                  const result = await roster.replace(incoming, appliedRange || range, expected);
                  if (result.ok) setNotice('Duty shift saved.');
                  return result;
                }}
              />
            )}
          </Box>
          {!roster.shifts.length && (
            <Alert severity="info">
              {tr('No shifts recorded yet. Add your first shift to start planning.')}
            </Alert>
          )}
          {!!roster.shifts.length && !displayedShifts.length && (
            <Alert severity="info">{tr('No shifts match the selected person.')}</Alert>
          )}
          <ManualRosterTools
            drag={calendarDrag}
            priorityIds={unassignedPeople(rules.groups, roster.people, rules.preferences).map(
              (p) => p.id
            )}
          />
          <DragSwapFeedback drag={calendarDrag} knownPeople={roster.knownPeople} />
          <DutyCalendar
            onVisibleRangeChange={updateVisibleRange}
            drag={calendarDrag}
            onChoosePerson={(shiftId, id) =>
              setSwapRequest({ sourceShiftId: shiftId, sourcePersonId: id })
            }
            shifts={displayedShifts}
            knownPeople={roster.knownPeople}
            date={date}
            view={view}
            onDateChange={setDate}
            onViewChange={setSelectedView}
            onOpen={(shift) => {
              setNotice('');
              setDialog(shift);
            }}
            onCreateAt={add}
          />
        </Stack>
      </Container>
      <Dialog open={navigation.open} onClose={navigation.cancel} fullWidth maxWidth="sm">
        <DialogTitle>{tr('Save settings before leaving?')}</DialogTitle>
        <DialogContent>
          {tr(
            'You have unsaved settings or an unconfirmed save. Save or retry before leaving, discard to leave without further saving, or continue editing.'
          )}
          {settings.error && <Alert severity="error">{tr(settings.errorText)}</Alert>}
          {roster.saving && <Alert severity="info">{tr('Saving roster data...')}</Alert>}
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap' }}>
          <Button onClick={navigation.cancel}>{tr('Continue editing')}</Button>
          <Button
            color="error"
            disabled={roster.saving || settings.saving}
            onClick={navigation.discard}
          >
            {tr('Discard and leave')}
          </Button>
          <Button
            disabled={roster.saving || settings.saving || roster.uncertain}
            onClick={navigation.saveAndLeave}
          >
            {tr('Save settings and leave')}
          </Button>
        </DialogActions>
      </Dialog>
      {swapRequest && (
        <PersonSwapDialog
          {...swapRequest}
          shifts={roster.shifts}
          people={roster.people}
          knownPeople={roster.knownPeople}
          rules={effectiveRules}
          period={period}
          blocked={busy}
          onClose={() => setSwapRequest(null)}
          onConfirm={async (selection, snapshot, accepted) => {
            const result = await calendarDrag.commit(selection, snapshot, accepted);
            if (result.ok) {
              setSwapRequest(null);
              setNotice('Personnel swapped.');
            }
            return result;
          }}
        />
      )}
      {dialog && (
        <DutyShiftDialog
          rules={effectiveRules}
          period={period}
          initial={dialog}
          shifts={roster.shifts}
          people={roster.people}
          knownPeople={roster.knownPeople}
          loading={roster.loading || roster.saving || roster.blocked}
          loadError={roster.error}
          onReload={roster.reload}
          onSwap={() => {
            setSwapRequest({ sourceShiftId: dialog.id });
            setDialog(null);
          }}
          onClose={() => setDialog(null)}
          onSave={async (draft) => {
            const targetShift = {
              ...draft,
              id: draft.id || `manual-${Date.now()}-${Math.random()}`,
            };
            const result = await calendarDrag.apply({
              kind: 'save',
              targetShiftId: targetShift.id,
              targetShift,
            });
            if (result.ok) {
              setDialog(null);
              setNotice('Duty shift saved.');
            }
            return result;
          }}
          onDelete={async (id) => {
            const result = await roster.remove(id);
            if (result.ok) {
              setDialog(null);
              setNotice('Duty shift deleted.');
            }
            return result;
          }}
        />
      )}
    </>
  );
}
