/**
 * Aleph Module
 * Implements complex mathematical pattern generation based on aleph infinity concepts
 * WITHOUT AudioWorklet dependency for maximum browser compatibility
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
        this.bufferSource = null;
        this.carrierRef = null;
        this.baseFrequency = 432; // Default if no carrier
        this.compressor = null;  // For preventing clipping
    }
    
    async apply(carrierModule) {
        // Store reference to carrier
        this.carrierRef = carrierModule;
        
        // Get base frequency from carrier
        this.baseFrequency = carrierModule ? carrierModule.oscillator.frequency.value : this.baseFrequency;
        
        try {
            // Create a compressor to prevent clipping with complex patterns
            this.compressor = this.ctx.createDynamicsCompressor();
            this.compressor.threshold.value = -15;
            this.compressor.knee.value = 30;
            this.compressor.ratio.value = 12;
            this.compressor.attack.value = 0.003;
            this.compressor.release.value = 0.25;
            this.compressor.connect(this.output);
            
            // Based on Aleph type, choose the appropriate pattern method
            if (this.alephType === 'aleph-two') {
                // For extremely complex patterns, use precomputed buffer
                await this.applyWithBufferedPattern();
            } else {
                // Use standard oscillator implementation for simpler patterns
                this.applyWithOscillators();
            }
            
            return this;
        } catch (error) {
            console.error('Error applying Aleph pattern:', error);
            // Create a very simple fallback pattern
            this.createSimpleFallbackPattern();
            return this;
        }
    }
    
    // Apply using oscillators (standard Web Audio API approach)
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
            // Calculate safe buffer duration based on available memory
            const safeDuration = this.calculateSafeBufferDuration();
            
            const buffer = await AudioSystem.precomputedPatterns.getPattern(
                this.ctx, 
                this.alephType, 
                this.baseFrequency,
                safeDuration
            );
            
            this.bufferSource = this.ctx.createBufferSource();
            this.bufferSource.buffer = buffer;
            this.bufferSource.loop = true;
            this.bufferSource.connect(this.compressor);
            
            // Schedule periodic buffer source replacement to prevent memory issues
            this.scheduleBufferReplacement(safeDuration);
        } catch (error) {
            console.error('Error creating buffered pattern:', error);
            this.createSimpleFallbackPattern();
        }
    }
    
    // Calculate safe buffer duration based on device capabilities
    calculateSafeBufferDuration() {
        // Estimate available memory - if performance API available
        if (window.performance && window.performance.memory) {
            const memInfo = window.performance.memory;
            const availableHeap = memInfo.jsHeapSizeLimit - memInfo.usedJSHeapSize;
            
            // Adaptive buffer duration based on available memory
            // 1MB of memory ≈ 5 seconds of stereo 44.1kHz audio
            const safeSeconds = Math.min(10, Math.max(2, Math.floor(availableHeap / (1024 * 1024 * 2))));
            return safeSeconds;
        }
        
        // Default safe duration for browsers without memory info
        return 3; // 3 seconds is generally safe on most devices
    }
    
    // Schedule buffer replacement to prevent memory issues with long playback
    scheduleBufferReplacement(duration) {
        // Clear any previous replacement schedule
        if (this.bufferReplacementTimeout) {
            clearTimeout(this.bufferReplacementTimeout);
        }
        
        // Schedule replacement at 80% of buffer duration to ensure smooth transition
        const replaceTime = duration * 0.8 * 1000;
        
        this.bufferReplacementTimeout = setTimeout(() => {
            // Only replace if still playing
            if (this.bufferSource) {
                try {
                    // Create new buffer source
                    const newSource = this.ctx.createBufferSource();
                    newSource.buffer = this.bufferSource.buffer;
                    newSource.loop = true;
                    newSource.connect(this.compressor);
                    
                    // Schedule start of new source
                    newSource.start();
                    
                    // Schedule stop of old source (with small overlap for smooth transition)
                    const oldSource = this.bufferSource;
                    setTimeout(() => {
                        try {
                            oldSource.stop();
                            oldSource.disconnect();
                        } catch (e) {
                            console.warn('Error stopping old buffer source:', e);
                        }
                    }, 50); // 50ms overlap
                    
                    // Update reference
                    this.bufferSource = newSource;
                    
                    // Schedule next replacement
                    this.scheduleBufferReplacement(duration);
                } catch (e) {
                    console.warn('Error during buffer replacement:', e);
                }
            }
        }, replaceTime);
    }
    
    // Pattern generators for different Aleph types
    createCountableInfinityPattern() {
        // Countable infinity implementation (aleph-null)
        // Create a harmonic series with diminishing amplitudes
        
        // Determine safe number of oscillators based on device capabilities
        const maxOscillators = this.estimateSafeOscillatorCount();
        
        for (let i = 1; i <= maxOscillators; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            // Harmonic series with golden ratio influence
            const phi = (1 + Math.sqrt(5)) / 2;
            osc.frequency.value = this.baseFrequency * (1 + (1/i) * phi);
            
            // Alternate waveforms for richer sound
            osc.type = i % 3 === 0 ? 'triangle' : (i % 2 === 0 ? 'sine' : 'sine');
            
            // Carefully scaled diminishing gain to prevent audio clipping
            gain.gain.value = 0.5 / Math.sqrt(i + 1);
            gain.gain.setValueAtTime(0, this.ctx.currentTime); // Start silent
            gain.gain.linearRampToValueAtTime(0.5 / Math.sqrt(i + 1), this.ctx.currentTime + 0.1); // Fade in
            
            osc.connect(gain);
            gain.connect(this.compressor);
            
            this.oscillators.push({ osc, gain });
        }
    }
    
    createUncountableInfinityPattern() {
        // More sophisticated implementation (aleph-one)
        // Create a multi-layered FM synthesis
        const carrier = this.ctx.createOscillator();
        const masterGain = this.ctx.createGain();
        masterGain.gain.value = 0.7;
        
        // Create multiple modulators for more complex patterns
        // Limited number based on device capabilities
        const maxModulators = Math.min(4, this.estimateSafeOscillatorCount() - 1);
        const modulators = [];
        const modGains = [];
        
        for (let i = 0; i < maxModulators; i++) {
            const modulator = this.ctx.createOscillator();
            const modGain = this.ctx.createGain();
            
            // Use irrational number relationships for complex patterns
            const irrationals = [Math.PI / 2, Math.E / 3, Math.sqrt(2), Math.sqrt(3) / 2];
            const ratio = irrationals[i % irrationals.length];
            
            modulator.frequency.value = this.baseFrequency * ratio;
            
            // Scale modulation depth carefully to prevent excessive frequency deviation
            modGain.gain.value = 40 / ((i + 1) * 2);
            
            modulator.connect(modGain);
            modGain.connect(carrier.frequency);
            
            modulators.push(modulator);
            modGains.push(modGain);
        }
        
        carrier.connect(masterGain);
        masterGain.connect(this.compressor);
        
        this.oscillators.push({ osc: carrier, type: 'carrier', gain: masterGain });
        
        for (let i = 0; i < modulators.length; i++) {
            this.oscillators.push({ 
                osc: modulators[i], 
                type: 'modulator', 
                gain: modGains[i] 
            });
        }
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
        masterGain.connect(this.compressor);
        
        modulator.connect(modGain);
        modGain.connect(masterGain.gain);
        
        modGain.gain.value = 0.5;
        masterGain.gain.value = 0.7;
        
        this.oscillators.push({ osc: carrier, type: 'carrier', gain: masterGain });
        this.oscillators.push({ osc: modulator, type: 'modulator', gain: modGain });
    }
    
    // Estimate safe number of oscillators based on device performance
    estimateSafeOscillatorCount() {
        // Default safe count
        let safeCount = 6;
        
        // Check if we have performance memory info
        if (window.performance && window.performance.memory) {
            const memInfo = window.performance.memory;
            // Adjust based on available memory
            const memoryRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
            
            if (memoryRatio > 0.7) {
                safeCount = 3;  // Low memory
            } else if (memoryRatio > 0.5) {
                safeCount = 5;  // Medium memory
            } else {
                safeCount = 8;  // High memory
            }
        }
        
        // Check for overall active tones to further limit if needed
        const activeOscillatorCount = Object.keys(AppState.audio.oscillators).length;
        if (activeOscillatorCount > 4) {
            safeCount = Math.max(2, safeCount - 2);
        }
        
        return safeCount;
    }
    
    // Start all oscillators in the pattern
    start() {
        try {
            if (this.bufferSource) {
                this.bufferSource.start();
                return this;
            }
            
            // Start all oscillators with slight timing offset to prevent audio spikes
            this.oscillators.forEach((item, index) => {
                try {
                    if (item.osc) {
                        // Stagger start times slightly
                        setTimeout(() => {
                            item.osc.start();
                        }, index * 5);
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
                if (item.osc) {
                    try {
                        item.osc.stop();
                    } catch (e) {
                        // Already stopped, ignore
                    }
                }
                
                if (item.gain) {
                    try {
                        item.gain.disconnect();
                    } catch (e) {
                        // Already disconnected, ignore
                    }
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
            // Cancel any scheduled buffer replacements
            if (this.bufferReplacementTimeout) {
                clearTimeout(this.bufferReplacementTimeout);
                this.bufferReplacementTimeout = null;
            }
            
            if (this.bufferSource) {
                try {
                    // Fade out buffer source to prevent clicks
                    const bufferGain = this.ctx.createGain();
                    this.bufferSource.disconnect();
                    this.bufferSource.connect(bufferGain);
                    bufferGain.connect(this.compressor);
                    
                    const now = this.ctx.currentTime;
                    bufferGain.gain.setValueAtTime(1, now);
                    bufferGain.gain.linearRampToValueAtTime(0, now + 0.05);
                    
                    // Stop after fade
                    setTimeout(() => {
                        try {
                            this.bufferSource.stop();
                            bufferGain.disconnect();
                        } catch (e) {
                            // Already stopped, ignore
                        }
                    }, 60);
                    
                    this.bufferSource = null;
                } catch (e) {
                    console.warn('Error stopping buffer source:', e);
                }
                return this;
            }
            
            // Fade out and stop oscillators
            const now = this.ctx.currentTime;
            this.oscillators.forEach(item => {
                try {
                    if (item.gain) {
                        item.gain.gain.setValueAtTime(item.gain.gain.value, now);
                        item.gain.gain.linearRampToValueAtTime(0, now + 0.05);
                    }
                } catch (e) {
                    console.warn('Error during gain ramp:', e);
                }
            });
            
            // Stop oscillators after fade
            setTimeout(() => {
                this.clearOscillators();
            }, 60);
        } catch (e) {
            console.error('Error stopping Aleph pattern:', e);
            // Force clear as fallback
            this.clearOscillators();
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
            
            // Cancel any scheduled tasks
            if (this.bufferReplacementTimeout) {
                clearTimeout(this.bufferReplacementTimeout);
                this.bufferReplacementTimeout = null;
            }
            
            if (this.bufferSource) {
                try {
                    this.bufferSource.disconnect();
                } catch (e) {
                    // Already disconnected, ignore
                }
                this.bufferSource = null;
            }
            
            if (this.compressor) {
                try {
                    this.compressor.disconnect();
                } catch (e) {
                    // Already disconnected, ignore
                }
                this.compressor = null;
            }
            
            this.input.disconnect();
            this.output.disconnect();
            
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
    lastUsedTime: {},
    
    async generatePatternBuffer(ctx, patternType, baseFreq, duration = 3) {
        const sampleRate = ctx.sampleRate;
        const bufferLength = sampleRate * duration;
        const buffer = ctx.createBuffer(2, bufferLength, sampleRate);
        
        // Update last used time
        this.lastUsedTime[patternType] = Date.now();
        
        switch(patternType) {
            case 'aleph-two':
                // Optimized algorithm for complex pattern generation
                const leftChannel = buffer.getChannelData(0);
                const rightChannel = buffer.getChannelData(1);
                
                // Use fewer primes and iterations for better performance
                const primes = [2, 3, 5, 7, 11];
                
                // Process in chunks to prevent UI blocking
                const chunkSize = Math.min(2000, Math.floor(bufferLength / 10));
                
                for (let chunkStart = 0; chunkStart < bufferLength; chunkStart += chunkSize) {
                    const chunkEnd = Math.min(chunkStart + chunkSize, bufferLength);
                    
                    for (let i = chunkStart; i < chunkEnd; i++) {
                        let sampleL = 0;
                        let sampleR = 0;
                        
                        // Reduced iterations for better performance
                        for (let p = 0; p < 3; p++) {
                            for (let q = p + 1; q < Math.min(p + 3, primes.length); q++) {
                                const ratio1 = primes[p] / primes[q];
                                const ratio2 = primes[q] / primes[p];
                                
                                const freq1 = baseFreq * ratio1;
                                const freq2 = baseFreq * ratio2;
                                
                                // Scale amplitude to prevent clipping
                                const amp = 0.03 / ((p + 1) * (q + 1));
                                
                                const phase1 = (i / sampleRate) * freq1 * Math.PI * 2;
                                const phase2 = (i / sampleRate) * freq2 * Math.PI * 2;
                                
                                sampleL += Math.sin(phase1) * amp;
                                sampleR += Math.sin(phase2) * amp;
                            }
                        }
                        
                        // Apply fade in/out envelope to prevent clicks
                        const fadeTime = Math.min(sampleRate * 0.01, bufferLength * 0.1);
                        let envelope = 1;
                        
                        if (i < fadeTime) {
                            envelope = i / fadeTime;
                        } else if (i > bufferLength - fadeTime) {
                            envelope = (bufferLength - i) / fadeTime;
                        }
                        
                        leftChannel[i] = sampleL * envelope;
                        rightChannel[i] = sampleR * envelope;
                    }
                    
                    // Yield to main thread between chunks to prevent UI blocking
                    if (chunkStart + chunkSize < bufferLength) {
                        await new Promise(resolve => setTimeout(resolve, 0));
                    }
                }
                break;
                
            default:
                // Simple fallback pattern
                const channel = buffer.getChannelData(0);
                for (let i = 0; i < bufferLength; i++) {
                    const envelope = Math.min(1, Math.min(i, bufferLength - i) / 1000);
                    channel[i] = Math.sin(2 * Math.PI * baseFreq * i / sampleRate) * 0.5 * envelope;
                }
                
                // Copy to second channel
                buffer.copyToChannel(channel, 1);
        }
        
        return buffer;
    },
    
    async getPattern(ctx, type, baseFreq, duration = 3) {
        const key = `${type}_${Math.round(baseFreq)}_${duration}`;
        
        // Check if we need to generate a new buffer or if we have a cached one
        if (!this.buffers[key]) {
            // Before generating a new buffer, check for and clean up old unused buffers
            this.cleanUnusedBuffers();
            
            this.buffers[key] = await this.generatePatternBuffer(ctx, type, baseFreq, duration);
        }
        
        // Update last used time
        this.lastUsedTime[key] = Date.now();
        
        return this.buffers[key];
    },
    
    // Clean up buffers that haven't been used recently
    cleanUnusedBuffers() {
        const now = Date.now();
        let totalCleared = 0;
        
        // Keep track of how many buffers we've cleared
        Object.keys(this.buffers).forEach(key => {
            if (!this.lastUsedTime[key] || now - this.lastUsedTime[key] > 120000) { // 2 minutes
                delete this.buffers[key];
                delete this.lastUsedTime[key];
                totalCleared++;
            }
        });
        
        if (totalCleared > 0) {
            console.log(`Cleaned ${totalCleared} unused audio buffers`);
        }
        
        return totalCleared;
    },
    
    // Clear all cached buffers to save memory
    clearBuffers() {
        const count = Object.keys(this.buffers).length;
        this.buffers = {};
        this.lastUsedTime = {};
        console.log(`Cleared all ${count} audio buffers`);
        
        // Force garbage collection if available
        if (window.gc) window.gc();
    }
};

// Export the module if in a module environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        AlephModule: AudioSystem.AudioModules.AlephModule,
        precomputedPatterns: AudioSystem.precomputedPatterns
    };
}
