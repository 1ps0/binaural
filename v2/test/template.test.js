'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'src', 'index.html'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

test('template: version string matches package.json', () => {
  assert.match(html, new RegExp(`class="version-info">${pkg.version.replace(/\\./g, '\\\\.')}\\b`), `version-info must show ${pkg.version}`);
});

test('template: banner offers both previous versions and carries the release version for dismissal', () => {
  const banner = html.match(/<div class="legacy-version-banner"[^>]*>[\s\S]*?<\/div>/);
  assert.ok(banner, 'banner present');
  assert.match(banner[0], /data-version="2\.\d+\.\d+"/, 'banner has data-version');
  assert.ok(banner[0].includes(`data-version="${pkg.version}"`), `banner data-version is ${pkg.version}`);
  assert.match(banner[0], /href="v2\.0\.2\/index\.html"/, 'links to the 2.0.2 snapshot');
  assert.match(banner[0], /href="v1\/index\.html"/, 'links to v1');
});

test('snapshot: v2.0.2/index.html exists and its own v1 link resolves from that directory', () => {
  const snap = path.join(root, '..', 'v2.0.2', 'index.html');
  assert.ok(fs.existsSync(snap), 'v2.0.2/index.html exists');
  const text = fs.readFileSync(snap, 'utf8');
  assert.match(text, /Version: 2\.0\.2/, 'snapshot is 2.0.2');
  assert.doesNotMatch(text, /href="v1\/index\.html"/, 'relative v1 link would 404 from v2.0.2/');
  assert.match(text, /href="\.\.\/v1\/index\.html"/, 'v1 link points one level up');
});

test('main.js: banner dismissal is keyed per release', () => {
  const main = fs.readFileSync(path.join(root, 'src', 'js', 'main.js'), 'utf8');
  assert.doesNotMatch(main, /'legacy-banner-dismissed'/, 'unversioned key must not be used');
  assert.match(main, /legacy-banner-dismissed-\$\{/, 'key includes the release version');
});
