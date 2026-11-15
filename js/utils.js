(function () {
    'use strict';

    /** 是否仍有其它弹窗处于打开状态 */
    function hasOpenModal() {
        return document.querySelectorAll('.modal-mask.active').length > 0;
    }

    window.Utils = {
        showToast: function (msg, duration) {
            var toast = document.getElementById('command-toast');
            if (!toast) return;
            toast.textContent = msg;
            toast.classList.add('show');
            clearTimeout(toast._timer);
            toast._timer = setTimeout(function () { toast.classList.remove('show'); }, duration || 1500);
        },

        /** 复制文本，返回是否成功（便于调用方给出准确反馈） */
        copyText: async function (text) {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                    return true;
                }
            } catch (e) { /* 降级到 execCommand */ }

            var ta = document.createElement('textarea');
            var ok = false;
            try {
                ta.value = text;
                ta.setAttribute('readonly', '');
                ta.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0;';
                document.body.appendChild(ta);
                ta.select();
                ok = typeof document.execCommand === 'function' ? document.execCommand('copy') : false;
            } catch (err) {
                ok = false;
            } finally {
                if (ta.parentNode) document.body.removeChild(ta);
            }
            return ok;
        },

        showModal: function (id) {
            var m = document.getElementById(id);
            if (!m) return;
            m.classList.add('active');
            document.body.style.overflow = 'hidden';
        },

        hideModal: function (id) {
            var m = document.getElementById(id);
            if (!m) return;
            m.classList.remove('active');
            // 修复：叠加弹窗（如帮助 → 等级指南）时，关闭其中一个不应提前恢复页面滚动
            if (!hasOpenModal()) document.body.style.overflow = '';
        }
    };

})();
