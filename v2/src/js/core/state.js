/**
 * Application State Management
 * Centralized state management for the application
 */

// State Management System
const AppState = {
    audio: {
        context: null,
        oscillators: {},
        patternOscillators: {},
        gainNodes: {},
        masterGain: null,
        volume: 0.2,
        isReady: false,
        lastResourceCheck: Date.now()
    },
    ui: {
        theme: localStorage.getItem('theme') || 'light',
        view: localStorage.getItem('view') || 'list',
        controlBar: {
            position: localStorage.getItem('controlBarPosition') || 'bottom',
            minimized: false
        }
    },
    frequencies: {
        active: [],
        pinned: {
            focus: [],
            meditation: [],
            sleep: [],
            relaxation: [],
            healing: []
        },
        filter: ''
    },
    // Memory management and performance monitoring
    performance: {
        maxSimultaneousTones: 8,
        resourceCheckInterval: 30000, // 30 seconds
        memoryWarningThreshold: 0.8, // 80% of available memory
        memoryStatus: {
            lastCheck: 0,
            warningIssued: false
        }
    }
};

// Export the AppState object
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppState };
}
