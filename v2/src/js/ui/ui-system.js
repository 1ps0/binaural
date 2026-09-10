/**
 * Rendering and DOM event wiring. State lives in AppState; audio in AudioSystem.
 */
const UISystem = {
    searchTimer: null,
    listeners: [],

    init() {
        this.renderControlBar();
        this.bindHeader();
        this.bindControlBar();
        this.bindSections();
        this.subscribe();
        this.observeControlBar();
        this.render();
    },

    on(target, event, handler) {
        if (!target) return;
        target.addEventListener(event, handler);
        this.listeners.push(() => target.removeEventListener(event, handler));
    },

    sectionTitle(key) {
        return (FrequencySystem.sections[key] || {}).title || key;
    },

    sectionDescription(key) {
        return (FrequencySystem.sections[key] || {}).description || '';
    },

    renderControlBar() {
        const container = document.querySelector('.control-bar .container');
        if (!container) return;
        const volume = AppState.audio.volume;
        container.innerHTML = `
            <div class="control-bar__section control-bar__volume">
                <label for="volume" class="visually-hidden">Volume</label>
                <input type="range" id="volume" class="volume-slider" min="0" max="1" step="0.01" value="${volume}">
                <span class="volume-display" aria-hidden="true">${Math.round(volume * 100)}%</span>
            </div>
            <div class="control-bar__section control-bar__search">
                <div class="search-container">
                    <label for="frequency-search" class="visually-hidden">Search</label>
                    <input type="search" id="frequency-search" class="search-input" placeholder="Search (e.g. 40, gamma, solfeggio)" value="${UIComponents.escape(AppState.frequencies.filter)}">
                    <button class="search-clear ${AppState.frequencies.filter ? 'visible' : ''}" aria-label="Clear search">${UIComponents.icon('close')}</button>
                </div>
            </div>
            <div class="control-bar__section control-bar__actions">
                <button class="action-button stop-all" disabled>${UIComponents.icon('stop')}<span>Stop all</span></button>
                <button class="action-button unpin-all" disabled>${UIComponents.icon('pin')}<span>Unpin all</span></button>
            </div>
            <div class="control-bar__section control-bar__active-tones">
                <div class="active-tones-container" aria-live="polite" aria-label="Playing"></div>
            </div>`;
    },

    bindHeader() {
        const themeButton = document.getElementById('themeToggle');
        const setThemeIcon = () => {
            const dark = AppState.ui.theme === 'dark';
            themeButton.innerHTML = UIComponents.icon(dark ? 'sun' : 'moon', dark ? 'Switch to light theme' : 'Switch to dark theme');
        };
        if (themeButton) {
            this.on(themeButton, 'click', () => { ThemeSystem.toggleTheme(); setThemeIcon(); });
            setThemeIcon();
        }

        document.querySelectorAll('.view-toggle-button').forEach(button => {
            this.on(button, 'click', () => {
                AppState.ui.view = button.dataset.view;
                localStorage.setItem('view', AppState.ui.view);
                this.syncViewButtons();
                this.render();
            });
        });
        this.syncViewButtons();

        const modal = document.getElementById('infoModal');
        const open = document.getElementById('showInfo');
        const close = document.getElementById('closeInfo');
        if (!modal) return;
        this.on(open, 'click', () => this.openModal(modal));
        this.on(close, 'click', () => this.closeModal(modal));
        this.on(modal, 'click', e => { if (e.target === modal) this.closeModal(modal); });
        this.on(document, 'keydown', e => {
            if (e.key === 'Escape' && modal.classList.contains('visible')) this.closeModal(modal);
        });
    },

    openModal(modal) {
        modal.classList.add('visible');
        modal.setAttribute('aria-hidden', 'false');
        const close = modal.querySelector('.info-modal__close');
        if (close) close.focus();
    },

    closeModal(modal) {
        modal.classList.remove('visible');
        modal.setAttribute('aria-hidden', 'true');
        const open = document.getElementById('showInfo');
        if (open) open.focus();
    },

    syncViewButtons() {
        document.querySelectorAll('.view-toggle-button').forEach(button => {
            const active = button.dataset.view === AppState.ui.view;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
        });
    },

    bindControlBar() {
        this.on(document.getElementById('volume'), 'input', e => AudioSystem.setVolume(parseFloat(e.target.value)));

        const search = document.getElementById('frequency-search');
        const clear = document.querySelector('.search-clear');
        this.on(search, 'input', e => {
            AppState.frequencies.filter = e.target.value;
            if (clear) clear.classList.toggle('visible', e.target.value.length > 0);
            clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => this.render(), 120);
        });
        this.on(clear, 'click', () => {
            if (search) { search.value = ''; search.focus(); }
            AppState.frequencies.filter = '';
            clear.classList.remove('visible');
            this.render();
        });

        this.on(document.querySelector('.action-button.stop-all'), 'click', () => AudioSystem.stopAll());
        this.on(document.querySelector('.action-button.unpin-all'), 'click', () => FrequencySystem.unpinAll());
    },

    bindSections() {
        this.on(document.querySelector('.frequency-sections'), 'click', e => {
            const button = e.target.closest('[data-action]');
            if (!button) return;
            const { id, action } = button.dataset;
            if (action === 'play') {
                if (AppState.audio.oscillators[id]) AudioSystem.stopTone(id);
                else AudioSystem.startTone(id, FrequencySystem.getFrequency(id));
            } else if (action === 'pin') {
                FrequencySystem.togglePin(id);
            }
        });
        this.on(document.querySelector('.active-tones-container'), 'click', e => {
            const button = e.target.closest('[data-stop]');
            if (button) AudioSystem.stopTone(button.dataset.stop);
        });
    },

    subscribe() {
        const sub = (event, handler) => this.listeners.push(EventSystem.on(event, handler));
        sub('toneStarted', ({ id }) => { this.refreshItem(id); this.refreshControls(); });
        sub('toneStopped', ({ id }) => { this.refreshItem(id); this.refreshControls(); });
        sub('allTonesStopped', () => this.refreshControls());
        sub('pinsUpdated', () => this.render());
        sub('volumeChanged', volume => {
            const slider = document.getElementById('volume');
            if (slider) slider.value = volume;
            const display = document.querySelector('.volume-display');
            if (display) display.textContent = `${Math.round(volume * 100)}%`;
        });
    },

    // The fixed control bar wraps on narrow screens; publish its height so content can clear it.
    observeControlBar() {
        const bar = document.querySelector('.control-bar');
        if (!bar) return;
        const apply = () => document.documentElement.style.setProperty('--control-bar-height', `${bar.offsetHeight}px`);
        if (window.ResizeObserver) new ResizeObserver(apply).observe(bar);
        else this.on(window, 'resize', apply);
        apply();
    },

    refreshControls() {
        const ids = AudioSystem.activeIds();
        const stopAll = document.querySelector('.action-button.stop-all');
        if (stopAll) stopAll.disabled = ids.length === 0;
        const unpinAll = document.querySelector('.action-button.unpin-all');
        if (unpinAll) unpinAll.disabled = AppState.frequencies.pinned.length === 0;
        this.renderActiveTones(ids);
    },

    renderActiveTones(ids) {
        const host = document.querySelector('.active-tones-container');
        if (!host) return;
        host.innerHTML = ids.map(id => {
            const f = FrequencySystem.getFrequency(id);
            if (!f) return '';
            const title = UIComponents.escape(f.title);
            return `<span class="active-tone active-tone--${f.type}">`
                + `<span class="active-tone__name">${title}</span>`
                + `<span class="active-tone__freq">${this.frequencyLabel(f)}</span>`
                + `<button class="active-tone__stop" data-stop="${f.id}" aria-label="Stop ${title}">${UIComponents.icon('close')}</button>`
                + '</span>';
        }).join('');
    },

    refreshItem(id) {
        const playing = !!AppState.audio.oscillators[id];
        const f = FrequencySystem.getFrequency(id);
        document.querySelectorAll(`[data-id="${id}"][data-action="play"]`).forEach(button => {
            button.classList.toggle('playing', playing);
            button.setAttribute('aria-pressed', String(playing));
            button.setAttribute('aria-label', `${playing ? 'Stop' : 'Play'} ${f ? f.title : id}`);
            button.innerHTML = this.playButtonInner(playing);
        });
        document.querySelectorAll(`[data-id="${id}"].frequency-card, [data-id="${id}"].frequency-item`).forEach(item => {
            item.classList.toggle('is-playing', playing);
        });
    },

    playButtonInner(playing) {
        return `${UIComponents.icon(playing ? 'stop' : 'play')}<span class="btn__label">${playing ? 'Stop' : 'Play'}</span>`;
    },

    pinButtonInner(pinned) {
        return `${UIComponents.icon(pinned ? 'pinned' : 'pin')}<span class="btn__label">${pinned ? 'Pinned' : 'Pin'}</span>`;
    },

    frequencyLabel(f) {
        return f.type === 'pattern' ? `${f.baseFrequency} Hz base` : AudioSystem.formatFrequency(f.frequency);
    },

    render() {
        const host = document.querySelector('.frequency-sections');
        if (!host) return;
        const filter = AppState.frequencies.filter.trim();
        const matches = filter ? new Set(FrequencySystem.searchFrequencies(filter).map(f => f.id)) : null;
        const keep = list => (matches ? list.filter(f => matches.has(f.id)) : list);

        const parts = [];
        const pinned = keep(FrequencySystem.getPinnedFrequencies());
        if (pinned.length) {
            parts.push(this.sectionMarkup({ title: 'Pinned', description: 'Saved in this browser.', frequencies: pinned }));
        }
        for (const key of Object.keys(FrequencySystem.sections)) {
            const list = keep(FrequencySystem.getFrequencies(key));
            if (!list.length) continue;
            parts.push(this.sectionMarkup({ title: this.sectionTitle(key), description: this.sectionDescription(key), frequencies: list }));
        }
        host.innerHTML = parts.length
            ? parts.join('')
            : `<p class="no-results">No entries match “${UIComponents.escape(filter)}”.</p>`;
        this.refreshControls();
    },

    sectionMarkup({ title, description, frequencies }) {
        const cards = AppState.ui.view === 'cards';
        const items = frequencies.map(f => (cards ? this.createFrequencyCard(f) : this.createFrequencyListItem(f))).join('');
        return `<section class="frequency-section">
            <div class="frequency-section__header">
                <h2 class="frequency-section__title">${UIComponents.escape(title)}</h2>
                ${description ? `<p class="frequency-section__description">${UIComponents.escape(description)}</p>` : ''}
            </div>
            <div class="frequency-${cards ? 'grid' : 'list'}">${items}</div>
        </section>`;
    },

    badgeMarkup(f) {
        const badge = FrequencySystem.badge(f);
        if (!badge) return '';
        const detail = badge.detail && f.type === 'binaural' ? ` · ${UIComponents.escape(badge.detail)}` : '';
        return `<span class="category-badge" title="${UIComponents.escape(badge.detail)}">${UIComponents.escape(badge.label)}${detail}</span>`;
    },

    actionsMarkup(f, block) {
        const playing = !!AppState.audio.oscillators[f.id];
        const pinned = FrequencySystem.isPinned(f.id);
        const title = UIComponents.escape(f.title);
        return `<div class="${block}__actions">
            <button class="btn btn--play ${playing ? 'playing' : ''}" data-id="${f.id}" data-action="play" aria-pressed="${playing}" aria-label="${playing ? 'Stop' : 'Play'} ${title}">${this.playButtonInner(playing)}</button>
            <button class="btn btn--pin ${pinned ? 'pinned' : ''}" data-id="${f.id}" data-action="pin" aria-pressed="${pinned}" aria-label="${pinned ? 'Unpin' : 'Pin'} ${title}">${this.pinButtonInner(pinned)}</button>
        </div>`;
    },

    createFrequencyCard(f) {
        const playing = !!AppState.audio.oscillators[f.id];
        return `<article class="frequency-card ${playing ? 'is-playing' : ''}" data-type="${f.type}" data-id="${f.id}">
            <header class="frequency-card__header">
                <h3 class="frequency-card__title">${UIComponents.escape(f.title)}</h3>
                <span class="frequency-card__frequency">${this.frequencyLabel(f)}</span>
            </header>
            <div class="frequency-card__body">
                <p class="frequency-card__description">${UIComponents.escape(FrequencySystem.describe(f))}</p>
                ${this.badgeMarkup(f)}
                ${f.note ? `<p class="frequency-card__note">${UIComponents.escape(f.note)}</p>` : ''}
                ${this.actionsMarkup(f, 'frequency-card')}
            </div>
        </article>`;
    },

    createFrequencyListItem(f) {
        const playing = !!AppState.audio.oscillators[f.id];
        return `<article class="frequency-item ${playing ? 'is-playing' : ''}" data-type="${f.type}" data-id="${f.id}">
            <header class="frequency-item__header">
                <h3 class="frequency-item__title">${UIComponents.escape(f.title)}</h3>
                <span class="frequency-item__frequency">${this.frequencyLabel(f)}</span>
                ${this.badgeMarkup(f)}
            </header>
            <div class="frequency-item__body">
                <p class="frequency-item__description">${UIComponents.escape(FrequencySystem.describe(f))}${f.note ? ` <span class="frequency-item__note">${UIComponents.escape(f.note)}</span>` : ''}</p>
            </div>
            ${this.actionsMarkup(f, 'frequency-item')}
        </article>`;
    },

    cleanup() {
        clearTimeout(this.searchTimer);
        this.listeners.forEach(off => off());
        this.listeners = [];
    }
};
