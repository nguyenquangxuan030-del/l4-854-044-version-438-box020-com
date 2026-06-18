(function () {
  var doc = document;

  function $(selector, root) {
    return (root || doc).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || doc).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var button = $('[data-menu-toggle]');
    var menu = $('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', menu.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function readQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function initCardsFilter() {
    var filterInput = $('[data-card-filter]');
    var typeFilter = $('[data-type-filter]');
    var yearFilter = $('[data-year-filter]');
    var cards = $all('[data-movie-card]');
    var empty = $('[data-empty-state]');

    if (!cards.length) {
      return;
    }

    var headerQuery = readQueryParam('q');
    if (filterInput && headerQuery) {
      filterInput.value = headerQuery;
    }

    function apply() {
      var q = normalize(filterInput ? filterInput.value : '');
      var type = typeFilter ? typeFilter.value : '';
      var year = yearFilter ? yearFilter.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matched = true;

        if (q && text.indexOf(q) === -1) {
          matched = false;
        }

        if (type && cardType.indexOf(type) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (filterInput) {
      filterInput.addEventListener('input', apply);
    }

    if (typeFilter) {
      typeFilter.addEventListener('change', apply);
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', apply);
    }

    apply();
  }

  function initImageFallback() {
    $all('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.style.opacity = '0';
      }, { once: true });
    });
  }

  function initPlayer() {
    $all('[data-player]').forEach(function (player) {
      var video = $('video', player);
      var button = $('[data-play]', player);
      var hlsSource = player.getAttribute('data-hls') || (video ? video.getAttribute('data-src') : '');
      var mp4Source = player.getAttribute('data-mp4') || (video ? video.getAttribute('data-mp4') : '');
      var ready = false;
      var hlsInstance = null;

      if (!video || !button) {
        return;
      }

      function useMp4() {
        if (mp4Source && video.getAttribute('src') !== mp4Source) {
          video.setAttribute('src', mp4Source);
        }
      }

      function loadSource() {
        if (ready) {
          return;
        }

        ready = true;

        if (hlsSource && window.location.protocol !== 'file:' && window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(hlsSource);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              try {
                hlsInstance.destroy();
              } catch (error) {
                void error;
              }
              useMp4();
            }
          });
        } else if (hlsSource && video.canPlayType('application/vnd.apple.mpegurl')) {
          video.setAttribute('src', hlsSource);
        } else {
          useMp4();
        }
      }

      function play() {
        loadSource();
        player.classList.add('is-playing');
        var attempt = video.play();

        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            video.setAttribute('controls', 'controls');
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
        player.classList.add('is-playing');
      });
    });
  }

  initMobileMenu();
  initHero();
  initCardsFilter();
  initImageFallback();
  initPlayer();
})();
