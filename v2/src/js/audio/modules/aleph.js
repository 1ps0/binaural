/**
 * Generated pattern synthesis. Three algorithms selected by pattern id.
 * Scheduling uses the AudioContext clock only.
 */
AudioSystem.AudioModules.BaseModule = class {
    constructor(ctx) {
        this.ctx = ctx;
        this.input = null;
        this.output = null;
    }
    connect(node) {
        if (this.output) this.output.connect(node.input || node);
        return node;
    }
    disconnect() {
        if (this.output) this.output.disconnect();
    }
};

AudioSystem.AudioModules.AlephModule = class extends AudioSystem.AudioModules.BaseModule {
    static get PATTERNS() {
        return ['aleph-null', 'aleph-one', 'aleph-two'];
    }

    static describe(pattern, base) {
        switch (pattern) {
            case 'aleph-null':
                return `Harmonic series: sine and triangle partials at ${base}·(1 + φ/i) Hz for i = 1…6, amplitude 0.5/√(i+1).`;
            case 'aleph-one':
                return `FM synthesis: ${base} Hz sine carrier; four modulators at ${base}·{π/2, e/3, √2, √3/2} Hz with 20/(i+1) Hz deviation.`;
            case 'aleph-two':
                return `Looped 3 s buffer: sines at ${base}·(p/q) Hz for prime pairs p<q from {2, 3, 5, 7, 11}; the ratio is inverted for the right channel.`;
            default:
                return '';
        }
    }

    constructor(ctx, pattern, baseFrequency = 200, { partials = 6 } = {}) {
        super(ctx);
        this.pattern = pattern;
        this.baseFrequency = baseFrequency;
        this.partials = partials;
        this.oscillators = []; // { osc, gain, role }
        this.bufferSource = null;
        this.compressor = null;
        this.output = ctx.createGain();
    }

    apply() {
        if (!this.constructor.PATTERNS.includes(this.pattern)) {
            throw new Error(`Unknown pattern "${this.pattern}"`);
        }
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.value = -15;
        this.compressor.knee.value = 30;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.25;
        this.compressor.connect(this.output);

        switch (this.pattern) {
            case 'aleph-null': this.buildHarmonicSeries(); break;
            case 'aleph-one': this.buildFM(); break;
            case 'aleph-two': this.buildPrimeRatioBuffer(); break;
        }
        return this;
    }

    buildHarmonicSeries() {
        const phi = (1 + Math.sqrt(5)) / 2;
        for (let i = 1; i <= this.partials; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = i % 3 === 0 ? 'triangle' : 'sine';
            osc.frequency.value = this.baseFrequency * (1 + phi / i);
            gain.gain.value = 0.5 / Math.sqrt(i + 1);
            osc.connect(gain);
            gain.connect(this.compressor);
            this.oscillators.push({ osc, gain, role: 'partial' });
        }
    }

    buildFM() {
        const carrier = this.ctx.createOscillator();
        const level = this.ctx.createGain();
        carrier.frequency.value = this.baseFrequency;
        level.gain.value = 0.7;
        carrier.connect(level);
        level.connect(this.compressor);
        this.oscillators.push({ osc: carrier, gain: level, role: 'carrier' });

        const ratios = [Math.PI / 2, Math.E / 3, Math.SQRT2, Math.sqrt(3) / 2];
        ratios.forEach((ratio, i) => {
            const modulator = this.ctx.createOscillator();
            const depth = this.ctx.createGain();
            modulator.frequency.value = this.baseFrequency * ratio;
            depth.gain.value = 20 / (i + 1);
            modulator.connect(depth);
            depth.connect(carrier.frequency);
            this.oscillators.push({ osc: modulator, gain: depth, role: 'modulator' });
        });
    }

    buildPrimeRatioBuffer() {
        const source = this.ctx.createBufferSource();
        source.buffer = this.constructor.primeRatioBuffer(this.ctx, this.baseFrequency, 3);
        source.loop = true;
        source.connect(this.compressor);
        this.bufferSource = source;
    }

    static primeRatioBuffer(ctx, base, seconds) {
        const key = `${base}@${ctx.sampleRate}x${seconds}`;
        const cache = this.bufferCache || (this.bufferCache = new Map());
        if (cache.has(key)) return cache.get(key);

        const sr = ctx.sampleRate;
        const n = Math.floor(sr * seconds);
        const buffer = ctx.createBuffer(2, n, sr);
        const L = buffer.getChannelData(0);
        const R = buffer.getChannelData(1);

        const primes = [2, 3, 5, 7, 11];
        const pairs = [];
        for (let p = 0; p < 3; p++) {
            for (let q = p + 1; q < Math.min(p + 3, primes.length); q++) {
                pairs.push([primes[p], primes[q], 1 / ((p + 1) * (q + 1))]);
            }
        }
        const weightSum = pairs.reduce((s, [, , w]) => s + w, 0);
        const scaled = pairs.map(([p, q, w]) => [p / q, q / p, 0.5 * w / weightSum]);

        const fade = Math.min(sr * 0.01, n * 0.1);
        const w0 = 2 * Math.PI * base / sr;
        for (let i = 0; i < n; i++) {
            let l = 0;
            let r = 0;
            for (const [lr, rr, amp] of scaled) {
                l += Math.sin(w0 * i * lr) * amp;
                r += Math.sin(w0 * i * rr) * amp;
            }
            const env = i < fade ? i / fade : (i > n - fade ? (n - i) / fade : 1);
            L[i] = l * env;
            R[i] = r * env;
        }
        cache.set(key, buffer);
        return buffer;
    }

    sources() {
        return this.bufferSource ? [this.bufferSource] : this.oscillators.map(o => o.osc);
    }

    start(t = this.ctx.currentTime) {
        if (this.bufferSource) {
            this.bufferSource.start(t);
            return this;
        }
        this.oscillators.forEach(({ osc }, i) => osc.start(t + i * 0.005));
        return this;
    }

    stop(t = this.ctx.currentTime) {
        if (this.bufferSource) this.bufferSource.stop(t);
        this.oscillators.forEach(({ osc }) => {
            try { osc.stop(t); } catch (e) { /* not started */ }
        });
        return this;
    }

    cleanup() {
        this.stop();
        this.oscillators.forEach(({ gain }) => gain.disconnect());
        if (this.bufferSource) this.bufferSource.disconnect();
        if (this.compressor) this.compressor.disconnect();
        this.output.disconnect();
        this.oscillators = [];
        this.bufferSource = null;
        return true;
    }
};
