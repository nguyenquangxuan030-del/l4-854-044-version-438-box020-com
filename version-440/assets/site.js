(function () {
    function closestForm(element) {
        return element && element.closest ? element.closest("form") : null;
    }

    function setupMenus() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupSearchForms() {
        var forms = document.querySelectorAll("[data-search-form]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var target = "./search.html";
                if (query) {
                    target += "?q=" + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        if (!slides.length) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var next = document.querySelector("[data-hero-next]");
        var prev = document.querySelector("[data-hero-prev]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
                restart();
            });
        });
        restart();
    }

    function setupLocalFilter() {
        var grid = document.querySelector("[data-filterable]");
        var input = document.getElementById("pageSearch");
        if (!grid || !input) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-search]"));
        var params = new URLSearchParams(window.location.search);
        var preset = params.get("q") || "";
        var active = "全部";
        if (preset) {
            input.value = preset;
        }

        function applyFilter() {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = card.getAttribute("data-search") || "";
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesChip = active === "全部" || text.indexOf(active.toLowerCase()) !== -1;
                card.classList.toggle("is-filter-hidden", !(matchesQuery && matchesChip));
            });
        }

        input.addEventListener("input", applyFilter);
        document.querySelectorAll(".filter-chip").forEach(function (chip) {
            chip.addEventListener("click", function () {
                active = chip.getAttribute("data-filter") || "全部";
                document.querySelectorAll(".filter-chip").forEach(function (item) {
                    item.classList.toggle("is-active", item === chip);
                });
                applyFilter();
            });
        });
        var defaultChip = document.querySelector(".filter-chip[data-filter='全部']");
        if (defaultChip) {
            defaultChip.classList.add("is-active");
        }
        applyFilter();
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenus();
        setupSearchForms();
        setupHero();
        setupLocalFilter();
    });
})();