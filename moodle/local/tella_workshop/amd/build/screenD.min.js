define(['local_tella_workshop/math', 'local_tella_workshop/chart3d', 'local_tella_workshop/report', 'local_tella_workshop/api'], function (math, chart3d, report, api) {
    function render(root, state, actions) {
        var labels = state.config.labels || {};
        var peak = math.bestCombination(state.config);
        var fromX = (state.actuals && state.actuals.x != null) ? state.actuals.x : state.config.currentX;
        var fromY = (state.actuals && state.actuals.y != null) ? state.actuals.y : state.config.currentY;
        var sx = math.slopeX(fromX, fromY, state.config);
        var sy = math.slopeY(fromX, fromY, state.config);
        var open = api.getWorkingOpen();
        var working = report.workingText(state.config).map(function (line) {
            return '<p>' + escapeHtml(line) + '</p>';
        }).join('');
        root.innerHTML = '<div class="tella-screen tella-screen-d" data-screen="d">' +
            '<div class="tella-toolbar"><h2>Your takeaway</h2>' +
            '<div class="tella-toolbar-actions">' +
            '<button type="button" class="tella-btn tella-btn-primary" data-action="pdf">Export PDF</button>' +
            '<button type="button" class="tella-btn" data-action="share">Share</button>' +
            '</div></div>' +
            '<article class="tella-report">' +
            '<p class="tella-recommend">' + escapeHtml(report.recommendation(state.config, state.actuals)) + '</p>' +
            '<dl class="tella-facts">' +
            '<div><dt>Best combination</dt><dd>' + Math.round(peak.bestX || 0) + ' ' + escapeHtml((labels.product1 || '').toLowerCase()) +
            ' · ' + Math.round(peak.bestY || 0) + ' ' + escapeHtml((labels.product2 || '').toLowerCase()) + '</dd></div>' +
            '<div><dt>Value of one more unit now</dt><dd>' + math.formatSlope(sx, labels.currency) + ' ' +
            escapeHtml((labels.product1 || '').toLowerCase()) + ' · ' + math.formatSlope(sy, labels.currency) + ' ' +
            escapeHtml((labels.product2 || '').toLowerCase()) + '</dd></div>' +
            '<div><dt>Cost of being off</dt><dd>10 units off ≈ ' + math.formatMoney(math.costOfBeingOff(10, state.config), labels.currency) +
            '/day · 50 units off ≈ ' + math.formatMoney(math.costOfBeingOff(50, state.config), labels.currency) + '/day</dd></div>' +
            '</dl>' +
            '<section class="tella-card tella-plot"><h3>Break-even ring</h3>' +
            '<canvas class="tella-canvas" width="720" height="420" aria-label="Break-even contour"></canvas></section>' +
            '<details class="tella-working"' + (open ? ' open' : '') + '><summary>Show the working</summary>' + working + '</details>' +
            '</article></div>';
        var canvas = root.querySelector('.tella-canvas');
        var validation = math.validateConfig(state.config);
        if (validation.canPlot) {
            var grid = chart3d.buildGrid(state.config);
            chart3d.drawContour(canvas.getContext('2d'), grid, {x: fromX, y: fromY}, {
                labels: labels,
                peak: {x: validation.clamped.bestX, y: validation.clamped.bestY}
            });
        }
        root.querySelector('[data-action="pdf"]').addEventListener('click', function () {
            report.downloadPdf(state.config, state.actuals);
            actions.onExport();
        });
        root.querySelector('[data-action="share"]').addEventListener('click', function () {
            var text = report.recommendation(state.config, state.actuals);
            if (navigator.share) {
                navigator.share({title: 'Tella workshop report', text: text});
            } else if (navigator.clipboard) {
                navigator.clipboard.writeText(text);
            }
        });
        root.querySelector('.tella-working').addEventListener('toggle', function (ev) {
            api.setWorkingOpen(ev.target.open);
        });
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (ch) {
            return ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch]);
        });
    }

    return {render: render};
});
