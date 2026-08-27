const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const plugin = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(plugin, relative), 'utf8');

test('plugin has the Phase 3 Moodle structure', () => {
    [
        'version.php',
        'lib.php',
        'settings.php',
        'db/access.php',
        'db/upgrade.php',
        'classes/privacy/provider.php',
        'templates/workshop_container.mustache',
        'styles/workshop.css',
        'amd/src/workshop.js',
        'amd/src/math.js'
    ].forEach(relative => assert.ok(fs.existsSync(path.join(plugin, relative)), relative));

    ['screenA', 'screenB', 'screenC', 'screenD'].forEach(name => {
        assert.ok(fs.existsSync(path.join(plugin, 'amd/src', `${name}.js`)), name);
        assert.ok(fs.existsSync(path.join(plugin, 'amd/build', `${name}.min.js`)), `${name} build`);
    });
});

test('entry point authenticates, supplies fallback JSON, and uses Moodle AMD once', () => {
    const page = read('index.php');
    assert.match(page, /require_login\(\)/);
    assert.match(page, /require_capability\('local\/tella_workshop:view'/);
    assert.match(page, /'workshopConfig'\s*=>\s*\$fallbackconfig/);
    assert.equal((page.match(/js_call_amd/g) || []).length, 1);
    assert.doesNotMatch(page, /js\/boot\.js/);
});

test('container and visual tokens are isolated under the plugin root', () => {
    const template = read('templates/workshop_container.mustache');
    const css = read('styles/workshop.css');
    assert.match(template, /class="tella-workshop"/);
    assert.match(template, /data-region="tella-workshop"/);
    assert.match(css, /^\.tella-workshop\s*\{/);
    assert.match(css, /--tella-primary:/);
    assert.match(css, /font-family:\s*Inter,/);
    assert.doesNotMatch(css, /(^|\})\s*(body|html|:root|#page)\b/m);
});
