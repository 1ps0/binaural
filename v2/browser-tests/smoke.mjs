// Drives real headless Firefox through geckodriver (WebDriver classic over HTTP).
// Proves what the vm tests cannot: the page initialises, a trusted click creates a
// running AudioContext, and the binaural graph renders the right frequencies.
//
//   npm run test:browser            # uses ../index.html
//   node browser-tests/smoke.mjs path/to/index.html
import { spawn, execSync } from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';

const PORT = 4449;
const target = path.resolve(process.argv[2] || path.join(import.meta.dirname, '..', '..', 'index.html'));

function hasGeckodriver() {
  try { execSync('geckodriver --version', { stdio: 'ignore' }); return true; } catch { return false; }
}
if (!hasGeckodriver()) {
  console.log('SKIP: geckodriver not on PATH (brew install geckodriver)');
  process.exit(0);
}

const driver = spawn('geckodriver', ['--port', String(PORT)], { stdio: 'ignore' });
const base = `http://127.0.0.1:${PORT}`;
const json = (method, p, body) => fetch(base + p, {
  method, headers: { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body)
}).then(r => r.json());

for (let i = 0; i < 50; i++) {
  try { if ((await fetch(`${base}/status`)).ok) break; } catch { /* not up yet */ }
  await new Promise(r => setTimeout(r, 100));
}

let session;
try {
  const created = await json('POST', '/session', {
    capabilities: { alwaysMatch: { browserName: 'firefox', 'moz:firefoxOptions': { args: ['-headless'] } } }
  });
  session = `/session/${created.value.sessionId}`;
  const exec = (script, args = []) => json('POST', `${session}/execute/sync`, { script, args }).then(r => r.value);
  const execAsync = (script, args = []) => json('POST', `${session}/execute/async`, { script, args }).then(r => r.value);

  await json('POST', `${session}/url`, { url: `file://${target}` });

  const page = await exec(`return {
    sections: document.querySelectorAll('.frequency-section').length,
    playButtons: document.querySelectorAll('[data-action="play"]').length,
    svgs: document.querySelectorAll('.frequency-sections svg').length,
    contextBeforeClick: binaural.AppState.audio.context ? binaural.AppState.audio.context.state : null,
    errors: binaural.errors
  }`);
  assert.equal(page.sections, 3, 'three sections rendered');
  assert.ok(page.playButtons >= 20, `play buttons rendered (${page.playButtons})`);
  assert.ok(page.svgs > 0, 'inline SVG icons present');
  assert.equal(page.contextBeforeClick, null, 'no AudioContext before a gesture');
  assert.deepEqual([...page.errors], [], 'no runtime errors during load');

  // Record audio-system failures, which are events rather than exceptions.
  await exec(`binaural.EventSystem.on('audioError', e => binaural.errors.push('audioError: ' + e.message + (e.error ? ' :: ' + e.error : '')));`);

  // WebDriver element click is a trusted input event, so it counts as user activation.
  // The first entry is used because it is never hidden under the fixed control bar.
  const ENTRY = 'beat-2hz';
  const el = await json('POST', `${session}/element`, { using: 'css selector', value: `[data-id="${ENTRY}"][data-action="play"]` });
  const elementId = Object.values(el.value)[0];
  const clicked = await json('POST', `${session}/element/${elementId}/click`, {});
  if (clicked.value && clicked.value.error) throw new Error(`click failed: ${JSON.stringify(clicked.value)}`);

  const after = await execAsync(`const done = arguments[0];
    setTimeout(() => done({
      state: binaural.AppState.audio.context && binaural.AppState.audio.context.state,
      sampleRate: binaural.AppState.audio.context && binaural.AppState.audio.context.sampleRate,
      active: binaural.AudioSystem.activeIds(),
      errors: binaural.errors,
      pressed: document.querySelector('[data-id="${ENTRY}"][data-action="play"]').getAttribute('aria-pressed')
    }), 400);`);
  assert.deepEqual([...after.active], [ENTRY], 'clicked entry is registered as active');
  assert.equal(after.pressed, 'true', 'button reflects playing state');
  assert.deepEqual([...after.errors], [], 'no runtime errors after click');
  assert.ok(after.state === 'running' || after.state === 'suspended', `context exists (state ${after.state})`);

  // A trusted click grants user activation; resume() must then settle to 'running'.
  // Headless device init takes a few hundred ms, so await it rather than polling.
  const resumed = await execAsync(`const done = arguments[0]; (async () => {
      const ctx = binaural.AppState.audio.context;
      try {
        await Promise.race([ctx.resume(), new Promise((_, rej) => setTimeout(() => rej(new Error('resume() did not settle in 3000 ms')), 3000))]);
        done({ state: ctx.state, activation: navigator.userActivation ? navigator.userActivation.hasBeenActive : null });
      } catch (e) { done({ state: ctx.state, error: String(e && e.message || e) }); }
    })();`);
  assert.equal(resumed.error, undefined, resumed.error);
  assert.equal(resumed.state, 'running', 'AudioContext runs after a trusted click');

  // Render the real graph offline and measure each ear by zero-crossing count over one second.
  const dsp = await execAsync(`const done = arguments[0];
    (async () => {
      const ctx = new OfflineAudioContext(2, 48000, 48000);
      const built = binaural.AudioSystem.buildBinaural(ctx, { type: 'binaural', frequency: 40, carrierFrequency: 200 }, ctx.destination);
      built.start(0);
      const buf = await ctx.startRendering();
      const hz = ch => { const d = buf.getChannelData(ch); let z = 0;
        for (let i = 1; i < d.length; i++) if ((d[i - 1] < 0) !== (d[i] < 0)) z++; return z / 2; };
      const peak = ch => { const d = buf.getChannelData(ch); let p = 0; for (let i = 0; i < d.length; i++) p = Math.max(p, Math.abs(d[i])); return p; };
      done({ left: hz(0), right: hz(1), peakL: peak(0), peakR: peak(1) });
    })().catch(e => done({ error: String(e) }));`);
  assert.equal(dsp.error, undefined, dsp.error);
  assert.ok(Math.abs(dsp.left - 200) <= 1, `left ear 200 Hz (got ${dsp.left})`);
  assert.ok(Math.abs(dsp.right - 240) <= 1, `right ear 240 Hz (got ${dsp.right})`);
  assert.ok(dsp.peakL > 0.9 && dsp.peakR > 0.9, 'both channels carry a full-scale sine before the gain stage');

  console.log(JSON.stringify({ page, after, resumed, dsp }, null, 2));
  console.log('PASS: headless Firefox smoke');
} finally {
  if (session) await json('DELETE', session).catch(() => {});
  driver.kill();
}
