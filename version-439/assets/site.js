import { H as Hls } from './hls-dru42stk.js';

function getSearchTarget(prefix, query) {
  const cleanPrefix = prefix || '';
  return `${cleanPrefix}search.html?q=${encodeURIComponent(query)}`;
}

function initMobileNav() {
  const button = document.querySelector('.mobile-menu-button');
  const nav = document.querySelector('.mobile-nav');
  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', () => {
    const isOpen = !nav.hasAttribute('hidden');
    if (isOpen) {
      nav.setAttribute('hidden', '');
      button.setAttribute('aria-expanded', 'false');
    } else {
      nav.removeAttribute('hidden');
      button.setAttribute('aria-expanded', 'true');
    }
  });
}

function initSearchForms() {
  const forms = document.querySelectorAll('[data-search-prefix]');
  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : '';
      if (!query) {
        return;
      }
      window.location.href = getSearchTarget(form.dataset.searchPrefix, query);
    });
  });
}

function initHeroCarousel() {
  const hero = document.querySelector('.hero-carousel');
  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll('.hero-slide'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const nextButton = hero.querySelector('.hero-next');
  const prevButton = hero.querySelector('.hero-prev');
  let index = 0;
  let timer = null;

  function render(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index);
    });
  }

  function schedule() {
    clearInterval(timer);
    timer = setInterval(() => render(index + 1), 5000);
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      render(index + 1);
      schedule();
    });
  }

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      render(index - 1);
      schedule();
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      render(Number(dot.dataset.heroDot || 0));
      schedule();
    });
  });

  if (slides.length > 1) {
    schedule();
  }
}

function getCardSearchText(card) {
  return [
    card.dataset.title || '',
    card.dataset.year || '',
    card.dataset.type || '',
    card.dataset.region || '',
    card.textContent || ''
  ].join(' ').toLowerCase();
}

function initCategoryFilters() {
  const grid = document.querySelector('.js-filter-grid');
  if (!grid) {
    return;
  }

  const cards = Array.from(grid.querySelectorAll('.movie-card'));
  const keywordInput = document.querySelector('.js-filter-keyword');
  const yearSelect = document.querySelector('.js-filter-year');
  const typeSelect = document.querySelector('.js-filter-type');
  const sortSelect = document.querySelector('.js-sort-movies');
  const visibleCount = document.querySelector('.js-visible-count');

  function apply() {
    const keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
    const year = yearSelect ? yearSelect.value : '';
    const type = typeSelect ? typeSelect.value : '';
    let shown = 0;

    cards.forEach((card) => {
      const matchesKeyword = !keyword || getCardSearchText(card).includes(keyword);
      const matchesYear = !year || card.dataset.year === year;
      const matchesType = !type || card.dataset.type === type;
      const visible = matchesKeyword && matchesYear && matchesType;
      card.hidden = !visible;
      if (visible) {
        shown += 1;
      }
    });

    if (visibleCount) {
      visibleCount.textContent = String(shown);
    }
  }

  function sortCards() {
    const mode = sortSelect ? sortSelect.value : 'default';
    const sorted = [...cards];

    if (mode === 'year-desc') {
      sorted.sort((a, b) => Number(b.dataset.year || 0) - Number(a.dataset.year || 0));
    }

    if (mode === 'title-asc') {
      sorted.sort((a, b) => (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-CN'));
    }

    sorted.forEach((card) => grid.appendChild(card));
    apply();
  }

  [keywordInput, yearSelect, typeSelect].forEach((element) => {
    if (element) {
      element.addEventListener('input', apply);
      element.addEventListener('change', apply);
    }
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', sortCards);
  }
}

function createSearchCard(movie) {
  const tags = (movie.tags || [])
    .slice(0, 3)
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join('');

  return `
    <article class="movie-card">
      <a class="poster-link" href="movies/${movie.file}" aria-label="观看 ${escapeHtml(movie.title)}">
        <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="poster-gradient"></span>
        <span class="play-mark">▶</span>
      </a>
      <div class="movie-card-body">
        <div class="card-labels">
          <span>${escapeHtml(movie.categoryName)}</span>
          <span>${escapeHtml(movie.year)}</span>
        </div>
        <h3><a href="movies/${movie.file}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.oneLine)}</p>
        <div class="tag-row">${tags}</div>
      </div>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function initSearchPage() {
  const results = document.getElementById('search-results');
  const status = document.getElementById('search-status');
  const form = document.querySelector('.search-page-form');
  if (!results || !status || !window.SEARCH_DATA) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const query = (params.get('q') || '').trim();
  const input = form ? form.querySelector('input[name="q"]') : null;
  if (input) {
    input.value = query;
  }

  if (!query) {
    return;
  }

  const lower = query.toLowerCase();
  const matched = window.SEARCH_DATA.filter((movie) => {
    return [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.oneLine,
      movie.summary,
      movie.categoryName,
      ...(movie.tags || [])
    ].join(' ').toLowerCase().includes(lower);
  });

  status.innerHTML = `关键词：<strong>${escapeHtml(query)}</strong>，找到 <strong>${matched.length}</strong> 个结果。`;
  results.innerHTML = matched.slice(0, 240).map(createSearchCard).join('');

  if (matched.length > 240) {
    status.innerHTML += ' 当前显示前 240 个结果，可继续输入更精确的关键词。';
  }
}

function initPlayers() {
  const shells = document.querySelectorAll('.player-shell');
  shells.forEach((shell) => {
    const video = shell.querySelector('.js-player');
    const start = shell.querySelector('.player-start');
    const message = shell.querySelector('.player-message');
    if (!video || !start) {
      return;
    }

    const source = video.dataset.src || video.dataset.fallbackSrc;
    const fallbackSource = video.dataset.fallbackSrc;
    let currentSource = source;
    let usingFallback = false;
    let attached = false;
    let hls = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function switchToFallback() {
      if (!fallbackSource || usingFallback) {
        return false;
      }

      usingFallback = true;
      currentSource = fallbackSource;
      attached = false;

      if (hls) {
        hls.destroy();
        hls = null;
      }

      video.removeAttribute('src');
      video.load();
      setMessage('已切换备用 HLS 播放源。');
      attachSource();
      video.play().catch(() => {});
      return true;
    }

    function attachSource() {
      if (attached || !currentSource) {
        return;
      }
      attached = true;

      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(currentSource);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (!data || !data.fatal) {
            return;
          }

          if (switchToFallback()) {
            return;
          }

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            setMessage('网络波动，正在重新连接播放源...');
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            setMessage('媒体加载异常，正在恢复播放...');
          } else {
            setMessage('播放源暂时无法加载，请稍后再试。');
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = currentSource;
      } else {
        video.src = currentSource;
      }
    }

    function play() {
      attachSource();
      start.classList.add('is-hidden');
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {
          start.classList.remove('is-hidden');
          setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
        });
      }
    }

    start.addEventListener('click', play);
    video.addEventListener('play', () => start.classList.add('is-hidden'));
    video.addEventListener('pause', () => {
      if (video.currentTime === 0 || video.ended) {
        start.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initSearchForms();
  initHeroCarousel();
  initCategoryFilters();
  initSearchPage();
  initPlayers();
});
