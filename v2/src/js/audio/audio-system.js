/**
 * Audio System
 * Core audio processing and management
 * Enhanced for maximum compatibility and memory management
 */

// Audio System
const AudioSystem = {
    // Resource management
    resourceManagement: {
        activeNodes: new Map(),
        maxActiveTones: 8, // Hard limit for simultaneous tones
        memoryCheckInterval: null,

        registerChain(id, chain) {
            this.activeNodes.set(id, {
                chain,
                createdAt: Date.now()
            });

            this.enforceResourceLimits();
            
            // Start memory monitoring if not already running
            if (!this.memoryCheckInterval) {
                this.startMemoryMonitoring();
            }
        },

        unregisterChain(id) {
            this.activeNodes.delete(id);
            
            // If no active nodes, stop memory monitoring
            if (this.activeNodes.size === 0) {
                this.stopMemoryMonitoring();
            }
            
            // Update last tone stopped time for buffer cleanup timing
            AppState.audio.lastToneStoppedTime = Date.now();
        },
        
        // Start periodic memory monitoring
        startMemoryMonitoring() {
            if (this.memoryCheckInterval) {
                clearInterval(this.memoryCheckInterval);
            }
            
            this.memoryCheckInterval = setInterval(() => {
                this.checkMemoryUsage();
            }, 10000); // Check every 10 seconds when active
        },
        
        // Stop memory monitoring when not needed
        stopMemoryMonitoring() {
            if (this.memoryCheckInterval) {
                clearInterval(this.memoryCheckInterval);
                this.memoryCheckInterval = null;
            }
        },
        
        // Monitor memory usage and take action if needed
        checkMemoryUsage() {
            if (window.performance && window.performance.memory) {
                const memInfo = window.performance.memory;
                const usedHeapPercentage = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
                
                // Critical memory pressure - take immediate action
                if (usedHeapPercentage > 0.85) {
                    console.warn("Critical memory pressure detected");
                    
                    // Stop oldest tones if we have more than 2
                    if (this.activeNodes.size > 2) {
                        // Sort by creation time
                        const entries = Array.from(this.activeNodes.entries())
                            .sort((a, b) => a[1].createdAt - b[1].createdAt);
                            
                        // Stop oldest 50% of tones
                        const stopCount = Math.ceil(entries.length / 2);
                        for (let i = 0; i < stopCount; i++) {
                            const [id, data] = entries[i];
                            console.log(`Emergency stopping tone ${id} due to memory pressure`);
                            AudioSystem.stopTone(id);
                            this.activeNodes.delete(id);
                            EventSystem.emit('resourceLimitReached', {
                                id,
                                message: 'High memory usage detected. Some tones have been stopped automatically.'
                            });
                        }
                    }
                    
                    // Clean precomputed patterns
                    if (AudioSystem.precomputedPatterns) {
                        AudioSystem.precomputedPatterns.clearBuffers();
                    }
                    
                    // Force garbage collection if available
                    if (window.gc) window.gc();
                }
                // High memory pressure - reduce complexity
                else if (usedHeapPercentage > 0.7) {
                    console.warn("High memory pressure detected");
                    
                    // If multiple aleph patterns are running, stop the oldest
                    let alephPatternCount = 0;
                    let oldestAlephId = null;
                    let oldestTime = Date.now();
                    
                    this.activeNodes.forEach((data, id) => {
                        if (id.includes('aleph')) {
                            alephPatternCount++;
                            if (data.createdAt < oldestTime) {
                                oldestTime = data.createdAt;
                                oldestAlephId = id;
                            }
                        }
                    });
                    
                    if (alephPatternCount > 1 && oldestAlephId) {
                        console.log(`Stopping oldest aleph pattern ${oldestAlephId} due to memory pressure`);
                        AudioSystem.stopTone(oldestAlephId);
                        EventSystem.emit('resourceLimitReached', {
                            id: oldestAlephId,
                            message: 'Multiple complex patterns detected. Oldest pattern stopped to conserve memory.'
                        });
                    }
                }
            }
        },

        // Enforce resource limits by stopping oldest tones if needed
        enforceResourceLimits() {
            if (this.activeNodes.size <= AppState.performance.maxSimultaneousTones) return;

            // Sort by creation time
            const entries = Array.from(this.activeNodes.entries())
                .sort((a, b) => a[1].createdAt - b[1].createdAt);

            // Stop oldest tones until we're under limit
            while (entries.length > AppState.performance.maxSimultaneousTones) {
                const [id, data] = entries.shift();
                console.log(`Stopping tone ${id} due to resource limits`);
                AudioSystem.stopTone(id);
                this.activeNodes.delete(id);
                EventSystem.emit('resourceLimitReached', {
                    id,
                    message: 'Maximum number of simultaneous tones reached. Oldest tone stopped.'
                });
            }
        },

        // Check system resources and cleanup if necessary
        checkResources() {
            const now = Date.now();

            // Only check resources at specified intervals
            if (now - AppState.audio.lastResourceCheck < AppState.performance.resourceCheckInterval) {
                return;
            }

            AppState.audio.lastResourceCheck = now;

            // Check for long-running tones (over 30 minutes) and clean them up
            let cleanupNeeded = false;

            this.activeNodes.forEach((data, id) => {
                // Check if node has been active for more than 30 minutes
                if (now - data.createdAt > 1800000) {
                    console.log(`Cleaning up long-running tone ${id}`);
                    AudioSystem.stopTone(id);
                    this.activeNodes.delete(id);
                    cleanupNeeded = true;
                    EventSystem.emit('autoCleanup', { id, reason: 'long-running' });
                }
            });
            
            // Check for unused buffer resources
            if (AudioSystem.precomputedPatterns) {
                // If no tones playing for 5 minutes, clear all buffers
                if (this.activeNodes.size === 0 && 
                    AppState.audio.lastToneStoppedTime && 
                    now - AppState.audio.lastToneStoppedTime > 300000) {
                    AudioSystem.precomputedPatterns.clearBuffers();
                    cleanupNeeded = true;
                } else {
                    // Otherwise just clean unused buffers
                    const cleared = AudioSystem.precomputedPatterns.cleanUnusedBuffers();
                    if (cleared > 0) cleanupNeeded = true;
                }
            }

            if (cleanupNeeded) {
                // Attempt to trigger garbage collection
                if (window.gc) window.gc();

                // Force AudioContext cleanup in some cases
                if (AppState.audio.context &&
                    AppState.audio.context.state === 'running' &&
                    this.activeNodes.size === 0) {

                    // Suspend context to save resources if no active tones
                    AppState.audio.context.suspend().catch(err => {
                        console.warn('Failed to suspend audio context:', err);
                    });
                }
            }

            return cleanupNeeded;
        }
    },

    // Buffer management
    bufferManagement: {
        defaultSize: 1024,
        maxSize: 8192, // Reduced from 16384 for better compatibility
        currentSize: 1024,

        // Calculate optimal buffer size based on complexity
        calculateOptimalBufferSize(moduleCount, hasAleph) {
            // Start with default
            let size = this.defaultSize;

            // Increase for module count
            size += moduleCount * 128; // Reduced from 256

            // Moderately increase for Aleph patterns (less than before)
            if (hasAleph) {
                size += 1024; // Reduced from 2048
            }

            // Cap at maximum
            return Math.min(size, this.maxSize);
        }
    },

    // Initialize the audio system
    init() {
        // Only initialize if not already initialized
        if (!AppState.audio.context && window.AudioContext) {
            try {
                return this.initializeAudioContext();
            } catch (error) {
                console.error('Failed to initialize audio context:', error);
                EventSystem.emit('audioError', {
                    message: 'Failed to initialize audio system. Please ensure your browser supports Web Audio API.',
                    error
                });
                return false;
            }
        }
        return AppState.audio.isReady;
    },

    // Initialize the Audio Context
    initializeAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const context = new AudioContext({
                // Use conservative settings for better compatibility
                latencyHint: 'playback',
                sampleRate: this.getSafeSampleRate()
            });

            if (!context || typeof context.createGain !== 'function') {
                throw new Error('Invalid Audio Context');
            }

            AppState.audio.context = context;

            const masterGain = context.createGain();
            if (!masterGain) {
                throw new Error('Failed to create gain node');
            }

            // Add a master compressor to prevent audio clipping
            const compressor = context.createDynamicsCompressor();
            compressor.threshold.value = -15;
            compressor.knee.value = 30;
            compressor.ratio.value = 12;
            compressor.attack.value = 0.003;
            compressor.release.value = 0.25;
            
            AppState.audio.masterGain = masterGain;
            AppState.audio.masterCompressor = compressor;
            
            // Connect chain: masterGain -> compressor -> destination
            AppState.audio.masterGain.gain.value = AppState.audio.volume;
            AppState.audio.masterGain.connect(compressor);
            compressor.connect(AppState.audio.context.destination);

            // If context is suspended (common in some browsers), try to resume it
            if (context.state === 'suspended') {
                context.resume().catch(error => {
                    console.warn('Could not resume audio context:', error);
                });
            }

            AppState.audio.isReady = true;
            
            // Add lastToneStoppedTime for buffer management
            AppState.audio.lastToneStoppedTime = Date.now();
            
            EventSystem.emit('audioReady');

            // Set up periodic resource checks
            setInterval(() => {
                this.resourceManagement.checkResources();
            }, AppState.performance.resourceCheckInterval);

            return true;
        } catch (error) {
            console.error('Error initializing audio context:', error);
            return false;
        }
    },
    
    // Get a safe sample rate based on device capabilities
    getSafeSampleRate() {
        // Default to 44.1kHz for compatibility
        const defaultRate = 44100;
        
        try {
            // Check if AudioContext is available
            if (window.AudioContext || window.webkitAudioContext) {
                // Create a temporary context to check supported sample rate
                const tempContext = new (window.AudioContext || window.webkitAudioContext)();
                const deviceRate = tempContext.sampleRate;
                
                // Clean up temp context
                if (tempContext.close) {
                    tempContext.close();
                }
                
                // Use device rate if it's reasonable (between 22.05kHz and 48kHz)
                if (deviceRate >= 22050 && deviceRate <= 48000) {
                    return deviceRate;
                }
            }
        } catch (e) {
            console.warn('Error checking sample rate:', e);
        }
        
        return defaultRate;
    },

    // Create a basic oscillator
    createOscillator(frequency, type = 'sine') {
        try {
            const oscillator = AppState.audio.context.createOscillator();
            const gainNode = AppState.audio.context.createGain();

            oscillator.type = type;
            oscillator.frequency.value = frequency;

            // Start with zero gain to prevent clicks
            gainNode.gain.value = 0;

            // Connect nodes
            oscillator.connect(gainNode);
            gainNode.connect(AppState.audio.masterGain);

            return { oscillator, gainNode };
        } catch (error) {
            console.error('Error creating oscillator:', error);
            EventSystem.emit('audioError', { message: 'Failed to create oscillator', error });
            return null;
        }
    },

    // Create a binaural beat
    createBinauralBeat(frequency, carrierFrequency = 200) {
        try {
            // Create merger for stereo output
            const merger = AppState.audio.context.createChannelMerger(2);

            // Create oscillators for left and right ears
            const leftOsc = this.createOscillator(carrierFrequency);
            const rightOsc = this.createOscillator(carrierFrequency + frequency);

            if (!leftOsc || !rightOsc) return null;

            // Reconnect to merger instead of master gain
            leftOsc.gainNode.disconnect();
            rightOsc.gainNode.disconnect();
            leftOsc.gainNode.connect(merger, 0, 0);  // Left channel
            rightOsc.gainNode.connect(merger, 0, 1); // Right channel
            merger.connect(AppState.audio.masterGain);

            return {
                left: leftOsc,
                right: rightOsc,
                merger
            };
        } catch (error) {
            console.error('Error creating binaural beat:', error);
            EventSystem.emit('audioError', { message: 'Failed to create binaural beat', error });
            return null;
        }
    },

    // Create a standard Aleph pattern using oscillators (no worklet)
    startAlephPattern(id, patternType, options = {}) {
        try {
            // Ensure audio context is initialized and resumed
            if (!this.init()) {
                EventSystem.emit('audioError', { message: 'Audio system not ready. Please try again.' });
                return false;
            }

            // Resume audio context if it's in suspended state
            if (AppState.audio.context.state === 'suspended') {
                AppState.audio.context.resume();
            }

            // Stop any existing pattern with this ID
            this.stopTone(id);

            // Create Aleph module
            const ctx = AppState.audio.context;
            
            // Create a carrier to base the pattern on
            const baseFreq = 432; // Default base frequency
            const carrier = new this.AudioModules.CarrierModule(ctx, baseFreq);
            
            // Create Aleph module and apply to carrier
            const alephModule = new this.AudioModules.AlephModule(ctx, patternType);
            alephModule.apply(carrier);

            // Create master gain
            const masterGain = ctx.createGain();
            masterGain.gain.value = 0; // Start silent

            // Connect the module to master
            alephModule.output.connect(masterGain);
            masterGain.connect(AppState.audio.masterGain);

            // Start the oscillators
            carrier.start();
            alephModule.start();

            // Ramp up volume
            this.rampGain(masterGain.gain, options.volume || AppState.audio.volume);

            // Store reference
            if (!AppState.audio.patternOscillators) {
                AppState.audio.patternOscillators = {};
            }

            AppState.audio.patternOscillators[id] = {
                carrier,
                alephModule,
                masterGain
            };

            // Register with resource management
            this.resourceManagement.registerChain(id, {
                modules: [carrier, alephModule],
                masterGain,
                start: () => {},
                stop: () => this.stopPatternTone(id)
            });

            EventSystem.emit('toneStarted', { id, patternType, isPattern: true });
            return true;
        } catch (error) {
            console.error('Error starting Aleph pattern:', error);
            EventSystem.emit('audioError', { message: 'Failed to start Aleph pattern', error });
            return false;
        }
    },

    // Handle stopping Aleph patterns
    stopPatternTone(id) {
        try {
            const pattern = AppState.audio.patternOscillators[id];
            if (!pattern) return false;

            // Fade out
            this.rampGain(pattern.masterGain.gain, 0).then(() => {
                try {
                    // Stop and cleanup components
                    if (pattern.carrier) pattern.carrier.stop();
                    if (pattern.alephModule) pattern.alephModule.stop();

                    // Disconnect
                    pattern.masterGain.disconnect();

                    // Remove references
                    delete AppState.audio.patternOscillators[id];
                    this.resourceManagement.unregisterChain(id);

                    EventSystem.emit('toneStopped', { id });
                } catch (e) {
                    console.warn('Error during pattern cleanup:', e);
                }
            });

            return true;
        } catch (error) {
            console.error('Error stopping pattern tone:', error);
            return false;
        }
    },

    // Start playing a tone
    startTone(id, frequency, options = {}) {
        const {
            type = 'sine',
            isBinaural = false,
            carrierFrequency = 200,
            volume = AppState.audio.volume,
            isPattern = false,
            patternType = null
        } = options;

        try {
            // Ensure audio context is initialized and resumed
            if (!this.init()) {
                EventSystem.emit('audioError', { message: 'Audio system not ready. Please try again.' });
                return false;
            }

            // Resume audio context if it's in suspended state
            if (AppState.audio.context.state === 'suspended') {
                AppState.audio.context.resume();
            }

            // Stop any existing tone with this ID
            this.stopTone(id);

            // Check if we're at resource limits before creating new tone
            if (Object.keys(AppState.audio.oscillators).length >= AppState.performance.maxSimultaneousTones) {
                // Find the oldest tone to replace
                this.resourceManagement.enforceResourceLimits();
            }

            // Handle different types of audio generation
            if (isPattern) {
                // Delegate to pattern handling system
                if (this.AudioModules && patternType.startsWith('aleph')) {
                    return this.startAlephPattern(id, patternType, options);
                }
                return false;
            } else if (isBinaural) {
                // Create binaural beat
                const nodes = this.createBinauralBeat(frequency, carrierFrequency);
                if (nodes) {
                    nodes.left.oscillator.start();
                    nodes.right.oscillator.start();
                    // Ramp up gain smoothly
                    this.rampGain(nodes.left.gainNode.gain, volume);
                    this.rampGain(nodes.right.gainNode.gain, volume);
                    AppState.audio.oscillators[id] = nodes;

                    // Register with resource management
                    this.resourceManagement.registerChain(id, nodes);
                }
            } else {
                // Create standard oscillator
                const nodes = this.createOscillator(frequency, type);
                if (nodes) {
                    nodes.oscillator.start();
                    this.rampGain(nodes.gainNode.gain, volume);
                    AppState.audio.oscillators[id] = nodes;

                    // Register with resource management
                    this.resourceManagement.registerChain(id, nodes);
                }
            }

            EventSystem.emit('toneStarted', { id, frequency, isBinaural, isPattern });
            return true;
        } catch (error) {
            console.error('Error starting tone:', error);
            EventSystem.emit('audioError', { message: 'Failed to start tone', error });
            return false;
        }
    },

    // Stop a specific tone
    stopTone(id) {
        try {
            const nodes = AppState.audio.oscillators[id];
            if (!nodes) {
                // Check if this is a pattern oscillator
                if (AppState.audio.patternOscillators && AppState.audio.patternOscillators[id]) {
                    return this.stopPatternTone(id);
                }
                return false;
            }

            const cleanup = () => {
                if (nodes.merger) nodes.merger.disconnect();
                delete AppState.audio.oscillators[id];
                this.resourceManagement.unregisterChain(id);
                EventSystem.emit('toneStopped', { id });
            };

            if (nodes.left && nodes.right) {
                // Binaural beat cleanup
                this.rampGain(nodes.left.gainNode.gain, 0).then(() => {
                    try {
                        nodes.left.oscillator.stop();
                        nodes.right.oscillator.stop();
                    } catch (e) {
                        console.warn('Error stopping oscillators:', e);
                    }
                    cleanup();
                });
            } else {
                // Single tone cleanup
                this.rampGain(nodes.gainNode.gain, 0).then(() => {
                    try {
                        nodes.oscillator.stop();
                    } catch (e) {
                        console.warn('Error stopping oscillator:', e);
                    }
                    cleanup();
                });
            }
            return true;
        } catch (error) {
            console.error('Error stopping tone:', error);
            EventSystem.emit('audioError', { message: 'Failed to stop tone', error });
            return false;
        }
    },

    // Stop all tones
    stopAll() {
        try {
            const activeIds = Object.keys(AppState.audio.oscillators);

            // Also get pattern oscillator IDs if they exist
            const patternIds = AppState.audio.patternOscillators ?
                Object.keys(AppState.audio.patternOscillators) : [];

            const allIds = [...activeIds, ...patternIds];

            // Immediately stop and disconnect all oscillators
            allIds.forEach(id => {
                if (activeIds.includes(id)) {
                    this.stopTone(id);
                } else if (patternIds.includes(id)) {
                    this.stopPatternTone(id);
                }
            });

            // Update UI state
            const playButtons = document.querySelectorAll(`.btn--play.playing`);
            playButtons.forEach(button => {
                button.classList.remove('playing');
                button.innerHTML = `<span class="visually-hidden">Play</span>▶`;
            });

            // Clear active tones container
            const activeTones = document.querySelector('.active-tones-container');
            if (activeTones) {
                activeTones.innerHTML = '';
            }

            // Update last tone stopped time
            AppState.audio.lastToneStoppedTime = Date.now();
            
            EventSystem.emit('allTonesStopped');
        } catch (error) {
            console.error('Error in stopAll:', error);
            // Force reset state even if cleanup fails
            AppState.audio.oscillators = {};
            if (AppState.audio.patternOscillators) {
                AppState.audio.patternOscillators = {};
            }
            EventSystem.emit('allTonesStopped');
        }
    },

    // Set master volume
    setVolume(value) {
        try {
            const newVolume = Math.max(0, Math.min(1, value));
            AppState.audio.volume = newVolume;

            if (AppState.audio.masterGain) {
                this.rampGain(AppState.audio.masterGain.gain, newVolume);
            }

            EventSystem.emit('volumeChanged', newVolume);
            return true;
        } catch (error) {
            console.error('Error setting volume:', error);
            EventSystem.emit('audioError', { message: 'Failed to set volume', error });
            return false;
        }
    },

    // Helper to ramp gain smoothly
    async rampGain(gainParam, targetValue, duration = 0.05) {
        const now = AppState.audio.context.currentTime;
        gainParam.cancelScheduledValues(now);
        gainParam.setValueAtTime(gainParam.value, now);
        gainParam.linearRampToValueAtTime(targetValue, now + duration);
        return new Promise(resolve => setTimeout(resolve, duration * 1000));
    },

    // Utility method to check if a frequency is audible
    isAudible(frequency) {
        return frequency >= 20 && frequency <= 20000;
    },

    // Utility method to format frequency for display
    formatFrequency(frequency) {
        if (frequency === null || frequency === undefined) {
            return "N/A";
        }
        return `${parseFloat(frequency).toFixed(2)} Hz`;
    },

    // Clean up and release audio resources
    cleanup() {
        try {
            // Stop all active tones
            this.stopAll();

            // Suspend audio context to save resources
            if (AppState.audio.context && AppState.audio.context.state === 'running') {
                AppState.audio.context.suspend().catch(err => {
                    console.warn('Could not suspend audio context during cleanup:', err);
                });
            }

            // Clear references to allow garbage collection
            if (AppState.audio.masterCompressor) {
                AppState.audio.masterCompressor.disconnect();
            }
            
            if (AppState.audio.masterGain) {
                AppState.audio.masterGain.disconnect();
            }
            
            // If precomputed patterns exist, clear them
            if (this.precomputedPatterns) {
                this.precomputedPatterns.clearBuffers();
            }
            
            // Stop any memory monitoring
            if (this.resourceManagement.memoryCheckInterval) {
                clearInterval(this.resourceManagement.memoryCheckInterval);
                this.resourceManagement.memoryCheckInterval = null;
            }

            EventSystem.emit('audioCleanup');
            return true;
        } catch (error) {
            console.error('Error during audio cleanup:', error);
            return false;
        }
    }
};

// Initialize AudioModules namespace
AudioSystem.AudioModules = {};

// Export the AudioSystem object
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AudioSystem };
}
