/**
 * Aleph Module
 * Implements complex mathematical pattern generation based on aleph infinity concepts
 */

// Creates Aleph pattern variations based on set theory infinity concepts
AudioSystem.AudioModules.AlephModule = class extends AudioSystem.AudioModules.BaseModule {
    constructor(ctx, alephType = 'aleph-null') {
        super(ctx);
        this.alephType = alephType;
        this.oscillators = [];
        
        // Create master input/output
        this.input = ctx.createGain();
        this.output = ctx.createGain();
        
        // Will be populated with oscillators when applied
        this.workletNode = null;
        this.workletLoaded = false;
        this.bufferSource = null;
        this.carrierRef = null;
        this.baseFrequency = 432; // Default if no carrier
    }
    
    // Initialize AudioWorklet if supported
    async initWorklet() {
        if (!window.AudioWorklet) {
            console.log('AudioWorklet not supported, using fallback implementation');
            return false;
        }
        
        try {
            // Check if there's a promise for this worklet already in progress
            if (!AudioSystem.workletPromises['aleph-processor']) {
                // Create a new promise for this worklet
                AudioSystem.workletPromises['aleph-processor'] = this.ctx.audioWorklet.addModule('aleph-processor.js')
                    .then(() => {
                        AudioSystem.workletModulesLoaded = true;
                        return true;
                    })
                    .catch(err => {
                        console.error('Failed to load AudioWorklet:', err);
                        delete AudioSystem.workletPromises['aleph-processor'];
                        return false;
                    });
            }
            
            // Wait for the worklet to be loaded
            const success = await AudioSystem.workletPromises['aleph-processor'];
            
            if (success) {
                // Create worklet node
                this.workletNode = new AudioWorkletNode(this.ctx, 'aleph-processor', {
                    outputChannelCount: [2] // Stereo output
                });
                
                // Connect the worklet
                this.input.connect(this.workletNode);
                this.workletNode.connect(this.output);
                
                // Set up message handling
                this.workletNode.port.onmessage = (event) => {
                    if (event.data.type === 'bufferStatus') {
                        if (event.data.overrun) {
                            console.warn('Buffer overrun detected in Aleph processor');
                            this.reduceComplexity();
                        }
                    }
                };
                
                this.workletLoaded = true;
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error initializing Aleph AudioWorklet:', error);
            return false;
        }
    }
    
    async apply(carrierModule) {
        // Store reference to carrier
        this.carrierRef = carrierModule;
        
        // Get base frequency from carrier
        this.baseFrequency = carrierModule ? carrierModule.oscillator.frequency.value : this.baseFrequency;
        
        try {
            // Try to use AudioWorklet first (preferred implementation)
            if (await this.initWorklet()) {
                // Configure worklet parameters based on aleph type
                this.workletNode.port.postMessage({
                    type: 'configure',
                    alephType: this.alephType,
                    baseFrequency: this.baseFrequency,
                    bufferSize: 4096 // Larger buffer for complex patterns
                });
            } else {
                // Fallback to standard audio node implementation
                if (this.alephType === 'aleph-two') {
                    // For extremely complex patterns, use precomputed buffer
                    await this.applyWithBufferedPattern();
                } else {
                    // Use standard oscillator implementation for simpler patterns
                    this.applyWithOscillators();
                }
            }
            
            return this;
        } catch (error) {
            console.error('Error applying Aleph pattern:', error);
            // Create a very simple fallback pattern
            this.createSimpleFallbackPattern();
            return this;
        }
    }
    
    // Apply using oscillators (fallback when AudioWorklet not available)
    applyWithOscillators() {
        // Clear any existing oscillators
        this.clearOscillators();
        
        // Based on Aleph type, create the appropriate pattern
        switch(this.alephType) {
            case 'aleph-null':
                this.createCountableInfinityPattern();
                break;
            case 'aleph-one':
                this.createUncountableInfinityPattern();
                break;
            default:
                this.createSimpleFallbackPattern();
                break;
        }
    }
    
    // Apply using precomputed buffer for complex patterns
    async applyWithBufferedPattern() {
        try {
            const buffer = await AudioSystem.precomputedPatterns.getPattern(
                this.ctx, 
                this.alephType, 
                this.baseFrequency
            );
            
            this.bufferSource = this.ctx.createBufferSource();
            this.bufferSource.buffer = buffer;
            this.bufferSource.loop = true;
            this.bufferSource.connect(this.output);
        } catch (error) {
            console.error('Error creating buffered pattern:', error);
            this.createSimpleFallbackPattern();
        }
    }
    
    // Pattern generators for different Aleph types
    createCountableInfinityPattern() {
        // Countable infinity implementation (aleph-null)
        // Creates a harmonic series with diminishing amplitudes
        for (let i = 1; i <= 8; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            // Harmonic series with golden ratio influence
            const phi = (1 + Math.sqrt(5)) / 2;
            osc.frequency.value = this.baseFrequency * (1 + (1/i) * phi);
            osc.type = 'sine';
            
            // Diminishing gain by position
            gain.gain.value = 0.7 / i;
            
            osc.connect(gain);
            gain.connect(this.output);
            
            this.oscillators.push({ osc, gain });
        }
    }
    
    createUncountableInfinityPattern() {
        // Create an FM synthesis pattern with irrational number relationships (aleph-one)
        const carrier = this.ctx.createOscillator();
        const modulator = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        
        carrier.frequency.value = this.baseFrequency;
        modulator.frequency.value = this.baseFrequency * (Math.PI / 2); // Irrational relationship
        
        modGain.gain.value = 100; // FM depth
        
        modulator.connect(modGain);
        modGain.connect(carrier.frequency);
        carrier.connect(this.output);
        
        this.oscillators.push({ osc: carrier, type: 'carrier' });
        this.oscillators.push({ osc: modulator, type: 'modulator', gain: modGain });
    }
    
    createSimpleFallbackPattern() {
        // Simple fallback pattern when other methods fail
        // Uses a basic AM modulation
        const carrier = this.ctx.createOscillator();
        const modulator = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        const masterGain = this.ctx.createGain();
        
        carrier.frequency.value = this.baseFrequency;
        modulator.frequency.value = 7.83; // Schumann resonance
        
        carrier.connect(masterGain);
        masterGain.connect(this.output);
        
        modulator.connect(modGain);
        modGain.connect(masterGain.gain);
        
        modGain.gain.value = 0.5;
        masterGain.gain.value = 0.7;
        
        this.oscillators.push({ osc: carrier, type: 'carrier' });
        this.oscillators.push({ osc: modulator, type: 'modulator', gain: modGain });
    }
    
    // Reduce pattern complexity if buffer overruns occur
    reduceComplexity() {
        if (this.workletLoaded && this.workletNode) {
            this.workletNode.port.postMessage({
                type: 'reduceComplexity',
                factor: 0.7 // Reduce complexity by 30%
            });
        }
    }
    
    // Start all oscillators in the pattern
    start() {
        try {
            if (this.workletLoaded && this.workletNode) {
                // Worklet is already running, just notify it to start
                this.workletNode.port.postMessage({ type: 'start' });
                return this;
            }
            
            if (this.bufferSource) {
                this.bufferSource.start();
                return this;
            }
            
            // Start all oscillators
            this.oscillators.forEach(item => {
                try {
                    if (item.osc) {
                        item.osc.start();
                    }
                } catch (e) {
                    console.warn('Error starting oscillator in Aleph pattern:', e);
                }
            });
        } catch (e) {
            console.error('Error starting Aleph pattern:', e);
        }
        
        return this;
    }
    
    // Clean up all oscillators
    clearOscillators() {
        this.oscillators.forEach(item => {
            try {
                if (item.type === 'carrier' || item.type === 'modulator') {
                    item.osc.stop();
                    if (item.gain) item.gain.disconnect();
                } else if (item.osc && item.gain) {
                    item.osc.stop();
                    item.gain.disconnect();
                }
            } catch (e) {
                console.warn('Error clearing oscillator:', e);
            }
        });
        this.oscillators = [];
    }
    
    // Stop all oscillators
    stop() {
        try {
            if (this.workletLoaded && this.workletNode) {
                // Signal worklet to stop audio generation
                this.workletNode.port.postMessage({ type: 'stop' });
                return this;
            }
            
            if (this.bufferSource) {
                try {
                    this.bufferSource.stop();
                } catch (e) {
                    console.warn('Error stopping buffer source:', e);
                }
                return this;
            }
            
            this.clearOscillators();
        } catch (e) {
            console.error('Error stopping Aleph pattern:', e);
        }
        
        return this;
    }
    
    // Set volume of output
    setVolume(vol, rampTime = 0.05) {
        try {
            const now = this.ctx.currentTime;
            this.output.gain.cancelScheduledValues(now);
            this.output.gain.setValueAtTime(this.output.gain.value, now);
            this.output.gain.linearRampToValueAtTime(vol, now + rampTime);
        } catch (e) {
            console.warn('Error setting Aleph volume:', e);
        }
        return this;
    }
    
    // Full cleanup
    cleanup() {
        try {
            this.stop();
            
            if (this.workletNode) {
                this.workletNode.disconnect();
                this.workletNode = null;
            }
            
            if (this.bufferSource) {
                this.bufferSource.disconnect();
                this.bufferSource = null;
            }
            
            this.input.disconnect();
            this.output.disconnect();
            this.workletLoaded = false;
            
            return true;
        } catch (e) {
            console.error('Error during Aleph cleanup:', e);
            return false;
        }
    }
};

// Precomputed pattern system for complex Aleph patterns
AudioSystem.precomputedPatterns = {
    buffers: {},
    
    async generatePatternBuffer(ctx, patternType, baseFreq, duration = 10) {
        const sampleRate = ctx.sampleRate;
        const bufferLength = sampleRate * duration;
        const buffer = ctx.createBuffer(2, bufferLength, sampleRate);
        
        switch(patternType) {
            case 'aleph-two':
                // This pattern is very complex, so precompute it
                const leftChannel = buffer.getChannelData(0);
                const rightChannel = buffer.getChannelData(1);
                
                // Complex mathematical pattern generation
                const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23];
                
                for (let i = 0; i < bufferLength; i++) {
                    let sampleL = 0;
                    let sampleR = 0;
                    
                    // Generate extremely complex pattern based on prime relationships
                    for (let p = 0; p < primes.length; p++) {
                        for (let q = p + 1; q < primes.length; q++) {
                            const ratio1 = primes[p] / primes[q];
                            const ratio2 = primes[q] / primes[p];
                            
                            const freq1 = baseFreq * ratio1;
                            const freq2 = baseFreq * ratio2;
                            
                            const amp = 0.05 / ((p + 1) * (q + 1));
                            
                            const phase1 = (i / sampleRate) * freq1 * Math.PI * 2;
                            const phase2 = (i / sampleRate) * freq2 * Math.PI * 2;
                            
                            sampleL += Math.sin(phase1) * amp;
                            sampleR += Math.sin(phase2) * amp;
                        }
                    }
                    
                    // Apply slight envelope to avoid clicks
                    const envelope = Math.min(1, Math.min(i, bufferLength - i) / 1000);
                    
                    leftChannel[i] = sampleL * envelope;
                    rightChannel[i] = sampleR * envelope;
                }
                break;
                
            // Other complex patterns...
            default:
                // Create a simpler pattern as fallback
                const channel = buffer.getChannelData(0);
                for (let i = 0; i < bufferLength; i++) {
                    channel[i] = Math.sin(2 * Math.PI * baseFreq * i / sampleRate) * 0.5;
                }
                // Copy to second channel
                buffer.copyToChannel(channel, 1);
        }
        
        return buffer;
    },
    
    async getPattern(ctx, type, baseFreq) {
        const key = `${type}_${Math.round(baseFreq)}`;
        
        if (!this.buffers[key]) {
            this.buffers[key] = await this.generatePatternBuffer(ctx, type, baseFreq);
        }
        
        return this.buffers[key];
    },
    
    // Clear cached buffers to save memory
    clearBuffers() {
        this.buffers = {};
    }
};

// Export the module if in a module environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        AlephModule: AudioSystem.AudioModules.AlephModule,
        precomputedPatterns: AudioSystem.precomputedPatterns
    };
}
