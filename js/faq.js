/* 保留原生 details 语义；无脚本时仍可正常展开。 */
(function () {
    'use strict';
    document.querySelectorAll('#faq .faq-item').forEach(function (item) {
        var summary = item.querySelector('summary');
        if (!summary || typeof item.animate !== 'function') return;
        var animation = null;
        var expanded = item.open;

        function settle() {
            if (animation) {
                animation.onfinish = null;
                animation.cancel();
                animation = null;
            }
            item.open = expanded;
            item.style.height = '';
            item.classList.remove('faq-closing');
        }

        summary.addEventListener('click', function (event) {
            event.preventDefault();
            var from = item.getBoundingClientRect().height;
            expanded = !expanded;
            if (animation) {
                animation.onfinish = null;
                animation.cancel();
                animation = null;
            }
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                settle();
                return;
            }
            // 收起结束后再移除 open，保证答案在动画期间仍然可见。
            item.open = true;
            item.classList.toggle('faq-closing', !expanded);
            item.style.height = '';
            var to = expanded ? item.getBoundingClientRect().height : summary.getBoundingClientRect().height;
            animation = item.animate([
                { height: from + 'px' },
                { height: to + 'px' }
            ], { duration: 350, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
            animation.onfinish = settle;
        });

        // 文字长度或屏幕宽度变化时恢复自然高度。
        window.addEventListener('langchange', settle);
        window.addEventListener('resize', function () { if (animation) settle(); });
    });
})();
