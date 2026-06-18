(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = qs('[data-menu-toggle]');
    var mobilePanel = qs('[data-mobile-panel]');
    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    qsa('.js-search-form').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
            }
        });
    });

    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    var prev = qs('[data-hero-prev]');
    var next = qs('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === current);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        stopHero();
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    function stopHero() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    if (slides.length) {
        showSlide(0);
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startHero();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startHero();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startHero();
            });
        }
        startHero();
    }

    var localSearch = qs('.js-local-search');
    var yearFilter = qs('.js-year-filter');
    var clearFilter = qs('.js-clear-filter');
    var cards = qsa('.searchable-card');

    function applyFilters() {
        var keyword = localSearch ? localSearch.value.trim().toLowerCase() : '';
        var year = yearFilter ? yearFilter.value : '';
        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-type') || '',
                card.getAttribute('data-category') || '',
                card.getAttribute('data-tags') || '',
                card.getAttribute('data-year') || ''
            ].join(' ').toLowerCase();
            var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var okYear = !year || card.getAttribute('data-year') === year;
            card.classList.toggle('hidden-by-filter', !(okKeyword && okYear));
        });
    }

    if (localSearch) {
        localSearch.addEventListener('input', applyFilters);
    }
    if (yearFilter) {
        yearFilter.addEventListener('change', applyFilters);
    }
    if (clearFilter) {
        clearFilter.addEventListener('click', function () {
            if (localSearch) {
                localSearch.value = '';
            }
            if (yearFilter) {
                yearFilter.value = '';
            }
            applyFilters();
        });
    }
})();
