import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Iconify from '../../components/iconify';
import useResponsive from '../../hooks/useResponsive';
import { currentLocale, tr, useUiLanguage } from '../../locales/translate';
import { domainLabel } from '../../locales/domainLabels';
import useDutyRoster from '../../sections/duty-roster/useDutyRoster';
import DutyCalendar from '../../sections/duty-roster/DutyCalendar';
import DutyShiftDialog from '../../sections/duty-roster/DutyShiftDialog';
import {
  emptyShift,
  malaysiaDateTime,
  periodRange,
  visibleShifts,
} from '../../sections/duty-roster/rosterModel';

export default function DutyRosterPage() {
  useUiLanguage();
  const desktop = useResponsive('up', 'md');
  const roster = useDutyRoster();
  const [date, setDate] = useState(() => malaysiaDateTime().date);
  const [period, setPeriod] = useState(() => malaysiaDateTime().date.slice(0, 7));
  const [selectedView, setSelectedView] = useState(null);
  const [personId, setPersonId] = useState('');
  const [dialog, setDialog] = useState(null);
  const [notice, setNotice] = useState('');
  const view = selectedView || (desktop ? 'timeGridWeek' : 'listDay');
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
    if (roster.loading || roster.error || !roster.availablePeople.length) return;
    setNotice('');
    setDialog(emptyShift(day, start));
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
            <Button
              variant="contained"
              onClick={() => add(date)}
              disabled={roster.loading || !!roster.error || !roster.availablePeople.length}
              startIcon={<Iconify icon="eva:plus-fill" />}
              sx={{ flexShrink: 0, alignSelf: { xs: 'flex-start', sm: 'center' } }}
            >
              {tr('Add shift')}
            </Button>
          </Stack>
          <Alert severity="info">
            {tr(
              'Frontend prototype: shifts are temporary and disappear when you refresh or leave this page. Personnel are read from the database. Appointments are managed separately.'
            )}
          </Alert>
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
              {tr('Personnel could not be loaded. Retry before adding or editing shifts.')}
            </Alert>
          )}
          {!roster.loading && !roster.error && !roster.availablePeople.length && (
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
          <Box sx={{ p: { xs: 2, md: 2.5 }, border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2.5}
              alignItems={{ md: 'center' }}
            >
              <TextField
                type="month"
                label={tr('Roster starting month')}
                value={period}
                onChange={(event) => {
                  const next = event.target.value;
                  setPeriod(next);
                  if (periodRange(next)) setDate(`${next}-01`);
                }}
                InputLabelProps={{ shrink: true }}
                error={!range}
                helperText={
                  !range ? tr('Choose a valid starting month for a three-month period.') : undefined
                }
                sx={{ minWidth: { md: 220 } }}
              />
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
                  {tr('Three-month planning period')}
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
        {!roster.shifts.length && <Alert severity="info">{tr('No shifts recorded yet. Add your first shift to start planning.')}</Alert>}
        {!!roster.shifts.length && !displayedShifts.length && <Alert severity="info">{tr('No shifts match the selected person.')}</Alert>}
        <DutyCalendar
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
      {dialog && (
        <DutyShiftDialog
          initial={dialog}
          shifts={roster.shifts}
          people={roster.people}
          knownPeople={roster.knownPeople}
          loading={roster.loading}
          loadError={roster.error}
          onReload={roster.reload}
          onClose={() => setDialog(null)}
          onSave={(draft) => {
            roster.save(draft);
            setDialog(null);
            setNotice('Duty shift saved.');
          }}
          onDelete={(id) => {
            roster.remove(id);
            setDialog(null);
            setNotice('Duty shift deleted.');
          }}
        />
      )}
    </>
  );
}
