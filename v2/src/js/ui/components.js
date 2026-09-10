/**
 * Icon markup, HTML escaping, and toasts.
 * Icons are inline SVG with an emoji fallback that CSS shows only under html.no-svg.
 */
const UIComponents = {
    ICONS: {
        play: { svg: '<path d="M8 5v14l11-7z"/>', fallback: '▶' },
        stop: { svg: '<rect x="6" y="6" width="12" height="12" rx="1"/>', fallback: '⏹' },
        pin: { svg: '<path d="M14 4v6l2 2v2h-3v6h-2v-6H8v-2l2-2V4H9V2h6v2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>', fallback: '📌' },
        pinned: { svg: '<path d="M14 4v6l2 2v2h-3v6h-2v-6H8v-2l2-2V4H9V2h6v2z"/>', fallback: '📍' },
        close: { svg: '<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>', fallback: '×' },
        sun: { svg: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>', fallback: '☀' },
        moon: { svg: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>', fallback: '☾' },
        info: { svg: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 11v6M12 7.5v.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>', fallback: 'i' },
        grid: { svg: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>', fallback: '▦' },
        list: { svg: '<path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>', fallback: '☰' }
    },

    icon(name, label) {
        const def = this.ICONS[name];
        if (!def) throw new Error(`Unknown icon "${name}"`);
        const a11y = label ? `role="img" aria-label="${this.escape(label)}"` : 'aria-hidden="true"';
        return `<span class="icon icon--${name}" ${a11y}>`
            + `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${def.svg}</svg>`
            + `<span class="icon__fallback" aria-hidden="true">${def.fallback}</span>`
            + '</span>';
    },

    escape(value) {
        return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    },

    showToast(message, type = 'info', duration = 3000) {
        let host = document.querySelector('.toast-host');
        if (!host) {
            host = document.createElement('div');
            host.className = 'toast-host';
            host.setAttribute('role', 'status');
            host.setAttribute('aria-live', 'polite');
            document.body.appendChild(host);
        }
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `<span class="toast__text"></span><button class="toast__close" aria-label="Dismiss">${this.icon('close')}</button>`;
        toast.querySelector('.toast__text').textContent = message;

        const dismiss = () => {
            toast.classList.add('toast--hiding');
            setTimeout(() => toast.remove(), 200);
        };
        toast.querySelector('.toast__close').addEventListener('click', dismiss);
        host.appendChild(toast);
        setTimeout(dismiss, duration);
        return toast;
    }
};
