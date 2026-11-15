/** 本地音乐播放器 */
(function() {
    'use strict';
    var SONG_LIST = [
        { file: 'music/1.mp3', name: '小曲一响，闪亮登场' },
        { file: 'music/2.mp3', name: '曲目 2' },
        { file: 'music/3.mp3', name: '曲目 3' },
        { file: 'music/4.mp3', name: '曲目 4' }
    ];
    function read(key, fallback) {
        try { var value = localStorage.getItem(key); return value === null ? fallback : value; }
        catch(e) { return fallback; }
    }
    function save(key, value) { try { localStorage.setItem(key, value); } catch(e) {} }
    document.addEventListener('DOMContentLoaded', function() {
        function el(id) { return document.getElementById(id); }
        var audio = el('bg-music'), playBtn = el('music-play-btn'), panel = el('music-panel');
        if (!audio || !playBtn || !panel) return;
        var toggle = el('music-toggle-btn'), cover = el('music-cover');
        var name = el('music-song-name'), volume = el('music-volume');
        var bar = el('music-progress-bar'), thumb = el('music-progress-thumb');
        var track = el('music-progress-track'), items = el('music-playlist-items');
        var index = Number(read('bgMusicIndex', 0));
        if (!Number.isInteger(index) || index < 0 || index >= SONG_LIST.length) index = 0;
        var modes = ['loop', 'loop-one', 'shuffle'];
        var mode = read('bgMusicMode', 'loop');
        if (modes.indexOf(mode) < 0) mode = 'loop';
        var listOpen = false;
        try { localStorage.removeItem('bgMusicSource'); } catch(e) {}

        function on(id, event, handler) { var node = el(id); if (node) node.addEventListener(event, handler); }
        function text(id, value) { var node = el(id); if (node) node.textContent = value; }
        function setPanel(open) {
            panel.classList.toggle('opacity-0', !open);
            panel.classList.toggle('invisible', !open);
            panel.classList.toggle('scale-95', !open);
            panel.classList.toggle('scale-100', open);
            if (toggle) { toggle.classList.toggle('hidden', open); toggle.setAttribute('aria-expanded', String(open)); }
        }
        on('music-toggle-btn', 'click', function() { setPanel(panel.classList.contains('invisible')); });
        on('music-close-panel', 'click', function() { setPanel(false); });

        function syncPlaying() {
            var playing = !audio.paused && !audio.ended;
            var icon = el('music-play-icon');
            if (icon) icon.className = playing ? 'fas fa-pause' : 'fas fa-play';
            playBtn.setAttribute('aria-label', playing ? '暂停' : '播放');
            if (cover) cover.classList.toggle('music-cover-pulse', playing);
        }
        function play() {
            var result = audio.play();
            if (result) result.catch(function() {
                syncPlaying();
                if (typeof Utils !== 'undefined') Utils.showModal('music-tip-modal');
            });
        }
        function buildPlaylist() {
            if (!items) return;
            items.textContent = '';
            SONG_LIST.forEach(function(song, i) {
                var item = document.createElement('button');
                item.type = 'button';
                item.className = 'w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all text-sm ' + (i === index ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:text-white hover:bg-gray-800/50');
                var icon = document.createElement('i'); icon.className = 'fas fa-music text-xs';
                var label = document.createElement('span'); label.className = 'truncate flex-1'; label.textContent = song.name;
                item.appendChild(icon); item.appendChild(label);
                item.addEventListener('click', function() { select(i, true); });
                items.appendChild(item);
            });
        }
        function select(next, autoplay) {
            index = next;
            audio.src = SONG_LIST[index].file;
            if (name) name.textContent = SONG_LIST[index].name;
            save('bgMusicIndex', index);
            updateProgress(); buildPlaylist();
            if (autoplay) play();
        }
        function nextIndex() {
            if (mode === 'loop-one') return index;
            if (mode === 'shuffle') {
                var next;
                do { next = Math.floor(Math.random() * SONG_LIST.length); } while (next === index && SONG_LIST.length > 1);
                return next;
            }
            return (index + 1) % SONG_LIST.length;
        }
        function updateMode() {
            audio.loop = mode === 'loop-one';
            var icon = el('music-mode-icon'), button = el('music-mode-btn');
            if (icon) icon.className = mode === 'shuffle' ? 'fas fa-random' : 'fas fa-repeat';
            if (button) button.title = mode === 'shuffle' ? '随机播放' : mode === 'loop-one' ? '单曲循环' : '列表循环';
            save('bgMusicMode', mode);
        }
        function formatTime(value) {
            if (!Number.isFinite(value)) return '0:00';
            return Math.floor(value / 60) + ':' + String(Math.floor(value % 60)).padStart(2, '0');
        }
        function updateProgress() {
            var percent = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.currentTime / audio.duration * 100 : 0;
            if (bar) bar.style.width = percent + '%';
            if (thumb) thumb.style.left = percent + '%';
            text('music-current-time', formatTime(audio.currentTime));
            text('music-duration', formatTime(audio.duration));
        }
        function setVolume(value) {
            audio.volume = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0.08;
            if (volume) volume.value = audio.volume;
            var icon = el('music-volume-icon');
            if (icon) icon.className = (audio.volume === 0 ? 'fas fa-volume-mute' : audio.volume < 0.5 ? 'fas fa-volume-down' : 'fas fa-volume-up') + ' text-sm';
            save('bgMusicVolume', audio.volume);
        }
        on('music-play-btn', 'click', function() { if (audio.paused) play(); else audio.pause(); });
        on('music-next-btn', 'click', function() { select(nextIndex(), true); });
        on('music-prev-btn', 'click', function() { if (audio.currentTime > 3) audio.currentTime = 0; else select((index - 1 + SONG_LIST.length) % SONG_LIST.length, true); });
        on('music-mode-btn', 'click', function() { mode = modes[(modes.indexOf(mode) + 1) % modes.length]; updateMode(); });
        on('music-volume', 'input', function() { setVolume(Number(this.value)); });
        on('music-volume-btn', 'click', function() {
            if (audio.volume > 0) { save('bgMusicVolumeCache', audio.volume); setVolume(0); }
            else setVolume(Number(read('bgMusicVolumeCache', '0.08')) || 0.08);
        });
        if (track) track.addEventListener('click', function(event) {
            if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
            var rect = track.getBoundingClientRect();
            if (rect.width) audio.currentTime = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)) * audio.duration;
        });
        on('music-playlist-toggle', 'click', function() {
            listOpen = !listOpen;
            var list = el('music-playlist'), arrow = el('playlist-arrow');
            if (list) list.classList.toggle('hidden', !listOpen);
            if (arrow) arrow.style.transform = listOpen ? 'rotate(180deg)' : '';
        });
        audio.addEventListener('play', syncPlaying);
        audio.addEventListener('pause', syncPlaying);
        audio.addEventListener('error', syncPlaying);
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', updateProgress);
        audio.addEventListener('ended', function() { select(nextIndex(), true); });
        updateMode(); setVolume(Number(read('bgMusicVolume', '0.08'))); select(index, false); syncPlaying();
        if (read('bgMusicPlaying', 'false') === 'true') audio.play().catch(syncPlaying);
        function persist() { save('bgMusicPlaying', !audio.paused); save('bgMusicIndex', index); save('bgMusicVolume', audio.volume); }
        window.addEventListener('pagehide', persist);
        enableDrag();
    });

    function enableDrag() {
        var player = document.getElementById('music-player');
        if (!player) return;
        var key = 'musicPlayerOffset', dragging = false, startX, startY, x = 0, y = 0;
        try { var offset = JSON.parse(read(key, '{}')); x = Number(offset.x) || 0; y = Number(offset.y) || 0; } catch(e) {}
        function apply() { player.style.transform = 'translate(' + x + 'px, ' + y + 'px)'; }
        function constrain() {
            var rect = player.getBoundingClientRect();
            if (rect.left < 0) x -= rect.left;
            if (rect.top < 0) y -= rect.top;
            if (rect.right > window.innerWidth) x -= rect.right - window.innerWidth;
            if (rect.bottom > window.innerHeight) y -= rect.bottom - window.innerHeight;
            apply(); save(key, JSON.stringify({x:x, y:y}));
        }
        player.addEventListener('mousedown', function(event) {
            if (event.button !== 0 || event.target.closest('button, input, a')) return;
            dragging = true; startX = event.clientX; startY = event.clientY;
            player.style.cursor = 'grabbing'; player.style.transition = 'none'; event.preventDefault();
        });
        document.addEventListener('mousemove', function(event) {
            if (dragging) player.style.transform = 'translate(' + (x + event.clientX - startX) + 'px, ' + (y + event.clientY - startY) + 'px)';
        });
        document.addEventListener('mouseup', function(event) {
            if (!dragging) return;
            dragging = false; x += event.clientX - startX; y += event.clientY - startY;
            player.style.cursor = ''; player.style.transition = ''; constrain();
        });
        window.addEventListener('resize', constrain);
        apply(); setTimeout(constrain, 300);
    }
})();
