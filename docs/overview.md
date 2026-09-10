# binaural — state of play

Updated 2026-09-10 on branch `v2.2`, after the 2.2.0 rewrite, committed locally and not yet pushed.

## What is real

- **One product, one build.** `v2/src` → `node build.js` → `v2/dist/index.html` → `--deploy` copies to root `index.html`, the file GitHub Pages serves. Root and dist are byte-identical. [ran: diff -q → identical]
- **Tests exist and pass.** 30 `node:test` cases load the production bundle order into a `vm` context with a fake `AudioContext` that records the graph. [ran: node --test → 30 pass, 0 fail]
- **CI guards drift.** `.github/workflows/ci.yml` runs test, deploy, and fails if root `index.html` or `v2/dist` differ from what `v2/src` builds. Not yet exercised (needs a push).
- **Firefox renders it.** Headless Firefox screenshots at 1280×900 and 390×844 show initialised sections, generated descriptions, SVG icons, dark theme. [ran: firefox --headless --screenshot → 2 PNGs, inspected]
- **Bundle is 76 KB unminified** (was 165 KB). [ran: wc -c]

## What the live site shows until the next push

`https://1ps0.info/binaural` still serves 2.0.2 with "Healing & Wellbeing" sections. [src: fetched 2026-08-18] Nothing here is public until `git push`.

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

- Live Firefox behaviour on the host after deploy. Headless local render passed; the historical failures were host-side.
- ROADMAP #16 (warbling with other audio) — no reproduction.
- Audible quality of the three patterns; the tests check graph shape and buffer range, not sound.
- The `npm ci` step in CI against the re-synced lockfile.

## Loose ends in the working tree

- `v3/` (untracked) differs from the `v3` branch in every shared file [ran: diff]; it holds work newer than `878677c` and is unbuildable (11 of 22 inputs missing). Left untouched. Decide: stash onto the `v3` branch, or delete.
- `.cursorrules` (untracked) is a personal file; not added.
- `v1/` and `v0.0.1/` frozen.
