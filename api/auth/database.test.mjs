import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { Pool, neonConfig } from '@neondatabase/serverless';

// Optional integration suite. It creates and removes ONLY a random test schema,
// never touching public tables. Supply a dedicated test Neon database.
test('PostgreSQL auth transactions, lockout, revocation and concurrent last-admin protection', {
  skip: !process.env.AUTH_TEST_DATABASE_URL,
}, async () => {
  if (!globalThis.WebSocket) throw new Error('Database integration tests require Node 22 or later.');
  neonConfig.webSocketConstructor = globalThis.WebSocket;
  const pool = new Pool({ connectionString: process.env.AUTH_TEST_DATABASE_URL, max: 4 });
  const schema = `auth_test_${randomBytes(8).toString('hex')}`;
  assert.match(schema, /^auth_test_[a-f0-9]{16}$/);
  try {
    await pool.query(`CREATE SCHEMA ${schema}`);
    const migration = await readFile(new URL('../../database/005_create_authentication.sql', import.meta.url), 'utf8');
    await pool.query(migration.replaceAll('public.', `${schema}.`));
    const first = (await pool.query(`SELECT ${schema}.auth_bootstrap_admin($1, $2, $3, NULL) AS id`, ['admin_one', 'hash-one', 'Admin One'])).rows[0].id;
    await assert.rejects(pool.query(`SELECT ${schema}.auth_bootstrap_admin($1, $2, $3, NULL)`, ['other', 'hash', 'Other']), /ADMIN_ALREADY_EXISTS/);
    const t1 = '11'.repeat(32); const t2 = '22'.repeat(32); const t3 = '33'.repeat(32);
    await pool.query(`SELECT * FROM ${schema}.auth_complete_login($1, $2, $3, false)`, [first, 'hash-one', t1]);
    const second = (await pool.query(`SELECT * FROM ${schema}.auth_create_user($1, $2, $3, $4, NULL, 'admin')`, [t1, 'admin_two', 'hash-two', 'Admin Two'])).rows[0].id;
    await pool.query(`SELECT * FROM ${schema}.auth_complete_login($1, $2, $3, true)`, [second, 'hash-two', t2]);
    const volunteer = (await pool.query(`SELECT * FROM ${schema}.auth_create_user($1, $2, $3, $4, NULL, 'volunteer')`, [t1, 'helper', 'hash-three', 'Helper'])).rows[0].id;
    await assert.rejects(pool.query(`SELECT * FROM ${schema}.auth_create_user($1, $2, $3, $4, NULL, 'volunteer')`, [t1, 'helper', 'hash-three', 'Helper']), { code: '23505' });

    const lifetimes = (await pool.query(`SELECT remember_me, EXTRACT(EPOCH FROM expires_at - created_at)::integer AS seconds FROM ${schema}.auth_sessions ORDER BY id`)).rows;
    assert.deepEqual(lifetimes, [{ remember_me: false, seconds: 43200 }, { remember_me: true, seconds: 2592000 }]);
    await Promise.all(Array.from({ length: 5 }, () => pool.query(`SELECT ${schema}.auth_record_failed_login($1, $2)`, [volunteer, 'hash-three'])));
    let helper = (await pool.query(`SELECT * FROM ${schema}.auth_users WHERE id = $1`, [volunteer])).rows[0];
    assert.equal(helper.failed_login_attempts, 5); assert.ok(helper.locked_until);
    assert.equal((await pool.query(`SELECT * FROM ${schema}.auth_complete_login($1, $2, $3, false)`, [volunteer, 'hash-three', t3])).rows.length, 0);
    await pool.query(`UPDATE ${schema}.auth_users SET locked_until = CURRENT_TIMESTAMP - interval '1 minute' WHERE id = $1`, [volunteer]);
    await pool.query(`SELECT * FROM ${schema}.auth_complete_login($1, $2, $3, false)`, [volunteer, 'hash-three', t3]);
    helper = (await pool.query(`SELECT * FROM ${schema}.auth_users WHERE id = $1`, [volunteer])).rows[0];
    assert.equal(helper.failed_login_attempts, 0); assert.equal(helper.locked_until, null);
    await assert.rejects(pool.query(`SELECT * FROM ${schema}.auth_update_user($1, $2, $3::jsonb)`, [t3, first, JSON.stringify({ role: 'volunteer' })]), /FORBIDDEN/);
    await pool.query(`SELECT ${schema}.auth_reset_password($1, $2, $3)`, [t1, volunteer, 'new-hash']);
    assert.ok((await pool.query(`SELECT revoked_at FROM ${schema}.auth_sessions WHERE token_hash = $1`, [t3])).rows[0].revoked_at);
    // A password verified before an administrator reset cannot create a new session.
    assert.equal((await pool.query(`SELECT * FROM ${schema}.auth_complete_login($1, $2, $3, false)`, [volunteer, 'hash-three', '44'.repeat(32)])).rows.length, 0);

    const results = await Promise.allSettled([
      pool.query(`SELECT * FROM ${schema}.auth_update_user($1, $2, $3::jsonb)`, [t1, first, JSON.stringify({ role: 'volunteer' })]),
      pool.query(`SELECT * FROM ${schema}.auth_update_user($1, $2, $3::jsonb)`, [t2, second, JSON.stringify({ isActive: false })]),
    ]);
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
    assert.match(results.find((result) => result.status === 'rejected').reason.message, /LAST_ADMIN/);
    const remaining = (await pool.query(`SELECT id FROM ${schema}.auth_users WHERE role = 'admin' AND is_active`)).rows;
    assert.equal(remaining.length, 1);
    const adminToken = String(remaining[0].id) === String(first) ? t1 : t2;
    await pool.query(`SELECT * FROM ${schema}.auth_update_user($1, $2, $3::jsonb)`, [adminToken, volunteer, JSON.stringify({ isActive: false })]);
    assert.equal((await pool.query(`SELECT * FROM ${schema}.auth_complete_login($1, $2, $3, false)`, [volunteer, 'new-hash', '55'.repeat(32)])).rows.length, 0);
  } finally {
    try { await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`); }
    finally { await pool.end(); }
  }
});
