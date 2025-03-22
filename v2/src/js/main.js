/**
 * Main Application Entry Point
 * Initializes and coordinates all subsystems
 * Enhanced with improved memory management
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
        // Memory check if performance API is available
        if (window.performance && window.performance.memory) {
            const memoryInfo = window.performance.memory;
            const usedHeapPercentage = memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit;

            // Log memory usage periodically
            if (AppState.performance.deviceCapabilities.isLowEndDevice) {
                console.log(`Memory usage: ${Math.round(usedHeapPercentage * 100)}% of available heap`);
            }

            // Critical memory pressure - take immediate action
            if (usedHeapPercentage > AppState.performance.memoryStatus.criticalThreshold) {
                console.warn("Critical memory pressure detected");
                
                // Clear all audio buffers
                if (AudioSystem.precomputedPatterns) {
                    AudioSystem.precomputedPatterns.clearBuffers();
                }
                
                // Stop all tones except the most recent one
                if (AudioSystem.resourceManagement.activeNodes.size > 1) {
                    // Sort by creation time (most recent first)
                    const entries = Array.from(AudioSystem.resourceManagement.activeNodes.entries())
                        .sort((a, b) => b[1].createdAt - a[1].createdAt);
                    
                    // Keep only the most recent tone, stop all others
                    const mostRecentId = entries[0][0];
                    entries.slice(1).forEach(([id]) => {
                        AudioSystem.stopTone(id);
                    });
                    
                    // Show notification to user
                    UIComponents.showToast(
                        'Memory pressure detected. Some tones have been stopped automatically.',
                        'warning',
                        5000
                    );
                }
                
                // Clear UI DOM cache
                UISystem.clearDOMCache();
                
                // Force garbage collection if available
                if (window.gc) window.gc();
            }
            // High memory usage - take proactive measures
            else if (usedHeapPercentage > AppState.performance.memoryStatus.highThreshold) {
                console.warn("High memory usage detected");
                
                // Clean unused audio buffers
                if (AudioSystem.precomputedPatterns) {
                    AudioSystem.precomputedPatterns.cleanUnusedBuffers();
                }
                
                // Clear UI DOM cache
                UISystem.clearDOMCache();
            }
            
            // Update memory status
            AppState.performance.memoryStatus.lastCheck = Date.now();
            AppState.performance.memoryStatus.warningIssued = 
                usedHeapPercentage > AppState.performance.memoryWarningThreshold;
        }
    };

    // Set up periodic checks
    // More frequent checks on low-end devices
    const checkInterval = AppState.performance.deviceCapabilities.isLowEndDevice ? 30000 : 60000;
    setInterval(performMemoryCleanup, checkInterval);

    // Handle page visibility changes to manage resources
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            // Suspend audio context if no tones are playing
            if (AppState.audio.context &&
                AppState.audio.context.state === 'running' &&
                Object.keys(AppState.audio.oscillators).length === 0) {
                
                AppState.audio.context.suspend().catch(err => {
                    console.warn('Could not suspend audio context:', err);
                });
            }
            
            // Clean up unused resources when page is hidden
            if (AudioSystem.precomputedPatterns) {
                AudioSystem.precomputedPatterns.cleanUnusedBuffers();
            }
        } else if (document.visibilityState === 'visible') {
            // Resume audio context if it was suspended
            if (AppState.audio.context &&
                AppState.audio.context.state === 'suspended' &&
                Object.keys(AppState.audio.oscillators).length > 0) {
                
                AppState.audio.context.resume().catch(err => {
                    console.warn('Could not resume audio context:', err);
                });
            }
        }
    });

    // Legacy banner handler
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
    
    // Set up error handling for uncaught errors to prevent crashes
    window.addEventListener('error', function(event) {
        console.error('Global error caught:', event.error);
        
        // Try to recover audio system if possible
        if (AppState.audio.context && AppState.audio.context.state === 'running') {
            try {
                // Stop all tones but keep context alive
                AudioSystem.stopAll();
                UIComponents.showToast(
                    'An error occurred. Audio has been reset.',
                    'error',
                    5000
                );
            } catch (e) {
                console.error('Error during recovery:', e);
            }
        }
        
        // Don't prevent default - let browser handle the error
        return false;
    });
});
