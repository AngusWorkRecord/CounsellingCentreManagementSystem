import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const expected = ['cases', 'counsellors', 'duty-roster'];
async function functionsIn(directory, prefix = '') {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const name = path.posix.join(prefix, entry.name);
    if (entry.name.endsWith('.func')) found.push(name);
    else found.push(...await functionsIn(path.join(directory, entry.name), name));
  }
  return found;
}
const root = '.vercel/output/functions';
const found = (await functionsIn(root)).sort();
assert.deepEqual(found, expected.map((name) => `api/${name}.func`), 'Expected exactly three deployable functions');
for (const name of found) {
  const config = JSON.parse(await readFile(path.join(root, name, '.vc-config.json'), 'utf8'));
  assert.match(config.runtime, /^nodejs22\.x$/, `${name}: unexpected runtime`);
}
const fields = path.join(root, 'api/cases.func/src/sections/counselling-practice/fields.json');
JSON.parse(await readFile(fields, 'utf8'));
console.log('Verified exactly 3 Node.js 22 Vercel Functions, including student feedback fields.json.');
