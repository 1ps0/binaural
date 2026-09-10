/**
 * Entry point. Wires systems together; contains no rendering or audio logic.
 */
(function detectInlineSvg() {
    const supported = !!(document.createElementNS
        && document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect);
    if (!supported) document.documentElement.classList.add('no-svg');
})();

document.addEventListener('DOMContentLoaded', () => {
    ThemeSystem.init();
    FrequencySystem.init();
    UISystem.init();

    EventSystem.on('audioError', ({ message }) => UIComponents.showToast(message, 'error', 6000));
    EventSystem.on('resourceLimitReached', ({ message }) => UIComponents.showToast(message, 'warning', 4000));

    // The AudioContext is created lazily inside the first play click, which satisfies
    // autoplay policy in Firefox, Safari, and Chrome. Here we only manage suspension.
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') AudioSystem.suspendIfIdle();
        else if (AudioSystem.activeIds().length) AudioSystem.resume();
    });

    const banner = document.querySelector('.legacy-version-banner');
    if (banner) {
        banner.hidden = localStorage.getItem('legacy-banner-dismissed') === 'true';
        banner.querySelector('.legacy-banner-close').addEventListener('click', () => {
            banner.hidden = true;
            localStorage.setItem('legacy-banner-dismissed', 'true');
        });
    }

    EventSystem.emit('appReady');
});
