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
        
        // Solfeggio frequencies and their observed/proposed applications
        this.solfeggioMap = {
            ut: 396, // Research into fear/guilt processing, potentially related to stress reduction
            re: 417, // Investigation of cognitive restructuring and adaptation to change
            mi: 528, // Study of cellular repair mechanisms and genetic expression
            fa: 639, // Exploration of interpersonal communication and social bonding
            sol: 741, // Analysis of intuitive decision-making and problem-solving
            la: 852, // Examination of cognitive organization and systemic regulation
            si: 963  // Research into altered states of consciousness and peak performance
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
