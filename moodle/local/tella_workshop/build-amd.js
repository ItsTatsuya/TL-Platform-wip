const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'amd', 'src');
const dest = path.join(__dirname, 'amd', 'build');
fs.mkdirSync(dest, {recursive: true});
for (const file of fs.readdirSync(src)) {
    if (!file.endsWith('.js')) {
        continue;
    }
    const name = file.replace(/\.js$/, '');
    fs.copyFileSync(path.join(src, file), path.join(dest, name + '.min.js'));
    console.log('built', name + '.min.js');
}
