/** 快捷键拦截、持续调试断点与停靠式开发者工具检测。 */
(function () {
    'use strict';
    var REDIRECT_URL = 'https://www.yuanshen.com/';
    var redirected = false;
    var timer = null;
    var pauseHits = 0;
    var sizeHits = 0;
    var INTERVAL = 400;
    var basePixelRatio = window.devicePixelRatio || 1;
    var breakpoint = null;
    try {
        // Recompile periodically so ignoring a single source breakpoint is less effective.
        breakpoint = new Function('debugger;');
    } catch (error) {
        // Strict CSP may block dynamic code; the static breakpoint remains available.
    }
    var checks = 0;

    function resetEvidence() {
        pauseHits = 0;
        sizeHits = 0;
    }

    function redirect() {
        if (redirected) return;
        redirected = true;
        clearTimeout(timer);
        timer = null;
        window.location.replace(REDIRECT_URL);
    }

    window.addEventListener('keydown', function (event) {
        var key = (event.key || '').toLowerCase();
        var code = event.code || '';
        var inspectKey = ['i', 'j', 'c', 'k'].indexOf(key) !== -1 || ['KeyI', 'KeyJ', 'KeyC', 'KeyK'].indexOf(code) !== -1;
        var sourceKey = key === 'u' || code === 'KeyU';
        var blocked = key === 'f12' || code === 'F12' || event.keyCode === 123 ||
            (event.ctrlKey && event.shiftKey && inspectKey) ||
            (event.metaKey && event.altKey && inspectKey) ||
            ((event.ctrlKey || event.metaKey) && sourceKey);
        if (!blocked) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        redirect();
    }, { capture: true, passive: false });

    window.addEventListener('contextmenu', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }, { capture: true, passive: false });

    function hasDockedPanel() {
        if (window.matchMedia('(pointer: coarse)').matches) return false;
        if (window.visualViewport && Math.abs(window.visualViewport.scale - 1) > 0.05) return false;
        if (!window.outerWidth || !window.outerHeight || !window.innerWidth || !window.innerHeight) return false;
        // Use a fixed zoom reference: panel resizing must not change the scale estimate.
        var zoom = (window.devicePixelRatio || 1) / basePixelRatio;
        var widthGap = window.outerWidth - window.innerWidth * zoom;
        var heightGap = window.outerHeight - window.innerHeight * zoom;
        return widthGap > 200 || heightGap > 280;
    }

    function schedule() {
        clearTimeout(timer);
        timer = null;
        if (!document.hidden && !redirected) timer = setTimeout(check, INTERVAL);
    }

    function check() {
        timer = null;
        if (document.hidden || redirected) return;
        var startedAt = performance.now();
        // 持续异步循环：继续执行后还会再次断点，不使用阻塞页面的 while(true)。
        if (breakpoint) {
            breakpoint();
            checks += 1;
            if (checks % 5 === 0) {
                try { breakpoint = new Function('debugger;\n// check ' + checks); } catch (error) {}
            }
        } else {
            debugger;
        }
        var elapsed = performance.now() - startedAt;
        if (document.hidden) {
            resetEvidence();
            schedule();
            return;
        }
        pauseHits = elapsed > 150 ? pauseHits + 1 : 0;
        sizeHits = hasDockedPanel() ? sizeHits + 1 : 0;
        // 调试暂停连续两次，或尺寸异常连续约三秒后跳转。
        if (pauseHits >= 2 || sizeHits >= 7) redirect();
        else schedule();
    }

    document.addEventListener('visibilitychange', function () {
        resetEvidence();
        schedule();
    });
    window.addEventListener('resize', resetEvidence);
    window.addEventListener('pagehide', function () {
        clearTimeout(timer);
        timer = null;
        resetEvidence();
    });
    window.addEventListener('pageshow', function () {
        resetEvidence();
        schedule();
    });
    schedule();
})();
