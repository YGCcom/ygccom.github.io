/** 极简 Logo 启动动画。页面就绪后完成，不等待图片或第三方 iframe。 */
(function() {
    'use strict';
    var preloader = document.getElementById('preloader');
    if (!preloader) return;
    try {
        if (sessionStorage.getItem('skip_preloader') === '1') {
            sessionStorage.removeItem('skip_preloader');
            preloader.remove();
            return;
        }
    } catch(e) {}

    var bar = document.getElementById('preloader-bar');
    var tip = document.getElementById('preloader-tip');
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finished = false;
    var readyTimer, fallbackTimer;
    var startedAt = performance.now();
    // 给 Logo 一次短暂的淡入时间。
    var duration = reducedMotion ? 0 : 550;
    function translate(key, fallback) {
        var translated = window.t ? window.t(key) : '';
        return translated && translated !== key ? translated : fallback;
    }
    function finish() {
        if (finished) return;
        finished = true;
        clearTimeout(readyTimer);
        clearTimeout(fallbackTimer);
        if (bar) bar.style.transform = 'scaleX(1)';
        if (tip) tip.textContent = translate('preload_done', '✓ 加载完成');
        setTimeout(function() {
            preloader.classList.add('is-exiting');
            setTimeout(function() { preloader.remove(); }, reducedMotion ? 0 : 950);
        }, reducedMotion ? 0 : 120);
    }
    function ready() {
        if (bar) bar.style.transform = 'scaleX(.85)';
        readyTimer = setTimeout(finish, Math.max(0, duration - (performance.now() - startedAt)));
    }
    if (tip) tip.textContent = translate('preload_loading', '正在加载官网...');
    if (bar) bar.style.transform = 'scaleX(.35)';
    fallbackTimer = setTimeout(finish, 3000);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
    else ready();
    window.addEventListener('pageshow', function(event) { if (event.persisted) finish(); });
})();
