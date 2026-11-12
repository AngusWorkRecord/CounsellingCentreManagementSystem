import { authenticatedFetch } from '../auth/authClient';

export const rosterErrorMessage = (error) => ({
  ROSTER_BUSY: 'Resolve the pending roster save before making another change.',
  ROSTER_RANGE_NOT_LOADED: 'Load this planning period before applying the roster.',
  UNAUTHENTICATED: 'Your session has expired. Please sign in again.',
  FORBIDDEN: 'You cannot modify the duty roster.',
  AUTH_NOT_CONFIGURED: 'Duty roster storage is not configured.',
  INVALID_REQUEST: 'Check the roster dates and fields before saving.',
  ROSTER_VALIDATION_FAILED: 'Check the roster dates and fields before saving.',
  ROSTER_PERSON_NOT_FOUND: 'A selected person was deleted. Reload personnel before trying again.',
  ROSTER_VERSION_CONFLICT: 'The roster changed on another device. Reload it before editing again.',
  ROSTER_UNDO_CONFLICT: 'These shifts changed on another device. Reload them; this operation cannot be undone.',
  ROSTER_REQUEST_CONFLICT: 'This save request does not match its original submission. Reload the roster.',
}[error?.code] || 'Unable to confirm the roster save. Retry the same request or reload to check the saved data.');

export const requestId = () => window.crypto.randomUUID();
export const settingsData = (rules) => Object.fromEntries(
  ['preferences', 'groups', 'holidays', 'start', 'end', 'stale'].map((key) => [key, rules[key]])
);
export const settingsSignature = (value) => JSON.stringify(value, (key, item) =>
  item && typeof item === 'object' && !Array.isArray(item)
    ? Object.fromEntries(Object.keys(item).sort().map((name) => [name, item[name]])) : item);
const validShift = (s) => s && /^[1-9]\d*$/.test(s.id) && Number.isInteger(s.version) && s.version > 0
  && ['date', 'start', 'end', 'note', 'groupId'].every((key) => typeof s[key] === 'string')
  && ['phone', 'f2f', 'zoom'].includes(s.method) && Array.isArray(s.personIds) && s.personIds.every((id) => typeof id === 'string');
async function request(settings, { range, body, signal } = {}) {
  const query = range ? `?${new URLSearchParams(range)}` : '';
  let method = 'GET';
  if (body) method = settings ? 'PUT' : 'POST';
  const response = await authenticatedFetch(`/api/duty-roster${settings ? '-settings' : ''}${query}`, {
    method, signal, cache: 'no-store',
    ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) throw Object.assign(new Error('ROSTER_REQUEST_FAILED'), { code: result?.error?.code, status: response.status });
  const { data } = result;
  if (!data || (settings ? !Number.isInteger(data.version) || data.version < 0 || !(data.settings === null || typeof data.settings === 'object')
    : !Array.isArray(data.shifts) || !data.shifts.every(validShift) || !data.knownPeople || typeof data.knownPeople !== 'object'))
    throw Object.assign(new Error('INVALID_ROSTER_RESPONSE'), { status: 500 });
  return data;
}
export const dutyRosterService = {
  list: (range, options = {}) => request(false, { ...options, range }),
  write: (body) => request(false, { body }),
  getSettings: (range, options = {}) => request(true, { ...options, range }),
  saveSettings: (body) => request(true, { body }),
};
export function shiftWrite(shift, create = false) {
  const identity = !create && Number.isInteger(shift.version) && /^[1-9]\d*$/.test(shift.id)
    ? { id: shift.id, version: shift.version } : { clientId: shift.id };
  return { ...identity, date: shift.date, start: shift.start, end: shift.end, method: shift.method,
    groupId: shift.groupId || '', note: shift.note || '', personIds: shift.personIds, manual: !!shift.manualAssignment };
}
