'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createSandbox } = require('./harness');

const CLAIM_WORDS = /\b(heal|healing|spiritual|consciousness|chakra|dna|repair|cortisol|hormone|research indicates|studies (show|suggest)|clinical|therapeutic|enhance|optimi[sz]|entrainment for)\b/i;

test('catalog: no duplicate (type, frequency) pairs', () => {
  const sb = createSandbox();
  const all = sb.$('FrequencySystem.all()');
  const seen = new Map();
  for (const f of all) {
    const key = `${f.type}:${f.frequency}:${f.carrierFrequency || ''}:${f.pattern || ''}`;
    assert.equal(seen.has(key), false, `duplicate entry ${f.id} collides with ${seen.get(key)}`);
    seen.set(key, f.id);
  }
});

test('catalog: anything below 20 Hz is a binaural beat with a carrier', () => {
  const sb = createSandbox();
  for (const f of sb.$('FrequencySystem.all()')) {
    if (f.frequency !== null && f.frequency < 20) {
      assert.equal(f.type, 'binaural', `${f.id} at ${f.frequency} Hz would be inaudible as a pure tone`);
      assert.ok(f.carrierFrequency >= 20, `${f.id} needs an audible carrier`);
    }
  }
});

test('catalog: every pattern entry names a pattern AlephModule implements', () => {
  const sb = createSandbox();
  const supported = sb.$('AudioSystem.AudioModules.AlephModule.PATTERNS');
  const patterns = sb.$('FrequencySystem.getFrequencies("patterns")');
  assert.ok(patterns.length >= 3);
  for (const f of patterns) {
    assert.equal(f.type, 'pattern');
    assert.ok(supported.includes(f.pattern), `${f.id} → ${f.pattern} not in ${supported}`);
  }
  assert.equal(new Set(patterns.map(f => f.pattern)).size, patterns.length, 'patterns must be distinct');
});

test('catalog: descriptions and titles carry no effect claims', () => {
  const sb = createSandbox();
  for (const f of sb.$('FrequencySystem.all()')) {
    const text = `${f.title} ${sb.$('FrequencySystem').describe(f)} ${f.note || ''}`;
    assert.equal(CLAIM_WORDS.test(text), false, `${f.id}: "${text}"`);
  }
  for (const [key, s] of Object.entries(sb.$('FrequencySystem.sections'))) {
    assert.equal(CLAIM_WORDS.test(`${s.title} ${s.description}`), false, `section ${key}`);
    assert.doesNotMatch(s.title, /_/, `section title "${s.title}" leaks a storage key`);
  }
});

test('describe(): binaural entries state both ear frequencies and the band', () => {
  const sb = createSandbox();
  const FS = sb.$('FrequencySystem');
  const f = FS.getFrequency('beat-40hz');
  assert.ok(f, 'beat-40hz exists');
  const text = FS.describe(f);
  assert.match(text, /200 Hz/);
  assert.match(text, /240 Hz/);
  assert.match(text, /gamma/i);
});

test('bandOf(): EEG band boundaries', () => {
  const sb = createSandbox();
  const FS = sb.$('FrequencySystem');
  assert.equal(FS.bandOf(2), 'delta');
  assert.equal(FS.bandOf(6), 'theta');
  assert.equal(FS.bandOf(10), 'alpha');
  assert.equal(FS.bandOf(15), 'beta');
  assert.equal(FS.bandOf(40), 'gamma');
  assert.equal(FS.bandOf(528), null);
});

test('pins: legacy object shapes normalise to a flat id list without throwing', () => {
  const sb = createSandbox();
  const FS = sb.$('FrequencySystem');
  const known = FS.all().map(f => f.id);
  const cases = [
    { focus: [known[0]], healing: [known[1]] },
    { binaural: [known[0]], solfeggio: [], special: [known[2]] },
    { cognitive_enhancement: [known[0]], experimental_protocols: [known[3]] },
    [known[0], 'no-such-id', known[0]],
    'garbage', null, 42
  ];
  for (const raw of cases) {
    const out = FS.normalizePinned(raw);
    assert.ok(Array.isArray(out), `normalizePinned(${JSON.stringify(raw)}) → array`);
    for (const id of out) assert.ok(known.includes(id), `unknown id ${id} survived`);
    assert.equal(new Set(out).size, out.length, 'no duplicate pins');
  }
});

test('pins: pinning a pattern after a legacy-format load does not throw', () => {
  const sb = createSandbox({ localStorage: { pinnedFrequencies: JSON.stringify({ binaural: [], solfeggio: [], special: [] }) } });
  const FS = sb.$('FrequencySystem');
  FS.loadPinnedFrequencies();
  const pattern = FS.getFrequencies('patterns')[0];
  assert.doesNotThrow(() => FS.pinFrequency(pattern.id));
  assert.equal(FS.isPinned(pattern.id), true);
  FS.unpinFrequency(pattern.id);
  assert.equal(FS.isPinned(pattern.id), false);
});

test('search: matches hidden tags and band names, not only titles', () => {
  const sb = createSandbox();
  const FS = sb.$('FrequencySystem');
  assert.ok(FS.searchFrequencies('gamma').some(f => f.id === 'beat-40hz'));
  assert.ok(FS.searchFrequencies('sleep').some(f => f.type === 'binaural' && f.frequency < 4));
  assert.equal(FS.searchFrequencies('zzzz-nothing').length, 0);
});
