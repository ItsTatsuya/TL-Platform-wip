define(['local_tella_workshop/math', 'local_tella_workshop/chart3d'], function (math, chart3d) {
    var surfaceCache = null;
    var cachedKey = '';

    function render(root, state, actions) {
        var labels = state.config.labels || {};
        var frozenIsY = state.frozen === 'y';
        var frozenName = frozenIsY ? labels.product2 : labels.product1;
        var freeName = frozenIsY ? labels.product1 : labels.product2;
        var frozenValue = frozenIsY ? state.config.currentY : state.config.currentX;
        var range = math.plotRange(state.config);
        var max = frozenIsY ? range.yMax : range.xMax;
        root.innerHTML = '<div class="tella-screen tella-screen-b" data-screen="b">' +
            '<div class="tella-toolbar">' +
            '<h2>Freeze an input · ' + escapeHtml(frozenName) + ' = ' + Math.round(frozenValue) +
            ' · ' + escapeHtml(freeName) + ' = free</h2>' +
            '<button type="button" class="tella-btn tella-btn-primary" data-action="swap">Swap</button>' +
            '</div>' +
            '<label class="tella-slider">' +
            '<span>Frozen ' + escapeHtml(frozenName || '') + '</span>' +
            '<input type="range" min="0" max="' + Math.round(max) + '" step="1" value="' + Math.round(frozenValue) + '" data-role="freeze">' +
            '</label>' +
            '<p class="tella-slope" data-role="slope" aria-live="polite"></p>' +
            '<div class="tella-split tella-split-even">' +
            '<section class="tella-card tella-plot"><canvas class="tella-canvas tella-canvas-3d" width="640" height="420" aria-label="Cutting plane"></canvas></section>' +
            '<section class="tella-card tella-plot"><canvas class="tella-canvas tella-canvas-2d" width="640" height="420" aria-label="Slice curve"></canvas></section>' +
            '</div>' +
            '</div>';
        bind(root, state, actions);
        draw(root, state, true);
    }

    function bind(root, state, actions) {
        var slider = root.querySelector('[data-role="freeze"]');
        var dragging = false;
        slider.addEventListener('pointerdown', function () {
            dragging = true;
        });
        slider.addEventListener('pointerup', function () {
            dragging = false;
        });
        slider.addEventListener('input', function () {
            var value = Math.round(Number(slider.value));
            if (state.frozen === 'y') {
                state.config.currentY = value;
            } else {
                state.config.currentX = value;
            }
            draw(root, state, !dragging);
            actions.onExplore();
            actions.onChange();
        });
        root.querySelector('[data-action="swap"]').addEventListener('click', function () {
            state.frozen = state.frozen === 'y' ? 'x' : 'y';
            actions.redraw();
        });
    }

    function draw(root, state, rebuild) {
        var labels = state.config.labels || {};
        var frozenIsY = state.frozen === 'y';
        var canvas3d = root.querySelector('.tella-canvas-3d');
        var canvas2d = root.querySelector('.tella-canvas-2d');
        var ctx3d = canvas3d.getContext('2d');
        var ctx2d = canvas2d.getContext('2d');
        var validation = math.validateConfig(state.config);
        if (!validation.canPlot) {
            return;
        }
        var gridKey = JSON.stringify([state.config.price1, state.config.priceDrop1, state.config.cost1,
            state.config.price2, state.config.priceDrop2, state.config.cost2, state.config.congestion, state.config.fixedCost]);
        if (rebuild || !surfaceCache || cachedKey !== gridKey) {
            surfaceCache = chart3d.buildGrid(state.config);
            cachedKey = gridKey;
        }
        var frozenValue = frozenIsY ? state.config.currentY : state.config.currentX;
        var freeValue = frozenIsY ? state.config.currentX : state.config.currentY;
        chart3d.drawSurface(ctx3d, surfaceCache, {x: state.config.currentX, y: state.config.currentY}, {
            labels: labels,
            plane: {axis: frozenIsY ? 'y' : 'x', value: frozenValue},
            peak: {x: validation.clamped.bestX, y: validation.clamped.bestY}
        });
        chart3d.drawSlice(ctx2d, state.config, frozenIsY ? 'y' : 'x', frozenValue, freeValue, labels);
        var slope = frozenIsY
            ? math.slopeX(state.config.currentX, state.config.currentY, state.config)
            : math.slopeY(state.config.currentX, state.config.currentY, state.config);
        var product = frozenIsY ? labels.product1 : labels.product2;
        var sentence = math.slopeSentence(product || 'unit', slope, labels.currency);
        var el = root.querySelector('[data-role="slope"]');
        el.textContent = sentence.charAt(0).toUpperCase() + sentence.slice(1);
        el.classList.toggle('is-positive', slope > 0);
        el.classList.toggle('is-negative', slope < 0);
        if (frozenIsY) {
            state.exploredX = true;
        } else {
            state.exploredY = true;
        }
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (ch) {
            return ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch]);
        });
    }

    return {render: render, draw: draw};
});
