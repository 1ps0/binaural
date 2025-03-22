/**
 * Binaural Module
 * Creates binaural beat effect by generating slightly different frequencies in each ear
 */

// Creates a binaural effect by generating left/right variations
AudioSystem.AudioModules.BinauralModule = class extends AudioSystem.AudioModules.BaseModule {
    constructor(ctx, beatFrequency = 7.83) {
        super(ctx);
        this.beatFrequency = beatFrequency;
        
        // Create stereo merger
        this.merger = ctx.createChannelMerger(2);
        this.leftGain = ctx.createGain();
        this.rightGain = ctx.createGain();
        
        // Connect to merger
        this.leftGain.connect(this.merger, 0, 0);  // Left channel
        this.rightGain.connect(this.merger, 0, 1); // Right channel
        
        this.input = ctx.createGain(); // Placeholder input
        this.output = this.merger;
        
        this.rightOsc = null; // Will be created during apply
        this.isApplied = false;
    }
    
    apply(carrierModule) {
        // Create a second oscillator for the right ear
        const baseFreq = carrierModule.oscillator.frequency.value;
        
        // Disconnect the carrier from its gain
        carrierModule.oscillator.disconnect();
        
        // Create the right ear oscillator
        this.rightOsc = this.ctx.createOscillator();
        this.rightOsc.type = carrierModule.oscillator.type;
        this.rightOsc.frequency.value = baseFreq + this.beatFrequency;
        
        // Connect to appropriate channels
        carrierModule.oscillator.connect(this.leftGain);
        this.rightOsc.connect(this.rightGain);
        
        this.isApplied = true;
        return this;
    }
    
    setBeatFrequency(freq) {
        if (this.rightOsc && this.isApplied) {
            // Update the right oscillator frequency to maintain the beat
            const leftFreq = this.leftOsc ? this.leftOsc.frequency.value : 
                             (this.carrierRef ? this.carrierRef.oscillator.frequency.value : 200);
            this.rightOsc.frequency.value = leftFreq + freq;
            this.beatFrequency = freq;
        }
        return this;
    }
    
    start() {
        if (this.rightOsc && this.isApplied) {
            try {
                this.rightOsc.start();
            } catch (e) {
                console.warn('Error starting right oscillator:', e);
            }
        }
        return this;
    }
    
    stop() {
        if (this.rightOsc && this.isApplied) {
            try {
                // Ramp down gain first to avoid clicks
                const now = this.ctx.currentTime;
                this.leftGain.gain.cancelScheduledValues(now);
                this.rightGain.gain.cancelScheduledValues(now);
                this.leftGain.gain.setValueAtTime(this.leftGain.gain.value, now);
                this.rightGain.gain.setValueAtTime(this.rightGain.gain.value, now);
                this.leftGain.gain.linearRampToValueAtTime(0, now + 0.05);
                this.rightGain.gain.linearRampToValueAtTime(0, now + 0.05);
                
                // Schedule oscillator stop after gain ramp
                setTimeout(() => {
                    try {
                        this.rightOsc.stop();
                    } catch (e) {
                        console.warn('Error stopping right oscillator:', e);
                    }
                }, 60);
            } catch (e) {
                console.warn('Error during binaural stop:', e);
                // Attempt immediate stop as fallback
                try {
                    this.rightOsc.stop();
                } catch (e) {
                    console.warn('Error in fallback right oscillator stop:', e);
                }
            }
        }
        return this;
    }
    
    setVolume(vol, rampTime = 0.05) {
        const now = this.ctx.currentTime;
        this.leftGain.gain.cancelScheduledValues(now);
        this.rightGain.gain.cancelScheduledValues(now);
        this.leftGain.gain.setValueAtTime(this.leftGain.gain.value, now);
        this.rightGain.gain.setValueAtTime(this.rightGain.gain.value, now);
        this.leftGain.gain.linearRampToValueAtTime(vol, now + rampTime);
        this.rightGain.gain.linearRampToValueAtTime(vol, now + rampTime);
        return this;
    }
    
    cleanup() {
        try {
            this.stop();
            this.leftGain.disconnect();
            this.rightGain.disconnect();
            this.merger.disconnect();
            this.isApplied = false;
            this.rightOsc = null;
            return true;
        } catch (e) {
            console.warn('Error during binaural cleanup:', e);
            return false;
        }
    }
};

// Export the module if in a module environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        BinauralModule: AudioSystem.AudioModules.BinauralModule
    };
}
