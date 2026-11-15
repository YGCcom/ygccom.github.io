/**
 * 导航模块
 * - 回到顶部 / 锚点平滑滚动（修复空锚点抛错）
 * - 移动端抽屉菜单：遮罩、Esc、点击外部、滚动锁定、ARIA 同步
 * - 导航栏滚动状态与当前区块高亮
 */
(function () {
    'use strict';

    var NAV_H = 68;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function ready(fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
        else fn();
    }

    ready(function () {
        var nav = document.getElementById('site-nav');
        var backToTop = document.getElementById('backToTop');
        var menuBtn = document.getElementById('mobile-menu-btn');
        var mobileMenu = document.getElementById('mobile-menu');
        var scrim = document.getElementById('nav-scrim');

        // ====== 移动端菜单 ======
        function setMenu(open) {
            if (!menuBtn || !mobileMenu || !scrim) return;
            menuBtn.classList.toggle('is-open', open);
            menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            menuBtn.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
            mobileMenu.classList.toggle('is-open', open);
            scrim.classList.toggle('is-open', open);
            document.body.classList.toggle('nav-open', open);
            var icon = menuBtn.querySelector('i');
            if (icon) icon.className = open ? 'fas fa-times' : 'fas fa-bars';
        }

        function closeMenu() { setMenu(false); }

        if (menuBtn && mobileMenu && scrim) {
            menuBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                setMenu(!mobileMenu.classList.contains('is-open'));
            });
            scrim.addEventListener('click', closeMenu);

            // 点击导航项后收起（语言下拉项除外，避免切语言时菜单消失）
            mobileMenu.querySelectorAll('.mobile-nav-links a, .mobile-login-btn').forEach(function (link) {
                link.addEventListener('click', closeMenu);
            });

            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
                    closeMenu();
                    menuBtn.focus();
                }
            });

            // 视口变宽进入桌面布局时收起，避免残留遮罩
            window.addEventListener('resize', function () {
                if (window.innerWidth >= 768 && mobileMenu.classList.contains('is-open')) closeMenu();
            });
        }

        // ====== 锚点平滑滚动 ======
        // 旧实现会对 href="#" 执行 document.querySelector('#') 并抛出 SyntaxError，
        // 这里跳过空锚点与无效选择器；跨页面链接（docs.html#xxx）交给浏览器处理。
        document.querySelectorAll('a[href^="#"]').forEach(function (a) {
            a.addEventListener('click', function (e) {
                var hash = this.getAttribute('href');
                if (!hash || hash === '#') return; // 保留默认行为，不抛错
                var target = null;
                try {
                    target = document.querySelector(hash);
                } catch (err) {
                    return;
                }
                if (!target) return;
                e.preventDefault();
                target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
                if (window.innerWidth < 768) closeMenu();
            });
        });

        // ====== 滚动：回到顶部按钮 / 导航状态 / 区块高亮 ======
        var sections = Array.prototype.slice.call(document.querySelectorAll('section[id]'));
        var navLinks = Array.prototype.slice.call(document.querySelectorAll(
            '.nav-links a[href^="#"], .mobile-nav-links a[href^="#"]'
        ));
        var ticking = false;

        function onScrollFrame() {
            var y = window.pageYOffset || document.documentElement.scrollTop || 0;

            if (backToTop) {
                var visible = y > 300;
                backToTop.style.opacity = visible ? '1' : '0';
                backToTop.style.visibility = visible ? 'visible' : 'hidden';
            }
            if (nav) nav.classList.toggle('is-scrolled', y > 16);

            if (navLinks.length && sections.length) {
                var probe = y + NAV_H + 48;
                var current = '';
                for (var i = 0; i < sections.length; i++) {
                    if (sections[i].offsetTop <= probe) current = sections[i].id;
                    else break;
                }
                for (var j = 0; j < navLinks.length; j++) {
                    navLinks[j].classList.toggle('is-active', navLinks[j].getAttribute('href') === '#' + current);
                }
            }
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(onScrollFrame);
        }, { passive: true });
        onScrollFrame();

        if (backToTop) {
            backToTop.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
            });
        }
    });
})();
