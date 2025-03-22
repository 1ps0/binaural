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
        masterCompressor: null, // Added for audio peak management
        volume: 0.2,
        isReady: false,
        lastResourceCheck: Date.now(),
        lastToneStoppedTime: null // Track when tones were stopped for cleanup timing
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
        maxSimultaneousTones: 6, // Reduced from 8 for better performance
        resourceCheckInterval: 30000, // 30 seconds
        memoryWarningThreshold: 0.7, // Reduced from 0.8 (70% of available memory)
        memoryStatus: {
            lastCheck: 0,
            warningIssued: false,
            criticalThreshold: 0.85, // Added critical threshold
            highThreshold: 0.7  // Added high threshold
        },
        // Added device capability detection
        deviceCapabilities: {
            isLowEndDevice: false,
            maxSafeOscillators: 6,
            safeBufferDuration: 3,
            lastDetectionTime: 0
        }
    }
};

// Detect device capabilities on startup
(function detectDeviceCapabilities() {
    try {
        // Check if this is a low-end device based on available memory
        if (window.performance && window.performance.memory) {
            const memInfo = window.performance.memory;
            const totalHeap = memInfo.jsHeapSizeLimit;
            
            // Consider low-end if heap limit is under 400MB
            if (totalHeap < 400 * 1024 * 1024) {
                AppState.performance.deviceCapabilities.isLowEndDevice = true;
                AppState.performance.deviceCapabilities.maxSafeOscillators = 4;
                AppState.performance.deviceCapabilities.safeBufferDuration = 2;
                AppState.performance.maxSimultaneousTones = 4; // Reduce for low-end devices
            }
        }
        
        // Check navigator.hardwareConcurrency if available
        if (navigator.hardwareConcurrency) {
            // Further reduce capabilities on single or dual-core devices
            if (navigator.hardwareConcurrency <= 2) {
                AppState.performance.deviceCapabilities.isLowEndDevice = true;
                AppState.performance.deviceCapabilities.maxSafeOscillators = 3;
                AppState.performance.maxSimultaneousTones = 3;
            }
        }
        
        // Record when we last checked
        AppState.performance.deviceCapabilities.lastDetectionTime = Date.now();
        
    } catch (e) {
        console.warn('Error detecting device capabilities:', e);
    }
})();

// Export the AppState object
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppState };
}
