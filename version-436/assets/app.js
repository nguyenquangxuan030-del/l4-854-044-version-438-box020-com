(() => {
  const menuButton = document.querySelector("[data-menu-button]");
  const mainNav = document.querySelector("[data-main-nav]");

  if (menuButton && mainNav) {
    menuButton.addEventListener("click", () => {
      mainNav.classList.toggle("open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let index = 0;

    const activate = (nextIndex) => {
      index = nextIndex;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === index);
      });
    };

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        activate(Number(dot.dataset.heroDot || 0));
      });
    });

    if (slides.length > 1) {
      window.setInterval(() => {
        activate((index + 1) % slides.length);
      }, 5000);
    }
  }

  const params = new URLSearchParams(window.location.search);
  const queryValue = params.get("q") || "";
  const filterInput = document.querySelector("[data-filter-input]");
  const filterCategory = document.querySelector("[data-filter-category]");
  const sortSelect = document.querySelector("[data-sort-select]");
  const cardList = document.querySelector("[data-card-list]");

  if (filterInput && queryValue) {
    filterInput.value = queryValue;
  }

  const normalize = (value) => String(value || "").trim().toLowerCase();

  const applyFilter = () => {
    if (!cardList) {
      return;
    }

    const cards = Array.from(cardList.querySelectorAll(".movie-card"));
    const keyword = normalize(filterInput ? filterInput.value : "");
    const category = filterCategory ? filterCategory.value : "";

    cards.forEach((card) => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.year,
        card.dataset.type,
        card.dataset.category,
        card.dataset.genre
      ].join(" "));
      const categoryMatched = !category || card.dataset.category === category;
      const keywordMatched = !keyword || haystack.includes(keyword);
      card.hidden = !(categoryMatched && keywordMatched);
    });
  };

  const applySort = () => {
    if (!cardList || !sortSelect) {
      return;
    }

    const mode = sortSelect.value;
    const cards = Array.from(cardList.querySelectorAll(".movie-card"));

    const getScore = (card) => {
      const score = card.querySelector(".score-badge");
      return score ? Number(score.textContent) || 0 : 0;
    };

    cards.sort((a, b) => {
      if (mode === "title") {
        return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
      }

      if (mode === "year") {
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      }

      if (mode === "rating") {
        return getScore(b) - getScore(a);
      }

      return 0;
    });

    cards.forEach((card) => {
      cardList.appendChild(card);
    });
  };

  if (filterInput || filterCategory || sortSelect) {
    filterInput && filterInput.addEventListener("input", applyFilter);
    filterCategory && filterCategory.addEventListener("change", applyFilter);
    sortSelect && sortSelect.addEventListener("change", () => {
      applySort();
      applyFilter();
    });
    applySort();
    applyFilter();
  }

  const players = Array.from(document.querySelectorAll("[data-player]"));

  players.forEach((player) => {
    const video = player.querySelector("video");
    const trigger = player.querySelector("[data-play-trigger]");
    const stream = player.dataset.stream;
    let prepared = false;
    let hlsInstance = null;

    const prepare = () => {
      if (prepared || !video || !stream) {
        return;
      }

      prepared = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else {
        video.src = stream;
      }
    };

    const start = () => {
      prepare();
      player.classList.add("playing");
      if (video) {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {
            player.classList.remove("playing");
          });
        }
      }
    };

    if (trigger) {
      trigger.addEventListener("click", start);
    }

    player.addEventListener("click", (event) => {
      if (event.target === video) {
        return;
      }
      if (!player.classList.contains("playing")) {
        start();
      }
    });

    window.addEventListener("beforeunload", () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
