define(['local_tella_workshop/math', 'local_tella_workshop/chart3d'], function (math, chart3d) {
    function render(root, state, actions) {
        var labels = state.config.labels || {};
        var range = math.plotRange(state.config);
        root.innerHTML = '<div class="tella-screen tella-screen-c" data-screen="c">' +
            '<div class="tella-toolbar">' +
            '<h2>Walk uphill</h2>' +
            '<div class="tella-toolbar-actions">' +
            '<button type="button" class="tella-btn tella-btn-primary" data-action="solve">Solve</button>' +
            '<button type="button" class="tella-btn" data-action="arrow">' + (state.showArrow ? 'Hide uphill arrow' : 'Show uphill arrow') + '</button>' +
            '<button type="button" class="tella-btn" data-action="reset-actuals">Reset to actuals</button>' +
            '</div></div>' +
            '<section class="tella-card tella-plot">' +
            '<canvas class="tella-canvas" width="900" height="520" aria-label="Contour map"></canvas>' +
            '</section>' +
            '<div class="tella-sliders">' +
            '<label class="tella-slider"><span>' + escapeHtml(labels.product1 || 'Product 1') + '</span>' +
            '<input type="range" min="0" max="' + Math.round(range.xMax) + '" step="1" value="' + Math.round(state.config.currentX) + '" data-axis="x"></label>' +
            '<label class="tella-slider"><span>' + escapeHtml(labels.product2 || 'Product 2') + '</span>' +
            '<input type="range" min="0" max="' + Math.round(range.yMax) + '" step="1" value="' + Math.round(state.config.currentY) + '" data-axis="y"></label>' +
            '</div>' +
            '<p class="tella-dual-slopes" data-role="slopes" aria-live="polite"></p>' +
            '</div>';
        bind(root, state, actions);
        draw(root, state);
    }

    function bind(root, state, actions) {
        root.querySelectorAll('input[type="range"]').forEach(function (slider) {
            slider.addEventListener('input', function () {
                var axis = slider.getAttribute('data-axis');
                var value = Math.round(Number(slider.value));
                if (axis === 'x') {
                    state.config.currentX = value;
                } else {
                    state.config.currentY = value;
                }
                state.trail.push({x: state.config.currentX, y: state.config.currentY});
                if (state.trail.length > 240) {
                    state.trail.shift();
                }
                draw(root, state);
                actions.onChange();
            });
        });
        root.querySelector('[data-action="arrow"]').addEventListener('click', function () {
            state.showArrow = !state.showArrow;
            actions.redraw();
        });
        root.querySelector('[data-action="reset-actuals"]').addEventListener('click', function () {
            state.config.currentX = state.actuals.x;
            state.config.currentY = state.actuals.y;
            state.trail = [{x: state.actuals.x, y: state.actuals.y}];
            actions.redraw();
        });
        root.querySelector('[data-action="solve"]').addEventListener('click', function () {
            actions.solve(root);
        });
    }

    function draw(root, state) {
        var canvas = root.querySelector('.tella-canvas');
        var ctx = canvas.getContext('2d');
        var validation = math.validateConfig(state.config);
        if (!validation.canPlot) {
            return;
        }
        var grid = chart3d.buildGrid(state.config);
        var sx = math.slopeX(state.config.currentX, state.config.currentY, state.config);
        var sy = math.slopeY(state.config.currentX, state.config.currentY, state.config);
        chart3d.drawContour(ctx, grid, {x: state.config.currentX, y: state.config.currentY}, {
            labels: state.config.labels,
            peak: {x: validation.clamped.bestX, y: validation.clamped.bestY},
            trail: state.trail,
            arrow: state.showArrow ? {dx: sx, dy: sy} : null
        });
        var labels = state.config.labels || {};
        root.querySelector('[data-role="slopes"]').textContent =
            math.slopeSentence(labels.product1 || 'product 1', sx, labels.currency) +
            ' · ' + math.slopeSentence(labels.product2 || 'product 2', sy, labels.currency);
        var xSlider = root.querySelector('[data-axis="x"]');
        var ySlider = root.querySelector('[data-axis="y"]');
        if (xSlider && Number(xSlider.value) !== state.config.currentX) {
            xSlider.value = state.config.currentX;
        }
        if (ySlider && Number(ySlider.value) !== state.config.currentY) {
            ySlider.value = state.config.currentY;
        }
    }

    function animateSolve(root, state, actions) {
        var peak = math.bestCombination(state.config);
        if (peak.error) {
            return;
        }
        var startX = state.config.currentX;
        var startY = state.config.currentY;
        var startP = math.profit(startX, startY, state.config);
        var endX = Math.round(peak.bestX);
        var endY = Math.round(peak.bestY);
        var endP = math.profit(endX, endY, state.config);
        var t0 = null;
        function step(ts) {
            if (!t0) {
                t0 = ts;
            }
            var t = Math.min(1, (ts - t0) / 900);
            var ease = 1 - Math.pow(1 - t, 3);
            state.config.currentX = Math.round(startX + (endX - startX) * ease);
            state.config.currentY = Math.round(startY + (endY - startY) * ease);
            state.trail.push({x: state.config.currentX, y: state.config.currentY});
            draw(root, state);
            actions.onChange();
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                state.reachedPeak = true;
                actions.onPeak(startP, endP);
            }
        }
        requestAnimationFrame(step);
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (ch) {
            return ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch]);
        });
    }

    return {render: render, draw: draw, animateSolve: animateSolve};
});
