/**
 * Application state. One object; each system mutates the slice it owns.
 */
const AppState = {
    audio: {
        context: null,
        // id → { sources, gain, stop(t), seq, spec }
        oscillators: {},
        masterGain: null,
        masterCompressor: null,
        volume: 0.2,
        isReady: false
    },
    ui: {
        theme: localStorage.getItem('theme')
            || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
        view: localStorage.getItem('view') || 'list'
    },
    frequencies: {
        pinned: [],
        filter: ''
    },
    performance: {
        maxSimultaneousTones: navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2 ? 3 : 6
    }
};
