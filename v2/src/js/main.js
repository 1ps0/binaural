/**
 * Main Application Entry Point
 * Initializes and coordinates all subsystems
 */

// Initialize Core Systems
document.addEventListener('DOMContentLoaded', () => {
    // Initialize systems in correct order
    ThemeSystem.init();
    FrequencySystem.init();
    UISystem.init();


    // Setup audio initialization on first user interaction
    const initAudio = async () => {
        try {
            if (AudioSystem.init()) {
                document.removeEventListener('click', initAudio);
                document.removeEventListener('touchstart', initAudio);
                EventSystem.emit('audioReady');
            }
        } catch (error) {
            console.error('Error initializing audio:', error);
        }
    };

    // Listen for user interactions that can initialize audio
    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);

    // Set up memory management and periodic cleanup
    const performMemoryCleanup = () => {
        // Check if we need to perform GC
        if (window.performance && window.performance.memory) {
            const memoryInfo = window.performance.memory;
            const usedHeapPercentage = memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit;

            // If memory usage is high, trigger cleanup
            if (usedHeapPercentage > AppState.performance.memoryWarningThreshold) {
                console.log('High memory usage detected, performing cleanup');

                // Clear unnecessary caches
                if (AudioSystem.precomputedPatterns) {
                    AudioSystem.precomputedPatterns.clearBuffers();
                }

                // Clear UI DOM cache
                UISystem.clearDOMCache();

                // Force garbage collection if available
                if (window.gc) window.gc();

                // Reset warning flag after cleanup
                AppState.performance.memoryStatus.warningIssued = false;
            }
        }
    };

    // Set up periodic checks
    setInterval(performMemoryCleanup, 60000); // Check every minute

    // Handle page visibility changes to manage resources
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            // Suspend audio context if no tones are playing
            if (AppState.audio.context &&
                Object.keys(AppState.audio.oscillators).length === 0) {
                AppState.audio.context.suspend().catch(err => {
                    console.warn('Could not suspend audio context:', err);
                });
            }
        } else if (document.visibilityState === 'visible') {
            // Resume audio context if it was suspended
            if (AppState.audio.context &&
                AppState.audio.context.state === 'suspended') {
                AppState.audio.context.resume().catch(err => {
                    console.warn('Could not resume audio context:', err);
                });
            }
        }
    });

    document.querySelector('.legacy-banner-close').addEventListener('click', function() {
        document.querySelector('.legacy-version-banner').style.display = 'none';
        localStorage.setItem('legacy-banner-dismissed', 'true');
    });

    // Only show the banner if it hasn't been dismissed
    if (localStorage.getItem('legacy-banner-dismissed') !== 'true') {
        document.querySelector('.legacy-version-banner').style.display = 'flex';
    } else {
        document.querySelector('.legacy-version-banner').style.display = 'none';
    }

    // Set up before unload handler to clean up resources
    window.addEventListener('beforeunload', () => {
        // Stop all audio
        AudioSystem.stopAll();

        // Save user preferences
        FrequencySystem.savePinnedFrequencies();

        // Clean up event listeners
        UISystem.cleanup();
        AudioSystem.cleanup();
        ThemeSystem.cleanup();
        EventSystem.cleanup();
    });

    // Emit ready event
    EventSystem.emit('appReady');
});
