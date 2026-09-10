/**
 * Frequency catalog and pin storage.
 *
 * Every entry is a synthesis spec that AudioSystem.startTone accepts as-is.
 * Descriptions are derived from the numbers so text and audio cannot disagree.
 * Tags are search aliases only and are never rendered.
 */
const FrequencySystem = {
    sections: {
        binaural: {
            title: 'Binaural beats',
            description: 'One sine tone per ear at slightly different frequencies; the difference is the beat frequency. Stereo headphones required.'
        },
        tones: {
            title: 'Pure tones',
            description: 'Single sine oscillators at fixed frequencies, listed with the origin of each value.'
        },
        patterns: {
            title: 'Generated patterns',
            description: 'Multi-oscillator and buffer synthesis. Each entry states its algorithm.'
        }
    },

    // [name, low Hz inclusive, high Hz exclusive]. Boundaries follow common EEG convention; sources vary.
    bands: [
        ['delta', 0.5, 4],
        ['theta', 4, 8],
        ['alpha', 8, 12],
        ['beta', 12, 30],
        ['gamma', 30, 100]
    ],

    data: {
        binaural: [
            { id: 'beat-2hz', type: 'binaural', title: '2 Hz beat', frequency: 2, carrierFrequency: 200, tags: ['delta', 'sleep', 'slow-wave'] },
            { id: 'beat-3.5hz', type: 'binaural', title: '3.5 Hz beat', frequency: 3.5, carrierFrequency: 200, tags: ['delta', 'sleep'] },
            { id: 'beat-4.5hz', type: 'binaural', title: '4.5 Hz beat', frequency: 4.5, carrierFrequency: 200, tags: ['theta', 'meditation'] },
            { id: 'beat-6hz', type: 'binaural', title: '6 Hz beat', frequency: 6, carrierFrequency: 200, tags: ['theta', 'meditation', 'creative'] },
            {
                id: 'beat-7.83hz', type: 'binaural', title: '7.83 Hz beat', frequency: 7.83, carrierFrequency: 200, tags: ['theta', 'schumann'],
                note: '7.83 Hz is the first Schumann resonance mode of the Earth–ionosphere cavity. Used here only as a beat frequency.'
            },
            { id: 'beat-10hz', type: 'binaural', title: '10 Hz beat', frequency: 10, carrierFrequency: 200, tags: ['alpha', 'relaxation', 'calm'] },
            { id: 'beat-15hz', type: 'binaural', title: '15 Hz beat', frequency: 15, carrierFrequency: 200, tags: ['beta', 'focus', 'flow'] },
            { id: 'beat-40hz', type: 'binaural', title: '40 Hz beat', frequency: 40, carrierFrequency: 200, tags: ['gamma', 'focus', 'attention'] }
        ],
        tones: [
            { id: 'tone-174hz', type: 'tone', title: '174 Hz', frequency: 174, series: 'solfeggio', tags: ['solfeggio'], note: 'Extended solfeggio set (added after the original six).' },
            { id: 'tone-396hz', type: 'tone', title: '396 Hz', frequency: 396, series: 'solfeggio', tags: ['solfeggio', 'ut'], note: 'Solfeggio set, syllable Ut.' },
            { id: 'tone-417hz', type: 'tone', title: '417 Hz', frequency: 417, series: 'solfeggio', tags: ['solfeggio', 're'], note: 'Solfeggio set, syllable Re.' },
            { id: 'tone-432hz', type: 'tone', title: '432 Hz', frequency: 432, series: 'pitch', tags: ['a4', 'concert pitch', 'verdi'], note: 'A4 at 432 Hz, an alternative concert pitch. ISO 16 standard A4 is 440 Hz.' },
            { id: 'tone-440hz', type: 'tone', title: '440 Hz', frequency: 440, series: 'pitch', tags: ['a4', 'concert pitch', 'reference'], note: 'A4 concert pitch (ISO 16). Reference tone.' },
            { id: 'tone-528hz', type: 'tone', title: '528 Hz', frequency: 528, series: 'solfeggio', tags: ['solfeggio', 'mi'], note: 'Solfeggio set, syllable Mi.' },
            { id: 'tone-639hz', type: 'tone', title: '639 Hz', frequency: 639, series: 'solfeggio', tags: ['solfeggio', 'fa'], note: 'Solfeggio set, syllable Fa.' },
            { id: 'tone-741hz', type: 'tone', title: '741 Hz', frequency: 741, series: 'solfeggio', tags: ['solfeggio', 'sol'], note: 'Solfeggio set, syllable Sol.' },
            { id: 'tone-852hz', type: 'tone', title: '852 Hz', frequency: 852, series: 'solfeggio', tags: ['solfeggio', 'la'], note: 'Solfeggio set, syllable La.' },
            { id: 'tone-963hz', type: 'tone', title: '963 Hz', frequency: 963, series: 'solfeggio', tags: ['solfeggio', 'si'], note: 'Extended solfeggio set, syllable Si.' }
        ],
        patterns: [
            { id: 'pattern-harmonic-series', type: 'pattern', title: 'Harmonic series', frequency: null, pattern: 'aleph-null', baseFrequency: 200, tags: ['aleph', 'harmonic', 'golden ratio', 'partials'] },
            { id: 'pattern-fm', type: 'pattern', title: 'FM stack', frequency: null, pattern: 'aleph-one', baseFrequency: 200, tags: ['aleph', 'fm', 'modulation'] },
            { id: 'pattern-prime-ratios', type: 'pattern', title: 'Prime ratio loop', frequency: null, pattern: 'aleph-two', baseFrequency: 200, tags: ['aleph', 'prime', 'buffer', 'loop'] }
        ]
    },

    // Ids used by earlier catalogs (v1, v2.0.x live site, undeployed v2.1) → current ids, so stored pins survive.
    LEGACY_IDS: {
        'deep-focus-40hz': 'beat-40hz', 'gamma-focus-40hz': 'beat-40hz',
        'flow-state-15hz': 'beat-15hz', 'beta-concentration-15hz': 'beat-15hz',
        'calm-clarity-10hz': 'beat-10hz', 'alpha-focus-10hz': 'beat-10hz',
        'mindful-presence-7.83hz': 'beat-7.83hz', 'schumann-7.83hz': 'beat-7.83hz',
        'deep-meditation-6hz': 'beat-6hz', 'theta-creativity-6hz': 'beat-6hz',
        'creative-insight-4.5hz': 'beat-4.5hz', 'theta-insight-4.5hz': 'beat-4.5hz',
        'twilight-3.5hz': 'beat-3.5hz', 'delta-deep-3.5hz': 'beat-3.5hz',
        'deep-sleep-2hz': 'beat-2hz', 'delta-sleep-2hz': 'beat-2hz',
        'pain-relief-174hz': 'tone-174hz', 'low-frequency-174hz': 'tone-174hz',
        'emotional-release-396hz': 'tone-396hz', 'solfeggio-396hz': 'tone-396hz', 'solfeggio-396hz-alt': 'tone-396hz',
        'peaceful-mind-417hz': 'tone-417hz', 'solfeggio-417hz': 'tone-417hz',
        'stress-relief-432hz': 'tone-432hz', 'solfeggio-432hz': 'tone-432hz',
        'cellular-harmony-528hz': 'tone-528hz', 'solfeggio-528hz': 'tone-528hz',
        'relationship-healing-639hz': 'tone-639hz', 'sleep-harmony-639hz': 'tone-639hz', 'solfeggio-639hz': 'tone-639hz', 'solfeggio-639hz-alt': 'tone-639hz',
        'negativity-741hz': 'tone-741hz', 'solfeggio-741hz': 'tone-741hz',
        'intuition-852hz': 'tone-852hz', 'mental-clarity-852hz': 'tone-852hz', 'solfeggio-852hz': 'tone-852hz', 'solfeggio-852hz-alt': 'tone-852hz',
        'spiritual-connection-963hz': 'tone-963hz', 'solfeggio-963hz': 'tone-963hz', 'solfeggio-963hz-alt': 'tone-963hz',
        'aleph-null': 'pattern-harmonic-series', 'aleph-zero': 'pattern-harmonic-series', 'aleph-focus': 'pattern-harmonic-series', 'aleph-pattern-1': 'pattern-harmonic-series',
        'aleph-one': 'pattern-fm', 'aleph-infinity': 'pattern-fm', 'aleph-pattern-2': 'pattern-fm',
        'aleph-two': 'pattern-prime-ratios', 'aleph-integration': 'pattern-prime-ratios', 'aleph-dreams': 'pattern-prime-ratios',
        'unified-field-infinity': 'pattern-prime-ratios', 'unified': 'pattern-prime-ratios', 'aleph-pattern-3': 'pattern-prime-ratios'
    },

    init() {
        this.loadPinnedFrequencies();
    },

    all() {
        return Object.values(this.data).flat();
    },

    getFrequencies(section) {
        return this.data[section] || [];
    },

    getFrequency(id) {
        return this.all().find(f => f.id === id) || null;
    },

    bandOf(hz) {
        const band = this.bands.find(([, lo, hi]) => hz >= lo && hz < hi);
        return band ? band[0] : null;
    },

    bandRange(name) {
        const band = this.bands.find(([n]) => n === name);
        return band ? `${band[1]}–${band[2]} Hz` : '';
    },

    describe(f) {
        switch (f.type) {
            case 'binaural': {
                const right = +(f.carrierFrequency + f.frequency).toFixed(2);
                const band = this.bandOf(f.frequency);
                const bandText = band ? `, ${band} band (${this.bandRange(band)})` : '';
                return `Left ${f.carrierFrequency} Hz, right ${right} Hz. ${f.frequency} Hz beat${bandText}.`;
            }
            case 'tone':
                return `Single sine tone at ${f.frequency} Hz.`;
            case 'pattern':
                return AudioSystem.AudioModules.AlephModule.describe(f.pattern, f.baseFrequency);
            default:
                return '';
        }
    },

    badge(f) {
        if (f.type === 'binaural') {
            const band = this.bandOf(f.frequency);
            return band ? { label: band, detail: this.bandRange(band) } : null;
        }
        if (f.type === 'tone') {
            if (f.series === 'solfeggio') return { label: 'solfeggio', detail: '' };
            if (f.series === 'pitch') return { label: 'concert pitch', detail: '' };
            return null;
        }
        if (f.type === 'pattern') return { label: 'pattern', detail: f.pattern };
        return null;
    },

    searchText(f) {
        const band = f.type === 'binaural' ? this.bandOf(f.frequency) : '';
        return [f.title, this.describe(f), f.note, band, f.type, f.series, f.pattern, f.frequency, ...(f.tags || [])]
            .filter(v => v !== null && v !== undefined && v !== '')
            .join(' ')
            .toLowerCase();
    },

    searchFrequencies(query) {
        const q = String(query || '').toLowerCase().trim();
        if (!q) return this.all();
        return this.all().filter(f => this.searchText(f).includes(q));
    },

    // Accepts any shape earlier versions stored and returns known ids, deduplicated.
    normalizePinned(raw) {
        let ids = [];
        if (Array.isArray(raw)) ids = raw;
        else if (raw && typeof raw === 'object') ids = Object.values(raw).flat();
        const known = new Set(this.all().map(f => f.id));
        const out = [];
        for (let id of ids) {
            if (typeof id !== 'string') continue;
            if (this.LEGACY_IDS[id]) id = this.LEGACY_IDS[id];
            if (known.has(id) && !out.includes(id)) out.push(id);
        }
        return out;
    },

    isPinned(id) {
        return AppState.frequencies.pinned.includes(id);
    },

    pinFrequency(id) {
        if (!this.getFrequency(id) || this.isPinned(id)) return false;
        AppState.frequencies.pinned.push(id);
        this.savePinnedFrequencies();
        EventSystem.emit('pinsUpdated', AppState.frequencies.pinned);
        return true;
    },

    unpinFrequency(id) {
        const index = AppState.frequencies.pinned.indexOf(id);
        if (index < 0) return false;
        AppState.frequencies.pinned.splice(index, 1);
        this.savePinnedFrequencies();
        EventSystem.emit('pinsUpdated', AppState.frequencies.pinned);
        return true;
    },

    togglePin(id) {
        return this.isPinned(id) ? this.unpinFrequency(id) : this.pinFrequency(id);
    },

    unpinAll() {
        AppState.frequencies.pinned = [];
        this.savePinnedFrequencies();
        EventSystem.emit('pinsUpdated', AppState.frequencies.pinned);
    },

    getPinnedFrequencies() {
        return AppState.frequencies.pinned.map(id => this.getFrequency(id)).filter(Boolean);
    },

    savePinnedFrequencies() {
        try {
            localStorage.setItem('pinnedFrequencies', JSON.stringify(AppState.frequencies.pinned));
        } catch (e) {
            console.warn('Could not save pins:', e);
        }
    },

    loadPinnedFrequencies() {
        let raw = null;
        try {
            raw = JSON.parse(localStorage.getItem('pinnedFrequencies'));
        } catch (e) {
            raw = null;
        }
        AppState.frequencies.pinned = this.normalizePinned(raw);
    }
};
