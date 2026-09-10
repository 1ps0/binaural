'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createSandbox } = require('./harness');
const { pathGain } = require('./fake-audio');

function activeSources(sb, id) {
  return sb.$('AppState').audio.oscillators[id].sources;
}

test('volume: a tone at slider 0.2 reaches the destination at exactly 0.2, not 0.04', () => {
  const sb = createSandbox();
  const AS = sb.$('AudioSystem');
  sb.$('AppState').audio.volume = 0.2;
  assert.equal(AS.startTone('t', { type: 'tone', frequency: 440 }), true);
  const [osc] = activeSources(sb, 't');
  const { gain, reached } = pathGain(osc);
  assert.equal(reached, true, 'oscillator is wired to the destination');
  assert.ok(Math.abs(gain - 0.2) < 1e-9, `effective gain ${gain}`);
});

test('volume: moving the slider after start changes what a running tone outputs', () => {
  const sb = createSandbox();
  const AS = sb.$('AudioSystem');
  sb.$('AppState').audio.volume = 0;
  AS.startTone('t', { type: 'tone', frequency: 440 });
  AS.setVolume(0.5);
  const { gain } = pathGain(activeSources(sb, 't')[0]);
  assert.ok(Math.abs(gain - 0.5) < 1e-9, `tone started at 0 must follow the slider; got ${gain}`);
});

test('volume: both binaural ears reach the destination at the slider level', () => {
  const sb = createSandbox();
  const AS = sb.$('AudioSystem');
  sb.$('AppState').audio.volume = 0.3;
  AS.startTone('b', { type: 'binaural', frequency: 40, carrierFrequency: 200 });
  const [left, right] = activeSources(sb, 'b');
  assert.equal(left.frequency.value, 200);
  assert.equal(right.frequency.value, 240);
  for (const osc of [left, right]) {
    const { gain, reached } = pathGain(osc);
    assert.equal(reached, true);
    assert.ok(Math.abs(gain - 0.3) < 1e-9, `ear gain ${gain}`);
  }
});

test('init: exactly one AudioContext is constructed', () => {
  const sb = createSandbox();
  sb.$('AudioSystem').init();
  assert.equal(sb.contexts.length, 1, `constructed ${sb.contexts.length} contexts`);
});

test('init: works when only webkitAudioContext exists', () => {
  const sb = createSandbox({ webkitOnly: true });
  assert.equal(sb.$('AudioSystem').init(), true);
  assert.equal(sb.contexts.length, 1);
});

test('init: audioReady fires once across repeated startTone calls', () => {
  const sb = createSandbox();
  let ready = 0;
  sb.$('EventSystem').on('audioReady', () => ready++);
  const AS = sb.$('AudioSystem');
  AS.startTone('a', { type: 'tone', frequency: 440 });
  AS.startTone('b', { type: 'tone', frequency: 528 });
  AS.startTone('c', { type: 'binaural', frequency: 10, carrierFrequency: 200 });
  assert.equal(ready, 1);
});

test('limits: exceeding maxSimultaneousTones stops the oldest tone', () => {
  const sb = createSandbox();
  const AS = sb.$('AudioSystem');
  const state = sb.$('AppState');
  state.performance.maxSimultaneousTones = 2;
  AS.startTone('a', { type: 'tone', frequency: 100 });
  AS.startTone('b', { type: 'tone', frequency: 200 });
  AS.startTone('c', { type: 'tone', frequency: 300 });
  assert.deepEqual([...AS.activeIds()].sort(), ['b', 'c']);
});

test('lifetime: no timer kills a tone after 30 minutes', () => {
  const sb = createSandbox();
  const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'src/js/audio/audio-system.js'), 'utf8');
  assert.doesNotMatch(src, /1800000|30 \* 60 \* 1000/, 'long-running tone cutoff must not exist');
});

test('stop: sources are stopped on the audio clock, not via setTimeout', () => {
  const sb = createSandbox();
  const AS = sb.$('AudioSystem');
  AS.startTone('t', { type: 'tone', frequency: 440 });
  const [osc] = activeSources(sb, 't');
  AS.stopTone('t');
  assert.ok(osc.stoppedAt !== null, 'stop() scheduled synchronously');
  assert.ok(osc.stoppedAt > 0, 'stop is scheduled after the fade, on the context clock');
  assert.equal(AS.activeIds().includes('t'), false);
});
