import { COUNSELLORS, SESSION_MODES } from '../sections/@dashboard/counselling/cases/create/constants';
import { authenticatedFetch } from '../auth/authClient';

export const STATUS_LABELS = { scheduled: 'Scheduled', completed: 'Appointment completed', no_show: 'No-show', cancelled: 'Appointment cancelled' };
export const MODE_COLORS = { 面谈: '#17834b', 电话辅导: '#1769aa', 线上辅导: '#7841ad' };

export function malaysiaNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  const p = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}
export function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || '') && value >= '0001-01-01' && !Number.isNaN(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
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
export function validateAppointment(item, items = []) {
  const errors = {};
  ['clientInitials', 'phone', 'date', 'start', 'end', 'counsellor', 'mode', 'location'].forEach((key) => { if (!String(item[key] || '').trim()) errors[key] = 'This field is required'; });
  if (!validDate(item.date)) errors.date = 'Select a valid date';
  ['start', 'end'].forEach((key) => { if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(item[key] || '')) errors[key] = 'Select a valid time'; });
  if (!errors.start && !errors.end && item.end <= item.start) errors.end = 'End time must be later than start time';
  if (!COUNSELLORS.includes(item.counsellor)) errors.counsellor = 'Please select a counsellor';
  if (!SESSION_MODES.includes(item.mode)) errors.mode = 'Please select a session mode';
  [['clientInitials', 100], ['phone', 50], ['location', 500]].forEach(([key, limit]) => {
    if (String(item[key] || '').length > limit) errors[key] = 'Appointment text is too long';
  });
  const conflict = items.find((other) => other.status !== 'cancelled' && other.id !== item.id && other.date === item.date && other.counsellor === item.counsellor && item.start < other.end && item.end > other.start);
  return { errors, conflict };
}
export const APPOINTMENT_ERROR_MESSAGES = {
  APPOINTMENT_VALIDATION_FAILED: 'Please check the appointment fields.',
  APPOINTMENT_CASE_NOT_FOUND: 'The related case is no longer available. Select another case.',
  APPOINTMENT_NOT_FOUND: 'This appointment no longer exists.',
  APPOINTMENT_VERSION_CONFLICT: 'This appointment was changed by someone else. Reload its details before saving again.',
  APPOINTMENT_TIME_CONFLICT: 'The counsellor already has an appointment during this time.',
  APPOINTMENT_INVALID_STATUS: 'This status change is not allowed. Reload the appointment details.',
  APPOINTMENT_NOT_ENDED: 'Mark completion or absence after the appointment ends.',
  INVALID_REQUEST: 'Please check the appointment fields.',
  FORBIDDEN: 'You cannot perform this appointment operation.',
  UNAUTHENTICATED: 'Your session has expired. Please sign in again.',
};
export const appointmentErrorMessage = (error) => APPOINTMENT_ERROR_MESSAGES[error?.code] || 'Unable to load or save appointments. Please try again.';
export const FIELD_ERROR_MESSAGES = {
  REQUIRED: 'This field is required', TEXT_TOO_LONG: 'Appointment text is too long', INVALID_ID: 'Please select a related case',
  INVALID_DATE: 'Select a valid date', INVALID_TIME: 'Select a valid time', INVALID_END: 'End time must be later than start time',
  INVALID_COUNSELLOR: 'Please select a counsellor', INVALID_MODE: 'Please select a session mode',
};
async function request(path, { signal, method = 'GET', body, list = false } = {}) {
  const response = await authenticatedFetch(path, { signal, method, cache: 'no-store',
    ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) throw Object.assign(new Error('APPOINTMENT_REQUEST_FAILED'), {
    code: result?.error?.code, fields: result?.error?.fields, status: response.status,
  });
  if (!result.data || typeof result.data !== 'object') throw new Error('INVALID_APPOINTMENT_RESPONSE');
  if (list && (!Array.isArray(result.data) || !Number.isInteger(result.total) || result.total < 0)) throw new Error('INVALID_APPOINTMENT_RESPONSE');
  if (!list && (Array.isArray(result.data) || typeof result.data.id !== 'string' || !validDate(result.data.date))) throw new Error('INVALID_APPOINTMENT_RESPONSE');
  return result;
}
const queryString = (query) => new URLSearchParams(Object.entries(query).filter(([, value]) => value !== '' && value !== undefined && value !== null)).toString();
export const appointmentService = {
  query: (query = {}, options = {}) => request(`/api/appointments?${queryString(query)}`, { ...options, list: true }),
  get: async (id, options) => (await request(`/api/appointments?id=${encodeURIComponent(id)}`, options)).data,
  cases: (query = {}, options = {}) => request(`/api/appointment-cases?${queryString(query)}`, { ...options, list: true }),
  create: async (item) => (await request('/api/appointments', { method: 'POST', body: item })).data,
  update: async (id, item) => (await request(`/api/appointments?id=${encodeURIComponent(id)}`, { method: 'PUT', body: item })).data,
  setStatus: async (id, status, version, reason = '') => (await request(`/api/appointments?id=${encodeURIComponent(id)}`, {
    method: 'PATCH', body: { status, version, reason },
  })).data,
};
// Calendar/day views consume every server page in their bounded date range.
export async function getAppointmentRange(query, options) {
  let data = []; let page = 0; let result;
  do {
    // Each page depends on the preceding response and shares its abort signal.
    // eslint-disable-next-line no-await-in-loop
    result = await appointmentService.query({ ...query, page, pageSize: 100 }, options);
    data = [...data, ...result.data]; page += 1;
  } while (result.data.length && data.length < result.total);
  return { data, total: data.length };
}
