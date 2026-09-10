# binaural — state of play

Updated 2026-09-10. `v2.2` and `main` are identical at 2.2.1 and pushed; GitHub Pages (source: `main`, `/`) serves 2.2.1 at https://1ps0.info/binaural. [ran: curl → version-info 2.2.1; banner links 2.0.2 and v1]

## What is real

- **One product, one build.** `v2/src` → `node build.js` → `v2/dist/index.html` → `--deploy` copies to root `index.html`, the file GitHub Pages serves. Root and dist are byte-identical. [ran: diff -q → identical]
- **Tests exist and pass.** 30 `node:test` cases load the production bundle order into a `vm` context with a fake `AudioContext` that records the graph. [ran: node --test → 30 pass, 0 fail]
- **CI is green on all three engines.** `check` (Node 24: `npm ci`, 30 tests, deploy, drift gate), `browsers-linux` (Firefox 155 + HeadlessChrome 152 over WebDriver, PulseAudio null sink for Firefox), `browsers-safari` (Safari 26.6.2 on macos-latest). Each browser: page loads with zero errors, trusted click → `AudioContext` `running`, offline render 199.5 / 239.5 Hz per ear. [ran: gh run view 34524579132 → all jobs success; annotations read via API]
- **Firefox and Chromium run it.** `npm run test:browser` drives each engine over plain WebDriver: 3 sections, 21 play buttons, 0 runtime errors; a trusted click registers the entry and `AudioContext.resume()` settles to `running` with `userActivation.hasBeenActive === true`; an `OfflineAudioContext` render of the binaural graph measures 199.5 / 239.5 Hz per ear by zero-crossing. Firefox 152 via geckodriver 0.35; HeadlessChrome 153 via a project-local Chrome for Testing + chromedriver pair (`v2/.browsers`, gitignored, ~380 MB). [ran: node browser-tests/smoke.mjs --browser=chromium,firefox → PASS, PASS] Firefox screenshots at 1280×900 and 390×844 inspected. [ran: firefox --headless --screenshot]
- **Safari locally needs one toggle.** `safaridriver` is enabled but session creation on this Mac returns "You must enable the 'Allow Remote Automation' option in Safari's Develop menu". Flip it once, then `node browser-tests/smoke.mjs --browser=safari`. In CI Safari passes. [ran: local smoke → that message; CI → PASS safari]
- **Bundle is 76 KB unminified** (was 165 KB). [ran: wc -c]

## Live site

2.2.1 is live. The previous production build is preserved at `v2.0.2/index.html` (the exact pre-rewrite file) and linked from the banner alongside `v1/`; the banner's dismissal is keyed per release.

## Where things live

| path | role |
|------|------|
| `v2/src/js/data/frequency-system.js` | catalog, `describe()`, pins, `LEGACY_IDS` |
| `v2/src/js/audio/audio-system.js` | context, routing, start/stop, limit |
| `v2/src/js/audio/modules/aleph.js` | three pattern algorithms |
| `v2/src/js/ui/{components,ui-system}.js` | icons, toasts, rendering, DOM events |
| `v2/test/` | `harness.js` (vm sandbox), `fake-audio.js`, four test files |
| `specs/` | audio-graph, frequency-catalog — durable invariants |
| `ROADMAP.md` | fixed / open items with root causes |

## Decisions made in this pass (rationale in specs/)

- Level applied once at `masterGain`; per-tone gain is an envelope. Fixes volume² and frozen-at-zero tones.
- Sections are by synthesis type (beats / tones / patterns), not by claimed purpose. Purpose words survive only as hidden search tags.
- Descriptions are generated from the spec; a test rejects effect vocabulary.
- Unused module classes (Carrier, Binaural, Solfeggio) deleted; `AudioSystem.buildBinaural` is the binaural implementation. Reintroduce a module layer when a second consumer exists.
- `_headers`, `_config.yml` removed; `.nojekyll` added. GitHub Pages served no COOP/COEP headers. [ran: curl -sI → server: GitHub.com, no cross-origin headers]
- Jekyll is off; nothing in the repo used Liquid or front matter.

## Not verified here

- Live Firefox behaviour on the host after deploy. Local headless Firefox creates and runs the context on a trusted click; the historical failures were host-side (headers/Jekyll) and those files are gone.
- ROADMAP #16 (warbling with other audio) — no reproduction.
- Audible quality of the three patterns; the tests check graph shape and buffer range, not sound.
- Safari smoke on this Mac (see above); CI covers it.

## Loose ends in the working tree

- `v3/` (untracked) differs from the `v3` branch in every shared file [ran: diff]; it holds work newer than `878677c` and is unbuildable (11 of 22 inputs missing). Left untouched. Decide: stash onto the `v3` branch, or delete.
- `.cursorrules` retired into `AGENTS.md` (imported by `CLAUDE.md`); the original is kept in the session scratchpad only.
- `v1/` and `v0.0.1/` frozen.
