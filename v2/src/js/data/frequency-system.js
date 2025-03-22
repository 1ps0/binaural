/**
 * Frequency Data System
 * Manages frequency data and user preferences
 */

// Frequency Data System
const FrequencySystem = {
    // Core frequency data
    data: {
        focus: [
            {
                id: 'deep-focus-40hz',
                title: 'Deep Focus',
                frequency: 40,
                type: 'binaural',
                category: 'gamma',
                carrierFrequency: 200,
                description: 'Enhance mental clarity and focus with gamma waves. Ideal for complex tasks, studying, or when you need peak cognitive performance.',
                warning: null
            },
            {
                id: 'flow-state-15hz',
                title: 'Flow State',
                frequency: 15,
                type: 'binaural',
                category: 'beta',
                carrierFrequency: 200,
                description: 'Enter a state of focused productivity. Perfect for sustained attention, problem-solving, and getting in the zone.',
                warning: null
            },
            {
                id: 'negativity-741hz',
                title: 'Negativity Suppression',
                frequency: 741,
                type: 'solfeggio',
                category: 'healing',
                description: 'Remove toxins and solve problems. This frequency helps clear negative energy and promotes expression and solution-finding.',
                warning: null
            },
            {
                id: 'mental-clarity-852hz',
                title: 'Mental Clarity',
                frequency: 852,
                type: 'solfeggio',
                category: 'healing',
                description: 'Awaken intuition and enhance clarity of thought. This frequency helps return to spiritual order and strengthens perception.',
                warning: null
            },
            {
                id: 'aleph-focus',
                title: 'Aleph Clarity',
                frequency: null,
                type: 'special',
                category: 'transcendental',
                description: 'Using mathematical patterns based on Aleph-null to create sustained attention through infinite recursion principles.',
                warning: 'Creates a unique cognitive state that may initially feel unfamiliar. Start with short sessions.'
            }
        ],
        meditation: [
            {
                id: 'deep-meditation-6hz',
                title: 'Deep Meditation',
                frequency: 6,
                type: 'binaural',
                category: 'theta',
                carrierFrequency: 200,
                description: 'Access profound meditative states easily. Helps quiet mental chatter and access deeper awareness.',
                warning: null
            },
            {
                id: 'creative-insight-4.5hz',
                title: 'Creative Insight',
                frequency: 4.5,
                type: 'binaural',
                category: 'theta',
                carrierFrequency: 200,
                description: 'Unlock creative inspiration and intuitive insights. Perfect for brainstorming, artistic work, or problem-solving.',
                warning: null
            },
            {
                id: 'mindful-presence-7.83hz',
                title: 'Earth Resonance',
                frequency: 7.83,
                type: 'special',
                category: 'earth',
                description: "Align with Earth's natural frequency for grounding and balance. Helps reduce stress and restore natural rhythms.",
                warning: 'This subtle frequency works through resonance rather than direct hearing.'
            },
            {
                id: 'spiritual-connection-963hz',
                title: 'Crown Connection',
                frequency: 963,
                type: 'solfeggio',
                category: 'healing',
                description: 'Connect with higher awareness and spiritual insight. Creates a sense of oneness and transcendent peace.',
                warning: null
            },
            {
                id: 'aleph-infinity',
                title: 'Aleph Consciousness',
                frequency: null,
                type: 'special',
                category: 'transcendental',
                description: 'Based on the concept of Aleph from set theory, representing infinite consciousness. This frequency pattern creates a mathematical approach to higher awareness states.',
                warning: 'Not a single frequency but a complex pattern designed to evoke experiences of boundlessness and non-duality.'
            }
        ],
        sleep: [
            {
                id: 'deep-sleep-2hz',
                title: 'Sleep Sanctuary',
                frequency: 2,
                type: 'binaural',
                category: 'delta',
                carrierFrequency: 200,
                description: 'Guide your brain into deep, restorative sleep patterns. Ideal for overcoming insomnia or enhancing sleep quality.',
                warning: null
            },
            {
                id: 'twilight-3.5hz',
                title: 'Twilight Transition',
                frequency: 3.5,
                type: 'binaural',
                category: 'delta',
                carrierFrequency: 200,
                description: 'Ease the transition from wakefulness to sleep. Perfect for power naps or preparing for deep rest.',
                warning: null
            },
            {
                id: 'sleep-harmony-639hz',
                title: 'Connection & Harmony',
                frequency: 639,
                type: 'solfeggio',
                category: 'healing',
                description: 'Enhances relationships, connection, and harmony. Helps resolve conflicts and promotes peaceful sleep through balanced emotions.',
                warning: null
            },
            {
                id: 'emotional-release-396hz',
                title: 'Emotional Freedom',
                frequency: 396,
                type: 'solfeggio',
                category: 'healing',
                description: 'Release emotional blockages and transform guilt into joy. Supports liberation from limiting patterns that may disturb sleep.',
                warning: null
            }
        ],
        relaxation: [
            {
                id: 'calm-clarity-10hz',
                title: 'Calm Clarity',
                frequency: 10,
                type: 'binaural',
                category: 'alpha',
                carrierFrequency: 200,
                description: 'Find your center with alert relaxation. Ideal for reading, light meditation, or unwinding while staying present.',
                warning: null
            },
            {
                id: 'stress-relief-432hz',
                title: 'Harmonic Balance',
                frequency: 432,
                type: 'solfeggio',
                category: 'healing',
                description: 'Experience natural harmony and deep relaxation. Many find this frequency more pleasing than standard tuning.',
                warning: null
            },
            {
                id: 'peaceful-mind-417hz',
                title: 'Change Facilitator',
                frequency: 417,
                type: 'solfeggio',
                category: 'healing',
                description: 'Facilitates change and breaks down energy blockages. Helps dissolve crystallized emotional patterns for deeper relaxation.',
                warning: null
            },
            {
                id: 'aleph-zero',
                title: 'Aleph Foundation',
                frequency: null,
                type: 'special',
                category: 'transcendental',
                description: 'Working with the concept of countable infinity, this pattern helps establish a stable foundation for relaxation by balancing finite and infinite perspectives.',
                warning: 'A gentle introduction to Aleph patterns, suitable for relaxation practices.'
            }
        ],
        healing: [
            {
                id: 'cellular-harmony-528hz',
                title: 'DNA Harmony',
                frequency: 528,
                type: 'solfeggio',
                category: 'healing',
                description: 'Known as the "miracle tone" for its potential cellular healing effects. Associated with transformation and repair.',
                warning: null
            },
            {
                id: 'pain-relief-174hz',
                title: 'Gentle Relief',
                frequency: 174,
                type: 'special',
                category: 'healing',
                description: 'Natural frequency associated with pain reduction and muscle relaxation. Helps ease physical tension.',
                warning: null
            },
            {
                id: 'emotional-release-396hz',
                title: 'Emotional Freedom',
                frequency: 396,
                type: 'solfeggio',
                category: 'healing',
                description: 'Release emotional blockages and transform guilt into joy. Supports liberation from limiting patterns.',
                warning: null
            },
            {
                id: 'spiritual-connection-963hz',
                title: 'Crown Connection',
                frequency: 963,
                type: 'solfeggio',
                category: 'healing',
                description: 'Connect with higher awareness and spiritual insight. Creates a sense of oneness and transcendent peace.',
                warning: null
            },
            {
                id: 'intuition-852hz',
                title: 'Third Eye Activation',
                frequency: 852,
                type: 'solfeggio',
                category: 'healing',
                description: 'Awakens intuition and inner wisdom. Helps return to spiritual order and strengthens the energy of the third eye chakra.',
                warning: null
            },
            {
                id: 'relationship-healing-639hz',
                title: 'Relationship Harmony',
                frequency: 639,
                type: 'solfeggio',
                category: 'healing',
                description: 'Enhances communication, understanding, and harmonious connections. Balances emotions and relationships.',
                warning: null
            },
            {
                id: 'aleph-null',
                title: 'Aleph Healing Matrix',
                frequency: null,
                type: 'special',
                category: 'transcendental',
                description: 'Using the mathematical concept of Aleph-null (smallest infinite cardinal), this matrix creates healing through complex frequency patterns that work on multiple dimensions simultaneously.',
                warning: 'This is an advanced frequency pattern that may cause temporary disorientation as it works on multiple levels of consciousness.'
            }
        ],
        transcendental: [
            {
                id: 'aleph-one',
                title: 'Aleph Continuum',
                frequency: null,
                type: 'special',
                category: 'transcendental',
                description: 'Based on Cantor\'s first transfinite number, this frequency pattern works with the concept of uncountable infinity to expand awareness beyond conventional boundaries.',
                warning: 'May temporarily alter perception of time and space. Use in a safe, comfortable environment.'
            },
            {
                id: 'aleph-two',
                title: 'Aleph Expansion',
                frequency: null,
                type: 'special',
                category: 'transcendental',
                description: 'Representing higher-order infinity, this pattern works with the mathematical concept of power sets to create exponential expansion of consciousness.',
                warning: 'Advanced users only. May produce profound non-ordinary states of consciousness.'
            },
            {
                id: 'aleph-integration',
                title: 'Aleph Integration',
                frequency: null,
                type: 'special',
                category: 'transcendental',
                description: 'A balanced matrix of Aleph patterns designed to integrate transcendental experiences with everyday consciousness, helping to ground insights from non-ordinary states.',
                warning: 'Best used as a closing practice after other Aleph sessions to integrate experiences.'
            },
            {
                id: 'unified-field-infinity',
                title: 'Unified Field',
                frequency: null,
                type: 'special',
                category: 'transcendental',
                description: 'Combines principles from all Solfeggio frequencies with Aleph mathematical patterns to create a unified field of consciousness that harmonizes all energy centers.',
                warning: 'Our most advanced frequency matrix. Start with shorter sessions of 5-10 minutes.'
            }
        ]
    },

    // Frequency scales and definitions
    reference: {
        // Complete Solfeggio Frequency Scale
        solfeggio: {
            ut: 396, // Liberating guilt and fear
            re: 417, // Undoing situations and facilitating change
            mi: 528, // Transformation and miracles (DNA repair)
            fa: 639, // Connecting/relationships
            sol: 741, // Awakening intuition
            la: 852, // Returning to spiritual order
            si: 963  // Awakening perfect state/higher consciousness
        },
        
        // Brainwave Frequencies
        brainwaves: {
            delta: '0.5-4 Hz', // Deep sleep, healing
            theta: '4-8 Hz',   // Meditation, creativity
            alpha: '8-13 Hz',  // Relaxation, learning
            beta: '13-30 Hz',  // Active thinking, focus
            gamma: '30-100 Hz' // Higher processing, insight
        },
        
        // Aleph Frequency Information
        aleph: {
            description: "The Aleph frequencies are based on mathematical concepts of infinity from set theory. Unlike conventional frequencies measured in Hertz, Aleph patterns work with complex mathematical relationships to create experiences that transcend ordinary perception. These are not single tones but rather matrices of frequency relationships designed to evoke experiences of boundlessness and non-duality.",
            types: [
                {
                    name: "Aleph-null (ℵ₀)",
                    concept: "Countable infinity",
                    application: "Foundation for expanded awareness"
                },
                {
                    name: "Aleph-one (ℵ₁)",
                    concept: "Uncountable infinity (continuum)",
                    application: "Transcendence of conventional boundaries"
                },
                {
                    name: "Aleph-two (ℵ₂)",
                    concept: "Power set of continuum",
                    application: "Exponential consciousness expansion"
                }
            ],
            warning: "The Aleph series represents advanced consciousness technology and should be approached gradually. These are not conventional frequencies but rather mathematical patterns designed to evoke specific states of awareness."
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
                            focus: [],
                            meditation: [],
                            sleep: [],
                            relaxation: [],
                            healing: []
                        };
                    } else {
                        AppState.frequencies.pinned = {
                            focus: Array.isArray(parsed.focus) ? parsed.focus : [],
                            meditation: Array.isArray(parsed.meditation) ? parsed.meditation : [],
                            sleep: Array.isArray(parsed.sleep) ? parsed.sleep : [],
                            relaxation: Array.isArray(parsed.relaxation) ? parsed.relaxation : [],
                            healing: Array.isArray(parsed.healing) ? parsed.healing : []
                        };
                        // Add transcendental category if it doesn't exist
                        if (!parsed.transcendental) {
                            AppState.frequencies.pinned.transcendental = [];
                        } else {
                            AppState.frequencies.pinned.transcendental = parsed.transcendental;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error loading pinned frequencies:', error);
            // Reset to default state
            AppState.frequencies.pinned = {
                focus: [],
                meditation: [],
                sleep: [],
                relaxation: [],
                healing: [],
                transcendental: []
            };
        }
    },

    // Utility methods
    getCategoryInfo(category) {
        const categories = {
            delta: { name: 'Delta', range: '0.5-4 Hz', description: 'Deep sleep, healing' },
            theta: { name: 'Theta', range: '4-8 Hz', description: 'Meditation, creativity' },
            alpha: { name: 'Alpha', range: '8-14 Hz', description: 'Relaxation, learning' },
            beta: { name: 'Beta', range: '14-30 Hz', description: 'Focus, alertness' },
            gamma: { name: 'Gamma', range: '30-100 Hz', description: 'Cognitive enhancement' },
            healing: { name: 'Healing', range: 'Various', description: 'Traditional healing frequencies' },
            earth: { name: 'Earth', range: 'Various', description: 'Natural Earth frequencies' },
            transcendental: { name: 'Transcendental', range: 'Complex', description: 'Advanced consciousness patterns' }
        };
        return categories[category] || null;
    },

    getSectionDescription(type) {
        const descriptions = {
            focus: 'Enhance concentration, mental clarity, and cognitive performance for your most important work.',
            meditation: 'Access deeper states of awareness, creativity, and inner peace with these consciousness-expanding frequencies.',
            sleep: 'Improve your sleep quality with frequencies that guide your brain into natural sleep patterns.',
            relaxation: 'Find balance between relaxation and alertness, perfect for unwinding while staying present.',
            healing: 'Traditional frequencies associated with physical, emotional, and spiritual wellbeing.',
            transcendental: 'Advanced mathematical patterns based on infinity concepts for exploring expanded states of consciousness.'
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
