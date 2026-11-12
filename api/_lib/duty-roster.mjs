import { getAuthSql, requireUser, assertWriteOrigin, readSessionToken, tokenHash, methodAllowed, writeAuthError } from './auth.mjs';

const fail = (code) => { throw Object.assign(new Error(code), { code }); };
const object = (v) => v && typeof v === 'object' && !Array.isArray(v);
const text = (v, max) => typeof v === 'string' && v.length <= max && !v.includes('\0');
const id = (v) => typeof v === 'string' && /^[1-9]\d{0,18}$/.test(v) && BigInt(v) <= 9223372036854775807n;
const uuid = (v) => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const version = (v, minimum = 1) => Number.isInteger(v) && v >= minimum && v < 2147483647;
export const validDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && v >= '0001-01-01'
  && !Number.isNaN(Date.parse(`${v}T12:00:00Z`)) && new Date(`${v}T12:00:00Z`).toISOString().slice(0, 10) === v;
const time = (v) => typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const list = (v, check) => Array.isArray(v) && v.every(check) && new Set(v).size === v.length;
const ref = (v) => object(v) && id(v.id) && version(v.version);
export function validateRosterRange(query = {}) {
  if (!object(query) || Object.keys(query).some((key) => !['from', 'to'].includes(key)) || !validDate(query.from) || !validDate(query.to) || query.from > query.to) fail('INVALID_REQUEST');
  return { from: query.from, to: query.to };
}
export function validateRosterSettings(data, range) {
  if (!object(data) || !object(data.preferences) || !Array.isArray(data.groups) || !Array.isArray(data.holidays)
    || !time(data.start) || !time(data.end) || data.end <= data.start || typeof data.stale !== 'boolean') fail('ROSTER_VALIDATION_FAILED');
  const months = (Number(range.to.slice(0, 4)) - Number(range.from.slice(0, 4))) * 12 + Number(range.to.slice(5, 7)) - Number(range.from.slice(5, 7)) + 1;
  const preferences = {};
  for (const [key, p] of Object.entries(data.preferences)) {
    if (!id(key) || !object(p) || typeof p.participating !== 'boolean' || typeof p.leader !== 'boolean'
      || !list(p.days, (v) => ['MON', 'WED', 'FRI'].includes(v)) || !list(p.methods, (v) => ['phone', 'f2f', 'zoom'].includes(v))
      || !list(p.months, (v) => Number.isInteger(v) && v >= 0 && v < months) || !(p.preset === '' || id(p.preset))
      || !Array.isArray(p.leave) || p.leave.some((l) => !object(l) || !validDate(l.from) || !validDate(l.to) || l.to < l.from)) fail('ROSTER_VALIDATION_FAILED');
    preferences[key] = { participating: p.participating, leader: p.leader, days: p.days, methods: p.methods, months: p.months,
      preset: p.preset, leave: p.leave.map(({ from, to }) => ({ from, to })) };
  }
  const reference = (value) => id(value) && Object.hasOwn(preferences, value);
  const groups = data.groups.map((g) => {
    if (!object(g) || !text(g.id, 100) || !g.id || !reference(g.leaderId) || !list(g.memberIds, reference)
      || !['', 'MON', 'WED', 'FRI'].includes(g.day)) fail('ROSTER_VALIDATION_FAILED');
    return { id: g.id, leaderId: g.leaderId, memberIds: g.memberIds, day: g.day };
  });
  if (new Set(groups.map((g) => g.id)).size !== groups.length || Object.values(preferences).some((p) => p.preset && !reference(p.preset))) fail('ROSTER_VALIDATION_FAILED');
  const holidays = data.holidays.map((h) => {
    if (!object(h) || !validDate(h.date) || !text(h.name, 200) || !h.name.trim()) fail('ROSTER_VALIDATION_FAILED');
    return { date: h.date, name: h.name };
  });
  return { preferences, groups, holidays, start: data.start, end: data.end, stale: data.stale };
}
function shift(value, createOnly = false) {
  if (!object(value) || !validDate(value.date) || !time(value.start) || !time(value.end) || value.end <= value.start
    || !['phone', 'f2f', 'zoom'].includes(value.method) || !text(value.note, 2000) || !text(value.groupId, 100)
    || !list(value.personIds, id) || typeof value.manual !== 'boolean') fail('ROSTER_VALIDATION_FAILED');
  const identity = !createOnly && value.id != null
    ? (ref(value) ? { id: value.id, version: value.version } : fail('ROSTER_VALIDATION_FAILED'))
    : (text(value.clientId, 200) && value.clientId ? { clientId: value.clientId } : fail('ROSTER_VALIDATION_FAILED'));
  return { ...identity, date: value.date, start: value.start, end: value.end, method: value.method, note: value.note,
    groupId: value.groupId, personIds: value.personIds, manual: value.manual };
}
export function validateRosterCommand(body, settings = false) {
  if (!object(body) || !uuid(body.requestId)) fail('INVALID_REQUEST');
  if (settings) {
    const range = validateRosterRange({ from: body.from, to: body.to });
    if (!version(body.version, 0)) fail('ROSTER_VALIDATION_FAILED');
    return { kind: 'settings', ...range, version: body.version, data: validateRosterSettings(body.data, range) };
  }
  if (body.kind === 'undo') {
    if (!uuid(body.undoId)) fail('INVALID_REQUEST');
    return { kind: 'undo', undoId: body.undoId };
  }
  if (!['patch', 'replace'].includes(body.kind) || !Array.isArray(body.upserts)) fail('INVALID_REQUEST');
  const upserts = body.upserts.map((s) => shift(s, body.kind === 'replace'));
  const keys = upserts.map((s) => s.id || s.clientId);
  if (new Set(keys).size !== keys.length) fail('ROSTER_VALIDATION_FAILED');
  if (body.kind === 'replace') {
    const range = validateRosterRange({ from: body.from, to: body.to });
    if (!Array.isArray(body.expected) || !body.expected.every(ref) || new Set(body.expected.map((r) => r.id)).size !== body.expected.length) fail('ROSTER_VALIDATION_FAILED');
    return { kind: 'replace', ...range, upserts, expected: body.expected.map(({ id: key, version: v }) => ({ id: key, version: v })) };
  }
  if (!Array.isArray(body.deletes) || !body.deletes.every(ref) || (!upserts.length && !body.deletes.length)
    || new Set([...upserts.filter((s) => s.id).map((s) => s.id), ...body.deletes.map((s) => s.id)]).size !== upserts.filter((s) => s.id).length + body.deletes.length) fail('ROSTER_VALIDATION_FAILED');
  return { kind: 'patch', upserts, deletes: body.deletes.map(({ id: key, version: v }) => ({ id: key, version: v })) };
}
export function rosterResult(result) {
  const knownPeople = {};
  const shifts = (result.shiftRows || []).map(({ people, deleted, ...s }) => {
    for (const person of people || []) knownPeople[person.id] = person;
    return s;
  });
  const { shiftRows, ...rest } = result;
  return { ...rest, shifts, knownPeople };
}
export function createRosterHandler(settings = false, overrides = {}) {
  const deps = { getSql: getAuthSql, requireUser, assertWriteOrigin, ...overrides };
  return async (request, response) => {
    if (!methodAllowed(request, response, settings ? ['GET', 'PUT'] : ['GET', 'POST'])) return;
    try {
      const token = readSessionToken(request);
      if (!token) fail('UNAUTHENTICATED');
      if (request.method !== 'GET') deps.assertWriteOrigin(request);
      const sql = deps.getSql();
      const user = await deps.requireUser(request, sql);
      if (!['admin', 'volunteer'].includes(user.role)) fail('FORBIDDEN');
      if (request.method === 'GET') {
        const range = validateRosterRange(request.query);
        if (settings) {
          const rows = await sql`SELECT data AS settings, version, updated_by::text AS "updatedBy", updated_at AS "updatedAt" FROM public.duty_roster_settings WHERE date_from = ${range.from}::date AND date_to = ${range.to}::date`;
          return response.status(200).json({ success: true, data: rows[0] || { settings: null, version: 0 } });
        }
        const rows = await sql`SELECT public.duty_roster_shift_json(id) AS data FROM public.duty_roster_shifts WHERE deleted_at IS NULL AND duty_date BETWEEN ${range.from}::date AND ${range.to}::date ORDER BY duty_date, start_time, id`;
        return response.status(200).json({ success: true, data: rosterResult({ shiftRows: rows.map((r) => r.data) }) });
      }
      if (Object.keys(request.query || {}).length) fail('INVALID_REQUEST');
      const command = validateRosterCommand(request.body, settings);
      const rows = await sql`SELECT public.write_duty_roster(${tokenHash(token)}, ${request.body.requestId}::uuid, ${JSON.stringify(command)}::jsonb) AS data`;
      return response.status(200).json({ success: true, data: settings ? rows[0].data : rosterResult(rows[0].data) });
    } catch (error) {
      const code = error.code === 'P0001' ? error.message : error.code;
      if (['UNAUTHENTICATED', 'FORBIDDEN', 'AUTH_NOT_CONFIGURED'].includes(code)) return writeAuthError(response, { code });
      const statuses = { INVALID_REQUEST: 400, ROSTER_VALIDATION_FAILED: 400, ROSTER_PERSON_NOT_FOUND: 400,
        ROSTER_VERSION_CONFLICT: 409, ROSTER_REQUEST_CONFLICT: 409, ROSTER_UNDO_CONFLICT: 409 };
      return response.status(statuses[code] || 500).json({ success: false, error: { code: Object.hasOwn(statuses, code) ? code : 'ROSTER_INTERNAL_ERROR' } });
    }
  };
}
