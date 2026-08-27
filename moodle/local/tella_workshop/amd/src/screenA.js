define(['local_tella_workshop/math', 'local_tella_workshop/chart3d'], function (math, chart3d) {
    function numberFields(labels) {
        var p1 = labels.product1 || 'Product 1';
        var p2 = labels.product2 || 'Product 2';
        return [
            {key: 'price1', label: p1 + ' starting price'},
            {key: 'priceDrop1', label: p1 + ' price drop / unit'},
            {key: 'cost1', label: p1 + ' cost / unit'},
            {key: 'price2', label: p2 + ' starting price'},
            {key: 'priceDrop2', label: p2 + ' price drop / unit'},
            {key: 'cost2', label: p2 + ' cost / unit'},
            {key: 'congestion', label: 'Congestion cost'},
            {key: 'fixedCost', label: 'Fixed cost / day'}
        ];
    }

    function isCustom(config) {
        return (config.name || '').indexOf('Campus café') !== -1 ||
            (config.labels && config.labels.product1 === 'Espresso');
    }

    function render(root, state, actions) {
        var labels = state.config.labels || {};
        var custom = isCustom(state.config);
        root.innerHTML = '<div class="tella-screen tella-screen-a" data-screen="a">' +
            '<div class="tella-toolbar">' +
            '<h2 data-role="qname">' + escapeHtml(state.config.name || 'Untitled business') + '</h2>' +
            '<div class="tella-toolbar-actions">' +
            '<button type="button" class="tella-btn' + (custom ? '' : ' tella-btn-primary is-on') + '" data-action="sample">Bakery sample</button>' +
            '<button type="button" class="tella-btn' + (custom ? ' tella-btn-primary is-on' : '') + '" data-action="custom">Custom question</button>' +
            '<button type="button" class="tella-btn" data-action="toggle-view">' + (state.view === 'contour' ? '3-D surface' : 'Contour map') + '</button>' +
            '<button type="button" class="tella-btn" data-action="reset">Reset</button>' +
            '</div></div>' +
            '<div class="tella-split">' +
            '<div class="tella-editor">' +
            '<section class="tella-card tella-identity" aria-label="Question">' +
            '<h3>The question</h3>' +
            '<label class="tella-field">Title<input data-meta="name" value="' + escapeAttr(state.config.name) + '"></label>' +
            '<label class="tella-field">Question text' +
            '<textarea data-meta="question" rows="2">' + escapeHtml(state.config.question || '') + '</textarea></label>' +
            '<div class="tella-identity-grid">' +
            '<label class="tella-field">Product 1 name<input data-meta="product1" value="' + escapeAttr(labels.product1) + '"></label>' +
            '<label class="tella-field">Product 1 unit<input data-meta="unit1" value="' + escapeAttr(labels.unit1) + '"></label>' +
            '<label class="tella-field">Product 2 name<input data-meta="product2" value="' + escapeAttr(labels.product2) + '"></label>' +
            '<label class="tella-field">Product 2 unit<input data-meta="unit2" value="' + escapeAttr(labels.unit2) + '"></label>' +
            '<label class="tella-field">Currency<input data-meta="currency" value="' + escapeAttr(labels.currency) + '"></label>' +
            '</div></section>' +
            '<section class="tella-card tella-inputs" aria-label="Business numbers">' +
            '<h3>The numbers</h3>' +
            numberFields(labels).map(function (f) {
                return '<label class="tella-field"><span data-dynlabel="' + f.key + '">' + escapeHtml(f.label) + '</span>' +
                    '<input inputmode="decimal" data-field="' + f.key + '" value="' + (state.config[f.key] ?? '') + '">' +
                    '<span class="tella-error" data-error="' + f.key + '"></span></label>';
            }).join('') +
            '<label class="tella-field"><span data-dynlabel="currentX">Current ' + escapeHtml(labels.product1 || 'product 1') + '</span>' +
            '<input inputmode="numeric" data-field="currentX" value="' + (state.config.currentX ?? '') + '"></label>' +
            '<label class="tella-field"><span data-dynlabel="currentY">Current ' + escapeHtml(labels.product2 || 'product 2') + '</span>' +
            '<input inputmode="numeric" data-field="currentY" value="' + (state.config.currentY ?? '') + '"></label>' +
            '<p class="tella-here" data-role="here"></p>' +
            '<p class="tella-note" data-role="notes"></p>' +
            '</section></div>' +
            '<section class="tella-card tella-plot">' +
            '<canvas class="tella-canvas" width="720" height="560" aria-label="Profit landscape"></canvas>' +
            '</section></div></div>';
        bind(root, state, actions);
        refreshIdentity(root, state);
        draw(root, state);
    }

    function bind(root, state, actions) {
        root.querySelectorAll('input[data-field]').forEach(function (input) {
            input.addEventListener('input', function () {
                var key = input.getAttribute('data-field');
                var raw = input.value.trim();
                if (raw === '') {
                    state.config[key] = '';
                } else if (key === 'currentX' || key === 'currentY') {
                    state.config[key] = Math.round(Number(raw));
                    state.actuals = {x: Number(state.config.currentX) || 0, y: Number(state.config.currentY) || 0};
                } else {
                    state.config[key] = Number(raw);
                }
                draw(root, state);
                actions.onChange();
            });
        });
        root.querySelectorAll('[data-meta]').forEach(function (input) {
            input.addEventListener('input', function () {
                var key = input.getAttribute('data-meta');
                var value = input.value;
                if (key === 'name' || key === 'question') {
                    state.config[key] = value;
                } else {
                    if (!state.config.labels) {
                        state.config.labels = {};
                    }
                    state.config.labels[key] = value;
                }
                refreshIdentity(root, state);
                draw(root, state);
                actions.onChange();
            });
        });
        root.querySelector('[data-action="sample"]').addEventListener('click', function () {
            actions.loadSample();
        });
        root.querySelector('[data-action="custom"]').addEventListener('click', function () {
            actions.loadCustom();
        });
        root.querySelector('[data-action="reset"]').addEventListener('click', function () {
            actions.reset();
        });
        root.querySelector('[data-action="toggle-view"]').addEventListener('click', function () {
            state.view = state.view === 'contour' ? 'surface' : 'contour';
            actions.redraw();
        });
    }

    function refreshIdentity(root, state) {
        var labels = state.config.labels || {};
        var title = root.querySelector('[data-role="qname"]');
        if (title) {
            title.textContent = state.config.name || 'Untitled business';
        }
        root.querySelectorAll('[data-dynlabel]').forEach(function (el) {
            var key = el.getAttribute('data-dynlabel');
            var map = {
                price1: (labels.product1 || 'Product 1') + ' starting price',
                priceDrop1: (labels.product1 || 'Product 1') + ' price drop / unit',
                cost1: (labels.product1 || 'Product 1') + ' cost / unit',
                price2: (labels.product2 || 'Product 2') + ' starting price',
                priceDrop2: (labels.product2 || 'Product 2') + ' price drop / unit',
                cost2: (labels.product2 || 'Product 2') + ' cost / unit',
                congestion: 'Congestion cost',
                fixedCost: 'Fixed cost / day',
                currentX: 'Current ' + (labels.product1 || 'product 1'),
                currentY: 'Current ' + (labels.product2 || 'product 2')
            };
            el.textContent = map[key] || el.textContent;
        });
        var here = root.querySelector('[data-role="here"]');
        if (here) {
            here.textContent = 'You are here: ' + Math.round(state.config.currentX || 0) + ' ' +
                (labels.unit1 || '') + ' · ' + Math.round(state.config.currentY || 0) + ' ' +
                (labels.unit2 || '');
        }
    }

    function draw(root, state) {
        var canvas = root.querySelector('.tella-canvas');
        var ctx = canvas.getContext('2d');
        var validation = math.validateConfig(state.config);
        root.querySelectorAll('[data-error]').forEach(function (el) {
            el.textContent = (validation.errors && validation.errors[el.getAttribute('data-error')]) || '';
        });
        var note = [];
        (validation.warnings || []).forEach(function (w) { note.push(w); });
        (validation.notes || []).forEach(function (w) { note.push(w); });
        root.querySelector('[data-role="notes"]').textContent = note.join(' ');
        refreshIdentity(root, state);
        if (!validation.canPlot) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#64748b';
            ctx.font = '16px "Segoe UI", system-ui, sans-serif';
            ctx.fillText(validation.errors.congestion || 'Fill in the business numbers to plot.', 24, 40);
            return;
        }
        var grid = chart3d.buildGrid(state.config);
        var peak = validation.clamped;
        var extras = {labels: state.config.labels, peak: {x: peak.bestX, y: peak.bestY}};
        if (state.view === 'contour') {
            chart3d.drawContour(ctx, grid, {x: state.config.currentX, y: state.config.currentY}, extras);
        } else {
            chart3d.drawSurface(ctx, grid, {x: state.config.currentX, y: state.config.currentY}, extras);
        }
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (ch) {
            return ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch]);
        });
    }

    function escapeAttr(value) {
        return escapeHtml(value);
    }

    return {render: render, draw: draw};
});
