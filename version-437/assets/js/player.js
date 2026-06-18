(function () {
    var video = document.getElementById('video-player');
    var button = document.getElementById('play-overlay');
    var configNode = document.getElementById('video-config');
    if (!video || !button || !configNode) {
        return;
    }

    var config = {};
    try {
        config = JSON.parse(configNode.textContent || '{}');
    } catch (error) {
        config = {};
    }

    var source = config.source || '';
    var attached = false;

    function attach() {
        if (attached || !source) {
            return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            window.__activeHls = hls;
        } else {
            video.src = source;
        }
    }

    function play() {
        attach();
        button.classList.add('hidden');
        var result = video.play();
        if (result && typeof result.catch === 'function') {
            result.catch(function () {
                button.classList.remove('hidden');
            });
        }
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener('play', function () {
        button.classList.add('hidden');
    });
    video.addEventListener('pause', function () {
        if (!video.ended) {
            button.classList.remove('hidden');
        }
    });
})();
