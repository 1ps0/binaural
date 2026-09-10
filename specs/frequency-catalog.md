# Frequency catalog

Owner: `v2/src/js/data/frequency-system.js`. Tests: `v2/test/frequency-system.test.js`.

## Model

Three sections, by what is synthesised, rendered in this order:

| key | title | entry type |
|-----|-------|------------|
| `binaural` | Binaural beats | `binaural` |
| `tones` | Pure tones | `tone` |
| `patterns` | Generated patterns | `pattern` |

An entry is the spec `AudioSystem.startTone(id, entry)` plays. Fields:

| field | binaural | tone | pattern |
|-------|----------|------|---------|
| `id` | stable string; see id policy | ✓ | ✓ |
| `type` | `'binaural'` | `'tone'` | `'pattern'` |
| `title` | short, numeric first ("40 Hz beat", "528 Hz", "FM stack") | | |
| `frequency` | beat Hz | tone Hz | `null` |
| `carrierFrequency` | left-ear Hz (200) | — | — |
| `pattern` | — | — | one of `AlephModule.PATTERNS` |
| `baseFrequency` | — | — | Hz (200) |
| `series` | — | `'solfeggio'` \| `'pitch'` | — |
| `note` | optional provenance sentence | | |
| `tags` | search aliases, never rendered | | |

## Language policy

- The description is **generated** by `describe(entry)` from the numbers: "Left 200 Hz, right 240 Hz. 40 Hz beat, gamma band (30–100 Hz)." / "Single sine tone at 528 Hz." / the algorithm text from `AlephModule.describe`. Text cannot disagree with audio.
- `note` carries provenance only: where the number comes from (Schumann mode, solfeggio syllable, ISO 16 pitch). It never states an effect.
- Band names are EEG nomenclature applied to the beat frequency: delta 0.5–4, theta 4–8, alpha 8–12, beta 12–30, gamma 30–100 Hz. Boundaries vary by source; ours are fixed in `bands`.
- Effect vocabulary (heal, enhance, optimise, DNA, cortisol, "research indicates", …) is rejected by a test over every title, description, note, and section.
- Purpose words ("sleep", "focus") live only in `tags` so search still finds them.

## Constraints enforced by tests

- No two entries share `(type, frequency, carrier, pattern)`.
- Anything below 20 Hz is a binaural beat with an audible carrier (a 7.83 Hz pure tone is inaudible).
- Every pattern entry names a pattern the module implements, and the three are distinct.
- Section titles contain no underscore (they are display strings, not keys).

## Id policy and pins

- Ids are `beat-<hz>hz`, `tone-<hz>hz`, `pattern-<name>`. Changing an id requires adding the old one to `LEGACY_IDS`.
- Pins are stored as a flat JSON array of ids under `localStorage.pinnedFrequencies`. `normalizePinned()` accepts every earlier shape (per-category objects from v1/v2.0/v2.1, arrays, garbage) and maps historical ids through `LEGACY_IDS`, dropping unknowns. It never throws.

## Provenance of the values

- Solfeggio set: 396, 417, 528, 639, 741, 852 Hz published by Puleo and Horowitz (1999) from a numerological reading of Numbers 7:12–83; 174 and 963 added later. Not derived from a tuning system; no controlled evidence of a specific physiological effect. The app lists them as tones with that provenance.
- 440 Hz: ISO 16 concert pitch. 432 Hz: alternative concert pitch.
- 7.83 Hz: first Schumann resonance mode of the Earth–ionosphere cavity; used only as a beat frequency.
- Beat frequencies 2–40 Hz: chosen to land one in each EEG band with the historically popular values kept (2, 3.5, 4.5, 6, 7.83, 10, 15, 40).
