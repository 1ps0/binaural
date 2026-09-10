/**
 * Theme: follows prefers-color-scheme until the user toggles, then persists.
 */
const ThemeSystem = {
    mediaQuery: null,
    mediaHandler: null,

    init() {
        this.apply(AppState.ui.theme);
        if (!window.matchMedia) return;
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.mediaHandler = e => {
            if (!localStorage.getItem('theme')) this.apply(e.matches ? 'dark' : 'light');
        };
        if (this.mediaQuery.addEventListener) this.mediaQuery.addEventListener('change', this.mediaHandler);
        else if (this.mediaQuery.addListener) this.mediaQuery.addListener(this.mediaHandler);
    },

    apply(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        AppState.ui.theme = theme;
        EventSystem.emit('themeChanged', theme);
    },

    toggleTheme() {
        const next = AppState.ui.theme === 'light' ? 'dark' : 'light';
        this.apply(next);
        localStorage.setItem('theme', next);
    },

    cleanup() {
        if (!this.mediaQuery || !this.mediaHandler) return;
        if (this.mediaQuery.removeEventListener) this.mediaQuery.removeEventListener('change', this.mediaHandler);
        else if (this.mediaQuery.removeListener) this.mediaQuery.removeListener(this.mediaHandler);
    }
};
