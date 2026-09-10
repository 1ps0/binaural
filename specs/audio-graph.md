# Audio graph

Owner: `v2/src/js/audio/audio-system.js`. Tests: `v2/test/audio-system.test.js`, `v2/test/aleph.test.js`.

## Routing

```
source(s) ──▶ toneGain (0→1 fade) ──▶ masterGain (slider) ──▶ DynamicsCompressor ──▶ destination
```

- Level is applied exactly once, at `masterGain`. `toneGain` is an envelope (0→1 on start, 1→0 on stop), never a level. This is what lets the slider move every running tone and is why a tone started at slider 0 becomes audible when the slider moves.
- Binaural: two oscillators into a `ChannelMerger(2)`; left = carrier, right = carrier + beat. The merger feeds `toneGain`.
- Pattern: `AlephModule.output` feeds `toneGain`. The module has its own compressor so multi-oscillator sums do not clip before the master stage.
- Compressor settings: threshold −15 dB, knee 30, ratio 12, attack 3 ms, release 250 ms. It limits peaks; it is not a loudness safety.

## Context lifecycle

- Exactly one `AudioContext` per page. It is created lazily inside `startTone`, which runs inside the user's click, satisfying autoplay policy in Firefox, Safari, and Chrome. No probe contexts.
- `latencyHint: 'playback'`; sample rate is whatever the device reports.
- `resume()` before every start; `suspendIfIdle()` when the tab hides with nothing playing.
- `audioReady` is emitted once, on creation.

## Scheduling

- Every start and stop is scheduled on `context.currentTime`. `setTimeout` appears only to disconnect nodes after a fade has finished; nothing audible depends on a timer. Background tabs throttle timers to ≥1 s, which is what produced the old drift and overlap bugs.
- Fade length: 50 ms linear ramps in and out.
- Stop order: ramp `toneGain` to 0, stop sources at `now + fade + 10 ms`, delete the registry entry synchronously, disconnect the gain 100 ms later.

## Limits

- `AppState.performance.maxSimultaneousTones`: 6, or 3 when `navigator.hardwareConcurrency ≤ 2`. Exceeding it stops the oldest entry (by start sequence) and emits `resourceLimitReached`.
- No time-based cutoff. A sleep tone may run all night.

## Pattern algorithms (`AlephModule`)

| id | graph | constants |
|----|-------|-----------|
| `aleph-null` | 6 partials → gains → compressor | f_i = base·(1 + φ/i); a_i = 0.5/√(i+1); every third partial is a triangle wave |
| `aleph-one` | carrier + 4 FM modulators | carrier = base; modulators at base·{π/2, e/3, √2, √3/2}; deviation 20/(i+1) Hz |
| `aleph-two` | looped 3 s stereo `AudioBuffer` | sines at base·(p/q) for prime pairs p<q from {2,3,5,7,11}; right channel uses q/p; amplitudes weighted 1/((p+1)(q+1)) and normalised to 0.5 peak; 10 ms fade at both ends |

Buffers are rendered synchronously (≈1.6 M `Math.sin` calls at 48 kHz) and cached per `(base, sampleRate, seconds)`. A looping `AudioBufferSourceNode` runs indefinitely; it is never replaced during playback.

## Rejected

- Replacing the looped buffer source periodically "to prevent memory issues": the premise was false and the 50 ms overlap of phase-offset copies caused audible cancellation.
- `performance.memory` heuristics: Chrome-only, non-standard, and never reached its thresholds for a page using ~10 MB.
- AudioWorklet: removed in 2.0.1 for Safari compatibility; nothing here needs sample-accurate custom DSP.
