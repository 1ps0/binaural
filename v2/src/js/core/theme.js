/**
 * Theme System
 * Manages application theming and preferences
 */

// Theme System
const ThemeSystem = {
    /**
     * Initialize the theme system
     */
    init() {
        this.applyTheme(AppState.ui.theme);
        this.setupListeners();
    },

    /**
     * Apply a theme to the application
     * @param {string} theme - Theme name ('light' or 'dark')
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        AppState.ui.theme = theme;
        localStorage.setItem('theme', theme);
        EventSystem.emit('themeChanged', theme);
    },

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const newTheme = AppState.ui.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    },

    /**
     * Set up system theme listeners
     */
    setupListeners() {
        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // Use proper event listener method based on browser support
            const mediaQueryHandler = (e) => {
                if (!localStorage.getItem('theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            };
            
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', mediaQueryHandler);
            } else if (mediaQuery.addListener) {
                // Deprecated but needed for older browsers
                mediaQuery.addListener(mediaQueryHandler);
            }
        }
    },
    
    /**
     * Clean up event listeners
     */
    cleanup() {
        // Remove media query listeners if necessary
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', this.mediaQueryHandler);
            } else if (mediaQuery.removeListener) {
                mediaQuery.removeListener(this.mediaQueryHandler);
            }
        }
    }
};

// Export the ThemeSystem object
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ThemeSystem };
}
