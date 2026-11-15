/** 开发者工具拦截：快捷键、右键菜单、低频调试暂停检测。 */
(function() {
    'use strict';
    var REDIRECT_URL = 'https://www.yuanshen.com/';
    var redirected = false;
    var timer = null;
    var slowChecks = 0;
    var INTERVAL = 2500;

    function redirect() {
        if (redirected) return;
        redirected = true;
        clearTimeout(timer);
        window.location.replace(REDIRECT_URL);
    }

    // 捕获阶段拦截，覆盖控制台、元素检查器、源码与 Mac 快捷键。
    window.addEventListener('keydown', function(event) {
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

    window.addEventListener('contextmenu', function(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }, { capture: true, passive: false });

    function schedule() {
        clearTimeout(timer);
        timer = null;
        if (!document.hidden && !redirected) timer = setTimeout(check, INTERVAL);
    }
    function check() {
        timer = null;
        if (document.hidden || redirected) return;
        var startedAt = performance.now();
        debugger;
        var elapsed = performance.now() - startedAt;
        // 两次连续的明显暂停才触发，避免单次系统卡顿误判。
        if (document.hidden) slowChecks = 0;
        else slowChecks = elapsed > 250 ? slowChecks + 1 : 0;
        if (slowChecks >= 2) redirect();
        else schedule();
    }
    document.addEventListener('visibilitychange', function() {
        slowChecks = 0;
        schedule();
    });
    window.addEventListener('pagehide', function() { clearTimeout(timer); timer = null; });
    window.addEventListener('pageshow', schedule);
    schedule();
})();
