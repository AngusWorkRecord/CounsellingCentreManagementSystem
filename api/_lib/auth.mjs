import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { neon } from '@neondatabase/serverless';

const derive = promisify(scrypt);
const SCRYPT = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };
export const COOKIE_NAME = 'counselling_session';
export const SESSION_SECONDS = 12 * 60 * 60;
export const REMEMBER_SECONDS = 30 * 24 * 60 * 60;
// An unknown username still pays the same password-verification cost.
const DUMMY_HASH = `scrypt$131072$8$1$${'00'.repeat(16)}$${'00'.repeat(64)}`;

export function authError(code, status = 400) {
  return Object.assign(new Error(code), { code, status });
}

export function writeAuthError(response, error) {
  const known = {
    INVALID_REQUEST: 400, INVALID_CREDENTIALS: 401, UNAUTHENTICATED: 401,
    FORBIDDEN: 403, USER_NOT_FOUND: 404, USERNAME_EXISTS: 409,
    LAST_ADMIN: 409, AUTH_NOT_CONFIGURED: 503,
  };
  let code = error.code;
  if (code === 'P0001' && ['FORBIDDEN', 'USER_NOT_FOUND', 'LAST_ADMIN'].includes(error.message)) code = error.message;
  if (code === '23505') code = 'USERNAME_EXISTS';
  if (!Object.hasOwn(known, code)) code = 'INTERNAL_ERROR';
  response.setHeader('Cache-Control', 'no-store');
  return response.status(known[code] || 500).json({ success: false, error: { code } });
}

export function getAuthSql() {
  if (!process.env.DATABASE_URL) throw authError('AUTH_NOT_CONFIGURED', 503);
  return neon(process.env.DATABASE_URL);
}

export function normalizeUsername(value) {
  const username = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (!/^[a-z0-9][a-z0-9_.-]{2,49}$/.test(username)) throw authError('INVALID_REQUEST');
  return username;
}

export function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
    throw authError('INVALID_REQUEST');
  }
  return password;
}

export async function hashPassword(password) {
  validatePassword(password);
  const salt = randomBytes(16);
  const key = await derive(password, salt, 64, SCRYPT);
  return `scrypt$131072$8$1$${salt.toString('hex')}$${key.toString('hex')}`;
}

export async function verifyPassword(password, encoded) {
  const parts = (encoded || DUMMY_HASH).split('$');
  const valid = parts.length === 6 && parts[0] === 'scrypt' && parts[1] === '131072'
    && parts[2] === '8' && parts[3] === '1' && /^[a-f0-9]{32}$/.test(parts[4])
    && /^[a-f0-9]{128}$/.test(parts[5]);
  const safe = valid ? parts : DUMMY_HASH.split('$');
  const key = await derive(password, Buffer.from(safe[4], 'hex'), 64, SCRYPT);
  return timingSafeEqual(key, Buffer.from(safe[5], 'hex')) && valid && Boolean(encoded);
}

export function tokenHash(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function readSessionToken(request) {
  const cookies = String(request.headers?.cookie || '').split(';');
  const matching = cookies.map((part) => part.trim()).filter((part) => part.startsWith(`${COOKIE_NAME}=`));
  if (matching.length !== 1) return null;
  const token = matching[0].slice(COOKIE_NAME.length + 1);
  return /^[a-f0-9]{64}$/.test(token) ? token : null;
}

export function sessionCookie(token, rememberMe = false, clear = false) {
  const flags = [`${COOKIE_NAME}=${clear ? '' : token}`, 'Path=/', 'HttpOnly', 'SameSite=Lax'];
  if (process.env.NODE_ENV === 'production') flags.push('Secure');
  if (clear) flags.push('Max-Age=0');
  else if (rememberMe) flags.push(`Max-Age=${REMEMBER_SECONDS}`);
  return flags.join('; ');
}

export function assertWriteOrigin(request) {
  const origins = (process.env.AUTH_APP_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean);
  if (!origins.length) throw authError('AUTH_NOT_CONFIGURED', 503);
  const origin = request.headers?.origin;
  // Compare configured origins, never a client-controlled Host or forwarded header.
  if (typeof origin !== 'string' || !origins.includes(origin)) throw authError('FORBIDDEN', 403);
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers?.['content-type'] || '')) {
    throw authError('INVALID_REQUEST');
  }
}

export function userDto(row) {
  return { id: String(row.id), username: row.username, fullName: row.full_name, email: row.email, role: row.role };
}

export async function requireUser(request, sql) {
  const token = readSessionToken(request);
  if (!token) throw authError('UNAUTHENTICATED', 401);
  sql = sql || getAuthSql();
  const rows = await sql`
    SELECT u.id, u.username, u.full_name, u.email, u.role
    FROM public.auth_sessions s JOIN public.auth_users u ON u.id = s.user_id
    WHERE s.token_hash = ${tokenHash(token)} AND s.revoked_at IS NULL
      AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = true
  `;
  if (!rows.length) throw authError('UNAUTHENTICATED', 401);
  return userDto(rows[0]);
}

export async function requireAdmin(request, sql) {
  const user = await requireUser(request, sql);
  if (user.role !== 'admin') throw authError('FORBIDDEN', 403);
  return user;
}

export async function authorizeRequest(request) {
  await requireUser(request);
  if (!['GET', 'HEAD'].includes(request.method)) assertWriteOrigin(request);
}

export function methodAllowed(request, response, methods) {
  response.setHeader('Cache-Control', 'no-store');
  if (methods.includes(request.method)) return true;
  response.setHeader('Allow', methods.join(', '));
  response.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED' } });
  return false;
}
