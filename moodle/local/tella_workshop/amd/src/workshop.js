define([
    'local_tella_workshop/math',
    'local_tella_workshop/api',
    'local_tella_workshop/screenA',
    'local_tella_workshop/screenB',
    'local_tella_workshop/screenC',
    'local_tella_workshop/screenD',
    'local_tella_workshop/careers'
], function (math, api, screenA, screenB, screenC, screenD, careers) {
    var state;
    var screens = {a: screenA, b: screenB, c: screenC, d: screenD, careers: careers};
    var root;
    var initCfg;

    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function emptyConfig() {
        return {
            name: 'New business',
            price1: '',
            priceDrop1: '',
            cost1: '',
            price2: '',
            priceDrop2: '',
            cost2: '',
            congestion: '',
            fixedCost: '',
            currentX: 0,
            currentY: 0,
            labels: math.SAMPLE_BAKERY.labels
        };
    }

    function bootState(config) {
        var cfg = clone(config);
        return {
            config: cfg,
            saved: clone(cfg),
            actuals: {x: Number(cfg.currentX) || 0, y: Number(cfg.currentY) || 0},
            screen: 'a',
            view: 'surface',
            frozen: 'y',
            showArrow: true,
            trail: [{x: Number(cfg.currentX) || 0, y: Number(cfg.currentY) || 0}],
            exploredX: false,
            exploredY: false,
            reachedPeak: false,
            loadedSample: false,
            exported: false,
            points: 0,
            badges: [],
            activityId: initCfg.activityId || null,
            apiUrl: initCfg.apiUrl,
            token: initCfg.token,
            strings: initCfg.strings || {},
            toast: ''
        };
    }

    function profitText() {
        var v = math.validateConfig(state.config);
        if (!v.canPlot) {
            return 'Profit —';
        }
        return 'Profit ' + math.formatMoney(
            math.profit(state.config.currentX, state.config.currentY, state.config),
            (state.config.labels || {}).currency
        );
    }

    function shell() {
        var s = (initCfg && initCfg.strings) || {};
        return '<div class="tella-modelling">' +
            '<div class="tella-pagehead">' +
            '<p class="tella-question" data-role="question"></p>' +
            '<div class="tella-meta">' +
            '<span class="badge rounded-pill bg-secondary" data-role="points">0 pts</span> ' +
            '<span class="badge rounded-pill bg-primary" data-role="profit" aria-live="polite"></span>' +
            '</div></div>' +
            '<ul class="nav nav-tabs mb-3" role="tablist">' +
            tab('a', s.tabenter || 'Enter the business') +
            tab('b', s.tabhold || 'Hold one still') +
            tab('c', s.tabwalk || 'Walk uphill') +
            tab('d', s.tabreport || 'Report') +
            tab('careers', s.tabcareers || 'Careers') +
            '</ul>' +
            '<div class="tella-stage" data-role="stage"></div>' +
            '<div class="tella-toast" data-role="toast" role="status" aria-live="polite"></div>' +
            '</div>';
    }

    function tab(id, label) {
        return '<li class="nav-item">' +
            '<a class="nav-link tella-tab" href="#tella-' + id + '" role="tab" data-screen="' + id + '">' +
            label + '</a></li>';
    }

    function actions() {
        return {
            onChange: function () {
                updateChrome();
                persistLocal();
            },
            redraw: function () {
                renderScreen();
            },
            loadSample: function () {
                applyQuestion(math.cloneSample(), 'load_sample');
            },
            loadCustom: function () {
                applyQuestion(math.cloneCustom(), 'load_sample');
            },
            reset: function () {
                state.config = clone(state.saved && hasNumbers(state.saved) ? state.saved : emptyConfig());
                renderScreen();
            },
            onExplore: function () {
                if (state.exploredX && state.exploredY) {
                    award('explore_slopes', 25, 'slope_reader');
                }
            },
            solve: function (screenRoot) {
                screenC.animateSolve(screenRoot, state, this);
            },
            onPeak: function (fromProfit, toProfit) {
                state.reachedPeak = true;
                award('reach_peak', 50, 'first_peak');
                toast('Profit ' + math.formatMoney(fromProfit, state.config.labels.currency) +
                    ' → ' + math.formatMoney(toProfit, state.config.labels.currency));
                persistProgress('reach_peak');
            },
            onExport: function () {
                state.exported = true;
                award('export_report', 20, 'business_optimiser');
                persistProgress('export_report');
            }
        };
    }

    function applyQuestion(config, eventName) {
        state.config = clone(config);
        state.saved = clone(config);
        state.actuals = {x: Number(config.currentX) || 0, y: Number(config.currentY) || 0};
        state.trail = [{x: state.actuals.x, y: state.actuals.y}];
        state.frozen = 'y';
        state.exploredX = false;
        state.exploredY = false;
        state.reachedPeak = false;
        state.loadedSample = true;
        if (eventName) {
            award(eventName, 10);
        }
        toast('Now using: ' + (config.name || 'custom question'));
        renderScreen();
    }

    function hasNumbers(cfg) {
        return cfg && cfg.price1 !== '' && cfg.price1 !== undefined;
    }

    function award(reason, pts, badge) {
        if (!state.awarded) {
            state.awarded = {};
        }
        if (state.awarded[reason]) {
            return;
        }
        state.awarded[reason] = true;
        state.points += pts;
        if (badge) {
            state.badges.push(badge);
            toast(badgeLabel(badge));
        }
        persistProgress(reason);
        updateChrome();
    }

    function badgeLabel(code) {
        if (code === 'first_peak') {
            return 'Badge: First Peak';
        }
        if (code === 'slope_reader') {
            return 'Badge: Slope Reader';
        }
        return 'Badge: Business Optimiser';
    }

    function toast(message) {
        var el = root.querySelector('[data-role="toast"]');
        el.textContent = message;
        el.classList.add('is-on');
        setTimeout(function () {
            el.classList.remove('is-on');
        }, 2800);
    }

    function updateChrome() {
        root.querySelector('[data-role="profit"]').textContent = profitText();
        root.querySelector('[data-role="points"]').textContent = state.points + ' pts';
        var q = root.querySelector('[data-role="question"]');
        if (q) {
            q.textContent = state.config.question || '';
            q.hidden = !state.config.question;
        }
        root.querySelectorAll('.tella-tab').forEach(function (el) {
            var on = el.getAttribute('data-screen') === state.screen;
            el.classList.toggle('active', on);
            el.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        if (state.screen === 'c') {
            state.view = 'contour';
        }
        if (window.history && window.history.replaceState) {
            var url = new URL(window.location.href);
            url.searchParams.set('tab', state.screen);
            window.history.replaceState({}, '', url.toString());
        }
    }

    function persistLocal() {
        try {
            localStorage.setItem('tella.workshopState', JSON.stringify({
                config: state.config,
                screen: state.screen,
                points: state.points,
                badges: state.badges,
                awarded: state.awarded,
                actuals: state.actuals,
                reachedPeak: state.reachedPeak
            }));
        } catch (e) {
            // Ignore quota errors; core interaction still works.
        }
    }

    function restoreLocal() {
        try {
            var raw = localStorage.getItem('tella.workshopState');
            if (!raw) {
                return;
            }
            var saved = JSON.parse(raw);
            if (saved.config) {
                state.config = saved.config;
                state.saved = clone(saved.config);
            }
            if (saved.actuals) {
                state.actuals = saved.actuals;
            }
            state.points = saved.points || 0;
            state.badges = saved.badges || [];
            state.awarded = saved.awarded || {};
            state.reachedPeak = !!saved.reachedPeak;
        } catch (e) {
            return;
        }
    }

    function persistProgress(eventName) {
        if (!state.activityId) {
            persistLocal();
            return;
        }
        api.saveProgress(initCfg.apiUrl, initCfg.token, {
            activity: state.activityId,
            status: state.reachedPeak ? 'completed' : 'in_progress',
            extra: {
                screensVisited: ['a', 'b', 'c', 'd'].slice(0, ['a', 'b', 'c', 'd'].indexOf(state.screen) + 1),
                reachedPeak: state.reachedPeak,
                slopeExplorations: (state.exploredX ? 1 : 0) + (state.exploredY ? 1 : 0)
            },
            event: eventName || ''
        });
        persistLocal();
        if (eventName === 'load_sample' || eventName === 'reach_peak') {
            api.saveModel(initCfg.apiUrl, initCfg.token, {
                activity: state.activityId,
                name: state.config.name,
                config: state.config
            });
        }
    }

    function renderScreen() {
        var stage = root.querySelector('[data-role="stage"]');
        screens[state.screen].render(stage, state, actions());
        updateChrome();
        persistProgress();
    }

    function bindTabs() {
        root.querySelectorAll('.tella-tab').forEach(function (el) {
            el.addEventListener('click', function (ev) {
                ev.preventDefault();
                state.screen = el.getAttribute('data-screen');
                if (state.screen === 'c') {
                    state.view = 'contour';
                }
                renderScreen();
            });
        });
    }

    function init(cfg) {
        initCfg = cfg || {};
        var mount = document.getElementById('tella-workshop-root');
        if (!mount || mount.querySelector('[data-role="stage"]')) {
            return;
        }
        mount.innerHTML = shell();
        root = mount;
        state = bootState(initCfg.workshopConfig || math.cloneSample());
        if (initCfg.screen) {
            state.screen = initCfg.screen;
        }
        restoreLocal();
        if (initCfg.screen) {
            state.screen = initCfg.screen;
        }
        bindTabs();
        api.flush(initCfg.apiUrl, initCfg.token);
        api.loadActivity(initCfg.apiUrl, initCfg.token, initCfg.activityId).then(function (activity) {
            if (activity) {
                state.activityId = activity.id;
                if (activity.workshop && activity.workshop.config) {
                    if (!localStorage.getItem('tella.workshopState')) {
                        state = bootState(activity.workshop.config);
                    } else {
                        state.activityId = activity.id;
                    }
                }
            }
            if (initCfg.screen) {
                state.screen = initCfg.screen;
            }
            renderScreen();
        }).catch(function () {
            if (initCfg.screen) {
                state.screen = initCfg.screen;
            }
            renderScreen();
        });
        window.addEventListener('online', function () {
            api.flush(initCfg.apiUrl, initCfg.token);
        });
    }

    return {init: init};
});
