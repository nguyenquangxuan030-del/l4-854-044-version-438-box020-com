import { H as Hls } from './hls-dru42stk.js';

export function initMoviePlayer(videoId, overlayId, source) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);

  if (!video || !overlay || !source) {
    return;
  }

  function attachSource() {
    if (video.dataset.ready === 'true') {
      return;
    }

    video.dataset.ready = 'true';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.load();
      return;
    }

    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      return;
    }

    video.src = source;
    video.load();
  }

  function playVideo() {
    attachSource();
    overlay.classList.add('is-hidden');
    var request = video.play();

    if (request && typeof request.catch === 'function') {
      request.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });
}
