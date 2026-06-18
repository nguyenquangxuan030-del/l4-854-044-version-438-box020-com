(function() {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function() {
            mobilePanel.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function() {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener("click", function() {
                showSlide(dotIndex);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener("click", function() {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                showSlide(index + 1);
                startTimer();
            });
        }

        startTimer();
    }

    var filterBar = document.querySelector("[data-filter-bar]");
    if (filterBar) {
        var searchInput = filterBar.querySelector("[data-card-search]");
        var genreSelect = filterBar.querySelector("[data-genre-filter]");
        var yearSelect = filterBar.querySelector("[data-year-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));

        function applyFilters() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var genre = genreSelect ? genreSelect.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value.trim() : "";

            cards.forEach(function(card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-tags")
                ].join(" ").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var matchQuery = !query || text.indexOf(query) >= 0;
                var matchGenre = !genre || text.indexOf(genre) >= 0;
                var matchYear = !year || cardYear.indexOf(year) >= 0;
                card.classList.toggle("is-hidden", !(matchQuery && matchGenre && matchYear));
            });
        }

        [searchInput, genreSelect, yearSelect].forEach(function(control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    }

    var searchData = window.SITE_MOVIES || [];
    var searchForm = document.querySelector("[data-search-page-form]");
    var searchInputPage = document.querySelector("[data-search-page-input]");
    var searchResults = document.querySelector("[data-search-results]");
    var searchStatus = document.querySelector("[data-search-status]");

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function cardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function(tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"poster-link\" href=\"./" + escapeHtml(movie.file) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"card-play\">▶</span>" +
            "</a>" +
            "<div class=\"card-body\">" +
            "<div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
            "<h2><a href=\"./" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a></h2>" +
            "<p class=\"card-desc compact\">" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function runSearch(query) {
        if (!searchResults || !searchStatus) {
            return;
        }
        var normalized = String(query || "").trim().toLowerCase();
        if (!normalized) {
            searchStatus.textContent = "热门影片";
            return;
        }
        var matches = searchData.filter(function(movie) {
            return [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" ")].join(" ").toLowerCase().indexOf(normalized) >= 0;
        }).slice(0, 96);
        searchStatus.textContent = matches.length ? "搜索结果" : "暂无匹配影片";
        searchResults.innerHTML = matches.map(cardTemplate).join("");
    }

    if (searchForm && searchInputPage) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        searchInputPage.value = initialQuery;
        runSearch(initialQuery);

        searchForm.addEventListener("submit", function(event) {
            event.preventDefault();
            var query = searchInputPage.value.trim();
            var nextUrl = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
            window.history.replaceState(null, "", nextUrl);
            runSearch(query);
        });
    }
}());
