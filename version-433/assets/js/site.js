// 亚洲好剧 - generated static site interactions
(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var navLinks = document.querySelector('[data-nav-links]');

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  var searchInput = document.querySelector('[data-search-input]');
  var searchCards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
  var searchCount = document.querySelector('[data-search-count]');
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applySearch() {
    if (!searchInput || searchCards.length === 0) {
      return;
    }

    var keyword = normalize(searchInput.value);
    var visible = 0;

    searchCards.forEach(function (card) {
      var text = card.getAttribute('data-search-text') || '';
      var matched = !keyword || text.indexOf(keyword) !== -1;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (searchCount) {
      searchCount.textContent = '找到 ' + visible + ' 部';
    }

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      searchInput.value = query;
    }
    searchInput.addEventListener('input', applySearch);
    applySearch();
  }

  var playButtons = Array.prototype.slice.call(document.querySelectorAll('[data-play-button]'));
  playButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var player = button.closest('[data-player-title]');
      var title = player ? player.getAttribute('data-player-title') : '当前影片';
      button.textContent = '✓';
      button.setAttribute('aria-label', title + ' 信息已载入');
    });
  });
})();
