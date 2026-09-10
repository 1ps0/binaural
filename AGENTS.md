# AGENTS.md — working in this repository

Read this before changing anything. It is the single guidance file; `CLAUDE.md` imports it.

## What this is

A single-file web page that synthesises binaural beats, pure tones, and generated patterns with the Web Audio API. Firefox is the first-class target; Safari and Chrome must also work. Served by GitHub Pages at `1ps0.info/binaural` from the root `index.html`.

## Where truth lives

| question | answer |
|----------|--------|
| source | `v2/src/` — nothing else is edited by hand |
| build outputs | `v2/dist/index.html` and root `index.html`; regenerate, never edit |
| invariants | `specs/audio-graph.md`, `specs/frequency-catalog.md` |
| state of play | `docs/overview.md` — update it in the same change that moves reality |
| open work | `ROADMAP.md` — numbered items, root cause stated when known |
| tests | `v2/test/` — `node --test`, fake `AudioContext` over the real bundle order |

`v1/`, `v0.0.1/` are frozen. The untracked `v3/` directory holds work that exists nowhere else; do not delete or "clean it up".

## Commands

```sh
cd v2
npm test          # must pass before any commit
npm run check     # test + build + deploy + fail if root index.html drifts from src
npm run deploy    # build and copy to ../index.html
npm run test:browser   # every browser whose driver is present: Firefox, Safari, Chromium
npm run browsers:chromium   # one-time: project-local Chrome for Testing + matched chromedriver (~380 MB, gitignored)
```

Never `git push` without an explicit go from the owner. Commit locally, then stop and summarise.

## Non-negotiable invariants

1. **Level is applied once**, at `masterGain`. Per-tone gain is a 0→1 envelope. If you add a per-entry volume control it multiplies *at that entry's gain* and the slider still moves everything.
2. **No timers in the audio path.** Every start and stop is scheduled on `AudioContext.currentTime`. `setTimeout` may only release nodes after a fade.
3. **One `AudioContext`**, created lazily inside a user gesture. No probe contexts.
4. **Descriptions are generated** from the entry's numbers by `FrequencySystem.describe()`. Do not hand-write description text.
5. **No effect claims anywhere in the catalog or UI copy.** State what is synthesised and where a value comes from. A test enforces this; do not weaken it to make copy pass.
6. **Ids are permanent.** Rename by adding the old id to `LEGACY_IDS`.
7. **Every change lands with a test that failed first.** For behaviour the vm harness cannot see (layout, real audio), add an executable check plus a note in `docs/overview.md` under "Not verified".

## Language

Mechanical, provenance-first. "Left 200 Hz, right 240 Hz. 40 Hz beat, gamma band (30–100 Hz)." — yes. "Enhances focus" — no. Band names are EEG nomenclature applied to a number, not a promise. The solfeggio set is listed with its 1999 numerological origin; 440 Hz is ISO 16; 7.83 Hz is a Schumann mode used as a beat frequency.

## How to work

- **Analyse before solving.** Name the root cause from the code before proposing a fix. Record README-vs-code discrepancies instead of resolving them silently.
- **Simplest direct fix.** No abstractions for one caller. Delete dead code in the same change that orphans it.
- **Comments are load-bearing only** and describe the code as it is now. History goes in commits.
- **Re-evaluate the part, not the repair.** When a fix fails twice, stop, name the friction (integration, dependency ambiguity, conceptual), and ask whether the component is the right one. Presenting "replace it" as a rational option is expected, not a last resort. Ten steps rethinking save a thousand steps patching.
- **Do not inflate.** Constructive disagreement beats agreement; if a request contradicts a spec, say which one and why, then do what is asked.
- **Say what you did and what you did not verify**, with the command or file that backs each claim. Marked uncertainty is free; unmarked assertion is expensive.
- Before a major direction change, restate the relevant invariants and the edges you are tracking, so the reader can catch a drift early.

## Browser verification

The vm tests prove routing and catalog rules; they cannot prove the page runs. After UI or audio-system changes, render the deployed file in headless Firefox and look at it:

```sh
/Applications/Firefox.app/Contents/MacOS/firefox --headless --new-instance \
  -profile /tmp/ffprof --window-size=1280,900 --screenshot /tmp/desktop.png \
  "file://$PWD/index.html"
```

`npm run test:browser` (`v2/browser-tests/smoke.mjs`) runs one scenario against every engine whose driver is present, over plain W3C WebDriver HTTP with no client library (`v2/browser-tests/webdriver.mjs`): load the deployed file, assert zero runtime errors, trusted click on Play, await `AudioContext.resume()` to `running`, render `buildBinaural` through an `OfflineAudioContext` and measure each ear by zero-crossing count. `--browser=a,b` selects engines; `--strict` makes a missing engine a failure (used in CI). The page is served from a loopback HTTP server inside the runner: Safari's WebDriver does not run scripts from `file://`, and headless Chrome's default 800×600 viewport is overridden to 1280×900 so the first entry is not under the fixed bar.

| engine | driver | how to get it | notes |
|--------|--------|---------------|-------|
| Firefox | `geckodriver` | `brew install geckodriver` | headless; Firefox.app from Mozilla |
| Safari | `safaridriver` | ships with macOS; `sudo safaridriver --enable` once, then Safari ▸ Develop ▸ **Allow Remote Automation** | no headless mode; a window opens |
| Chromium | `chromedriver` | `npm run browsers:chromium` → `v2/.browsers/` | Google's Chrome for Testing build with a version-matched chromedriver; nothing in `/Applications`, no consumer Chrome. Homebrew's `chromium`/`chromedriver` casks are disabled (Gatekeeper, 2026-09). `CHROMIUM_BIN` / `CHROMEDRIVER_BIN` override. |

CI runs Firefox + Chromium on `ubuntu-latest` (both preinstalled; Firefox needs `pulseaudio --start` because the runner has no sound device and Firefox, unlike Chromium, will not `resume()` without one) and Safari on `macos-latest` after `sudo safaridriver --enable`. Failures surface as workflow annotations, readable with `gh api repos/1ps0/binaural/check-runs/<job>/annotations` when the raw log host is unreachable.

The page exposes `window.binaural = { AppState, AudioSystem, FrequencySystem, … , errors }` because top-level `const` bindings are not reachable from WebDriver's script sandbox or the console. Use it for debugging; never for production code paths.

## Domain notes

- Binaural beats need one tone per ear; anything below ~20 Hz as a pure tone is inaudible and must be a beat on a carrier.
- Firefox, Safari, and Chrome all block `AudioContext` creation or leave it `suspended` outside a user gesture. Create it inside the click.
- Background tabs throttle `setTimeout` to ≥1 s in every engine; audio-clock scheduling is immune.
- GitHub Pages serves no custom headers; `_headers` files are Netlify/Cloudflare syntax. `.nojekyll` is present so files are served as-is.
