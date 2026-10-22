import { stdin, stdout } from 'node:process';
import { createInterface, emitKeypressEvents } from 'node:readline';
import { neon } from '@neondatabase/serverless';
import { hashPassword, normalizeUsername } from '../api/_lib/auth.mjs';

async function question(prompt) {
  const rl = createInterface({ input: stdin, output: stdout });
  try { return await new Promise((resolve) => rl.question(prompt, resolve)); }
  finally { rl.close(); }
}

async function secret(prompt) {
  stdout.write(prompt);
  emitKeypressEvents(stdin);
  stdin.setRawMode(true);
  stdin.resume();
  return new Promise((resolve, reject) => {
    let value = '';
    const finish = (error) => {
      stdin.removeListener('keypress', listener);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write('\n');
      if (error) reject(error); else resolve(value);
    };
    const listener = (text, key = {}) => {
      if (key.ctrl && key.name === 'c') return finish(new Error('CANCELLED'));
      if (key.name === 'return' || key.name === 'enter') return finish();
      if (key.name === 'backspace') { value = value.slice(0, -1); return; }
      if (typeof text === 'string' && !key.ctrl && !key.meta) value += text;
    };
    stdin.on('keypress', listener);
  });
}

try {
  if (!stdin.isTTY || !stdout.isTTY) throw new Error('INTERACTIVE_TERMINAL_REQUIRED');
  const connection = await secret('Database connection URL (hidden) / 数据库连接（隐藏）: ');
  let parsed;
  try { parsed = new URL(connection); } catch { throw new Error('INVALID_DATABASE_URL'); }
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) throw new Error('INVALID_DATABASE_URL');
  const username = normalizeUsername(await question('Admin username / 管理员用户名: '));
  const password = await secret('New password (12–128 characters, hidden) / 新密码（12–128 字符，隐藏）: ');
  const confirm = await secret('Confirm password (hidden) / 确认密码（隐藏）: ');
  if (password !== confirm) throw new Error('PASSWORDS_DO_NOT_MATCH');
  const passwordHash = await hashPassword(password);
  const sql = neon(connection);
  const results = await sql.transaction([
    sql`SELECT pg_advisory_xact_lock(714203, 1)`,
    sql`WITH recovered AS (
      UPDATE public.auth_users SET password_hash = ${passwordHash},
        password_changed_at = CURRENT_TIMESTAMP, failed_login_attempts = 0,
        locked_until = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE username = ${username} AND role = 'admin' AND is_active = true
      RETURNING id
    ), revoked AS (
      UPDATE public.auth_sessions SET revoked_at = CURRENT_TIMESTAMP
      WHERE user_id IN (SELECT id FROM recovered) AND revoked_at IS NULL
      RETURNING id
    ) SELECT id FROM recovered`,
  ]);
  if (results[1].length !== 1) throw new Error('ACTIVE_ADMIN_NOT_FOUND');
  stdout.write('Admin password recovered; sessions revoked. / 管理员密码已重设，旧会话已撤销。\n');
} catch (error) {
  const allowed = ['INTERACTIVE_TERMINAL_REQUIRED', 'INVALID_DATABASE_URL', 'INVALID_REQUEST',
    'CANCELLED', 'PASSWORDS_DO_NOT_MATCH', 'ACTIVE_ADMIN_NOT_FOUND'];
  const code = allowed.includes(error.code || error.message) ? error.code || error.message : 'ADMIN_RECOVERY_FAILED';
  // Never expose connection strings, passwords or database diagnostics.
  stdout.write(`Recovery failed / 恢复失败: ${code}\n`);
  process.exitCode = 1;
}
