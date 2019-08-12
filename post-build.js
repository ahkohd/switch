const fs = require('fs');
const list = [
    {from: 'node_modules/node-notifier/vendor/notifu/notifu.exe', to: 'bin/notifier/notifu.exe'},
    {from: 'node_modules/node-notifier/vendor/notifu/notifu64.exe', to: 'bin/notifier/notifu64.exe'},
    {from: 'node_modules/node-notifier/vendor/snoreToast/SnoreToast.exe', to: 'bin/notifier/SnoreToast.exe'},
    {from: 'node_modules/node-notifier/vendor/mac.noindex/terminal-notifier.app/Contents/MacOS/terminal-notifier', to: 'bin/notifier/terminal-notifier'}
];

list.forEach(path => {
    fs.copyFile(path.from, path.to, (err) => {
        if (err) throw err;
        console.log(`File was copied - ${path.to}`);
      });
});

