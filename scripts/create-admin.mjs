import { stdin, stdout } from 'node:process';
import { createInterface, emitKeypressEvents } from 'node:readline';
import { getAuthSql, hashPassword, normalizeUsername } from '../api/_lib/auth.mjs';

async function question(prompt) {
  const rl = createInterface({ input: stdin, output: stdout });
  try { return await new Promise((resolve) => rl.question(prompt, resolve)); }
  finally { rl.close(); }
}

async function secret(prompt) {
  if (!stdin.isTTY || !stdout.isTTY) throw new Error('INTERACTIVE_TERMINAL_REQUIRED');
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
  const sql = getAuthSql();
  const username = normalizeUsername(await question('Username: '));
  const fullName = (await question('Full name: ')).trim();
  if (!fullName || fullName.length > 100) throw new Error('INVALID_NAME');
  const email = (await question('Email (optional): ')).trim() || null;
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) throw new Error('INVALID_EMAIL');
  const password = await secret('Password (12–128 characters, hidden): ');
  const confirm = await secret('Confirm password (hidden): ');
  if (password !== confirm) throw new Error('PASSWORDS_DO_NOT_MATCH');
  const passwordHash = await hashPassword(password);
  await sql`SELECT public.auth_bootstrap_admin(${username}, ${passwordHash}, ${fullName}, ${email})`;
  stdout.write('Administrator created successfully.\n');
} catch (error) {
  const codes = ['AUTH_NOT_CONFIGURED', 'INTERACTIVE_TERMINAL_REQUIRED', 'INVALID_REQUEST', 'INVALID_NAME', 'INVALID_EMAIL', 'CANCELLED', 'PASSWORDS_DO_NOT_MATCH'];
  const code = error.code === 'P0001' && error.message === 'ADMIN_ALREADY_EXISTS' ? 'ADMIN_ALREADY_EXISTS'
    : error.code === '23505' ? 'USERNAME_EXISTS'
      : codes.includes(error.code || error.message) ? error.code || error.message : 'ADMIN_CREATION_FAILED';
  // Never print database diagnostics, a connection string or input credentials.
  stdout.write(`Unable to create administrator: ${code}\n`);
  process.exitCode = 1;
}
