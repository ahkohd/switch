const fs = require('fs');
const zipFolder = require('zip-folder');

console.log("SWITCH SERVICE POST BUILD");
// create bin folder if does not exists
console.log('[info]: Checking ./bin');
if(!fs.existsSync('./bin')) {
    console.log('[info]: ./bin not found!');
    console.log('[info]: Created ./bin');
    fs.mkdirSync('./bin');
}

// create bin/notifier folder if does not exists
console.log('[info]: Checking ./bin/notifier');
if(!fs.existsSync('./bin/notifier')) {
    console.log('[info]: ./bin/notifier not found!');
    console.log('[info]: Created ./bin/notifier');
    fs.mkdirSync('./bin/notifier');
}

const list = [
    {from: './node_modules/node-notifier/vendor/notifu/notifu.exe', to: 'bin/notifier/notifu.exe'},
    {from: './node_modules/node-notifier/vendor/notifu/notifu64.exe', to: 'bin/notifier/notifu64.exe'},
    {from: './node_modules/node-notifier/vendor/snoreToast/SnoreToast.exe', to: 'bin/notifier/SnoreToast.exe'},
    {from: './node_modules/node-notifier/vendor/mac.noindex/terminal-notifier.app/Contents/MacOS/terminal-notifier', to: 'bin/notifier/terminal-notifier'},
    {from: './node_modules/iohook/builds/node-v64-win32-x64/build/Release/iohook.node', to: 'bin/iohook.node'},
    {from: './node_modules/iohook/builds/node-v64-win32-x64/build/Release/uiohook.dll', to: 'bin/uiohook.dll'},
    {from: './node_modules/node-window-manager/build/Release/addon.node', to: 'bin/addon.node'}
];


list.forEach(path => {
    if(fs.existsSync(path.from))
    {
        console.log(`[info]: Copy ${path.from}`);
        fs.copyFile(path.from, path.to, (err) => {
            if (err) throw err;
            console.log(`[info]: Copied ${path.to}`);
          });
    }
});

console.log('[info]: Packing Binaries');
const getVersion = JSON.parse(fs.readFileSync('./package.json')).version;
zipFolder('./bin', `./switch_deamon_v${getVersion}_${process.platform}.zip`, function(err) {
    if(err) {
        console.log('[info]: Packing failed', err);
    } else {
        console.log('[success]: BUILD SUCCEED!');
    }
});