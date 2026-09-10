'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createSandbox } = require('./harness');
const { FakeAudioContext } = require('./fake-audio');

function build(sb, pattern) {
  const Aleph = sb.$('AudioSystem.AudioModules.AlephModule');
  const ctx = new FakeAudioContext();
  const m = new Aleph(ctx, pattern, 200);
  m.apply();
  return { m, ctx };
}

test('aleph: the three patterns build three different graphs', () => {
  const sb = createSandbox();
  const shapes = sb.$('AudioSystem.AudioModules.AlephModule.PATTERNS').map(p => {
    const { ctx } = build(sb, p);
    const kinds = ctx.nodes.map(n => n.kind).sort().join(',');
    return `${p}=${kinds}`;
  });
  assert.equal(new Set(shapes.map(s => s.split('=')[1])).size, shapes.length, shapes.join('\n'));
});

test('aleph: unknown pattern id throws instead of silently playing a fallback', () => {
  const sb = createSandbox();
  const Aleph = sb.$('AudioSystem.AudioModules.AlephModule');
  assert.throws(() => new Aleph(new FakeAudioContext(), 'aleph-pattern-1', 200).apply(), /pattern/i);
});

test('aleph-one: FM carrier sits at the base frequency', () => {
  const sb = createSandbox();
  const { m } = build(sb, 'aleph-one');
  const carrier = m.oscillators.find(o => o.role === 'carrier');
  assert.ok(carrier, 'has a carrier');
  assert.equal(carrier.osc.frequency.value, 200);
});

test('aleph-two: buffer is generated synchronously, looped, and started by start()', () => {
  const sb = createSandbox();
  const { m } = build(sb, 'aleph-two');
  assert.ok(m.bufferSource, 'buffer source exists right after apply()');
  assert.equal(m.bufferSource.loop, true);
  assert.ok(m.bufferSource.buffer.length > 0);
  m.start();
  assert.notEqual(m.bufferSource.startedAt, null, 'start() started the buffer');
  assert.equal(m.bufferReplacementTimeout, undefined, 'no periodic buffer-source replacement');
});

test('aleph-two: buffer samples stay inside [-1, 1] with a non-zero signal', () => {
  const sb = createSandbox();
  const { m } = build(sb, 'aleph-two');
  const data = m.bufferSource.buffer.getChannelData(0);
  let peak = 0;
  for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
  assert.ok(peak > 0.01, `signal present (peak ${peak})`);
  assert.ok(peak <= 1, `no clipping (peak ${peak})`);
});

test('aleph: start() schedules oscillators on the audio clock (no setTimeout stagger)', () => {
  const sb = createSandbox();
  const { m } = build(sb, 'aleph-null');
  m.start();
  for (const { osc } of m.oscillators) {
    assert.notEqual(osc.startedAt, null, 'every oscillator started synchronously');
  }
});

test('AudioSystem: startTone with a pattern spec plays it and stopTone stops it', () => {
  const sb = createSandbox();
  const AS = sb.$('AudioSystem');
  assert.equal(AS.startTone('p', { type: 'pattern', pattern: 'aleph-null', baseFrequency: 200 }), true);
  assert.ok(AS.activeIds().includes('p'));
  AS.stopTone('p');
  assert.equal(AS.activeIds().includes('p'), false);
});
