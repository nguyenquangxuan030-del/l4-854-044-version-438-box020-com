import { movies } from './search-index.js';

var params = new URLSearchParams(window.location.search);
var initialQuery = params.get('q') || '';
var input = document.querySelector('[data-search-input]');
var form = document.querySelector('[data-search-form]');
var results = document.querySelector('[data-search-results]');
var summary = document.querySelector('[data-search-summary]');

if (input) {
  input.value = initialQuery;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function render(items, keyword) {
  if (!results || !summary) {
    return;
  }

  var displayItems = items.slice(0, 120);
  summary.textContent = keyword ? '搜索结果：' + items.length + ' 条' : '推荐内容';

  if (!displayItems.length) {
    results.innerHTML = '<div class="no-result">没有找到匹配内容，请尝试其他关键词。</div>';
    return;
  }

  results.innerHTML = displayItems.map(function (movie) {
    return '<article class="movie-card">' +
      '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>' +
      '<span class="poster-play">▶</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="tag-row"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
      '</div>' +
      '</article>';
  }).join('');
}

function search(keyword) {
  var query = String(keyword || '').trim().toLowerCase();

  if (!query) {
    render(movies.slice(0, 60), '');
    return;
  }

  var matched = movies.filter(function (movie) {
    return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine, movie.category]
      .join(' ')
      .toLowerCase()
      .indexOf(query) !== -1;
  });

  render(matched, query);
}

if (form && input) {
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var query = input.value.trim();
    var nextUrl = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
    window.history.replaceState(null, '', nextUrl);
    search(query);
  });

  input.addEventListener('input', function () {
    search(input.value);
  });
}

search(initialQuery);
