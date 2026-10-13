import { randomBytes } from 'node:crypto';
import {
  assertWriteOrigin, authError, getAuthSql, hashPassword, methodAllowed, normalizeUsername,
  readSessionToken, requireAdmin, requireUser, sessionCookie, tokenHash, userDto,
  validatePassword, verifyPassword, writeAuthError,
} from './auth.mjs';

const defaults = { getSql: getAuthSql, hashPassword, verifyPassword, assertWriteOrigin, requireAdmin, requireUser };

function objectBody(request) {
  const body = request.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw authError('INVALID_REQUEST');
  return body;
}

function identifier(request) {
  const id = request.query?.id;
  if (typeof id !== 'string' || !/^[1-9]\d{0,18}$/.test(id) || BigInt(id) > 9223372036854775807n) {
    throw authError('INVALID_REQUEST');
  }
  return id;
}

function details(body, partial = false) {
  const result = {};
  if (!partial || Object.hasOwn(body, 'fullName')) {
    if (typeof body.fullName !== 'string' || !body.fullName.trim() || body.fullName.trim().length > 100) throw authError('INVALID_REQUEST');
    result.fullName = body.fullName.trim();
  }
  if (!partial || Object.hasOwn(body, 'email')) {
    if (body.email != null && typeof body.email !== 'string') throw authError('INVALID_REQUEST');
    const email = body.email?.trim() || null;
    if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) throw authError('INVALID_REQUEST');
    result.email = email;
  }
  if (!partial || Object.hasOwn(body, 'role')) {
    result.role = body.role === undefined ? 'volunteer' : body.role;
    if (!['admin', 'volunteer'].includes(result.role)) throw authError('INVALID_REQUEST');
  }
  if (Object.hasOwn(body, 'isActive')) {
    if (typeof body.isActive !== 'boolean') throw authError('INVALID_REQUEST');
    result.isActive = body.isActive;
  }
  return result;
}

export function createLoginHandler(overrides = {}) {
  const deps = { ...defaults, ...overrides };
  return async (request, response) => {
    if (!methodAllowed(request, response, ['POST'])) return;
    try {
      deps.assertWriteOrigin(request);
      const body = objectBody(request);
      const username = normalizeUsername(body.username);
      // Login accepts existing credentials of any non-empty length up to 128.
      if (typeof body.password !== 'string' || !body.password.length || body.password.length > 128
        || (body.rememberMe !== undefined && typeof body.rememberMe !== 'boolean')) throw authError('INVALID_REQUEST');
      const sql = deps.getSql();
      const rows = await sql`SELECT id, password_hash FROM public.auth_users WHERE username = ${username}`;
      const user = rows[0];
      const valid = await deps.verifyPassword(body.password, user?.password_hash);
      if (!valid) {
        if (user) await sql`SELECT public.auth_record_failed_login(${String(user.id)}::bigint, ${user.password_hash})`;
        throw authError('INVALID_CREDENTIALS', 401);
      }
      const token = randomBytes(32).toString('hex');
      const rememberMe = body.rememberMe === true;
      // SQL rechecks the observed hash, lock and active status under a row lock.
      const loggedIn = await sql`
        SELECT * FROM public.auth_complete_login(
          ${String(user.id)}::bigint, ${user.password_hash}, ${tokenHash(token)}, ${rememberMe}::boolean
        )
      `;
      if (!loggedIn.length) throw authError('INVALID_CREDENTIALS', 401);
      const previous = readSessionToken(request);
      if (previous) await sql`UPDATE public.auth_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ${tokenHash(previous)} AND revoked_at IS NULL`;
      response.setHeader('Set-Cookie', sessionCookie(token, rememberMe));
      return response.status(200).json({ success: true, data: userDto(loggedIn[0]) });
    } catch (error) { return writeAuthError(response, error); }
  };
}

export function createMeHandler(overrides = {}) {
  const deps = { ...defaults, ...overrides };
  return async (request, response) => {
    if (!methodAllowed(request, response, ['GET'])) return;
    try {
      // Reject absent cookies before attempting to connect to the database.
      if (!readSessionToken(request)) throw authError('UNAUTHENTICATED', 401);
      const user = await deps.requireUser(request, deps.getSql());
      return response.status(200).json({ success: true, data: user });
    } catch (error) {
      if (error.code === 'UNAUTHENTICATED') response.setHeader('Set-Cookie', sessionCookie('', false, true));
      return writeAuthError(response, error);
    }
  };
}

export function createLogoutHandler(overrides = {}) {
  const deps = { ...defaults, ...overrides };
  return async (request, response) => {
    if (!methodAllowed(request, response, ['POST'])) return;
    try {
      deps.assertWriteOrigin(request);
      const token = readSessionToken(request);
      if (token) {
        const sql = deps.getSql();
        await sql`UPDATE public.auth_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ${tokenHash(token)} AND revoked_at IS NULL`;
      }
      response.setHeader('Set-Cookie', sessionCookie('', false, true));
      return response.status(200).json({ success: true });
    } catch (error) { return writeAuthError(response, error); }
  };
}

export function createUsersHandler(overrides = {}) {
  const deps = { ...defaults, ...overrides };
  return async (request, response) => {
    if (!methodAllowed(request, response, ['GET', 'POST', 'PATCH'])) return;
    try {
      if (!readSessionToken(request)) throw authError('UNAUTHENTICATED', 401);
      if (request.method !== 'GET') deps.assertWriteOrigin(request);
      const sql = deps.getSql();
      await deps.requireAdmin(request, sql);
      if (request.method === 'GET') {
        const rows = await sql`SELECT id, username, full_name, email, role, is_active, created_at, updated_at FROM public.auth_users ORDER BY id`;
        return response.status(200).json({ success: true, data: rows.map((row) => ({ ...userDto(row), isActive: row.is_active, createdAt: row.created_at, updatedAt: row.updated_at })) });
      }
      const body = objectBody(request);
      const sessionHash = tokenHash(readSessionToken(request));
      if (request.method === 'POST') {
        const username = normalizeUsername(body.username);
        const data = details(body);
        const passwordHash = await deps.hashPassword(validatePassword(body.password));
        const rows = await sql`SELECT * FROM public.auth_create_user(${sessionHash}, ${username}, ${passwordHash}, ${data.fullName}, ${data.email}, ${data.role})`;
        return response.status(201).json({ success: true, data: userDto(rows[0]) });
      }
      const id = identifier(request);
      const data = details(body, true);
      if (!Object.keys(data).length || Object.keys(body).some((key) => !['fullName', 'email', 'role', 'isActive'].includes(key))) throw authError('INVALID_REQUEST');
      const rows = await sql`SELECT * FROM public.auth_update_user(${sessionHash}, ${id}::bigint, ${JSON.stringify(data)}::jsonb)`;
      return response.status(200).json({ success: true, data: { ...userDto(rows[0]), isActive: rows[0].is_active } });
    } catch (error) { return writeAuthError(response, error); }
  };
}

export function createPasswordHandler(overrides = {}) {
  const deps = { ...defaults, ...overrides };
  return async (request, response) => {
    if (!methodAllowed(request, response, ['POST'])) return;
    try {
      if (!readSessionToken(request)) throw authError('UNAUTHENTICATED', 401);
      deps.assertWriteOrigin(request);
      const sql = deps.getSql();
      await deps.requireAdmin(request, sql);
      const id = identifier(request);
      const body = objectBody(request);
      const passwordHash = await deps.hashPassword(validatePassword(body.password));
      await sql`SELECT public.auth_reset_password(${tokenHash(readSessionToken(request))}, ${id}::bigint, ${passwordHash})`;
      return response.status(200).json({ success: true });
    } catch (error) { return writeAuthError(response, error); }
  };
}
