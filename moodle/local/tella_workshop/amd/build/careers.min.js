define(['local_tella_workshop/api'], function (api) {
    function render(root, state, actions) {
        var placeholder = (state && state.careersPlaceholder) ||
            ((window.M && M.cfg) ? '' : '') ||
            'Opportunities from partner organisations will appear here.';
        if (state && state.strings && state.strings.careersplaceholder) {
            placeholder = state.strings.careersplaceholder;
        }
        root.innerHTML = '<div class="tella-screen" data-screen="careers">' +
            '<p class="text-muted">' + escapeHtml(placeholder) + '</p>' +
            '<div class="tella-split" data-role="list"></div></div>';
        var list = root.querySelector('[data-role="list"]');
        api.loadCareers(state.apiUrl, state.token).then(function (items) {
            if (!items || !items.length) {
                return;
            }
            list.innerHTML = items.map(function (item) {
                return '<article class="tella-card tella-job">' +
                    '<h3>' + escapeHtml(item.title) + '</h3>' +
                    '<p class="text-muted">' + escapeHtml((item.kind || '').replace(/_/g, ' ')) + '</p>' +
                    '<p>' + escapeHtml(item.summary || '') + '</p>' +
                    (item.url ? '<a href="' + escapeHtml(item.url) + '">Open details</a>' : '') +
                    '</article>';
            }).join('');
        });
    }

    function init(cfg) {
        var root = document.getElementById('tella-careers-root');
        if (!root) {
            return;
        }
        render(root, {apiUrl: cfg.apiUrl, token: cfg.token, strings: cfg.strings || {}}, {});
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (ch) {
            return ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch]);
        });
    }

    return {init: init, render: render};
});
