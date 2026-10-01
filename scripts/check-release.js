import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Vercel verifies the committed release; Windows packaging verifies source entries.
const release = JSON.parse(readFileSync(new URL('../src/release.json', import.meta.url), 'utf8'));
assert.match(release.version, /^\d+(?:\.\d+){1,3}$/);
assert.equal(release.fileName, `privatepilot-${release.version}.zip`);
assert.match(release.sha256, /^[a-f0-9]{64}$/);
assert.ok(Number.isSafeInteger(release.sizeBytes) && release.sizeBytes > 0);
const archive = readFileSync(new URL('../public/downloads/privatepilot.zip', import.meta.url));
assert.equal(archive.length, release.sizeBytes, 'Public ZIP size differs from release metadata; run npm run package:extension locally.');
assert.equal(archive.subarray(0, 4).toString('hex'), '504b0304', 'Expected a ZIP archive.');
assert.equal(createHash('sha256').update(archive).digest('hex'), release.sha256, 'Public ZIP checksum differs; run npm run package:extension locally.');
console.log(`Public extension release verified: ${release.fileName}, ${release.sizeBytes} bytes.`);
