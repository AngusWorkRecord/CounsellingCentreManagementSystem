import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Box,
  Button,
  Card,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import Iconify from '../../components/iconify';
import { tr, useUiLanguage } from '../../locales/translate';
import cnCalendar from '../../locales/calendarLocale';
import { dateKey, malaysiaDateTime } from './rosterModel';

export default function DutyCalendar({
  shifts,
  knownPeople,
  date,
  view,
  onDateChange,
  onViewChange,
  onOpen,
  onCreateAt,
}) {
  const language = useUiLanguage();
  const calendar = useRef(null);
  const [title, setTitle] = useState('');
  useEffect(() => {
    const api = calendar.current?.getApi();
    if (!api) return;
    if (api.view.type !== view) api.changeView(view, date);
    else if (dateKey(api.getDate()) !== date) api.gotoDate(date);
  }, [date, view]);
  const peopleNames = (ids) =>
    ids.map((id) => knownPeople[id]?.name || tr('Unavailable person #{{id}}', { id })).join(', ');
  return (
    <Card sx={{ p: { xs: 1.5, md: 2.5 } }}>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ md: 'center' }}
        >
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
            <IconButton
              aria-label={tr('Previous calendar period')}
              onClick={() => calendar.current?.getApi().prev()}
            >
              <Iconify icon="eva:arrow-ios-back-fill" />
            </IconButton>
            <IconButton
              aria-label={tr('Next calendar period')}
              onClick={() => calendar.current?.getApi().next()}
            >
              <Iconify icon="eva:arrow-ios-forward-fill" />
            </IconButton>
            <Typography variant="h6" sx={{ overflowWrap: 'anywhere', flex: 1 }}>
              {title}
            </Typography>
            <Button onClick={() => onDateChange(malaysiaDateTime().date)}>{tr('Today')}</Button>
          </Stack>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={view}
            onChange={(_, next) => {
              if (next) onViewChange(next);
            }}
            aria-label={tr('Duty calendar view')}
            sx={{ flexWrap: 'wrap' }}
          >
            {[
              ['dayGridMonth', 'Month view'],
              ['timeGridWeek', 'Week view'],
              ['timeGridDay', 'Day view'],
              ['listDay', 'Daily agenda'],
            ].map(([value, label]) => (
              <ToggleButton key={value} value={value}>
                {tr(label)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
        <Box
          sx={{
            overflowX: 'auto',
            '& .fc': {
              minWidth: view === 'timeGridWeek' ? 680 : 0,
              '--fc-border-color': (theme) => theme.palette.divider,
              '--fc-today-bg-color': (theme) => theme.palette.action.hover,
            },
            '& .fc a': { color: 'text.primary' },
            '& .fc-event': { cursor: 'pointer' },
            '& .fc-event-main': { color: 'primary.dark' },
            '& .fc-daygrid-event': { whiteSpace: 'normal' },
            '& .fc-list-event:hover td': { bgcolor: 'action.hover' },
          }}
        >
          <FullCalendar
            ref={calendar}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialDate={date}
            initialView={view}
            headerToolbar={false}
            firstDay={1}
            height="auto"
            locale={language === 'cn' ? cnCalendar : 'en'}
            now={() => {
              const now = malaysiaDateTime();
              return `${now.date}T${now.time}:00`;
            }}
            editable={false}
            selectable={false}
            allDaySlot={false}
            dayMaxEvents={3}
            slotEventOverlap={false}
            scrollTime="08:00:00"
            noEventsText={tr('No shifts on this day. Add a shift or choose another date.')}
            events={shifts.map((shift) => ({
              id: shift.id,
              title: peopleNames(shift.personIds),
              start: `${shift.date}T${shift.start}:00`,
              end: `${shift.date}T${shift.end}:00`,
              backgroundColor: '#e5f3ef',
              borderColor: '#3c8b74',
              textColor: '#185a47',
              extendedProps: { shift },
            }))}
            datesSet={({ view: currentView }) => {
              setTitle(currentView.title);
              const api = calendar.current?.getApi();
              if (api) onDateChange(dateKey(api.getDate()));
            }}
            eventContent={({ event }) => (
              <Box
                title={`${event.extendedProps.shift.start}–${event.extendedProps.shift.end} · ${event.title}`}
                sx={{ px: 0.5, py: 0.25, fontSize: 12, lineHeight: 1.4, overflowWrap: 'anywhere' }}
              >
                <Box component="span" sx={{ fontWeight: 700 }}>
                  {event.extendedProps.shift.start}–{event.extendedProps.shift.end}
                </Box>
                <Box
                  sx={{
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {event.title}
                </Box>
              </Box>
            )}
            eventClick={({ event }) => onOpen(event.extendedProps.shift)}
            dateClick={({ dateStr }) => {
              const day = dateStr.slice(0, 10);
              if (view === 'dayGridMonth') {
                onDateChange(day);
                onViewChange('timeGridDay');
              } else onCreateAt(day, dateStr.slice(11, 16) || '09:00');
            }}
            moreLinkClick={({ date: clicked }) => {
              onDateChange(dateKey(clicked));
              onViewChange('listDay');
              return 'none';
            }}
          />
        </Box>
      </Stack>
    </Card>
  );
}
DutyCalendar.propTypes = {
  shifts: PropTypes.array.isRequired,
  knownPeople: PropTypes.object.isRequired,
  date: PropTypes.string.isRequired,
  view: PropTypes.string.isRequired,
  onDateChange: PropTypes.func.isRequired,
  onViewChange: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
  onCreateAt: PropTypes.func.isRequired,
};
