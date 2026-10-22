import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Container,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { tr, useUiLanguage, currentLocale } from '../../locales/translate';
import { domainLabel } from '../../locales/domainLabels';
import cnCalendar from '../../locales/calendarLocale';
import useResponsive from '../../hooks/useResponsive';
import { StyledCalendar } from '../../sections/@dashboard/calendar';
import {
  COUNSELLORS,
  SESSION_MODES,
} from '../../sections/@dashboard/counselling/cases/create/constants';
import AppointmentDialog from '../../sections/@dashboard/counselling/appointments/AppointmentDialog';
import {
  appointmentService,
  defaultAppointment,
  filterAppointments,
  malaysiaNow,
  MODE_COLORS,
  shiftDate,
  STATUS_LABELS,
  validDate,
} from '../../services/appointmentService';
import { useSnackbar } from '../../components/snackbar';

const EMPTY_FILTERS = { from: '', to: '', counsellor: '', mode: '', status: '', search: '' };
export default function AppointmentManagementPage() {
  const language = useUiLanguage();
  const desktop = useResponsive('up', 'sm');
  const { enqueueSnackbar } = useSnackbar();
  const [params, setParams] = useSearchParams();
  const today = malaysiaNow().date;
  const view = ['month', 'day', 'list'].includes(params.get('view')) ? params.get('view') : 'month';
  const date = validDate(params.get('date')) ? params.get('date') : today;
  const [items, setItems] = useState(() => appointmentService.query());
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(10);
  const [dialog, setDialog] = useState(null);
  const calendar = useRef(null);
  const navigate = (nextView, nextDate = date) => {
    const next = new URLSearchParams(params);
    next.set('view', nextView);
    next.set('date', nextDate);
    setParams(next);
  };
  useEffect(() => {
    calendar.current?.getApi().gotoDate(date);
  }, [date, view]);
  const updateFilter = (key, value) => {
    setFilters((old) => ({ ...old, [key]: value }));
    setPage(0);
  };
  const invalidRange = !!(filters.from && filters.to && filters.from > filters.to);
  const filtered = invalidRange ? [] : filterAppointments(items, filters);
  const dayItems = filterAppointments(items, { ...EMPTY_FILTERS, from: date, to: date });
  const formatDate = (value, month = false) =>
    new Intl.DateTimeFormat(currentLocale(), {
      timeZone: 'Asia/Kuala_Lumpur',
      year: 'numeric',
      month: 'long',
      ...(month ? {} : { day: 'numeric', weekday: 'short' }),
    }).format(new Date(`${value}T12:00:00+08:00`));
  const modeChip = (item) => (
    <Chip
      size="small"
      label={domainLabel(item.mode)}
      sx={{
        bgcolor: MODE_COLORS[item.mode],
        color: '#fff',
        maxWidth: '100%',
        '& .MuiChip-label': { whiteSpace: 'normal' },
        height: 'auto',
        minHeight: 24,
      }}
    />
  );
  const displayItems = view === 'day' ? dayItems : filtered.slice(page * rows, (page + 1) * rows);
  const selectFilter = (key, label, values, render) => (
    <TextField
      select
      label={tr(label)}
      value={filters[key]}
      onChange={(e) => updateFilter(key, e.target.value)}
      fullWidth
    >
      <MenuItem value="">{tr('All')}</MenuItem>
      {values.map((v) => (
        <MenuItem value={v} key={v}>
          {render(v)}
        </MenuItem>
      ))}
    </TextField>
  );
  const changed = (next, message) => {
    setItems(next);
    setDialog(null);
    setPage(0);
    enqueueSnackbar(tr(message));
  };
  return (
    <Container maxWidth="xl" sx={{ pb: 4 }}>
      <Helmet>
        <title>{tr('Appointment management')}</title>
      </Helmet>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="h4">{tr('Appointment management')}</Typography>
            <Typography color="text.secondary">
              {tr('Coordinate counselling appointments')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => setDialog(defaultAppointment(view === 'day' ? date : undefined))}
          >
            {tr('New appointment')}
          </Button>
        </Stack>
        <Alert severity="info">
          {tr(
            'Demo version — fictional data. Reloading resets all changes. Times use Malaysia time (UTC+8).'
          )}
        </Alert>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2}>
          <ToggleButtonGroup
            exclusive
            value={view}
            onChange={(_, next) => {
              if (next) navigate(next);
            }}
            aria-label={tr('Appointment view')}
          >
            <ToggleButton value="month">{tr('Month view')}</ToggleButton>
            <ToggleButton value="day">{tr('Day view')}</ToggleButton>
            <ToggleButton value="list">{tr('List view')}</ToggleButton>
          </ToggleButtonGroup>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {SESSION_MODES.map((mode) => (
              <Chip
                key={mode}
                label={domainLabel(mode)}
                sx={{ bgcolor: MODE_COLORS[mode], color: '#fff' }}
              />
            ))}
          </Stack>
        </Stack>
        {view !== 'list' && (
          <Stack spacing={1}>
            <Typography variant="h5">{formatDate(date, view === 'month')}</Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Button
                variant="outlined"
                onClick={() => navigate(view, shiftDate(date, -1, view === 'month'))}
              >
                {tr(view === 'month' ? 'Previous month' : 'Previous day')}
              </Button>
              <Button onClick={() => navigate(view, today)}>{tr('Today')}</Button>
              <Button
                variant="outlined"
                onClick={() => navigate(view, shiftDate(date, 1, view === 'month'))}
              >
                {tr(view === 'month' ? 'Next month' : 'Next day')}
              </Button>
              {view === 'day' && (
                <Button onClick={() => navigate('month')}>{tr('Back to month')}</Button>
              )}
            </Stack>
          </Stack>
        )}
        {view === 'month' && (
          <Card sx={{ overflow: 'hidden' }}>
            <StyledCalendar
              sx={{
                '& .fc-daygrid-event': { whiteSpace: 'normal', cursor: 'pointer' },
                '& .fc-daygrid-day-frame': { minHeight: 110 },
                '& .fc .fc-event .fc-event-main': {
                  overflowWrap: 'anywhere',
                  backgroundColor: 'transparent',
                  color: '#fff',
                  '&:before, &:after': { display: 'none' },
                },
                '& .fc .fc-event .fc-event-main-frame': { filter: 'none' },
                '& .fc a.fc-event': { color: '#fff' },
              }}
            >
              <FullCalendar
                ref={calendar}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                initialDate={date}
                locale={language === 'cn' ? cnCalendar : 'en'}
                headerToolbar={false}
                height="auto"
                fixedWeekCount={false}
                dayMaxEvents={3}
                eventDisplay="block"
                editable={false}
                events={items.map((a) => ({
                  id: a.id,
                  start: `${a.date}T${a.start}:00`,
                  end: `${a.date}T${a.end}:00`,
                  title: `${a.counsellor} · ${a.clientInitials} · ${domainLabel(a.mode)}`,
                  backgroundColor: MODE_COLORS[a.mode],
                  borderColor: MODE_COLORS[a.mode],
                  textColor: '#fff',
                  extendedProps: { appointment: a },
                }))}
                eventContent={({ event }) => {
                  const a = event.extendedProps.appointment;
                  return (
                    <Box sx={{ px: 0.5, fontSize: desktop ? 12 : 10, lineHeight: 1.5 }}>
                      <strong>
                        {a.start} · {a.counsellor}
                      </strong>
                      <div>
                        {a.clientInitials} · {domainLabel(a.mode)}
                      </div>
                      <div>{domainLabel(a.status)}</div>
                    </Box>
                  );
                }}
                dateClick={({ dateStr }) => navigate('day', dateStr)}
                eventClick={({ event }) => setDialog({ ...event.extendedProps.appointment })}
                moreLinkClick={({ date: clicked }) => {
                  const day = `${clicked.getFullYear()}-${String(clicked.getMonth() + 1).padStart(
                    2,
                    '0'
                  )}-${String(clicked.getDate()).padStart(2, '0')}`;
                  navigate('day', day);
                  return 'none';
                }}
                moreLinkContent={({ num }) => tr('{{count}} more appointments', { count: num })}
              />
            </StyledCalendar>
          </Card>
        )}
        {view === 'list' && (
          <Card sx={{ p: 2 }}>
            <Stack spacing={2}>
              <TextField
                label={tr('Search initials / case number')}
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                fullWidth
              />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                  gap: 2,
                }}
              >
                <TextField
                  type="date"
                  label={tr('From date')}
                  InputLabelProps={{ shrink: true }}
                  value={filters.from}
                  onChange={(e) => updateFilter('from', e.target.value)}
                />
                <TextField
                  type="date"
                  label={tr('To date')}
                  InputLabelProps={{ shrink: true }}
                  value={filters.to}
                  onChange={(e) => updateFilter('to', e.target.value)}
                  error={invalidRange}
                  helperText={invalidRange ? tr('End date must not precede start date') : undefined}
                />
                {selectFilter('counsellor', 'Counsellor', COUNSELLORS, (v) => v)}
                {selectFilter('mode', 'Session mode', SESSION_MODES, domainLabel)}
                {selectFilter('status', 'Status', Object.keys(STATUS_LABELS), (v) =>
                  domainLabel(v)
                )}
              </Box>
              <Button
                onClick={() => {
                  setFilters(EMPTY_FILTERS);
                  setPage(0);
                }}
                sx={{ alignSelf: 'flex-start' }}
              >
                {tr('Clear filters')}
              </Button>
            </Stack>
          </Card>
        )}
        {view !== 'month' && (
          <>
            {!displayItems.length && <Alert severity="info">{tr('No appointments found')}</Alert>}
            {desktop && displayItems.length > 0 ? (
              <TableContainer component={Card}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {[
                        'Appointment date',
                        'Time',
                        'Client initials',
                        'Case number',
                        'Counsellor',
                        'Session mode',
                        'Location',
                        'Status',
                        'Actions',
                      ].map((label) => (
                        <TableCell key={label}>{tr(label)}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayItems.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{formatDate(a.date)}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {a.start}–{a.end}
                        </TableCell>
                        <TableCell>{a.clientInitials}</TableCell>
                        <TableCell>{a.caseNumber || '—'}</TableCell>
                        <TableCell>{a.counsellor}</TableCell>
                        <TableCell>{modeChip(a)}</TableCell>
                        <TableCell sx={{ maxWidth: 180, overflowWrap: 'anywhere' }}>
                          {a.location}
                        </TableCell>
                        <TableCell>{domainLabel(a.status)}</TableCell>
                        <TableCell>
                          <Button onClick={() => setDialog({ ...a })}>{tr('View details')}</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Stack spacing={2}>
                {displayItems.map((a) => (
                  <Card key={a.id} sx={{ p: 2, borderLeft: `4px solid ${MODE_COLORS[a.mode]}` }}>
                    <Stack spacing={1}>
                      <Typography variant="subtitle1">
                        {formatDate(a.date)} · {a.start}–{a.end}
                      </Typography>
                      <Typography sx={{ overflowWrap: 'anywhere' }}>
                        {a.clientInitials} · {a.caseNumber || tr('New visitor')} · {a.counsellor}
                      </Typography>
                      <Box>{modeChip(a)}</Box>
                      <Typography sx={{ overflowWrap: 'anywhere' }}>{a.location}</Typography>
                      <Typography>{domainLabel(a.status)}</Typography>
                      <Button onClick={() => setDialog({ ...a })}>{tr('View details')}</Button>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
            {view === 'list' && (
              <TablePagination
                component="div"
                count={filtered.length}
                page={page}
                rowsPerPage={rows}
                rowsPerPageOptions={[5, 10, 25]}
                onPageChange={(_, value) => setPage(value)}
                onRowsPerPageChange={(e) => {
                  setRows(Number(e.target.value));
                  setPage(0);
                }}
                labelRowsPerPage={tr('Rows per page:')}
                labelDisplayedRows={({ from, to, count }) =>
                  tr('{{from}}–{{to}} of {{count}}', { from, to, count })
                }
                sx={{
                  '& .MuiTablePagination-toolbar': { flexWrap: 'wrap', justifyContent: 'flex-end' },
                  '& .MuiTablePagination-spacer': { display: { xs: 'none', sm: 'block' } },
                }}
              />
            )}
          </>
        )}
      </Stack>
      {dialog && (
        <AppointmentDialog
          initial={dialog}
          items={items}
          onClose={() => setDialog(null)}
          onSave={(item) =>
            changed(
              item.id ? appointmentService.update(item.id, item) : appointmentService.create(item),
              'Appointment saved'
            )
          }
          onStatus={(id, status) =>
            changed(appointmentService.setStatus(id, status), 'Appointment status updated')
          }
          onDelete={(id) => changed(appointmentService.remove(id), 'Appointment deleted')}
        />
      )}
    </Container>
  );
}
