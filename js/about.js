(function () {
    'use strict';
    var modal = document.getElementById('about-modal');
    if (!modal) return;
    var previousFocus;
    var closeButton = modal.querySelector('.about-close');
    function close() {
        Utils.hideModal('about-modal');
        modal.setAttribute('aria-hidden', 'true');
        if (previousFocus && document.contains(previousFocus)) previousFocus.focus();
    }
    document.querySelectorAll('[data-about-open]').forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            previousFocus = button;
            // 先收起移动导航，避免关闭面板后遮罩仍留在页面上。
            var menuButton = document.getElementById('mobile-menu-btn');
            if (menuButton && menuButton.getAttribute('aria-expanded') === 'true') menuButton.click();
            Utils.showModal('about-modal');
            modal.setAttribute('aria-hidden', 'false');
            closeButton.focus();
        });
    });
    closeButton.addEventListener('click', close);
    modal.addEventListener('click', function (event) { if (event.target === modal) close(); });
    modal.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') { event.preventDefault(); close(); }
        // 面板只有一个交互控件，将键盘焦点保持在关闭按钮上。
        if (event.key === 'Tab') { event.preventDefault(); closeButton.focus(); }
    });
})();
