// Business dates/times are Malaysia wall-clock values, independent of browser timezone.
export function malaysiaDateTime(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}
export function dateKey(date) {
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(date.getDate()).padStart(2, '0')}`;
}
export function validDate(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    value >= '0001-01-01' &&
    !Number.isNaN(Date.parse(`${value}T12:00:00Z`)) &&
    new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value
  );
}
export function periodRange(month) {
  if (month && typeof month === 'object') {
    const { from, to } = month;
    return validDate(from) && validDate(to) && from <= to ? { from, to } : null;
  }
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || !validDate(`${month}-01`)) return null;
  const end = new Date(`${month}-01T12:00:00Z`);
  end.setUTCMonth(end.getUTCMonth() + 3);
  end.setUTCDate(end.getUTCDate() - 1);
  const to = end.toISOString().slice(0, 10);
  return validDate(to) ? { from: `${month}-01`, to } : null;
}
export function periodMonths(period) {
  const range = periodRange(period);
  if (!range) return [];
  const start = Number(range.from.slice(0, 4)) * 12 + Number(range.from.slice(5, 7)) - 1;
  const end = Number(range.to.slice(0, 4)) * 12 + Number(range.to.slice(5, 7)) - 1;
  return Array.from({ length: end - start + 1 }, (_, i) => {
    const value = start + i;
    return `${String(Math.floor(value / 12)).padStart(4, '0')}-${String((value % 12) + 1).padStart(
      2,
      '0'
    )}`;
  });
}
const validTime = (value) => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
export function emptyShift(date = malaysiaDateTime().date, start = '09:00') {
  const minutes = validTime(start) ? Number(start.slice(0, 2)) * 60 + Number(start.slice(3)) : 540;
  const end = Math.min(minutes + 60, 1439);
  return {
    date,
    start,
    end: `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`,
    personIds: [],
    note: '',
  };
}
export const activeStaff = (people) =>
  people.filter(
    (person) => person.status === 'active' && ['counsellor', 'volunteer'].includes(person.type)
  );
export function validateShift(shift) {
  const errors = {};
  if (!validDate(shift.date)) errors.date = 'Select a valid date';
  if (!validTime(shift.start)) errors.start = 'Select a valid time';
  if (!validTime(shift.end)) errors.end = 'Select a valid time';
  if (!errors.start && !errors.end && shift.end <= shift.start)
    errors.end = 'Shift end time must be later than start time on the same day.';
  if (!Array.isArray(shift.personIds) || new Set(shift.personIds).size !== shift.personIds.length)
    errors.personIds = 'The selected shift or person is no longer available.';
  if (typeof shift.note !== 'string' || shift.note.length > 2000)
    errors.note = 'Shift notes must not exceed 2,000 characters.';
  return errors;
}
export function overlappingShifts(shift, shifts) {
  return shifts.filter(
    (other) =>
      other.id !== shift.id &&
      other.date === shift.date &&
      other.start < shift.end &&
      shift.start < other.end &&
      other.personIds.some((id) => shift.personIds.includes(id))
  );
}
export const visibleShifts = (shifts, personId) =>
  shifts.filter((shift) => !personId || shift.personIds.includes(personId));
