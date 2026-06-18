(function () {
  function toggleMobileNav() {
    var button = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }
  }

  function applyFilter(input) {
    var scope = input.closest(".catalog-section") || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var keywords = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    cards.forEach(function (card) {
      var haystack = (card.getAttribute("data-search") || "").toLowerCase();
      var matched = keywords.every(function (keyword) {
        return haystack.indexOf(keyword) !== -1;
      });
      card.classList.toggle("is-hidden", !matched);
    });
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".local-filter"));
    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        applyFilter(input);
      });
    });

    var searchPage = document.querySelector("[data-search-page]");
    if (searchPage) {
      var queryInput = searchPage.querySelector(".search-query");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (queryInput) {
        queryInput.value = query;
        applyFilter(queryInput);
        queryInput.addEventListener("keydown", function (event) {
          if (event.key === "Enter") {
            event.preventDefault();
            var value = queryInput.value.trim();
            var target = value ? "?q=" + encodeURIComponent(value) : window.location.pathname;
            window.history.replaceState(null, "", target);
            applyFilter(queryInput);
          }
        });
      }
    }
  }

  window.createMoviePlayer = function (videoId, triggerId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var trigger = document.getElementById(triggerId);
    var overlay = document.getElementById(overlayId);
    var hlsInstance = null;
    var loaded = false;

    if (!video || !sourceUrl) {
      return;
    }

    function attachSource() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else {
        video.src = sourceUrl;
      }
    }

    function playVideo(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      attachSource();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }
    if (trigger) {
      trigger.addEventListener("click", playVideo);
    }
    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        playVideo();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    toggleMobileNav();
    setupHero();
    setupFilters();
  });
})();
