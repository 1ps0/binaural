'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createSandbox } = require('./harness');

const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{25B6}\u{23F9}]/u;

test('icons: markup is an inline SVG with an emoji fallback that is hidden by default', () => {
  const sb = createSandbox();
  const html = sb.$('UIComponents').icon('play', 'Play');
  assert.match(html, /<svg[^>]*aria-hidden="true"/);
  assert.match(html, /class="icon__fallback"/);
  assert.match(html, /aria-label="Play"/);
});

test('cards: play/pin controls use SVG icons; emoji only appears inside the fallback span', () => {
  const sb = createSandbox();
  const UI = sb.$('UISystem');
  const f = sb.$('FrequencySystem').getFrequency('beat-40hz');
  for (const html of [UI.createFrequencyCard(f), UI.createFrequencyListItem(f)]) {
    assert.match(html, /<svg/);
    const stripped = html.replace(/<span class="icon__fallback"[^>]*>[^<]*<\/span>/g, '');
    assert.doesNotMatch(stripped, EMOJI, 'emoji outside fallback spans');
  }
});

test('sections: rendered titles come from the section table, not the storage key', () => {
  const sb = createSandbox();
  const UI = sb.$('UISystem');
  assert.equal(UI.sectionTitle('binaural'), sb.$('FrequencySystem').sections.binaural.title);
  assert.doesNotMatch(UI.sectionTitle('binaural'), /_/);
});

test('cards: mechanical description and band badge are present; no invented warning box', () => {
  const sb = createSandbox();
  const UI = sb.$('UISystem');
  const f = sb.$('FrequencySystem').getFrequency('beat-40hz');
  const html = UI.createFrequencyCard(f);
  assert.match(html, /200 Hz/);
  assert.match(html, /gamma/i);
  assert.doesNotMatch(html, /⚠️|frequency-card__warning/);
});

test('theme: first visit follows prefers-color-scheme and does not pin a choice in storage', () => {
  const sb = createSandbox({ prefersDark: true });
  const Theme = sb.$('ThemeSystem');
  Theme.init();
  assert.equal(sb.$('AppState').ui.theme, 'dark');
  assert.equal(sb.localStorage.getItem('theme'), null, 'init must not persist an implicit choice');
  Theme.toggleTheme();
  assert.equal(sb.localStorage.getItem('theme'), 'light', 'explicit toggle persists');
});
