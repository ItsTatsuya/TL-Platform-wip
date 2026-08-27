(function () {
    function configFrom(el) {
        if (!el) {
            return {};
        }
        var raw = el.getAttribute('data-config') || '{}';
        try {
            return JSON.parse(raw);
        } catch (e) {
            return {};
        }
    }

    function start() {
        if (window.__tellaBooted) {
            return;
        }
        var workshop = document.getElementById('tella-workshop-root');
        var careers = document.getElementById('tella-careers-root');
        if (typeof window.require !== 'function' || typeof window.M === 'undefined' || (!workshop && !careers)) {
            setTimeout(start, 40);
            return;
        }
        var moduleName = workshop ? 'local_tella_workshop/workshop' : 'local_tella_workshop/careers';
        var mount = workshop || careers;
        window.require([moduleName], function (mod) {
            if (window.__tellaBooted) {
                return;
            }
            window.__tellaBooted = true;
            mod.init(configFrom(mount));
        }, function () {
            setTimeout(start, 120);
        });
    }

    start();
})();
