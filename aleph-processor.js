/**
 * Aleph AudioWorklet Processor
 * Efficient implementation of Aleph mathematical pattern generation
 */

class AlephProcessor extends AudioWorkletProcessor {
    constructor() {
        super();

        // Configuration
        this.alephType = 'aleph-null';
        this.baseFrequency = 432;
        this.complexityFactor = 1.0;
        this.isActive = true;
        this.overrunDetected = false;
        this.oscillators = [];

        // Buffer monitoring
        this.bufferUsage = 0;
        this.bufferOverrunThreshold = 0.9;

        // Initialize oscillator configurations
        this.setupOscillators();

        // Listen for messages from main thread
        this.port.onmessage = (event) => {
            if (event.data.type === 'configure') {
                this.alephType = event.data.alephType;
                this.baseFrequency = event.data.baseFrequency;
                this.setupOscillators();
            } else if (event.data.type === 'reduceComplexity') {
                this.complexityFactor *= event.data.factor;
                this.setupOscillators();
            } else if (event.data.type === 'start') {
                this.isActive = true;
            } else if (event.data.type === 'stop') {
                this.isActive = false;
            }
        };
    }

    setupOscillators() {
        // Create oscillator configurations based on aleph type
        this.oscillators = [];

        switch(this.alephType) {
            case 'aleph-null':
                // Number of oscillators limited by complexity factor
                const count = Math.max(2, Math.floor(8 * this.complexityFactor));
                for (let i = 1; i <= count; i++) {
                    const phi = (1 + Math.sqrt(5)) / 2;
                    const freq = this.baseFrequency * (1 + (1/i) * phi);
                    const amp = 0.7 / i;
                    this.oscillators.push({ freq, amp, phase: 0 });
                }
                break;

            case 'aleph-one':
                // Using FM relationships
                const carrier = { freq: this.baseFrequency, amp: 0.7, phase: 0 };
                const modFreq = this.baseFrequency * (Math.PI / 2);
                const modIndex = 5 * this.complexityFactor; // Modulation index
                this.oscillators = [
                    carrier,
                    { freq: modFreq, amp: modIndex, phase: 0, isModulator: true, target: carrier }
                ];
                break;

            case 'aleph-two':
                // Power set pattern - more complex
                this.setupPowerSetPattern();
                break;

            default:
                // Simple fallback
                this.oscillators = [
                    { freq: this.baseFrequency, amp: 0.7, phase: 0 },
                    { freq: this.baseFrequency * 1.5, amp: 0.3, phase: 0 }
                ];
        }
    }

    setupPowerSetPattern() {
        // Create a layered pattern representing power sets
        this.oscillators = [];

        // Base frequency
        this.oscillators.push({ freq: this.baseFrequency, amp: 0.5, phase: 0 });

        // Prime number relationships
        const primes = [2, 3, 5, 7, 11, 13];
        const usablePrimes = Math.max(2, Math.floor(primes.length * this.complexityFactor));

        for (let i = 0; i < usablePrimes; i++) {
            for (let j = i + 1; j < usablePrimes; j++) {
                const ratio = primes[i] / primes[j];
                const freq = this.baseFrequency * ratio;
                const amp = 0.2 / ((i + 1) * (j + 1));

                this.oscillators.push({
                    freq,
                    amp,
                    phase: 0,
                    // Add slight stereo positioning
                    pan: (i % 2 === 0) ? -0.5 : 0.5
                });
            }
        }
    }

    process(inputs, outputs, parameters) {
        // Skip processing if not active
        if (!this.isActive) {
            return true;
        }

        const output = outputs[0];
        const bufferSize = output[0].length;

        // Reset buffer usage monitoring
        this.bufferUsage = 0;

        // Process each channel
        for (let channel = 0; channel < output.length; channel++) {
            const channelData = output[channel];

            // Clear output buffer
            channelData.fill(0);

            // Simple pattern processing for oscillators
            for (const osc of this.oscillators) {
                if (osc.isModulator) {
                    // Calculate modulator value and apply to target
                    for (let i = 0; i < bufferSize; i++) {
                        const modValue = osc.amp * Math.sin(osc.phase);
                        osc.target.freq = this.baseFrequency + modValue;
                        osc.phase += (2 * Math.PI * osc.freq) / sampleRate;
                    }
                } else {
                    // Standard oscillator output
                    let panFactor = 1.0;

                    // Apply panning if specified (simple stereo effect)
                    if (osc.pan !== undefined) {
                        // Left channel attenuation for right-panned sounds
                        if (channel === 0 && osc.pan > 0) {
                            panFactor = 1.0 - Math.abs(osc.pan);
                        }
                        // Right channel attenuation for left-panned sounds
                        else if (channel === 1 && osc.pan < 0) {
                            panFactor = 1.0 - Math.abs(osc.pan);
                        }
                    }

                    // Add oscillator output to channel data
                    for (let i = 0; i < bufferSize; i++) {
                        const sample = osc.amp * panFactor * Math.sin(osc.phase);
                        channelData[i] += sample;
                        osc.phase += (2 * Math.PI * osc.freq) / sampleRate;

                        // Detect if we're using too much buffer
                        if (Math.abs(channelData[i]) > this.bufferUsage) {
                            this.bufferUsage = Math.abs(channelData[i]);
                        }
                    }
                }

                // Keep phase in reasonable range to prevent floating point errors
                osc.phase %= (2 * Math.PI);
            }
        }

        // Monitor buffer usage and report overruns
        if (this.bufferUsage > this.bufferOverrunThreshold && !this.overrunDetected) {
            this.overrunDetected = true;
            this.port.postMessage({ type: 'bufferStatus', overrun: true });
        } else if (this.bufferUsage < this.bufferOverrunThreshold * 0.8 && this.overrunDetected) {
            this.overrunDetected = false;
            this.port.postMessage({ type: 'bufferStatus', overrun: false });
        }

        return true; // Keep processor running
    }
}

registerProcessor('aleph-processor', AlephProcessor);
