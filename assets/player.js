(function() {
    function boot(video, button, streamUrl) {
        var hls = null;
        var ready = false;
        var pending = null;

        function hideButton() {
            button.classList.add("is-hidden");
        }

        function showButton() {
            if (video.paused || video.ended) {
                button.classList.remove("is-hidden");
            }
        }

        function loadStream() {
            if (ready) {
                return Promise.resolve();
            }
            if (pending) {
                return pending;
            }
            pending = new Promise(function(resolve) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                    ready = true;
                    resolve();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
                        ready = true;
                        resolve();
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    return;
                }
                video.src = streamUrl;
                ready = true;
                resolve();
            });
            return pending;
        }

        function playVideo() {
            hideButton();
            loadStream().then(function() {
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function() {
                        showButton();
                    });
                }
            });
        }

        button.addEventListener("click", playVideo);
        video.addEventListener("click", function() {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener("play", hideButton);
        video.addEventListener("pause", showButton);
        video.addEventListener("ended", showButton);
        window.addEventListener("beforeunload", function() {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    window.MoviePlayer = {
        boot: boot
    };
}());
