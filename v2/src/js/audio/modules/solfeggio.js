/**
 * Solfeggio Module
 * Implements Solfeggio tuning frequencies
 */

// Applies Solfeggio tuning to a carrier
AudioSystem.AudioModules.SolfeggioModule = class extends AudioSystem.AudioModules.BaseModule {
    constructor(ctx, solfNote) {
        super(ctx);
        this.input = ctx.createGain();
        this.output = ctx.createGain();
        this.input.connect(this.output);
        
        // Solfeggio frequencies
        this.solfeggioMap = {
            ut: 396, // Liberating guilt and fear
            re: 417, // Undoing situations and facilitating change
            mi: 528, // Transformation and miracles (DNA repair)
            fa: 639, // Connecting/relationships
            sol: 741, // Awakening intuition
            la: 852, // Returning to spiritual order
            si: 963  // Awakening perfect state/higher consciousness
        };
        
        this.note = solfNote;
        this.frequency = this.solfeggioMap[solfNote] || 432;
        this.originalFrequency = null;
        this.carrierRef = null;
    }
    
    // This module modifies the frequency of the previous carrier
    apply(carrierModule) {
        // Store reference to carrier for potential reset
        this.carrierRef = carrierModule;
        
        // Store original frequency in case we need to restore it
        this.originalFrequency = carrierModule.oscillator.frequency.value;
        
        // Apply the solfeggio frequency
        carrierModule.setFrequency(this.frequency);
        return this;
    }
    
    // Change the solfeggio note
    setNote(solfNote) {
        if (this.solfeggioMap[solfNote]) {
            this.note = solfNote;
            this.frequency = this.solfeggioMap[solfNote];
            
            // Update carrier if we have a reference
            if (this.carrierRef) {
                this.carrierRef.setFrequency(this.frequency);
            }
        }
        return this;
    }
    
    // Restore original frequency
    reset() {
        if (this.carrierRef && this.originalFrequency) {
            this.carrierRef.setFrequency(this.originalFrequency);
        }
        return this;
    }
    
    // Find the nearest solfeggio note to a given frequency
    static findNearestNote(frequency) {
        const solfeggioMap = {
            ut: 396,
            re: 417,
            mi: 528,
            fa: 639,
            sol: 741,
            la: 852,
            si: 963
        };
        
        let closestNote = 'ut';
        let closestDiff = Math.abs(solfeggioMap.ut - frequency);
        
        for (const [note, freq] of Object.entries(solfeggioMap)) {
            const diff = Math.abs(freq - frequency);
            if (diff < closestDiff) {
                closestDiff = diff;
                closestNote = note;
            }
        }
        
        return closestNote;
    }
    
    cleanup() {
        this.reset();
        this.disconnect();
        this.carrierRef = null;
        return true;
    }
};

// Export the module if in a module environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        SolfeggioModule: AudioSystem.AudioModules.SolfeggioModule
    };
}
