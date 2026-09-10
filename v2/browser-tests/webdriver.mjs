// Minimal W3C WebDriver client over HTTP. No dependencies. One driver process per browser:
//   firefox  → geckodriver   (Mozilla)        headless
//   safari   → safaridriver  (Apple, ships with macOS; enable once: safaridriver --enable)
//   chromium → chromedriver  (any Chromium build; Google Chrome not required)
import { spawn, execSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

// Project-local browser store written by `npm run browsers:chromium`
// (@puppeteer/browsers: Chrome for Testing + a version-matched chromedriver). Gitignored.
export const BROWSER_STORE = path.join(import.meta.dirname, '..', '.browsers');

function findFile(root, predicate, depth = 8) {
  if (depth < 0 || !existsSync(root)) return null;
  for (const name of readdirSync(root)) {
    const full = path.join(root, name);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isFile() && predicate(full)) return full;
    if (st.isDirectory()) {
      const hit = findFile(full, predicate, depth - 1);
      if (hit) return hit;
    }
  }
  return null;
}

export function hasCommand(name) {
  try { execSync(`command -v ${name}`, { stdio: 'ignore', shell: '/bin/sh' }); return true; } catch { return false; }
}

export function chromiumBinary() {
  if (process.env.CHROMIUM_BIN) return process.env.CHROMIUM_BIN;
  const local = findFile(BROWSER_STORE, f => /\/Contents\/MacOS\/(Google Chrome for Testing|Chromium)$/.test(f) || /\/chrome-linux64\/chrome$/.test(f));
  if (local) return local;
  const candidates = [
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium',
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable'
  ];
  return candidates.find(existsSync) || null;
}

export function chromedriverBinary() {
  if (process.env.CHROMEDRIVER_BIN) return process.env.CHROMEDRIVER_BIN;
  const local = findFile(BROWSER_STORE, f => path.basename(f) === 'chromedriver');
  if (local) return local;
  return hasCommand('chromedriver') ? 'chromedriver' : null;
}

export const BROWSERS = {
  firefox: {
    driver: 'geckodriver',
    portArgs: port => ['--port', String(port)],
    capabilities: () => ({ browserName: 'firefox', 'moz:firefoxOptions': { args: ['-headless'] } }),
    available: () => hasCommand('geckodriver'),
    missing: 'geckodriver not on PATH (brew install geckodriver)'
  },
  safari: {
    driver: 'safaridriver',
    portArgs: port => ['-p', String(port)],
    capabilities: () => ({ browserName: 'safari' }),
    available: () => process.platform === 'darwin' && hasCommand('safaridriver'),
    missing: 'safaridriver requires macOS; run `safaridriver --enable` once'
  },
  chromium: {
    get driver() { return chromedriverBinary() || 'chromedriver'; },
    portArgs: port => [`--port=${port}`],
    capabilities: () => {
      const binary = chromiumBinary();
      return {
        browserName: 'chrome',
        'goog:chromeOptions': {
          ...(binary ? { binary } : {}),
          args: ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
        }
      };
    },
    available: () => !!chromedriverBinary() && (!!chromiumBinary() || process.platform === 'linux'),
    missing: 'no chromedriver + Chromium pair found; run `npm run browsers:chromium` (project-local, no Google Chrome install) or set CHROMEDRIVER_BIN/CHROMIUM_BIN'
  }
};

function unwrap(res) {
  if (res && res.value && typeof res.value === 'object' && res.value.error) {
    throw new Error(`${res.value.error}: ${res.value.message}`);
  }
  return res.value;
}

export async function startDriver(browser, port) {
  const spec = BROWSERS[browser];
  const proc = spawn(spec.driver, spec.portArgs(port), { stdio: 'ignore' });
  const base = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 100; i++) {
    try {
      const res = await fetch(`${base}/status`);
      if (res.ok) return { proc, base };
    } catch { /* not listening yet */ }
    await new Promise(r => setTimeout(r, 100));
  }
  proc.kill();
  throw new Error(`${spec.driver} did not answer /status on ${port} within 10 s`);
}

export class Session {
  constructor(base, id) { this.base = base; this.path = `/session/${id}`; }

  static async create(base, capabilities) {
    const res = await Session.call(base, 'POST', '/session', { capabilities: { alwaysMatch: capabilities } });
    const value = unwrap(res);
    return new Session(base, value.sessionId);
  }

  static async call(base, method, p, body) {
    const res = await fetch(base + p, {
      method,
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    return res.json();
  }

  async call(method, p, body) { return unwrap(await Session.call(this.base, method, `${this.path}${p}`, body)); }
  navigate(url) { return this.call('POST', '/url', { url }); }
  setWindowRect(width, height) { return this.call('POST', '/window/rect', { x: 0, y: 0, width, height }); }
  exec(script, args = []) { return this.call('POST', '/execute/sync', { script, args }); }
  execAsync(script, args = []) { return this.call('POST', '/execute/async', { script, args }); }
  async find(css) {
    const el = await this.call('POST', '/element', { using: 'css selector', value: css });
    return Object.values(el)[0];
  }
  click(elementId) { return this.call('POST', `/element/${elementId}/click`, {}); }
  quit() { return this.call('DELETE', ''); }
}
