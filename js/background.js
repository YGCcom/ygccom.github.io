/** 保留背景轮换：加载并解码后交叉淡入，后台暂停。 */
(function () {
    'use strict';
    if (!document.body || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    var root = document.createElement('div');
    root.className = 'site-background';
    root.setAttribute('aria-hidden', 'true');
    var current = document.createElement('div');
    current.className = 'site-background-layer';
    current.style.backgroundImage = 'url("./img/bgh_1.png")';
    root.appendChild(current);
    document.body.prepend(root);
    var index = 1, timer = null, busy = false;
    function schedule() {
        clearTimeout(timer);
        timer = null;
        if (!document.hidden && !busy) timer = setTimeout(next, 6000);
    }
    function next() {
        if (document.hidden) return;
        busy = true;
        var nextIndex = index % 5 + 1;
        var url = './img/bgh_' + nextIndex + '.png';
        var image = new Image();
        image.onload = function () {
            var decoded = image.decode ? image.decode() : Promise.resolve();
            decoded.then(function () {
                if (document.hidden) { busy = false; schedule(); return; }
                var incoming = document.createElement('div');
                incoming.className = 'site-background-layer is-incoming';
                incoming.style.backgroundImage = 'url("' + url + '")';
                root.appendChild(incoming);
                // 分开两帧提交初始透明度，确保浏览器执行过渡。
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () { incoming.classList.add('is-visible'); });
                });
                setTimeout(function () {
                    current.remove();
                    incoming.className = 'site-background-layer';
                    current = incoming;
                    index = nextIndex;
                    busy = false;
                    schedule();
                }, 1400);
            }).catch(retry);
        };
        image.onerror = retry;
        image.src = url;
    }
    function retry() { busy = false; schedule(); }
    document.addEventListener('visibilitychange', schedule);
    window.addEventListener('pagehide', function () { clearTimeout(timer); });
    window.addEventListener('pageshow', schedule);
    schedule();
})();
