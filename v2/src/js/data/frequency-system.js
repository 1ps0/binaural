/**
 * Frequency Data System
 * Manages frequency data and user preferences
 */

// Frequency Data System
const FrequencySystem = {
    // Core frequency data
    data: {
        cognitive_enhancement: [
            {
                id: 'gamma-focus-40hz',
                title: 'Gamma Focus Protocol',
                frequency: 40,
                type: 'binaural',
                category: 'gamma',
                carrierFrequency: 200,
                description: 'Targets gamma wave entrainment (40Hz) for enhanced working memory and sustained attention. Measured improvements in cognitive binding tasks.',
                warning: null
            },
            {
                id: 'beta-concentration-15hz',
                title: 'Beta Concentration Mode',
                frequency: 15,
                type: 'binaural',
                category: 'beta',
                carrierFrequency: 200,
                description: 'Beta wave entrainment (15Hz) for sustained cognitive performance. Optimizes prefrontal cortex activation patterns.',
                warning: null
            },
            {
                id: 'solfeggio-741hz',
                title: 'Cognitive Restructuring 741Hz',
                frequency: 741,
                type: 'solfeggio',
                category: 'cognitive',
                description: '741Hz solfeggio frequency. Research indicates potential for enhanced problem-solving and mental flexibility.',
                warning: null
            },
            {
                id: 'solfeggio-852hz',
                title: 'Perceptual Processing 852Hz',
                frequency: 852,
                type: 'solfeggio',
                category: 'cognitive',
                description: '852Hz solfeggio frequency. Studies suggest improved pattern recognition and perceptual integration.',
                warning: null
            }
        ],
        creative_processing: [
            {
                id: 'theta-creativity-6hz',
                title: 'Theta Creative State',
                frequency: 6,
                type: 'binaural',
                category: 'theta',
                carrierFrequency: 200,
                description: 'Theta wave entrainment (6Hz) for enhanced creative ideation. Correlates with increased default mode network activity.',
                warning: null
            },
            {
                id: 'theta-insight-4.5hz',
                title: 'Insight Problem-Solving',
                frequency: 4.5,
                type: 'binaural',
                category: 'theta',
                carrierFrequency: 200,
                description: 'Low theta (4.5Hz) for insight problem-solving tasks. Facilitates right hemisphere processing and pattern synthesis.',
                warning: null
            },
            {
                id: 'schumann-7.83hz',
                title: 'Schumann Resonance Sync',
                frequency: 7.83,
                type: 'special',
                category: 'geomagnetic',
                description: "Earth's fundamental electromagnetic frequency (7.83Hz). Theoretical synchronization with natural circadian rhythms.",
                warning: 'Sub-audible frequency. Effects may be subtle or placebo-based.'
            },
            {
                id: 'solfeggio-963hz',
                title: 'Neural Integration 963Hz',
                frequency: 963,
                type: 'solfeggio',
                category: 'integrative',
                description: '963Hz solfeggio frequency. Hypothesized to enhance neural network integration and cognitive coherence.',
                warning: null
            }
        ],
        sleep_optimization: [
            {
                id: 'delta-sleep-2hz',
                title: 'Delta Sleep Induction',
                frequency: 2,
                type: 'binaural',
                category: 'delta',
                carrierFrequency: 200,
                description: 'Delta wave entrainment (2Hz) for sleep onset. Targets slow-wave sleep promotion and reduced sleep latency.',
                warning: null
            },
            {
                id: 'delta-deep-3.5hz',
                title: 'Deep Sleep Maintenance',
                frequency: 3.5,
                type: 'binaural',
                category: 'delta',
                carrierFrequency: 200,
                description: 'Mid-delta (3.5Hz) for deep sleep maintenance. Supports N3 sleep stage duration and quality.',
                warning: null
            },
            {
                id: 'solfeggio-639hz',
                title: 'Stress Reduction 639Hz',
                frequency: 639,
                type: 'solfeggio',
                category: 'autonomic',
                description: '639Hz solfeggio frequency. May reduce cortisol levels and promote parasympathetic activation before sleep.',
                warning: null
            },
            {
                id: 'solfeggio-396hz',
                title: 'Anxiety Modulation 396Hz',
                frequency: 396,
                type: 'solfeggio',
                category: 'autonomic',
                description: '396Hz solfeggio frequency. Research into anxiolytic effects and stress response regulation.',
                warning: null
            }
        ],
        attention_regulation: [
            {
                id: 'alpha-focus-10hz',
                title: 'Alpha Attention State',
                frequency: 10,
                type: 'binaural',
                category: 'alpha',
                carrierFrequency: 200,
                description: 'Alpha wave entrainment (10Hz) for relaxed attention. Maintains alertness while reducing cognitive load.',
                warning: null
            },
            {
                id: 'solfeggio-432hz',
                title: 'Harmonic Tuning 432Hz',
                frequency: 432,
                type: 'solfeggio',
                category: 'harmonic',
                description: '432Hz carrier frequency. Alternative tuning standard studied for potential psychoacoustic effects.',
                warning: null
            },
            {
                id: 'solfeggio-417hz',
                title: 'Cognitive Flexibility 417Hz',
                frequency: 417,
                type: 'solfeggio',
                category: 'adaptive',
                description: '417Hz solfeggio frequency. Investigated for effects on cognitive flexibility and mental adaptation.',
                warning: null
            }
        ],
        physiological_regulation: [
            {
                id: 'solfeggio-528hz',
                title: 'Cellular Frequency 528Hz',
                frequency: 528,
                type: 'solfeggio',
                category: 'cellular',
                description: '528Hz solfeggio frequency. Research into potential effects on DNA repair mechanisms and cellular processes.',
                warning: 'Claims of DNA repair are speculative. Use for research purposes only.'
            },
            {
                id: 'low-frequency-174hz',
                title: 'Pain Modulation 174Hz',
                frequency: 174,
                type: 'special',
                category: 'nociceptive',
                description: '174Hz low frequency tone. Studies investigate potential analgesic effects and pain signal modulation.',
                warning: 'Not a medical treatment. Consult healthcare providers for pain management.'
            },
            {
                id: 'solfeggio-396hz-alt',
                title: 'Stress Response 396Hz',
                frequency: 396,
                type: 'solfeggio',
                category: 'autonomic',
                description: '396Hz solfeggio frequency. Research into HPA axis modulation and stress hormone regulation.',
                warning: null
            },
            {
                id: 'solfeggio-963hz-alt',
                title: 'Neural Coherence 963Hz',
                frequency: 963,
                type: 'solfeggio',
                category: 'neural',
                description: '963Hz solfeggio frequency. Studies examine effects on neural synchronization and brain network coherence.',
                warning: null
            },
            {
                id: 'solfeggio-852hz-alt',
                title: 'Cognitive Control 852Hz',
                frequency: 852,
                type: 'solfeggio',
                category: 'executive',
                description: '852Hz solfeggio frequency. Research into executive function enhancement and cognitive control mechanisms.',
                warning: null
            },
            {
                id: 'solfeggio-639hz-alt',
                title: 'Social Cognition 639Hz',
                frequency: 639,
                type: 'solfeggio',
                category: 'social',
                description: '639Hz solfeggio frequency. Studies investigate effects on social cognition and interpersonal neural synchrony.',
                warning: null
            }
        ],
        experimental_protocols: [
            {
                id: 'aleph-pattern-1',
                title: 'Algorithmic Pattern Alpha',
                frequency: null,
                type: 'special',
                category: 'algorithmic',
                description: 'Complex frequency pattern based on mathematical series. Experimental protocol for non-linear auditory stimulation.',
                warning: 'Experimental. Effects unpredictable. Use with caution.'
            },
            {
                id: 'aleph-pattern-2',
                title: 'Algorithmic Pattern Beta',
                frequency: null,
                type: 'special',
                category: 'algorithmic',
                description: 'Advanced multi-frequency synthesis using mathematical progressions. Research into complex auditory processing.',
                warning: 'Advanced experimental protocol. May cause disorientation.'
            },
            {
                id: 'aleph-pattern-3',
                title: 'Algorithmic Pattern Gamma',
                frequency: null,
                type: 'special',
                category: 'algorithmic',
                description: 'Highest complexity frequency matrix. Combines multiple mathematical sequences for advanced research applications.',
                warning: 'Highly experimental. Requires controlled environment and monitoring.'
            }
        ]
    },

    // Frequency scales and definitions
    reference: {
        // Solfeggio Frequency Scale - Research Applications
        solfeggio: {
            ut: 396, // Stress response modulation, anxiety research
            re: 417, // Cognitive flexibility, adaptation studies
            mi: 528, // Cellular process research, DNA studies
            fa: 639, // Social cognition, interpersonal synchrony
            sol: 741, // Problem-solving, cognitive restructuring
            la: 852, // Executive function, cognitive control
            si: 963  // Neural integration, coherence studies
        },
        
        // Brainwave Frequency Bands
        brainwaves: {
            delta: '0.5-4 Hz', // Slow-wave sleep, deep rest protocols
            theta: '4-8 Hz',   // Creative processing, insight tasks
            alpha: '8-14 Hz',  // Relaxed attention, learning states
            beta: '14-30 Hz',  // Active cognition, focused processing
            gamma: '30-100 Hz' // Binding, working memory, attention
        },
        
        // Experimental Pattern Information
        algorithmic: {
            description: "Algorithmic patterns use mathematical sequences to generate complex auditory stimuli. These are experimental protocols for research into non-linear auditory processing and complex pattern recognition. Not based on traditional frequency theory.",
            applications: [
                "Complex pattern recognition research",
                "Non-linear auditory processing studies", 
                "Advanced psychoacoustic experimentation"
            ],
            warning: "Experimental protocols with unpredictable effects. Use only in controlled research environments with proper monitoring."
        }
    },

    init() {
        this.loadPinnedFrequencies();
        this.setupListeners();
    },

    setupListeners() {
        EventSystem.on('frequencyPinned', ({ id, type }) => {
            this.pinFrequency(id, type);
            UISystem.render();
        });

        EventSystem.on('frequencyUnpinned', ({ id, type }) => {
            this.unpinFrequency(id, type);
            UISystem.render();
        });
    },

    // Get all frequencies of a specific type
    getFrequencies(type) {
        return this.data[type] || [];
    },

    // Get a specific frequency by ID
    getFrequency(id) {
        // Search in all categories
        for (const category of Object.keys(this.data)) {
            const found = this.data[category].find(f => f.id === id);
            if (found) return found;
        }
        return null;
    },

    // Search frequencies across all types
    searchFrequencies(query) {
        query = query.toLowerCase().trim();
        const results = [];

        Object.keys(this.data).forEach(type => {
            this.data[type].forEach(freq => {
                if (
                    freq.title.toLowerCase().includes(query) ||
                    freq.description.toLowerCase().includes(query) ||
                    (freq.frequency && freq.frequency.toString().includes(query))
                ) {
                    results.push(freq);
                }
            });
        });

        return results;
    },

    // Pin management
    pinFrequency(id, type) {
        const freq = this.getFrequency(id);
        if (!freq) return false;

        // Find which category this frequency belongs to
        let category;
        for (const [cat, freqs] of Object.entries(this.data)) {
            if (freqs.find(f => f.id === id)) {
                category = cat;
                break;
            }
        }

        if (category && !AppState.frequencies.pinned[category].includes(id)) {
            AppState.frequencies.pinned[category].push(id);
            this.savePinnedFrequencies();
            EventSystem.emit('pinsUpdated', AppState.frequencies.pinned);
            return true;
        }
        return false;
    },

    unpinFrequency(id, type) {
        // Find which category this frequency belongs to
        let category;
        for (const [cat, freqs] of Object.entries(this.data)) {
            if (freqs.find(f => f.id === id)) {
                category = cat;
                break;
            }
        }

        if (category) {
            const index = AppState.frequencies.pinned[category].indexOf(id);
            if (index > -1) {
                AppState.frequencies.pinned[category].splice(index, 1);
                this.savePinnedFrequencies();
                EventSystem.emit('pinsUpdated', AppState.frequencies.pinned);
                return true;
            }
        }
        return false;
    },

    unpinAll() {
        Object.keys(AppState.frequencies.pinned).forEach(type => {
            AppState.frequencies.pinned[type] = [];
        });
        this.savePinnedFrequencies();
        EventSystem.emit('pinsUpdated', AppState.frequencies.pinned);
    },

    // Get all pinned frequencies as full objects
    getPinnedFrequencies() {
        const pinned = {};
        Object.keys(AppState.frequencies.pinned).forEach(category => {
            pinned[category] = AppState.frequencies.pinned[category]
                .map(id => this.getFrequency(id))
                .filter(Boolean);
        });
        return pinned;
    },

    // Local storage management
    savePinnedFrequencies() {
        try {
            localStorage.setItem('pinnedFrequencies', JSON.stringify(AppState.frequencies.pinned));
        } catch (e) {
            console.warn('Could not save pinned frequencies to localStorage:', e);
        }
    },

    loadPinnedFrequencies() {
        try {
            const saved = localStorage.getItem('pinnedFrequencies');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Validate the structure
                if (typeof parsed === 'object' && parsed !== null) {
                    // Handle migration from old format if necessary
                    if (parsed.binaural || parsed.solfeggio || parsed.special) {
                        AppState.frequencies.pinned = {
                            cognitive_enhancement: [],
                            creative_processing: [],
                            sleep_optimization: [],
                            attention_regulation: [],
                            physiological_regulation: []
                        };
                    } else {
                        AppState.frequencies.pinned = {
                            cognitive_enhancement: Array.isArray(parsed.focus) ? parsed.focus : [],
                            creative_processing: Array.isArray(parsed.meditation) ? parsed.meditation : [],
                            sleep_optimization: Array.isArray(parsed.sleep) ? parsed.sleep : [],
                            attention_regulation: Array.isArray(parsed.relaxation) ? parsed.relaxation : [],
                            physiological_regulation: Array.isArray(parsed.healing || parsed.restorative) ? (parsed.healing || parsed.restorative) : []
                        };
                        // Add experimental protocols category if it doesn't exist
                        if (!parsed.experimental_protocols) {
                            AppState.frequencies.pinned.experimental_protocols = [];
                        } else {
                            AppState.frequencies.pinned.experimental_protocols = parsed.experimental_protocols;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error loading pinned frequencies:', error);
            // Reset to default state
            AppState.frequencies.pinned = {
                cognitive_enhancement: [],
                creative_processing: [],
                sleep_optimization: [],
                attention_regulation: [],
                physiological_regulation: [],
                experimental_protocols: []
            };
        }
    },

    // Utility methods
    getCategoryInfo(category) {
        const categories = {
            delta: { name: 'Delta', range: '0.5-4 Hz', description: 'Slow-wave sleep, deep rest protocols' },
            theta: { name: 'Theta', range: '4-8 Hz', description: 'Creative processing, insight tasks' },
            alpha: { name: 'Alpha', range: '8-14 Hz', description: 'Relaxed attention, learning states' },
            beta: { name: 'Beta', range: '14-30 Hz', description: 'Active cognition, focused processing' },
            gamma: { name: 'Gamma', range: '30-100 Hz', description: 'Binding, working memory, attention' },
            cognitive: { name: 'Cognitive', range: 'Various', description: 'Cognitive function enhancement protocols' },
            autonomic: { name: 'Autonomic', range: 'Various', description: 'Autonomic nervous system regulation' },
            cellular: { name: 'Cellular', range: 'Various', description: 'Cellular process research frequencies' },
            neural: { name: 'Neural', range: 'Various', description: 'Neural network and coherence studies' },
            social: { name: 'Social', range: 'Various', description: 'Social cognition and communication research' },
            algorithmic: { name: 'Algorithmic', range: 'Complex', description: 'Experimental mathematical pattern protocols' }
        };
        return categories[category] || null;
    },

    getSectionDescription(type) {
        const descriptions = {
            cognitive_enhancement: 'Frequencies targeting sustained attention, working memory, and executive cognitive functions.',
            creative_processing: 'Protocols for enhanced creative ideation, insight problem-solving, and divergent thinking.',
            sleep_optimization: 'Delta wave entrainment and related frequencies for sleep induction and maintenance.',
            attention_regulation: 'Alpha wave protocols for maintaining relaxed attention and reducing cognitive load.',
            physiological_regulation: 'Research frequencies investigating autonomic, cellular, and neural system effects.',
            experimental_protocols: 'Advanced algorithmic patterns for complex auditory processing research.'
        };
        return descriptions[type] || '';
    },
    
    // Clean up memory usage
    cleanup() {
        // Save pinned frequencies before cleanup
        this.savePinnedFrequencies();
        
        // Remove event listeners
        EventSystem.off('frequencyPinned');
        EventSystem.off('frequencyUnpinned');
    }
};

// Export the FrequencySystem object if in a module environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FrequencySystem };
}
