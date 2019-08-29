const fs = require('fs');
const zipFolder = require('zip-folder');
const copyFileSync = require('fs-copy-file-sync');

console.log("SWITCH SERVICE POST BUILD");
// create bin folder if does not exists.
console.log('[info]: Checking ./bin');
if (!fs.existsSync('./bin')) {
    console.log('[info]: ./bin not found!');
    console.log('[info]: Created ./bin');
    fs.mkdirSync('./bin');
}

// create bin/notifier folder if does not exists
console.log('[info]: Checking ./bin/notifier');
if (!fs.existsSync('./bin/notifier')) {
    console.log('[info]: ./bin/notifier not found!');
    console.log('[info]: Created ./bin/notifier');
    fs.mkdirSync('./bin/notifier');
}

let list;

// iohook platform specific for mac and windows..
if(process.platform == 'darwin')
{
    // 1. terminal-notifier
    // 2. addon.node - node window manager
    // 3. iohook.node
    list = [{
        from: './node_modules/node-notifier/vendor/mac.noindex/terminal-notifier.app/Contents/MacOS/terminal-notifier',
        to: 'bin/notifier/terminal-notifier'
    }, {
        from: './node_modules/node-window-manager/build/Release/addon.node',
        to: 'bin/addon.node'
    },{
        from: `./node_modules/iohook/build/Release/iohook.node`,
        to: 'bin/iohook.node'
    }];
} else if(process.platform == 'win32')
{
    // 1. notifu
    // 2. notifu64
    // 3. SnoreToast
    // 4. iohook.node
    // 5. uiohook.dll
    // 6. addon.node - node window manager
    
    list = [{
        from: './node_modules/node-notifier/vendor/notifu/notifu.exe',
        to: 'bin/notifier/notifu.exe'
    },
    {
        from: './node_modules/node-notifier/vendor/notifu/notifu64.exe',
        to: 'bin/notifier/notifu64.exe'
    },
    {
        from: './node_modules/node-notifier/vendor/snoreToast/SnoreToast.exe',
        to: 'bin/notifier/SnoreToast.exe'
    },{
        from: `./node_modules/iohook/builds/node-v64-win32-x64/build/Release/iohook.node`,
        to: 'bin/iohook.node'
    },{
        from: `./node_modules/iohook/builds/node-v64-win32-x64/build/Release/uiohook.dll`,
        to: 'bin/uiohook.dll'
    }, {
        from: './node_modules/node-window-manager/build/Release/addon.node',
        to: 'bin/addon.node'
    }];
}

list.forEach(path => {
    if (fs.existsSync(path.from)) {
        console.log(`[info]: Copy ${path.from}`);
        copyFileSync(path.from, path.to);
        console.log(`[info]: Copied ${path.to}`);
    }
});

const getVersion = JSON.parse(fs.readFileSync('./package.json')).version;
zipFolder('./bin', `./switch_deamon_v${getVersion}_${process.platform}_release.zip`, function (err) {
    if (err) {
        console.log('[info]: Packing failed', err);
    } else {
        console.log('[success]: BUILD SUCCEED!');
    }
});