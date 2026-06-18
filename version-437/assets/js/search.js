(function () {
    var input = document.getElementById('search-input');
    var box = document.getElementById('search-results');
    if (!input || !box || !window.SEARCH_INDEX) {
        return;
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (ch) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[ch];
        });
    }

    function card(item) {
        return '<article class="search-result-card">' +
            '<a href="' + escapeHtml(item.url) + '"><img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></a>' +
            '<div><h2><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>' +
            '<p>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.category) + '</p>' +
            '<p>' + escapeHtml(item.text) + '</p></div>' +
            '</article>';
    }

    function render() {
        var keyword = input.value.trim().toLowerCase();
        if (!keyword) {
            box.innerHTML = '<div class="search-empty">请输入关键词开始搜索。</div>';
            return;
        }
        var parts = keyword.split(/\s+/).filter(Boolean);
        var results = window.SEARCH_INDEX.filter(function (item) {
            var haystack = [item.title, item.year, item.region, item.type, item.category, item.text].join(' ').toLowerCase();
            return parts.every(function (part) {
                return haystack.indexOf(part) !== -1;
            });
        }).slice(0, 80);
        if (!results.length) {
            box.innerHTML = '<div class="search-empty">没有找到匹配内容。</div>';
            return;
        }
        box.innerHTML = results.map(card).join('');
    }

    var params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';
    input.addEventListener('input', render);
    render();
})();
