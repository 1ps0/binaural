/**
 * Carrier Module
 * Base audio generation module for standard oscillators
 */

// Initialize AudioModules namespace if it doesn't exist
if (!AudioSystem.AudioModules) {
    AudioSystem.AudioModules = {};
}

// Base audio module that all specific modules will extend
AudioSystem.AudioModules.BaseModule = class {
    constructor(ctx) {
        this.ctx = ctx;
        this.input = null;
        this.output = null;
    }

    connect(module) {
        if (this.output && module.input) {
            this.output.connect(module.input);
        }
        return module; // For chaining
    }

    disconnect() {
        if (this.output) {
            this.output.disconnect();
        }
    }

    start() {
        // Override in subclasses
        return this;
    }

    stop() {
        // Override in subclasses
        return this;
    }

    cleanup() {
        this.disconnect();
        return true;
    }
};

// Generates a base carrier frequency
AudioSystem.AudioModules.CarrierModule = class extends AudioSystem.AudioModules.BaseModule {
    constructor(ctx, frequency, type = 'sine') {
        super(ctx);
        this.oscillator = ctx.createOscillator();
        this.gain = ctx.createGain();

        this.oscillator.type = type;
        this.oscillator.frequency.value = frequency;
        this.gain.gain.value = 0; // Start silent

        this.oscillator.connect(this.gain);

        this.input = null; // No input as this is a source
        this.output = this.gain;
    }

    setFrequency(freq) {
        this.oscillator.frequency.value = freq;
        return this;
    }

    setVolume(vol, rampTime = 0.05) {
        const now = this.ctx.currentTime;
        this.gain.gain.cancelScheduledValues(now);
        this.gain.gain.setValueAtTime(this.gain.gain.value, now);
        this.gain.gain.linearRampToValueAtTime(vol, now + rampTime);
        return this;
    }

    start() {
        try {
            this.oscillator.start();
        } catch (e) {
            console.warn('Error starting oscillator:', e);
        }
        return this;
    }

    stop() {
        try {
            // Ramp down gain first to avoid clicks
            const now = this.ctx.currentTime;
            this.gain.gain.cancelScheduledValues(now);
            this.gain.gain.setValueAtTime(this.gain.gain.value, now);
            this.gain.gain.linearRampToValueAtTime(0, now + 0.05);

            // Schedule oscillator stop after gain ramp
            setTimeout(() => {
                try {
                    this.oscillator.stop();
                } catch (e) {
                    console.warn('Error stopping oscillator:', e);
                }
            }, 60);
        } catch (e) {
            console.warn('Error during carrier stop:', e);
            // Attempt immediate stop as fallback
            try {
                this.oscillator.stop();
            } catch (e) {
                console.warn('Error in fallback stop:', e);
            }
        }
        return this;
    }

    cleanup() {
        try {
            this.stop();
            this.disconnect();
            return true;
        } catch (e) {
            console.warn('Error during carrier cleanup:', e);
            return false;
        }
    }
};

// Export the modules if in a module environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BaseModule: AudioSystem.AudioModules.BaseModule,
        CarrierModule: AudioSystem.AudioModules.CarrierModule
    };
}
