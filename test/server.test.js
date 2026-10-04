import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { app } from '../server.js';
import { createHash } from 'node:crypto';

test('serves the built landing page and assets without exposing project files', async () => {
  const server = app.listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}`;
    const page = await fetch(base);
    assert.equal(page.status, 200);
    assert.equal(page.headers.get('x-powered-by'), null);
    assert.match(page.headers.get('content-security-policy'), /script-src 'self'/);
    const html = await page.text();
    assert.match(html, /PrivatePilot/);
    const script = html.match(/src="([^"]+\.js)"/)[1];
    assert.equal((await fetch(base + script)).status, 200);
    assert.equal((await fetch(base + '/favicon.svg')).status, 200);
    for (const route of ['/.env', '/server.js', '/package.json', '/PLAN.md', '/api/profile', '/downloads/release.json', '/downloads/INSTALL.txt', '/downloads/missing.zip']) {
      assert.equal((await fetch(base + route)).status, 404, route);
    }
    const source = await readFile(new URL('../src/main.jsx', import.meta.url), 'utf8');
    assert.doesNotMatch(source, /\bfetch\s*\(|localStorage|sessionStorage|https?:\/\//);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

test('downloads the verified versioned ZIP with correct headers and byte integrity', async () => {
  const release = JSON.parse(await readFile(new URL('../downloads/release.json', import.meta.url), 'utf8'));
  const portableRelease = JSON.parse(await readFile(new URL('../src/release.json', import.meta.url), 'utf8'));
  assert.deepEqual(portableRelease, release, 'Vercel release metadata matches the verified local package');
  const staticArchive = await readFile(new URL('../dist/downloads/privatepilot.zip', import.meta.url));
  assert.equal(createHash('sha256').update(staticArchive).digest('hex'), release.sha256, 'Vercel build includes the exact verified ZIP');
  const manifest = JSON.parse(await readFile(new URL('../../private-pilot-testing/extension/manifest.json', import.meta.url), 'utf8'));
  assert.equal(release.version, manifest.version);
  const server = app.listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    const url = `http://127.0.0.1:${server.address().port}/downloads/privatepilot.zip?v=${release.version}`;
    const head = await fetch(url, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(Number(head.headers.get('content-length')), release.sizeBytes);
    const response = await fetch(url);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /application\/zip/);
    assert.equal(response.headers.get('content-disposition'), `attachment; filename="${release.fileName}"`);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.length, release.sizeBytes);
    assert.equal(bytes.subarray(0, 4).toString('hex'), '504b0304');
    assert.equal(createHash('sha256').update(bytes).digest('hex'), release.sha256);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
