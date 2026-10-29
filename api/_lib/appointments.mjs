import { getAuthSql, requireUser, assertWriteOrigin, readSessionToken, tokenHash, methodAllowed, writeAuthError } from './auth.mjs';

export const COUNSELLORS = ['沈佳佳', '林美琪', '陈伟伦', '黄诗婷', '刘志豪'];
export const MODES = ['面谈', '电话辅导', '线上辅导'];
export const STATUSES = ['scheduled', 'completed', 'no_show', 'cancelled'];
const failure = (code, fields) => Object.assign(new Error(code), { code, fields });
const scalar = (value) => typeof value === 'string';
export const validId = (value) => scalar(value) && /^[1-9]\d{0,18}$/.test(value) && BigInt(value) <= 9223372036854775807n;
export function validDate(value) {
  return scalar(value) && /^[0-9]{4}-\d{2}-\d{2}$/.test(value) && value >= '0001-01-01'
    && !Number.isNaN(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
}
const validTime = (v) => scalar(v) && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
export function validateWrite(body, action) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw failure('INVALID_REQUEST');
  const fields = {};
  if (action !== 'create' && (!Number.isInteger(body.version) || body.version < 1 || body.version > 2147483647)) fields.version = 'INVALID_VERSION';
  if (action === 'status') {
    if (!STATUSES.includes(body.status)) fields.status = 'INVALID_STATUS';
    if (body.reason !== undefined && (!scalar(body.reason) || body.reason.length > 1000)) fields.reason = 'TEXT_TOO_LONG';
  } else {
    [['clientInitials', 100], ['phone', 50], ['location', 500]].forEach(([key, max]) => {
      if (!scalar(body[key]) || !body[key].trim()) fields[key] = 'REQUIRED';
      else if (body[key].length > max) fields[key] = 'TEXT_TOO_LONG';
    });
    if (body.caseId !== undefined && body.caseId !== '' && body.caseId !== null && !validId(body.caseId)) fields.caseId = 'INVALID_ID';
    if (!validDate(body.date)) fields.date = 'INVALID_DATE';
    if (!validTime(body.start)) fields.start = 'INVALID_TIME';
    if (!validTime(body.end)) fields.end = 'INVALID_TIME';
    if (!fields.start && !fields.end && body.end <= body.start) fields.end = 'INVALID_END';
    if (!COUNSELLORS.includes(body.counsellor)) fields.counsellor = 'INVALID_COUNSELLOR';
    if (!MODES.includes(body.mode)) fields.mode = 'INVALID_MODE';
  }
  if (Object.keys(fields).length) throw failure('APPOINTMENT_VALIDATION_FAILED', fields);
  // Whitelist input; actor, case number, status on create, and audit data are server-owned.
  return action === 'status' ? { status: body.status, reason: body.reason || '' } : {
    caseId: body.caseId || '', clientInitials: body.clientInitials.trim(), phone: body.phone.trim(),
    date: body.date, start: body.start, end: body.end, counsellor: body.counsellor, mode: body.mode, location: body.location.trim(),
  };
}
export function validateQuery(query = {}, cases = false) {
  const q = {};
  ['search', 'from', 'to', 'counsellor', 'mode', 'status', 'excludeCancelled', 'page', 'pageSize', 'id'].forEach((key) => {
    if (query[key] !== undefined && !scalar(query[key])) throw failure('INVALID_REQUEST');
    q[key] = query[key] || '';
  });
  if (q.id && !validId(q.id)) throw failure('INVALID_REQUEST');
  if (query.id !== undefined && !q.id) throw failure('INVALID_REQUEST');
  if (q.search.length > 100 || (q.from && !validDate(q.from)) || (q.to && !validDate(q.to))
    || (q.from && q.to && q.from > q.to) || (q.counsellor && !COUNSELLORS.includes(q.counsellor))
    || (q.mode && !MODES.includes(q.mode)) || (q.status && !STATUSES.includes(q.status))
    || (q.excludeCancelled && !['true', 'false'].includes(q.excludeCancelled))) throw failure('INVALID_REQUEST');
  if ((q.page && !/^\d{1,7}$/.test(q.page)) || (q.pageSize && !/^\d{1,3}$/.test(q.pageSize))) throw failure('INVALID_REQUEST');
  q.page = Number(q.page || 0); q.pageSize = Number(q.pageSize || (cases ? 20 : 10));
  if (q.pageSize < 1 || q.pageSize > 100) throw failure('INVALID_REQUEST');
  q.search = q.search.trim();
  return q;
}
export function appointmentDto(row) {
  return { id: String(row.id), caseId: row.case_id == null ? '' : String(row.case_id), caseNumber: row.case_number,
    clientInitials: row.client_initials, phone: row.phone, date: String(row.date).slice(0, 10),
    start: row.start_time.slice(0, 5), end: row.end_time.slice(0, 5), counsellor: row.counsellor,
    mode: row.mode, location: row.location, status: row.status, version: row.version,
    createdBy: String(row.created_by), updatedBy: String(row.updated_by), createdAt: row.created_at, updatedAt: row.updated_at };
}
function writeError(response, error) {
  const statuses = { INVALID_REQUEST: 400, APPOINTMENT_VALIDATION_FAILED: 400, APPOINTMENT_CASE_NOT_FOUND: 400,
    APPOINTMENT_NOT_FOUND: 404, APPOINTMENT_VERSION_CONFLICT: 409, APPOINTMENT_TIME_CONFLICT: 409,
    APPOINTMENT_INVALID_STATUS: 409, APPOINTMENT_NOT_ENDED: 409 };
  const code = error.code === 'P0001' ? error.message : error.code;
  if (['UNAUTHENTICATED', 'FORBIDDEN', 'AUTH_NOT_CONFIGURED'].includes(code)) return writeAuthError(response, { code });
  if (statuses[code]) return response.status(statuses[code]).json({ success: false, error: { code, ...(error.fields ? { fields: error.fields } : {}) } });
  // No connection strings, database diagnostics, or personal records in client errors/logs.
  return response.status(500).json({ success: false, error: { code: 'APPOINTMENT_INTERNAL_ERROR' } });
}
export function createAppointmentsHandler(overrides = {}, cases = false) {
  const deps = { getSql: getAuthSql, requireUser, assertWriteOrigin, ...overrides };
  return async (request, response) => {
    if (!methodAllowed(request, response, cases ? ['GET'] : ['GET', 'POST', 'PUT', 'PATCH'])) return undefined;
    try {
      const sql = deps.getSql();
      await deps.requireUser(request, sql);
      if (request.method !== 'GET') deps.assertWriteOrigin(request);
      const q = validateQuery(request.query, cases);
      if (request.method !== 'GET') {
        const action = { POST: 'create', PUT: 'update', PATCH: 'status' }[request.method];
        if ((action !== 'create' && !q.id) || (action === 'create' && q.id)) throw failure('INVALID_REQUEST');
        const data = validateWrite(request.body, action);
        const rows = await sql`SELECT public.appointment_snapshot(a) AS data FROM public.write_appointment(${tokenHash(readSessionToken(request) || '')}, ${action},
          ${q.id || null}::bigint, ${action === 'create' ? null : request.body.version}::integer, ${JSON.stringify(data)}::jsonb) a`;
        return response.status(action === 'create' ? 201 : 200).json({ success: true, data: appointmentDto(rows[0].data) });
      }
      if (cases) {
        const rows = await sql`WITH matching AS MATERIALIZED (
          SELECT id::text AS id, case_number AS "caseNumber", client_initials AS "clientInitials",
            COALESCE(client_phone, '') AS phone, counselling_date::text AS date
          FROM public.counselling_sessions WHERE deleted_at IS NULL AND (${q.search} = '' OR
            strpos(lower(case_number), lower(${q.search})) > 0 OR strpos(lower(client_initials), lower(${q.search})) > 0)
        ), paged AS (SELECT * FROM matching ORDER BY date DESC, id::bigint DESC LIMIT ${q.pageSize} OFFSET ${q.page * q.pageSize})
        SELECT (SELECT count(*)::integer FROM matching) AS total, COALESCE(jsonb_agg(to_jsonb(paged) ORDER BY date DESC, id::bigint DESC), '[]'::jsonb) AS data FROM paged`;
        return response.status(200).json({ success: true, ...rows[0], page: q.page, pageSize: q.pageSize });
      }
      if (q.id) {
        // One statement gives detail and history a consistent snapshot.
        const rows = await sql`SELECT public.appointment_snapshot(a) AS data, COALESCE((SELECT jsonb_agg(jsonb_build_object(
          'id', h.id::text, 'actorId', h.actor_id::text, 'actorName', h.actor_name, 'action', h.action,
          'before', h.before_data, 'after', h.after_data, 'reason', h.reason, 'createdAt', h.created_at) ORDER BY h.id)
          FROM public.appointment_history h WHERE h.appointment_id = a.id), '[]'::jsonb) AS history
          FROM public.appointments a WHERE a.id = ${q.id}::bigint`;
        if (!rows.length) throw failure('APPOINTMENT_NOT_FOUND');
        return response.status(200).json({ success: true, data: { ...appointmentDto(rows[0].data), history: rows[0].history } });
      }
      const rows = await sql`WITH matching AS MATERIALIZED (
        SELECT a.* FROM public.appointments a WHERE (${q.from || null}::date IS NULL OR date >= ${q.from || null}::date)
          AND (${q.to || null}::date IS NULL OR date <= ${q.to || null}::date)
          AND (${q.counsellor} = '' OR counsellor = ${q.counsellor}) AND (${q.mode} = '' OR mode = ${q.mode})
          AND (${q.status} = '' OR status = ${q.status}) AND (${q.excludeCancelled === 'true'}::boolean = false OR status <> 'cancelled')
          AND (${q.search} = '' OR strpos(lower(client_initials), lower(${q.search})) > 0 OR strpos(lower(case_number), lower(${q.search})) > 0)
      ), paged AS (SELECT * FROM matching ORDER BY date, start_time, id LIMIT ${q.pageSize} OFFSET ${q.page * q.pageSize})
      SELECT (SELECT count(*)::integer FROM matching) AS total,
        COALESCE(jsonb_agg(public.appointment_snapshot(paged::public.appointments) ORDER BY date, start_time, id), '[]'::jsonb) AS data FROM paged`;
      return response.status(200).json({ success: true, data: rows[0].data.map(appointmentDto), total: rows[0].total, page: q.page, pageSize: q.pageSize });
    } catch (error) { return writeError(response, error); }
  };
}
