(function () {
  var nav = document.querySelector('[data-nav]');
  var navToggle = document.querySelector('[data-nav-toggle]');

  if (nav && navToggle) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('is-active', i === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('mouseenter', function () {
        activate(Number(thumb.getAttribute('data-hero-thumb')) || 0);
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        activate(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        activate(current + 1);
        startTimer();
      });
    }

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    startTimer();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var search = scope.querySelector('[data-search]');
    var typeFilter = scope.querySelector('[data-type-filter]');
    var yearFilter = scope.querySelector('[data-year-filter]');
    var list = document.querySelector('[data-card-list]');
    var empty = document.querySelector('[data-empty-state]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

    if (search && search.hasAttribute('data-query-param')) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get(search.getAttribute('data-query-param')) || '';
      search.value = query;
    }

    function includesAny(value, target) {
      if (!value) {
        return true;
      }
      return target.indexOf(value) !== -1;
    }

    function applyFilter() {
      var query = search ? search.value.trim().toLowerCase() : '';
      var typeValue = typeFilter ? typeFilter.value : '';
      var yearValue = yearFilter ? yearFilter.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var type = card.getAttribute('data-type') || '';
        var year = card.getAttribute('data-year') || '';
        var region = (card.getAttribute('data-region') || '').toLowerCase();
        var tags = (card.getAttribute('data-tags') || '').toLowerCase();
        var text = [title, type.toLowerCase(), year, region, tags].join(' ');
        var matched = includesAny(query, text) && includesAny(typeValue, type) && includesAny(yearValue, year);

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (search) {
      search.addEventListener('input', applyFilter);
    }

    if (typeFilter) {
      typeFilter.addEventListener('change', applyFilter);
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilter);
    }

    applyFilter();
  });
})();
