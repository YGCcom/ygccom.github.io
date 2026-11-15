/**
 * QQ 头像容错模块
 * - 直接读取 img[data-qq]，团队成员增删无需再维护硬编码 QQ 列表
 * - 仅在头像加载失败时追加时间戳重试，避免原先每 30 秒全量刷新造成的闪烁与重复请求
 * - 多次失败后回退到品牌色首字母头像，避免留下空白圆
 */
(function () {
    'use strict';

    var MAX_RETRY = 2;

    /** 生成品牌色首字母头像 */
    function fallback(img) {
        var ch = (img.getAttribute('alt') || '4').trim().charAt(0) || '4';
        ch = ch.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">' +
            '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0" stop-color="#06b6d4"/><stop offset="1" stop-color="#5856d6"/>' +
            '</linearGradient></defs>' +
            '<rect width="100" height="100" fill="url(#g)"/>' +
            '<text x="50" y="64" text-anchor="middle" font-family="Arial, sans-serif" ' +
            'font-size="44" font-weight="700" fill="#ffffff">' + ch + '</text></svg>';
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    function retry(img) {
        var qq = img.getAttribute('data-qq');
        if (!qq) return;
        var tries = parseInt(img.getAttribute('data-retry') || '0', 10);
        if (tries >= MAX_RETRY) { fallback(img); return; }
        img.setAttribute('data-retry', String(tries + 1));
        img.src = 'https://q1.qlogo.cn/g?b=qq&nk=' + qq + '&s=100&t=' + Date.now();
    }

    function bind() {
        document.querySelectorAll('img[data-qq]').forEach(function (img) {
            if (img.getAttribute('data-qq-bound')) return;
            img.setAttribute('data-qq-bound', '1');
            img.addEventListener('error', function () { retry(img); });
            // 已缓存且加载失败的图片不会再触发 error，主动检查一次
            if (img.complete && img.naturalWidth === 0) retry(img);
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
    else bind();
})();
