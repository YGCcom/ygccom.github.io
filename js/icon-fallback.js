/**
 * 图标字体守卫
 * --------------------------------------------------------------------------
 * 背景：图标字体一旦加载失败，<i class="fas fa-xxx"> 的 ::before 私有区字符
 * 会渲染成空白，于是所有带底色的图标容器（导航按钮、优势卡片圆形、
 * 团队分组图标、悬浮按钮等）就变成一堆"空白 UI"。
 *
 * 本站已把 Font Awesome 本地化到 vendor/，正常情况下不会触发。
 * 这里只在字体确实缺失时给 <html> 加 .no-icon-font，
 * 由 css/icon-fallback.css 显示中性符号，保证最坏情况下也不留空洞。
 */
(function () {
    'use strict';

    var FREE = 'Font Awesome 6 Free';
    var BRANDS = 'Font Awesome 6 Brands';

    function fontFaces() {
        var result = {};
        try {
            if (!document.fonts || typeof document.fonts.forEach !== 'function') return result;
            document.fonts.forEach(function (face) {
                var name = String(face.family || '').replace(/^["']|["']$/g, '');
                if (name !== FREE && name !== BRANDS) return;
                var state = result[name] || (result[name] = { loaded: false, failed: false });
                if (face.status === 'loaded') state.loaded = true;
                if (face.status === 'error') state.failed = true;
            });
        } catch (e) { /* 隐私模式 / 旧浏览器忽略 */ }
        return result;
    }

    function evaluate() {
        var needFree = !!document.querySelector('.fas, .far, .fa, .fa-solid, .fa-regular, .faq-question');
        var needBrands = !!document.querySelector('.fab, .fa-brands');
        if (!needFree && !needBrands) return;

        var faces = fontFaces();
        var broken = false;

        [[FREE, needFree], [BRANDS, needBrands]].forEach(function (pair) {
            if (!pair[1]) return;
            var state = faces[pair[0]];
            // 找不到 @font-face（CSS 没加载）或字体加载报错，或未成功载入 => 异常
            if (!state || state.failed || !state.loaded) broken = true;
        });

        document.documentElement.classList.toggle('no-icon-font', broken);
    }

    function start() {
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(evaluate);
        } else {
            evaluate();
        }
        // 兜底：字体迟迟不就绪时再判定一次
        setTimeout(evaluate, 3000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
