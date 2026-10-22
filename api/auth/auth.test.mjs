import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertWriteOrigin, authError, COOKIE_NAME, hashPassword, normalizeUsername,
  requireAdmin, requireUser, sessionCookie, tokenHash, verifyPassword,
} from '../_lib/auth.mjs';
import {
  createLoginHandler, createLogoutHandler, createMeHandler, createPasswordHandler, createUsersHandler,
} from '../_lib/auth-handlers.mjs';
import { createCounsellingSessionsHandler } from '../counselling-sessions.mjs';
import { createCaseAdviceHandler } from '../ai/case-advice.mjs';
import { createManagementInsightsHandler } from '../ai/management-insights.mjs';

const token = 'ab'.repeat(32);
const user = { id: '9007199254740993', username: 'alice', full_name: 'Original Name', email: null, role: 'volunteer', password_hash: 'never-return-this' };
const request = (method, body, extra = {}) => ({ method, body, headers: { cookie: `${COOKIE_NAME}=${token}` }, ...extra });
function response() {
  return { statusCode: 200, headers: {}, body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}
const permitOrigin = () => {};

test('password hashes are salted, bounded and verifiable without storing plaintext', async () => {
  const password = '  long-password  ';
  const hash = await hashPassword(password);
  const second = await hashPassword(password);
  assert.notEqual(hash, second);
  assert.doesNotMatch(hash, /long-password/);
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword(password.trim(), hash), false);
  assert.equal(await verifyPassword(password, null), false);
  assert.equal(await verifyPassword(password, 'corrupt-hash'), false);
  await assert.rejects(hashPassword('too-short'), { code: 'INVALID_REQUEST' });
  await assert.rejects(hashPassword('a'.repeat(129)), { code: 'INVALID_REQUEST' });
});

test('usernames normalize and invalid identifiers are rejected', () => {
  assert.equal(normalizeUsername(' ALICE_1 '), 'alice_1');
  for (const value of ['ab', 'a@b.com', 'admin space', '../admin', null]) {
    assert.throws(() => normalizeUsername(value), { code: 'INVALID_REQUEST' });
  }
});

test('write origin is explicitly configured and JSON required', () => {
  const old = process.env.AUTH_APP_ORIGINS;
  try {
    process.env.AUTH_APP_ORIGINS = 'https://counselling.example';
    assertWriteOrigin({ headers: { origin: 'https://counselling.example', 'content-type': 'application/json; charset=utf-8' } });
    for (const origin of [undefined, 'null', 'https://evil.example', 'https://counselling.example.evil']) {
      assert.throws(() => assertWriteOrigin({ headers: { origin, host: 'counselling.example', 'content-type': 'application/json' } }), { code: 'FORBIDDEN' });
    }
    assert.throws(() => assertWriteOrigin({ headers: { origin: 'https://counselling.example', 'content-type': 'text/plain' } }), { code: 'INVALID_REQUEST' });
    delete process.env.AUTH_APP_ORIGINS;
    assert.throws(() => assertWriteOrigin({ headers: {} }), { code: 'AUTH_NOT_CONFIGURED' });
  } finally { if (old === undefined) delete process.env.AUTH_APP_ORIGINS; else process.env.AUTH_APP_ORIGINS = old; }
});

test('session cookies have correct persistence and security flags', () => {
  const old = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'production';
    const ordinary = sessionCookie(token);
    assert.match(ordinary, /HttpOnly/); assert.match(ordinary, /SameSite=Lax/); assert.match(ordinary, /Secure/);
    assert.doesNotMatch(ordinary, /Max-Age/);
    assert.match(sessionCookie(token, true), /Max-Age=2592000/);
    assert.match(sessionCookie('', false, true), /Max-Age=0/);
    assert.equal(tokenHash(token).length, 64);
    assert.notEqual(tokenHash(token), token);
  } finally { if (old === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = old; }
});

test('login accepts normalized username, stores only token hash, and returns a safe DTO', async () => {
  for (const rememberMe of [false, true]) {
    const calls = [];
    const sql = async (strings, ...values) => {
      calls.push({ text: strings.join('?'), values });
      return strings.join('').includes('auth_complete_login') ? [user] : strings.join('').includes('SELECT id') ? [user] : [];
    };
    const handler = createLoginHandler({ assertWriteOrigin: permitOrigin, getSql: () => sql, verifyPassword: async () => true });
    const res = response();
    await handler(request('POST', { username: ' Alice ', password: 'not-logged-anywhere', rememberMe }, { headers: {} }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(calls[0].values[0], 'alice');
    const rawToken = res.headers['Set-Cookie'].split(';')[0].split('=')[1];
    assert.equal(calls[1].values[2], tokenHash(rawToken));
    assert.equal(calls[1].values[3], rememberMe);
    assert.equal(res.body.data.id, user.id);
    assert.doesNotMatch(JSON.stringify(res.body), /password|never-return|not-logged/);
    assert.equal(res.headers['Cache-Control'], 'no-store');
    assert.equal(res.headers['Set-Cookie'].includes('Max-Age='), rememberMe);
  }
});

test('unknown user, incorrect password and locked/disabled account return the same error', async () => {
  for (const [rows, valid, completed] of [[[], false, []], [[user], false, []], [[user], true, []]]) {
    const calls = [];
    let verified = false;
    const sql = async (strings) => {
      const text = strings.join(''); calls.push(text);
      return text.includes('SELECT id') ? rows : completed;
    };
    const handler = createLoginHandler({ assertWriteOrigin: permitOrigin, getSql: () => sql,
      verifyPassword: async () => { verified = true; return valid; } });
    const res = response();
    await handler(request('POST', { username: 'alice', password: 'wrong' }), res);
    assert.equal(verified, true);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.error.code, 'INVALID_CREDENTIALS');
    assert.equal(res.headers['Set-Cookie'], undefined);
    if (rows.length && !valid) assert.ok(calls.some((text) => text.includes('auth_record_failed_login')));
  }
});

test('me rejects absent or invalid cookies and checks live session state', async () => {
  const res = response();
  await createMeHandler({ getSql: () => { throw new Error('must not access database'); } })({ method: 'GET', headers: {} }, res);
  assert.equal(res.statusCode, 401);
  assert.match(res.headers['Set-Cookie'], /Max-Age=0/);
  for (const rows of [[], [user]]) {
    let query;
    const sql = async (strings, ...values) => { query = { text: strings.join(''), values }; return rows; };
    if (!rows.length) await assert.rejects(requireUser(request('GET'), sql), { code: 'UNAUTHENTICATED' });
    else assert.equal((await requireUser(request('GET'), sql)).username, 'alice');
    assert.match(query.text, /revoked_at IS NULL/);
    assert.match(query.text, /expires_at > CURRENT_TIMESTAMP/);
    assert.match(query.text, /is_active = true/);
    assert.equal(query.values[0], tokenHash(token));
  }
  await assert.rejects(requireAdmin(request('GET'), async () => [user]), { code: 'FORBIDDEN' });
});

test('logout revokes a session, clears the cookie and is idempotent without a cookie', async () => {
  let revocations = 0;
  const handler = createLogoutHandler({ assertWriteOrigin: permitOrigin, getSql: () => async () => { revocations += 1; } });
  for (const headers of [{ cookie: `${COOKIE_NAME}=${token}` }, {}]) {
    const res = response();
    await handler(request('POST', {}, { headers }), res);
    assert.equal(res.statusCode, 200);
    assert.match(res.headers['Set-Cookie'], /Max-Age=0/);
  }
  assert.equal(revocations, 1);
});

test('all counselling and AI handlers deny anonymous access before accessing data/model', async () => {
  for (const handler of [createCounsellingSessionsHandler(), createCaseAdviceHandler(), createManagementInsightsHandler()]) {
    const res = response();
    await handler({ method: 'POST', headers: {}, body: {} }, res);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.error.code, 'UNAUTHENTICATED');
  }
});

test('volunteers cannot list, create, edit users or reset passwords', async () => {
  for (const [factory, method] of [[createUsersHandler, 'GET'], [createUsersHandler, 'POST'], [createUsersHandler, 'PATCH'], [createPasswordHandler, 'POST']]) {
    const res = response();
    await factory({ assertWriteOrigin: permitOrigin, getSql: () => async () => [user] })(request(method, {}), res);
    assert.equal(res.statusCode, 403);
  }
});

test('admin creation defaults to volunteer, rejects invalid input and hides database details', async () => {
  const calls = [];
  const options = { assertWriteOrigin: permitOrigin, requireAdmin: async () => ({ role: 'admin' }),
    getSql: () => async (_, ...values) => { calls.push(values); return [user]; }, hashPassword: async () => 'encoded-password' };
  const handler = createUsersHandler(options);
  const res = response();
  await handler(request('POST', { username: ' Alice ', password: 'valid-password', fullName: 'Alice' }), res);
  assert.equal(res.statusCode, 201);
  assert.equal(calls[0][1], 'alice'); assert.equal(calls[0][5], 'volunteer');
  assert.doesNotMatch(JSON.stringify(res.body), /password|encoded/);
  for (const body of [{ username: 'a', password: 'valid-password', fullName: 'Alice' }, { username: 'alice', password: 'short', fullName: 'Alice' }, { username: 'alice', password: 'valid-password', fullName: 'Alice', role: 'staff' }]) {
    const invalid = response(); await handler(request('POST', body), invalid); assert.equal(invalid.statusCode, 400);
  }
  const failed = response();
  await createUsersHandler({ ...options, getSql: () => async () => { throw Object.assign(new Error('secret connection and values'), { code: '23505' }); } })(request('POST', { username: 'alice', password: 'valid-password', fullName: 'Alice' }), failed);
  assert.equal(failed.statusCode, 409); assert.equal(failed.body.error.code, 'USERNAME_EXISTS');
  assert.doesNotMatch(JSON.stringify(failed.body), /secret/);
});

test('last admin transaction error is returned as a conflict', async () => {
  const res = response();
  await createUsersHandler({ assertWriteOrigin: permitOrigin, requireAdmin: async () => ({ role: 'admin' }),
    getSql: () => async () => { throw Object.assign(new Error('LAST_ADMIN'), { code: 'P0001' }); } })(request('PATCH', { role: 'volunteer' }, { query: { id: '1' } }), res);
  assert.equal(res.statusCode, 409); assert.equal(res.body.error.code, 'LAST_ADMIN');
});

test('password reset validates its password and calls the transactional revocation function', async () => {
  let values;
  const handler = createPasswordHandler({ assertWriteOrigin: permitOrigin, requireAdmin: async () => ({}),
    hashPassword: async () => 'encoded', getSql: () => async (_, ...args) => { values = args; } });
  const res = response();
  await handler(request('POST', { password: 'new-valid-password' }, { query: { id: '2' } }), res);
  assert.equal(res.statusCode, 200); assert.deepEqual(values, [tokenHash(token), '2', 'encoded']);
  const invalid = response();
  await handler(request('POST', { password: 'short' }, { query: { id: '2' } }), invalid);
  assert.equal(invalid.statusCode, 400);
});
