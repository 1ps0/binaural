/**
 * UI System
 * Manages rendering and user interface interactions
 */

// UI Components System
const UISystem = {
    // Store DOM references to avoid repeated queries
    domCache: new Map(),
    activeListeners: [],

    init() {
        this.initializeControlBar();
        this.setupEventListeners();
        this.render();
    },

    // Cache DOM elements for better performance
    getDOMElement(selector) {
        if (!this.domCache.has(selector)) {
            const element = document.querySelector(selector);
            if (element) {
                this.domCache.set(selector, element);
            }
            return element;
        }
        return this.domCache.get(selector);
    },

    // Clear DOM cache on major updates
    clearDOMCache() {
        this.domCache.clear();
    },

    initializeControlBar() {
        const controlBar = this.getDOMElement('.control-bar');
        const container = controlBar.querySelector('.container');

        // Create control bar components
        container.innerHTML = `
            <div class="control-bar__section control-bar__volume">
                <label for="volume" class="visually-hidden">Volume</label>
                <input type="range"
                    id="volume"
                    class="volume-slider"
                    min="0"
                    max="1"
                    step="0.01"
                    value="${AppState.audio.volume}">
                <span class="volume-display">${Math.round(AppState.audio.volume * 100)}%</span>
            </div>

            <div class="control-bar__section control-bar__search">
                <div class="search-container">
                    <input type="text"
                        id="frequency-search"
                        class="search-input"
                        placeholder="Search frequencies..."
                        value="${AppState.frequencies.filter}">
                    <button class="search-clear ${AppState.frequencies.filter ? 'visible' : ''}" aria-label="Clear search">
                        ×
                    </button>
                </div>
            </div>

            <div class="control-bar__section control-bar__actions">
                <button class="action-button stop-all" disabled>
                    <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
                        <rect x="6" y="6" width="12" height="12"/>
                    </svg>
                    Stop All
                </button>
                <button class="action-button unpin-all" disabled>
                    <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12 2L2 12l10 10 10-10z"/>
                    </svg>
                    Unpin All
                </button>
            </div>

            <div class="control-bar__section control-bar__active-tones">
                <div class="active-tones-container">
                    <!-- Active tones will be rendered here -->
                </div>
            </div>
        `;
    },

    setupEventListeners() {
        // Track all listeners for proper cleanup
        const cleanupFns = [];

        // Volume control
        const volumeSlider = document.getElementById('volume');
        const volumeListener = (e) => {
            AudioSystem.setVolume(parseFloat(e.target.value));
        };
        volumeSlider.addEventListener('input', volumeListener);
        cleanupFns.push(() => volumeSlider.removeEventListener('input', volumeListener));

        // Search
        const searchInput = document.getElementById('frequency-search');
        const searchClear = document.querySelector('.search-clear');

        const searchListener = (e) => {
            const value = e.target.value;
            AppState.frequencies.filter = value;
            searchClear.classList.toggle('visible', value.length > 0);
            this.render();
        };
        searchInput.addEventListener('input', searchListener);
        cleanupFns.push(() => searchInput.removeEventListener('input', searchListener));

        const clearListener = () => {
            searchInput.value = '';
            AppState.frequencies.filter = '';
            searchClear.classList.remove('visible');
            this.render();
        };
        searchClear.addEventListener('click', clearListener);
        cleanupFns.push(() => searchClear.removeEventListener('click', clearListener));

        // Action buttons
        const stopAllButton = document.querySelector('.action-button.stop-all');
        const stopAllListener = () => {
            AudioSystem.stopAll();
        };
        stopAllButton.addEventListener('click', stopAllListener);
        cleanupFns.push(() => stopAllButton.removeEventListener('click', stopAllListener));

        const unpinAllButton = document.querySelector('.action-button.unpin-all');
        const unpinAllListener = () => {
            FrequencySystem.unpinAll();
        };
        unpinAllButton.addEventListener('click', unpinAllListener);
        cleanupFns.push(() => unpinAllButton.removeEventListener('click', unpinAllListener));

        // Info modal
        const infoModal = document.getElementById('infoModal');
        const showInfoBtn = document.getElementById('showInfo');
        const closeInfoBtn = document.getElementById('closeInfo');

        const showInfoListener = () => {
            infoModal.classList.add('visible');
        };
        showInfoBtn.addEventListener('click', showInfoListener);
        cleanupFns.push(() => showInfoBtn.removeEventListener('click', showInfoListener));

        const closeInfoListener = () => {
            infoModal.classList.remove('visible');
        };
        closeInfoBtn.addEventListener('click', closeInfoListener);
        cleanupFns.push(() => closeInfoBtn.removeEventListener('click', closeInfoListener));

        // Close modal on outside click
        const modalOutsideClickListener = (e) => {
            if (e.target === infoModal) {
                infoModal.classList.remove('visible');
            }
        };
        infoModal.addEventListener('click', modalOutsideClickListener);
        cleanupFns.push(() => infoModal.removeEventListener('click', modalOutsideClickListener));

        // Close modal on escape key
        const escKeyListener = (e) => {
            if (e.key === 'Escape' && infoModal.classList.contains('visible')) {
                infoModal.classList.remove('visible');
            }
        };
        document.addEventListener('keydown', escKeyListener);
        cleanupFns.push(() => document.removeEventListener('keydown', escKeyListener));

        // Theme toggle
        const themeToggleBtn = document.getElementById('themeToggle');
        const themeToggleListener = () => {
            ThemeSystem.toggleTheme();
            themeToggleBtn.querySelector('.theme-toggle-icon').textContent =
                AppState.ui.theme === 'light' ? '☀️' : '🌙';
        };
        themeToggleBtn.addEventListener('click', themeToggleListener);
        cleanupFns.push(() => themeToggleBtn.removeEventListener('click', themeToggleListener));

        // Set initial icon
        themeToggleBtn.querySelector('.theme-toggle-icon').textContent =
            AppState.ui.theme === 'light' ? '☀️' : '🌙';

        // View toggle
        const viewButtons = document.querySelectorAll('.view-toggle-button');
        viewButtons.forEach(button => {
            const viewToggleListener = () => {
                const view = button.dataset.view;
                AppState.ui.view = view;
                localStorage.setItem('view', view);

                // Update button states
                viewButtons.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.view === view);
                });

                this.render();
                EventSystem.emit('viewChanged', view);
            };
            button.addEventListener('click', viewToggleListener);
            cleanupFns.push(() => button.removeEventListener('click', viewToggleListener));

            // Set initial active state
            button.classList.toggle('active', button.dataset.view === AppState.ui.view);
        });

        // Event subscriptions
        const toneStartedHandler = () => this.updateControlState();
        EventSystem.on('toneStarted', toneStartedHandler);
        cleanupFns.push(() => EventSystem.off('toneStarted', toneStartedHandler));

        const toneStoppedHandler = () => this.updateControlState();
        EventSystem.on('toneStopped', toneStoppedHandler);
        cleanupFns.push(() => EventSystem.off('toneStopped', toneStoppedHandler));

        const pinsUpdatedHandler = () => this.updateControlState();
        EventSystem.on('pinsUpdated', pinsUpdatedHandler);
        cleanupFns.push(() => EventSystem.off('pinsUpdated', pinsUpdatedHandler));

        const volumeChangedHandler = (volume) => {
            volumeSlider.value = volume;
            document.querySelector('.volume-display').textContent = `${Math.round(volume * 100)}%`;
        };
        EventSystem.on('volumeChanged', volumeChangedHandler);
        cleanupFns.push(() => EventSystem.off('volumeChanged', volumeChangedHandler));

        // Store all cleanup functions
        this.activeListeners = cleanupFns;
    },

    updateControlState() {
        // Update stop all button
        const stopAllButton = document.querySelector('.action-button.stop-all');
        stopAllButton.disabled = Object.keys(AppState.audio.oscillators).length === 0;

        // Update unpin all button
        const unpinAllButton = document.querySelector('.action-button.unpin-all');
        const hasPinnedItems = Object.values(AppState.frequencies.pinned)
            .some(arr => arr.length > 0);
        unpinAllButton.disabled = !hasPinnedItems;

        this.renderActiveTones();
    },

    renderActiveTones() {
        const container = document.querySelector('.active-tones-container');
        container.innerHTML = '';

        Object.entries(AppState.audio.oscillators).forEach(([id]) => {
            const frequency = FrequencySystem.getFrequency(id);
            if (!frequency) return;

            const toneElement = document.createElement('div');
            toneElement.className = `active-tone active-tone--${frequency.type}`;
            toneElement.innerHTML = `
                <span class="active-tone__name">${frequency.title}</span>
                <span class="active-tone__freq">${AudioSystem.formatFrequency(frequency.frequency)}</span>
                <button class="active-tone__stop" aria-label="Stop ${frequency.title}">×</button>
            `;

            const stopButton = toneElement.querySelector('.active-tone__stop');
            const stopListener = () => {
                AudioSystem.stopTone(id);
            };
            stopButton.addEventListener('click', stopListener);

            // Memory management - remove listener when container is cleared
            const observerOptions = { childList: true };
            const observer = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList' && !container.contains(toneElement)) {
                        stopButton.removeEventListener('click', stopListener);
                        observer.disconnect();
                        break;
                    }
                }
            });
            observer.observe(container, observerOptions);

            container.appendChild(toneElement);
        });
    },

    render() {
        const mainContent = document.querySelector('.frequency-sections');
        const fragment = document.createDocumentFragment(); // Use fragment for better performance

        // First render pinned frequencies if any exist
        const pinnedFreqs = FrequencySystem.getPinnedFrequencies();
        const hasPinnedFreqs = Object.values(pinnedFreqs).some(arr => arr.length > 0);

        if (hasPinnedFreqs) {
            const pinnedSection = this.createSection({
                title: 'Pinned Frequencies',
                description: 'Your saved frequencies for quick access',
                frequencies: Object.values(pinnedFreqs).flat()
            });
            fragment.appendChild(pinnedSection);
        }

        // Render each frequency type section
        const sectionTypes = ['focus', 'meditation', 'sleep', 'relaxation', 'healing', 'transcendental'];

        sectionTypes.forEach(type => {
            let frequencies = FrequencySystem.getFrequencies(type);

            // Apply search filter if exists
            if (AppState.frequencies.filter) {
                const query = AppState.frequencies.filter.toLowerCase();
                frequencies = frequencies.filter(freq =>
                    freq.title.toLowerCase().includes(query) ||
                    freq.description.toLowerCase().includes(query) ||
                    (freq.frequency && freq.frequency.toString().includes(query))
                );
            }

            if (frequencies.length === 0) return; // Skip empty sections

            const sectionTitle = type.charAt(0).toUpperCase() + type.slice(1);
            const section = this.createSection({
                title: `${sectionTitle} Frequencies`,
                description: FrequencySystem.getSectionDescription(type),
                frequencies
            });
            fragment.appendChild(section);
        });

        // Use a single DOM operation for better performance
        mainContent.innerHTML = '';
        mainContent.appendChild(fragment);

        // Update control bar state
        this.updateControlState();
    },

    createSection({ title, description, frequencies }) {
        const section = document.createElement('section');
        section.className = 'frequency-section';

        section.innerHTML = `
            <div class="frequency-section__header">
                <h2 class="frequency-section__title">${title}</h2>
                ${description ? `<p class="frequency-section__description">${description}</p>` : ''}
            </div>
            <div class="frequency-${AppState.ui.view === 'cards' ? 'grid' : 'list'}">
                ${frequencies.map(freq =>
                    AppState.ui.view === 'cards'
                        ? this.createFrequencyCard(freq)
                        : this.createFrequencyListItem(freq)
                ).join('')}
            </div>
        `;

        // Add event listeners to the frequency items
        section.querySelectorAll('.btn--play').forEach(button => {
            button.addEventListener('click', () => {
                const { id, type } = button.dataset;
                const isPlaying = button.classList.contains('playing');

                if (isPlaying) {
                    AudioSystem.stopTone(id);
                    button.classList.remove('playing');
                    button.innerHTML = `<span class="visually-hidden">Play</span>▶`;
                } else {
                    const freq = FrequencySystem.getFrequency(id);

                    // Build options based on frequency type
                    const options = {};

                    if (freq.type === 'binaural') {
                        options.isBinaural = true;
                        options.carrierFrequency = freq.carrierFrequency || 200;
                    } else if (freq.type === 'special' && freq.id.includes('aleph')) {
                        options.isPattern = true;
                        options.patternType = freq.id;
                    }

                    const success = AudioSystem.startTone(id, freq.frequency, options);

                    if (success) {
                        button.classList.add('playing');
                        button.innerHTML = `<span class="visually-hidden">Stop</span>⏹`;
                    }
                }
            });
        });

        section.querySelectorAll('.btn--pin').forEach(button => {
            button.addEventListener('click', () => {
                const { id, type } = button.dataset;
                const isPinned = button.classList.contains('pinned');

                if (isPinned) {
                    EventSystem.emit('frequencyUnpinned', { id, type });
                } else {
                    EventSystem.emit('frequencyPinned', { id, type });
                }
            });
        });

        // Add event listeners for advanced feature toggles
        // (These buttons are now hidden by default)
        section.querySelectorAll('.btn--advanced').forEach(button => {
            button.addEventListener('click', () => {
                const controlsContainer = button.nextElementSibling;
                if (controlsContainer) {
                    controlsContainer.classList.toggle('visible');
                    button.textContent = controlsContainer.classList.contains('visible')
                        ? 'Hide Advanced Options'
                        : 'Show Advanced Options';
                }
            });
        });

        return section;
    },

    createFrequencyCard(freq) {
        // Find if this frequency is pinned
        let isPinned = false;
        for (const category in AppState.frequencies.pinned) {
            if (AppState.frequencies.pinned[category].includes(freq.id)) {
                isPinned = true;
                break;
            }
        }

        const isPlaying = !!AppState.audio.oscillators[freq.id];
        const categoryInfo = FrequencySystem.getCategoryInfo(freq.category);

        // Hide advanced options button and controls by default
        let advancedOptions = '';

        // Comment out the advanced options section until functionality is implemented
        /*
        // Only show advanced options button for frequencies that have modules available
        if (freq.frequency || freq.type === 'special') {
            advancedOptions = `
                <button class="btn btn--advanced" style="display: none;">Show Advanced Options</button>
                <div class="frequency-card__advanced-controls">
                    ${freq.frequency ? `
                        <label class="feature-toggle">
                            <input type="checkbox" class="feature-toggle__input" data-feature="binaural"
                                ${freq.type === 'binaural' ? 'checked' : ''}>
                            <span class="feature-toggle__label">Binaural</span>
                        </label>

                        <label class="feature-toggle">
                            <input type="checkbox" class="feature-toggle__input" data-feature="solfeggio">
                            <span class="feature-toggle__label">Solfeggio</span>
                        </label>
                    ` : ''}

                    <label class="feature-toggle">
                        <input type="checkbox" class="feature-toggle__input" data-feature="aleph" data-aleph-type="aleph-null">
                        <span class="feature-toggle__label">Aleph</span>
                    </label>
                </div>
            `;
        }
        */

        return `
            <article class="frequency-card" data-type="${freq.type}">
                <header class="frequency-card__header">
                    <h3 class="frequency-card__title">${freq.title}</h3>
                    <span class="frequency-card__frequency">${AudioSystem.formatFrequency(freq.frequency)}</span>
                </header>
                <div class="frequency-card__body">
                    <p class="frequency-card__description">${freq.description}</p>
                    ${categoryInfo ? `
                        <span class="category-badge">
                            ${categoryInfo.name} (${categoryInfo.range})
                        </span>
                    ` : ''}
                    ${freq.warning ? `
                        <p class="frequency-card__warning">⚠️ ${freq.warning}</p>
                    ` : ''}
                    ${advancedOptions}
                    <div class="frequency-card__actions">
                        <button class="btn btn--play ${isPlaying ? 'playing' : ''}"
                            data-id="${freq.id}"
                            data-type="${freq.type}">
                            <span class="visually-hidden">${isPlaying ? 'Stop' : 'Play'}</span>
                            ${isPlaying ? '⏹' : '▶'}
                        </button>
                        <button class="btn btn--pin ${isPinned ? 'pinned' : ''}"
                            data-id="${freq.id}"
                            data-type="${freq.type}">
                            <span class="visually-hidden">${isPinned ? 'Unpin' : 'Pin'}</span>
                            ${isPinned ? '📍' : '📌'}
                        </button>
                    </div>
                </div>
            </article>
        `;
    },

    createFrequencyListItem(freq) {
        // Find if this frequency is pinned
        let isPinned = false;
        for (const category in AppState.frequencies.pinned) {
            if (AppState.frequencies.pinned[category].includes(freq.id)) {
                isPinned = true;
                break;
            }
        }

        const isPlaying = !!AppState.audio.oscillators[freq.id];
        const categoryInfo = FrequencySystem.getCategoryInfo(freq.category);

        // Hide advanced options button and controls by default
        let advancedOptions = '';

        // Comment out the advanced options section until functionality is implemented
        /*
        // Only show advanced options button for frequencies that have modules available
        if (freq.frequency || freq.type === 'special') {
            advancedOptions = `
                <button class="btn btn--advanced" style="display: none;">Show Advanced Options</button>
                <div class="frequency-item__advanced-controls">
                    ${freq.frequency ? `
                        <label class="feature-toggle">
                            <input type="checkbox" class="feature-toggle__input" data-feature="binaural"
                                ${freq.type === 'binaural' ? 'checked' : ''}>
                            <span class="feature-toggle__label">Binaural</span>
                        </label>

                        <label class="feature-toggle">
                            <input type="checkbox" class="feature-toggle__input" data-feature="solfeggio">
                            <span class="feature-toggle__label">Solfeggio</span>
                        </label>
                    ` : ''}

                    <label class="feature-toggle">
                        <input type="checkbox" class="feature-toggle__input" data-feature="aleph" data-aleph-type="aleph-null">
                        <span class="feature-toggle__label">Aleph</span>
                    </label>
                </div>
            `;
        }
        */

        return `
            <article class="frequency-item" data-type="${freq.type}">
                <header class="frequency-item__header">
                    <h3 class="frequency-item__title">${freq.title}</h3>
                    <span class="frequency-item__frequency">${AudioSystem.formatFrequency(freq.frequency)}</span>
                    ${categoryInfo ? `
                        <span class="category-badge">
                            ${categoryInfo.name}
                        </span>
                    ` : ''}
                </header>
                <div class="frequency-item__body">
                    <p class="frequency-item__description">
                        ${freq.description}
                        ${freq.warning ? `⚠️ ${freq.warning}` : ''}
                    </p>
                    ${advancedOptions}
                </div>
                <div class="frequency-item__actions">
                    <button class="btn btn--play ${isPlaying ? 'playing' : ''}"
                        data-id="${freq.id}"
                        data-type="${freq.type}">
                        <span class="visually-hidden">${isPlaying ? 'Stop' : 'Play'}</span>
                        ${isPlaying ? '⏹' : '▶'}
                    </button>
                    <button class="btn btn--pin ${isPinned ? 'pinned' : ''}"
                        data-id="${freq.id}"
                        data-type="${freq.type}">
                        <span class="visually-hidden">${isPinned ? 'Unpin' : 'Pin'}</span>
                        ${isPinned ? '📍' : '📌'}
                    </button>
                </div>
            </article>
        `;
    },

    // Clean up event listeners and DOM references
    cleanup() {
        // Remove all active listeners
        this.activeListeners.forEach(cleanup => cleanup());
        this.activeListeners = [];

        // Clear DOM cache
        this.clearDOMCache();
    }
};

// Export the UISystem object if in a module environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UISystem };
}
