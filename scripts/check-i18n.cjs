const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const messages = JSON.parse(fs.readFileSync('src/locales/messages.json', 'utf8'));
const vars = (text) => (text.match(/\{\{\w+\}\}/g) || []).sort();
for (const [key, value] of Object.entries(messages)) {
  assert.equal(typeof value.cn, 'string', `${key}: missing Chinese`);
  assert.equal(typeof value.en, 'string', `${key}: missing English`);
  assert.deepEqual(vars(value.cn), vars(value.en), `${key}: interpolation mismatch`);
}
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory()
    ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}
const missing = new Map();
function check(key, file) { if (!messages[key]) missing.set(key, file); }
for (const file of walk('src').filter((file) => file.endsWith('.js') && !file.includes('.test.'))) {
  const ast = parser.parse(fs.readFileSync(file, 'utf8'), { sourceType: 'module', plugins: ['jsx'] });
  traverse(ast, { CallExpression(p) {
    if (p.node.callee.name !== 'tr') return;
    const key = p.node.arguments[0];
    if (key?.type === 'StringLiteral') check(key.value, file);
    if (key?.type !== 'Identifier') return;
    const binding = p.scope.getBinding(key.name);
    if (binding?.kind !== 'param') return;
    const fn = binding.scope.path;
    if (!fn.isFunction()) return;
    const call = fn.parentPath;
    if (!call.isCallExpression() || call.node.callee.property?.name !== 'map') return;
    const source = call.node.callee.object;
    const init = source.type === 'Identifier' ? call.scope.getBinding(source.name)?.path.node.init : source;
    if (init?.type !== 'ArrayExpression') return;
    const param = fn.node.params[0];
    const values = param.type === 'Identifier' ? init.elements : param.type === 'ArrayPattern'
      ? init.elements.map((n) => n?.elements?.[param.elements.findIndex((e) => e?.name === key.name)]) : [];
    values.filter((n) => n?.type === 'StringLiteral').forEach((n) => check(n.value, file));
  } });
}
if (missing.size) {
  console.error([...missing].map(([key, file]) => `${JSON.stringify(key)}: ${file}`).join('\n'));
  process.exitCode = 1;
} else console.log(`Verified ${Object.keys(messages).length} bilingual messages and literal translation references.`);
