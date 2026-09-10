# Roadmap

Status as of 2.2.0 (2026-09-10). Item numbers are stable so older references still resolve.
Verification: `cd v2 && npm run check` (tests, build, and a diff that fails if root `index.html` drifts from `v2/src`).

## Fixed in 2.2.0

| # | Item | Root cause → change |
|---|------|---------------------|
| 2, 14 | Control bar covers content when it wraps; search forces a new row | Content cleared the bar with a fixed 100 px margin. A ResizeObserver now publishes `--control-bar-height`; search gets its own row below 576 px. |
| 5, 18 | Firefox blocks Web Audio on the GitHub Pages host | Two AudioContexts were created per init (one to probe sample rate) and `_headers` / `_config.yml` COOP+COEP were never served by GitHub Pages (`curl -I` shows none). Single context, created inside the play click; inert files removed; `.nojekyll` added. Needs a live Firefox check after deploy. |
| 7 | Buffers overflow → standing / cancelling waves | Looped buffer sources were replaced every 0.8×duration with a phase-offset copy overlapping 50 ms. A looping `AudioBufferSourceNode` needs no replacement; the scheduler is gone. |
| 12 | Pattern buffers do not survive a tab change | Pattern start/stop/replacement used `setTimeout`, which background tabs throttle. Everything is scheduled on the AudioContext clock. |
| 13 | Only one pattern audibly works | UI passed `aleph-pattern-N`; the module only knew `aleph-null/one/two` and fell through to a fallback. Entries now carry `pattern`; unknown ids throw. The FM carrier also never had its frequency set (defaulted to 440 Hz). |
| 15 | Entries do not say whether they are beats or pure tones | Descriptions are generated from the spec: "Left 200 Hz, right 240 Hz. 40 Hz beat, gamma band (30–100 Hz)." |
| 19 | Tone started at volume 0 stays silent | Level was applied twice (per-tone gain × master, i.e. volume²) and the per-tone gain froze at press time. Per-tone gain is now a 0→1 fade; the slider drives master only. |
| 21 | Worklet-free path lags the UI | No longer applicable: the audio path contains no timers. |
| — | Tones stopped after 30 minutes | A "long-running tone" cleanup killed anything older than 30 min. Removed. |
| — | Pin on a pattern threw after a legacy pin migration | Pins are a flat id list; every earlier storage shape and every historical id normalises through `FrequencySystem.LEGACY_IDS`. |
| — | Section headings rendered as `Cognitive_enhancement Frequencies` | Titles come from `FrequencySystem.sections`. |
| — | "Audio system ready" toast on every play | Toast removed; `audioReady` fires once. |
| 22 | Real-browser smoke test | `npm run test:browser`: geckodriver + WebDriver over HTTP drives headless Firefox — load with zero errors, trusted click, `resume()` reaches `running`, `OfflineAudioContext` render measures 200/240 Hz per ear. Not in CI yet (needs a Firefox + geckodriver runner step). |
| — | Focus/scroll-into-view lands under the fixed control bar | `html { scroll-padding-bottom }` tied to `--control-bar-height`. Found by the WebDriver click on a low entry being intercepted. |

## Open

| # | Item | Notes |
|---|------|-------|
| 1 | Per-entry volume slider | Unblocked by the routing fix: each entry already owns a GainNode; needs a control and a `setToneGain(id, v)`. |
| 3, 4 | User-defined entries; import/export JSON | The catalog is a plain array of specs, so a user entry is one object. Needs UI and a `customEntries` localStorage slot. v1 had both; v2 dropped them. |
| 6, 9 | Visualisation of active frequencies | An AnalyserNode after the compressor plus a canvas. `.research/v3/visualization/` has a draft. |
| 10 | Oscillator registry / chaining | Unused module classes were removed; reintroduce when a second consumer exists. |
| 11 | Pattern complexity controls | `AlephModule` takes `{ partials }`; expose it. |
| 16 | Warbling / down-res while other audio plays | Not reproduced here. Suspects: OS mixer ducking, sample-rate switching on device change. Capture `context.sampleRate` and `baseLatency` in a debug panel first. |
| 17 | Closing the browser on mobile stops audio | Expected for a page. Background playback needs an `<audio>` element fed by a MediaStreamDestination plus the Media Session API, or a PWA. |
| 20 | Exclusive mode (switch tones instead of adding) | One flag in `startTone`: stop all before start. |
| 23 | Offline / installable | Manifest + service worker; the page already makes no network requests. |
| 24 | Keyboard shortcuts | Space toggles the focused entry; `/` focuses search; `Escape` already closes the modal. |
