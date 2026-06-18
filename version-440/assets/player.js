function initMoviePlayer(videoId, sourceUrl, coverId) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var hlsInstance = null;
    var isReady = false;

    if (!video || !sourceUrl) {
        return;
    }

    function setCoverState(hidden) {
        if (cover) {
            cover.classList.toggle("is-hidden", hidden);
        }
    }

    function startVideo() {
        setCoverState(true);
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    function bindSource() {
        if (isReady) {
            startVideo();
            return;
        }
        isReady = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            video.addEventListener("loadedmetadata", startVideo, { once: true });
            video.load();
            startVideo();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                startVideo();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
                if (data && data.fatal) {
                    hlsInstance.destroy();
                    video.src = sourceUrl;
                    video.load();
                    startVideo();
                }
            });
            return;
        }
        video.src = sourceUrl;
        video.load();
        startVideo();
    }

    if (cover) {
        cover.addEventListener("click", bindSource);
    }
    video.addEventListener("click", function () {
        if (!isReady) {
            bindSource();
        }
    });
}