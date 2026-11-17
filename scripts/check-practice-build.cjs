const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Jest can execute .cjs even when CRA treats it as a URL. Inspect the actual
// production output so this regression cannot pass on unit tests alone.
const buildDirectory = path.resolve(process.env.BUILD_PATH || 'build');
const manifest = JSON.parse(fs.readFileSync(path.join(buildDirectory, 'asset-manifest.json'), 'utf8'));
const misplaced = Object.keys(manifest.files).filter((name) => /^static\/media\/feedbackContract\./.test(name));
assert.deepEqual(misplaced, [], 'Feedback contract was emitted as a static asset instead of executable JavaScript');
console.log('Verified feedback contract is not emitted as a static asset.');
