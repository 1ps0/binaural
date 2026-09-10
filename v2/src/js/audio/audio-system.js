/**
 * Web Audio graph owner.
 *
 * Routing: source(s) → per-tone gain (0→1 fade) → masterGain (slider) → compressor → destination.
 * Level is applied once, at masterGain, so the slider moves every running tone.
 * All timing is on the AudioContext clock; setTimeout is used only to release nodes after a fade.
 */
const AudioSystem = {
    FADE: 0.05,
    seq: 0,

    init() {
        if (AppState.audio.context) return AppState.audio.isReady;
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) {
            EventSystem.emit('audioError', { message: 'This browser does not expose the Web Audio API.' });
            return false;
        }
        try {
            let context;
            try {
                context = new Ctor({ latencyHint: 'playback' });
            } catch (e) {
                context = new Ctor();
            }
            const masterGain = context.createGain();
            masterGain.gain.value = AppState.audio.volume;

            let compressor;
            try {
                compressor = context.createDynamicsCompressor();
                compressor.threshold.value = -15;
                compressor.knee.value = 30;
                compressor.ratio.value = 12;
                compressor.attack.value = 0.003;
                compressor.release.value = 0.25;
            } catch (e) {
                compressor = context.createGain();
            }
            masterGain.connect(compressor);
            compressor.connect(context.destination);

            AppState.audio.context = context;
            AppState.audio.masterGain = masterGain;
            AppState.audio.masterCompressor = compressor;
            AppState.audio.isReady = true;
            this.resume();
            EventSystem.emit('audioReady');
            return true;
        } catch (error) {
            EventSystem.emit('audioError', { message: 'Could not start the audio system.', error });
            return false;
        }
    },

    resume() {
        const ctx = AppState.audio.context;
        if (ctx && ctx.state === 'suspended' && typeof ctx.resume === 'function') {
            ctx.resume().catch(() => {});
        }
    },

    suspendIfIdle() {
        const ctx = AppState.audio.context;
        if (ctx && ctx.state === 'running' && this.activeIds().length === 0 && typeof ctx.suspend === 'function') {
            ctx.suspend().catch(() => {});
        }
    },

    activeIds() {
        return Object.keys(AppState.audio.oscillators);
    },

    /**
     * spec: { type: 'tone', frequency }
     *     | { type: 'binaural', frequency (beat Hz), carrierFrequency }
     *     | { type: 'pattern', pattern, baseFrequency }
     */
    startTone(id, spec) {
        if (!this.init()) return false;
        this.resume();
        if (AppState.audio.oscillators[id]) this.stopTone(id);
        this.enforceLimit();

        const ctx = AppState.audio.context;
        try {
            const gain = ctx.createGain();
            gain.gain.value = 0;
            gain.connect(AppState.audio.masterGain);

            let built;
            switch (spec.type) {
                case 'tone': built = this.buildTone(ctx, spec, gain); break;
                case 'binaural': built = this.buildBinaural(ctx, spec, gain); break;
                case 'pattern': built = this.buildPattern(ctx, spec, gain); break;
                default: throw new Error(`Unknown tone type "${spec.type}"`);
            }

            const now = ctx.currentTime;
            built.start(now);
            this.ramp(gain.gain, 1, now);

            AppState.audio.oscillators[id] = { sources: built.sources, gain, stop: built.stop, seq: this.seq++, spec };
            EventSystem.emit('toneStarted', { id, spec });
            return true;
        } catch (error) {
            console.error(`startTone(${id}) failed:`, error);
            EventSystem.emit('audioError', { message: `Could not start ${id}.`, error });
            return false;
        }
    },

    buildTone(ctx, { frequency, wave = 'sine' }, out) {
        const osc = ctx.createOscillator();
        osc.type = wave;
        osc.frequency.value = frequency;
        osc.connect(out);
        return { sources: [osc], start: t => osc.start(t), stop: t => osc.stop(t) };
    },

    buildBinaural(ctx, { frequency, carrierFrequency = 200, wave = 'sine' }, out) {
        const merger = ctx.createChannelMerger(2);
        const left = ctx.createOscillator();
        const right = ctx.createOscillator();
        left.type = wave;
        right.type = wave;
        left.frequency.value = carrierFrequency;
        right.frequency.value = carrierFrequency + frequency;
        left.connect(merger, 0, 0);
        right.connect(merger, 0, 1);
        merger.connect(out);
        return {
            sources: [left, right],
            start: t => { left.start(t); right.start(t); },
            stop: t => { left.stop(t); right.stop(t); }
        };
    },

    buildPattern(ctx, { pattern, baseFrequency = 200 }, out) {
        const module = new this.AudioModules.AlephModule(ctx, pattern, baseFrequency);
        module.apply();
        module.output.connect(out);
        return { sources: module.sources(), start: t => module.start(t), stop: t => module.stop(t) };
    },

    stopTone(id) {
        const entry = AppState.audio.oscillators[id];
        if (!entry) return false;
        const ctx = AppState.audio.context;
        const now = ctx.currentTime;
        this.ramp(entry.gain.gain, 0, now);
        try {
            entry.stop(now + this.FADE + 0.01);
        } catch (e) {
            // already stopped
        }
        delete AppState.audio.oscillators[id];
        setTimeout(() => {
            try { entry.gain.disconnect(); } catch (e) { /* detached */ }
        }, (this.FADE + 0.1) * 1000);
        EventSystem.emit('toneStopped', { id });
        return true;
    },

    stopAll() {
        this.activeIds().forEach(id => this.stopTone(id));
        EventSystem.emit('allTonesStopped');
    },

    enforceLimit() {
        const max = AppState.performance.maxSimultaneousTones;
        const ordered = this.activeIds()
            .map(id => [id, AppState.audio.oscillators[id].seq])
            .sort((a, b) => a[1] - b[1]);
        while (ordered.length >= max) {
            const [id] = ordered.shift();
            this.stopTone(id);
            EventSystem.emit('resourceLimitReached', {
                id,
                message: `Limit of ${max} simultaneous tones reached; the oldest tone was stopped.`
            });
        }
    },

    setVolume(value) {
        const v = Math.max(0, Math.min(1, Number(value) || 0));
        AppState.audio.volume = v;
        if (AppState.audio.masterGain) {
            this.ramp(AppState.audio.masterGain.gain, v, AppState.audio.context.currentTime);
        }
        EventSystem.emit('volumeChanged', v);
        return true;
    },

    ramp(param, target, now, duration = this.FADE) {
        param.cancelScheduledValues(now);
        param.setValueAtTime(param.value, now);
        param.linearRampToValueAtTime(target, now + duration);
    },

    formatFrequency(hz) {
        if (hz === null || hz === undefined) return '—';
        return `${parseFloat(Number(hz).toFixed(2))} Hz`;
    },

    cleanup() {
        this.stopAll();
        const ctx = AppState.audio.context;
        if (ctx && typeof ctx.close === 'function') ctx.close().catch(() => {});
        AppState.audio.context = null;
        AppState.audio.masterGain = null;
        AppState.audio.masterCompressor = null;
        AppState.audio.isReady = false;
    }
};

AudioSystem.AudioModules = {};
