/**
 * Audio System
 * Core audio processing and management
 */

// Audio System
const AudioSystem = {
    // Worklet management
    workletModulesLoaded: false,
    workletPromises: {},

    // Resource management
    resourceManagement: {
        activeNodes: new Map(),
        maxActiveTones: 8, // Hard limit for simultaneous tones

        registerChain(id, chain) {
            this.activeNodes.set(id, {
                chain,
                createdAt: Date.now()
            });

            this.enforceResourceLimits();
        },

        unregisterChain(id) {
            this.activeNodes.delete(id);
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

            // Check for long-running tones (over 1 hour) and clean them up
            let cleanupNeeded = false;

            this.activeNodes.forEach((data, id) => {
                // Check if node has been active for more than an hour
                if (now - data.createdAt > 3600000) {
                    console.log(`Cleaning up long-running tone ${id}`);
                    AudioSystem.stopTone(id);
                    this.activeNodes.delete(id);
                    cleanupNeeded = true;
                    EventSystem.emit('autoCleanup', { id, reason: 'long-running' });
                }
            });

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
        maxSize: 16384,
        currentSize: 1024,

        // Calculate optimal buffer size based on complexity
        calculateOptimalBufferSize(moduleCount, hasAleph) {
            // Start with default
            let size = this.defaultSize;

            // Increase for module count
            size += moduleCount * 256;

            // Significantly increase for Aleph patterns
            if (hasAleph) {
                size += 2048;
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
            const context = new AudioContext();

            if (!context || typeof context.createGain !== 'function') {
                throw new Error('Invalid Audio Context');
            }

            AppState.audio.context = context;

            const masterGain = context.createGain();
            if (!masterGain) {
                throw new Error('Failed to create gain node');
            }

            AppState.audio.masterGain = masterGain;
            AppState.audio.masterGain.gain.value = AppState.audio.volume;
            AppState.audio.masterGain.connect(AppState.audio.context.destination);

            // If context is suspended (common in some browsers), try to resume it
            if (context.state === 'suspended') {
                context.resume().catch(error => {
                    console.warn('Could not resume audio context:', error);
                });
            }

            AppState.audio.isReady = true;
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

    // Add this function to the AudioSystem object near the startTone function:
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
            const alephModule = new this.AudioModules.AlephModule(ctx, patternType);

            // Create a carrier to base the pattern on
            const baseFreq = 432; // Default base frequency
            const carrier = new this.AudioModules.CarrierModule(ctx, baseFreq);

            // Apply the Aleph pattern to the carrier
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

    // Add this function to handle stopping Aleph patterns
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
            if (AppState.audio.masterGain) {
                AppState.audio.masterGain.disconnect();
            }

            EventSystem.emit('audioCleanup');
            return true;
        } catch (error) {
            console.error('Error during audio cleanup:', error);
            return false;
        }
    }
};

// Export the AudioSystem object
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AudioSystem };
}
