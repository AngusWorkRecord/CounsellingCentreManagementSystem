import { getAuthSql, requireUser, assertWriteOrigin, readSessionToken, tokenHash, methodAllowed, writeAuthError } from './auth.mjs';

const TYPES = ['counsellor', 'volunteer'];
const LANGUAGES = ['cn', 'en', 'ms', 'ta'];
const STATUSES = ['active', 'inactive'];
const failure = (code, fields) => Object.assign(new Error(code), { code, fields });
const validId = (value) => typeof value === 'string' && /^[1-9]\d{0,18}$/.test(value) && BigInt(value) <= 9223372036854775807n;

export function validatePersonWrite(body, action) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw failure('INVALID_REQUEST');
  const fields = {};
  if (action !== 'create' && (!Number.isInteger(body.version) || body.version < 1 || body.version >= 2147483647)) fields.version = 'INVALID_VERSION';
  if (action === 'delete') {
    if (Object.keys(fields).length) throw failure('PERSON_VALIDATION_FAILED', fields);
    return {};
  }
  if (action === 'status') {
    if (!STATUSES.includes(body.status)) fields.status = 'INVALID_STATUS';
    if (Object.keys(fields).length) throw failure('PERSON_VALIDATION_FAILED', fields);
    return { status: body.status };
  }
  const text = {};
  for (const [key, max] of [['name', 100], ['phone', 50], ['email', 254], ['specialisation', 2000]]) {
    if (typeof body[key] !== 'string' || body[key].includes('\0')) fields[key] = 'INVALID_TEXT';
    else {
      text[key] = body[key].trim();
      if (text[key].length > max) fields[key] = 'TEXT_TOO_LONG';
    }
  }
  if (text.name === '') fields.name = 'REQUIRED';
  if (text.phone === '' && text.email === '') fields.phone = fields.email = 'CONTACT_REQUIRED';
  if (text.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.email)) fields.email = 'INVALID_EMAIL';
  if (!TYPES.includes(body.type)) fields.type = 'INVALID_TYPE';
  if (!Array.isArray(body.languages) || body.languages.length > 4 || new Set(body.languages).size !== body.languages.length
    || body.languages.some((value) => !LANGUAGES.includes(value))) fields.languages = 'INVALID_LANGUAGES';
  if (Object.keys(fields).length) throw failure('PERSON_VALIDATION_FAILED', fields);
  // The client never owns IDs, status on create, version increments or audit fields.
  return { ...text, type: body.type, languages: body.languages };
}

export function personDto(row) {
  return { id: String(row.id), name: row.name, type: row.person_type, phone: row.phone,
    email: row.email, languages: row.languages, specialisation: row.specialisation,
    status: row.status, version: row.version, createdAt: row.created_at, updatedAt: row.updated_at };
}

function writeError(response, error) {
  const code = error.code === 'P0001' ? error.message : error.code;
  if (['UNAUTHENTICATED', 'FORBIDDEN', 'AUTH_NOT_CONFIGURED'].includes(code)) return writeAuthError(response, { code });
  const statuses = { INVALID_REQUEST: 400, PERSON_VALIDATION_FAILED: 400, PERSON_NOT_FOUND: 404, PERSON_VERSION_CONFLICT: 409 };
  if (Object.hasOwn(statuses, code)) return response.status(statuses[code]).json({ success: false, error: { code, ...(error.fields ? { fields: error.fields } : {}) } });
  return response.status(500).json({ success: false, error: { code: 'PERSON_INTERNAL_ERROR' } });
}

export function createPeopleHandler(overrides = {}) {
  const deps = { getSql: getAuthSql, requireUser, assertWriteOrigin, ...overrides };
  return async (request, response) => {
    if (!methodAllowed(request, response, ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])) return undefined;
    try {
      const token = readSessionToken(request);
      if (!token) throw failure('UNAUTHENTICATED');
      if (request.method !== 'GET') deps.assertWriteOrigin(request);
      const sql = deps.getSql();
      await deps.requireUser(request, sql);
      const query = request.query || {};
      if (Object.keys(query).some((key) => key !== 'id') || (query.id !== undefined && !validId(query.id))) throw failure('INVALID_REQUEST');
      const id = query.id;
      if (request.method === 'GET') {
        const rows = id
          ? await sql`SELECT * FROM public.counselling_people WHERE id = ${id}::bigint AND deleted_at IS NULL`
          : await sql`SELECT * FROM public.counselling_people WHERE deleted_at IS NULL ORDER BY id`;
        if (id && !rows.length) throw failure('PERSON_NOT_FOUND');
        return response.status(200).json({ success: true, data: id ? personDto(rows[0]) : rows.map(personDto) });
      }
      const action = { POST: 'create', PUT: 'update', PATCH: 'status', DELETE: 'delete' }[request.method];
      if ((action === 'create' && id) || (action !== 'create' && !id)) throw failure('INVALID_REQUEST');
      const data = validatePersonWrite(request.body, action);
      // Atomic SQL function rechecks the session, locks the row and checks its version.
      const rows = await sql`SELECT * FROM public.write_counselling_person(${tokenHash(token)}, ${action},
        ${id || null}::bigint, ${action === 'create' ? null : request.body.version}::integer, ${JSON.stringify(data)}::jsonb)`;
      return response.status(action === 'create' ? 201 : 200).json({ success: true, data: personDto(rows[0]) });
    } catch (error) { return writeError(response, error); }
  };
}
