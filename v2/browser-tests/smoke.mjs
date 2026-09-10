// Cross-browser smoke over W3C WebDriver. Proves what the vm tests cannot: the page
// initialises with no runtime errors, a trusted click creates an AudioContext that
// resumes to 'running', and the binaural graph renders the right frequency per ear.
//
//   npm run test:browser                          # every browser whose driver is present
//   node browser-tests/smoke.mjs --browser=firefox,safari --file=path/to/index.html
//   node browser-tests/smoke.mjs --strict          # a missing browser fails instead of skipping
import path from 'node:path';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { BROWSERS, startDriver, Session } from './webdriver.mjs';

// Serve the target over loopback HTTP: file:// is refused or sandboxed differently per engine.
async function serve(rootDir) {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
  const server = http.createServer(async (req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.normalize(path.join(rootDir, urlPath === '/' ? 'index.html' : urlPath));
    if (!file.startsWith(rootDir)) { res.writeHead(403); res.end(); return; }
    try {
      const data = await readFile(file);
      res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(data);
    } catch {
      res.writeHead(404); res.end('not found');
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/);
  return m ? [m[1], m[2] === undefined ? true : m[2]] : ['file', a];
}));
const target = path.resolve(args.file || path.join(import.meta.dirname, '..', '..', 'index.html'));
const wanted = args.browser ? String(args.browser).split(',') : Object.keys(BROWSERS);
const strict = !!args.strict;
const ENTRY = 'beat-2hz';

async function scenario(session, pageUrl) {
  // Same viewport in every engine; headless Chrome defaults to 800×600, which puts the
  // first entry under the fixed control bar after WebDriver's scroll-into-view.
  await session.setWindowRect(1280, 900);
  await session.navigate(pageUrl);

  const loaded = await session.exec(`return { href: location.href, ready: document.readyState, title: document.title, app: typeof window.binaural }`);
  assert.equal(loaded.app, 'object', `page script did not run: ${JSON.stringify(loaded)}`);

  const page = await session.exec(`return {
    sections: document.querySelectorAll('.frequency-section').length,
    playButtons: document.querySelectorAll('[data-action="play"]').length,
    svgs: document.querySelectorAll('.frequency-sections svg').length,
    contextBeforeClick: binaural.AppState.audio.context ? binaural.AppState.audio.context.state : null,
    errors: binaural.errors,
    ua: navigator.userAgent
  }`);
  assert.equal(page.sections, 3, 'three sections rendered');
  assert.ok(page.playButtons >= 20, `play buttons rendered (${page.playButtons})`);
  assert.ok(page.svgs > 0, 'inline SVG icons present');
  assert.equal(page.contextBeforeClick, null, 'no AudioContext before a gesture');
  assert.deepEqual([...page.errors], [], 'no runtime errors during load');

  await session.exec(`binaural.EventSystem.on('audioError', e => binaural.errors.push('audioError: ' + e.message + (e.error ? ' :: ' + e.error : '')));`);

  // A WebDriver element click is trusted input, so it grants user activation.
  // The first entry is used because it is never under the fixed control bar.
  await session.click(await session.find(`[data-id="${ENTRY}"][data-action="play"]`));

  const after = await session.execAsync(`const done = arguments[0]; (async () => {
    const ctx = binaural.AppState.audio.context;
    let resumeError = null;
    try {
      await Promise.race([ctx.resume(), new Promise((_, rej) => setTimeout(() => rej(new Error('resume() did not settle in 3000 ms')), 3000))]);
    } catch (e) { resumeError = String(e && e.message || e); }
    done({
      state: ctx.state,
      sampleRate: ctx.sampleRate,
      resumeError,
      activation: navigator.userActivation ? navigator.userActivation.hasBeenActive : null,
      active: binaural.AudioSystem.activeIds(),
      pressed: document.querySelector('[data-id="${ENTRY}"][data-action="play"]').getAttribute('aria-pressed'),
      errors: binaural.errors
    });
  })();`);
  assert.deepEqual([...after.active], [ENTRY], 'clicked entry is registered as active');
  assert.equal(after.pressed, 'true', 'button reflects playing state');
  assert.deepEqual([...after.errors], [], 'no runtime errors after click');
  assert.equal(after.resumeError, null, after.resumeError);
  assert.equal(after.state, 'running', 'AudioContext runs after a trusted click');

  // Render the real graph offline; measure each ear by zero-crossing count over one second.
  const dsp = await session.execAsync(`const done = arguments[0]; (async () => {
    const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const ctx = new Offline(2, 48000, 48000);
    const built = binaural.AudioSystem.buildBinaural(ctx, { type: 'binaural', frequency: 40, carrierFrequency: 200 }, ctx.destination);
    built.start(0);
    const buf = await ctx.startRendering();
    const hz = ch => { const d = buf.getChannelData(ch); let z = 0;
      for (let i = 1; i < d.length; i++) if ((d[i - 1] < 0) !== (d[i] < 0)) z++; return z / 2; };
    const peak = ch => { const d = buf.getChannelData(ch); let p = 0; for (let i = 0; i < d.length; i++) p = Math.max(p, Math.abs(d[i])); return p; };
    done({ left: hz(0), right: hz(1), peakL: peak(0), peakR: peak(1) });
  })().catch(e => done({ error: String(e && e.message || e) }));`);
  assert.equal(dsp.error, undefined, dsp.error);
  assert.ok(Math.abs(dsp.left - 200) <= 1, `left ear 200 Hz (got ${dsp.left})`);
  assert.ok(Math.abs(dsp.right - 240) <= 1, `right ear 240 Hz (got ${dsp.right})`);
  assert.ok(dsp.peakL > 0.9 && dsp.peakR > 0.9, 'both channels carry a full-scale sine before the gain stage');

  return { ua: page.ua, sampleRate: after.sampleRate, state: after.state, activation: after.activation, left: dsp.left, right: dsp.right };
}

// Under GitHub Actions also emit workflow-command annotations, which are readable through
// the REST API (check-runs/{job}/annotations) when raw logs are not reachable.
const onActions = !!process.env.GITHUB_ACTIONS;
function report(status, name, detail) {
  const line = `${status} ${name}: ${detail}`;
  console.log(line);
  if (onActions) {
    const level = status === 'FAIL' ? 'error' : 'notice';
    console.log(`::${level} title=browser smoke ${name}::${line.replace(/\r?\n/g, ' ').slice(0, 900)}`);
  }
}

const { server, origin } = await serve(path.dirname(target));
const pageUrl = `${origin}/${path.basename(target)}`;

let failed = 0;
let port = 4460;
for (const name of wanted) {
  const spec = BROWSERS[name];
  if (!spec) { report('FAIL', name, 'unknown browser'); failed++; continue; }
  if (!spec.available()) {
    report(strict ? 'FAIL' : 'SKIP', name, `${spec.missing} [driver=${spec.driver}, PATH lookup and store checked]`);
    if (strict) failed++;
    continue;
  }
  let driver; let session;
  try {
    driver = await startDriver(name, port++);
    session = await Session.create(driver.base, spec.capabilities());
    const result = await scenario(session, pageUrl);
    report('PASS', name, JSON.stringify(result));
  } catch (e) {
    failed++;
    report('FAIL', name, e.message);
  } finally {
    if (session) await session.quit().catch(() => {});
    if (driver) driver.proc.kill();
  }
}
server.close();
process.exit(failed ? 1 : 0);
