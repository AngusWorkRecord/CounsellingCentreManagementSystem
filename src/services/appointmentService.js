import { COUNSELLORS, SESSION_MODES } from '../sections/@dashboard/counselling/cases/create/constants';

export const STATUS_LABELS = { scheduled: 'Scheduled', completed: 'Appointment completed', no_show: 'No-show' };
export const MODE_COLORS = { 面谈: '#17834b', 电话辅导: '#1769aa', 线上辅导: '#7841ad' };
export const MOCK_CASES = [
  { id: 'mock-case-1', caseNumber: 'DEMO-001', clientInitials: 'AL', phone: '010-0000001' },
  { id: 'mock-case-2', caseNumber: 'DEMO-002', clientInitials: 'BK', phone: '010-0000002' },
];

export function malaysiaNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  const p = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}
export function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
}
export function shiftDate(date, amount, month = false) {
  const d = new Date(`${date}T12:00:00Z`);
  if (month) { d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + amount); }
  else d.setUTCDate(d.getUTCDate() + amount);
  return d.toISOString().slice(0, 10);
}
export function defaultAppointment(date, now = new Date()) {
  const local = malaysiaNow(now);
  const next = Number(local.time.slice(0, 2)) + 1;
  // At the end of the day, the next complete one-hour slot is tomorrow.
  const rollover = next >= 23;
  const hour = rollover ? 0 : next;
  return { caseId: '', caseNumber: '', clientInitials: '', phone: '', date: date || (rollover ? shiftDate(local.date, 1) : local.date), start: `${String(hour).padStart(2, '0')}:00`, end: `${String(hour + 1).padStart(2, '0')}:00`, counsellor: '', mode: '', location: '', status: 'scheduled' };
}
export function hasEnded(item, now = new Date()) {
  return new Date(`${item.date}T${item.end}:00+08:00`).getTime() <= now.getTime();
}
export function validateAppointment(item, items) {
  const errors = {};
  ['clientInitials', 'phone', 'date', 'start', 'end', 'counsellor', 'mode', 'location'].forEach((key) => { if (!String(item[key] || '').trim()) errors[key] = 'This field is required'; });
  if (!validDate(item.date)) errors.date = 'Select a valid date';
  ['start', 'end'].forEach((key) => { if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(item[key] || '')) errors[key] = 'Select a valid time'; });
  if (!errors.start && !errors.end && item.end <= item.start) errors.end = 'End time must be later than start time';
  if (!COUNSELLORS.includes(item.counsellor)) errors.counsellor = 'Please select a counsellor';
  if (!SESSION_MODES.includes(item.mode)) errors.mode = 'Please select a session mode';
  const conflict = items.find((other) => other.id !== item.id && other.date === item.date && other.counsellor === item.counsellor && item.start < other.end && item.end > other.start);
  return { errors, conflict };
}
export function filterAppointments(items, filters) {
  const query = filters.search.trim().toLowerCase();
  return items.filter((a) => (!filters.from || a.date >= filters.from) && (!filters.to || a.date <= filters.to) && (!filters.counsellor || a.counsellor === filters.counsellor) && (!filters.mode || a.mode === filters.mode) && (!filters.status || a.status === filters.status) && (!query || [a.clientInitials, a.caseNumber].some((v) => v.toLowerCase().includes(query))))
    .sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
}
export function createAppointmentService(now = new Date()) {
  const today = malaysiaNow(now).date;
  const make = (id, date, start, end, index, status = 'scheduled') => ({ date, start, end, ...MOCK_CASES[index % 2], id: `appointment-${id}`, caseId: MOCK_CASES[index % 2].id, counsellor: COUNSELLORS[index % COUNSELLORS.length], mode: SESSION_MODES[index % 3], location: 'Demo Centre', status });
  let items = [
    ...Array.from({ length: 5 }, (_, i) => make(i, today, `${String(9 + i).padStart(2, '0')}:00`, `${String(10 + i).padStart(2, '0')}:00`, i)),
    make(5, shiftDate(today, -1), '09:00', '10:00', 0, 'completed'),
    { ...make(6, shiftDate(today, -1), '11:00', '12:00', 2, 'no_show'), caseId: '', caseNumber: '', clientInitials: 'CT' },
  ];
  const query = () => items.map((a) => ({ ...a }));
  const check = (item) => {
    const result = validateAppointment(item, items);
    if (Object.keys(result.errors).length || result.conflict) throw Object.assign(new Error('INVALID_APPOINTMENT'), result);
  };
  return {
    query,
    create(item) { const next = { ...item, id: globalThis.crypto?.randomUUID?.() || `appointment-${Date.now()}-${Math.random()}`, status: 'scheduled' }; check(next); items = [...items, next]; return query(); },
    update(id, item) {
      const previous = items.find((a) => a.id === id);
      if (!previous || previous.status !== 'scheduled') throw new Error('APPOINTMENT_NOT_EDITABLE');
      const next = { ...item, id, status: previous.status }; check(next); items = items.map((a) => a.id === id ? next : a); return query();
    },
    setStatus(id, status, currentTime = new Date()) {
      const item = items.find((a) => a.id === id);
      if (!item || !STATUS_LABELS[status] || (status !== 'scheduled' && (item.status !== 'scheduled' || !hasEnded(item, currentTime)))) throw new Error('INVALID_STATUS_CHANGE');
      check(item); items = items.map((a) => a.id === id ? { ...a, status } : a); return query();
    },
    remove(id) { items = items.filter((a) => a.id !== id); return query(); },
  };
}

// Module lifetime keeps changes across views/routes; a browser reload resets the demo.
export const appointmentService = createAppointmentService();
