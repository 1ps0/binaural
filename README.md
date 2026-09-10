# Binaural

A single-file web page that generates binaural beats, pure tones, and synthesized patterns with the Web Audio API. No network requests, no dependencies at runtime. Live at [1ps0.info/binaural](https://1ps0.info/binaural).

## What it plays

- **Binaural beats** — one sine per ear; the right ear is higher by the beat frequency (2 to 40 Hz on a 200 Hz carrier). Each entry states both ear frequencies and the EEG band the beat falls in. Headphones required.
- **Pure tones** — the solfeggio set (with its 1999 numerological provenance stated), 440 Hz ISO concert pitch, 432 Hz alternative pitch.
- **Generated patterns** — a φ-spaced harmonic series, an FM stack, and a looped prime-ratio buffer. Descriptions give the algorithm and constants.

Descriptions are generated from the synthesis parameters, so the text cannot disagree with the audio, and a test rejects effect-claim vocabulary anywhere in the catalog.

## Use

Open `index.html` in any current browser (Firefox, Safari, Chrome, Edge; desktop or mobile), or save it and open it from disk. Up to six entries play at once; the slider sets the level for all of them. Pins persist in the browser.

## Develop

```sh
cd v2
npm install
npm test          # node --test, 30 tests with a fake AudioContext
npm run build     # v2/src → v2/dist/index.html
npm run deploy    # build, then copy to ../index.html (the served file)
npm run check     # test + deploy + fail if root index.html drifts from src
```

`v2/src` is the source of truth. `v2/dist/index.html` and the root `index.html` are build outputs committed for GitHub Pages; CI fails if they are stale.

```
v2/src/
├── index.html                 template with STYLES/SCRIPTS placeholders
├── styles/{base,components,responsive}.css
└── js/
    ├── core/{state,events,theme}.js
    ├── data/frequency-system.js   catalog, describe(), pins, legacy id map
    ├── audio/audio-system.js      AudioContext, routing, start/stop
    ├── audio/modules/aleph.js     pattern algorithms
    ├── ui/{components,ui-system}.js
    └── main.js
```

Specs: [specs/audio-graph.md](specs/audio-graph.md), [specs/frequency-catalog.md](specs/frequency-catalog.md). Status: [docs/overview.md](docs/overview.md). Open work: [ROADMAP.md](ROADMAP.md). History: [CHANGELOG.md](CHANGELOG.md).

## Older versions

`v1/` is the previous single-file app (reachable from the banner). `v0.0.1/binaural.sh` is a SoX shell script. The `v3` branch holds an unfinished program/sequence system.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Every change lands with a test; run `npm run check` before pushing.

## License

MIT — see [LICENSE](LICENSE).
