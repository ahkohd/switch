"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("./enums");
const { windowManager } = require("node-window-manager");
const fs = require('fs');
const open = require('open');
const notifier = require('node-notifier');
const path = require('path');
const blackList = ['explorer.exe'];
const win32api = require('win32-api');
function switchMessage(type, data) {
    notifier.notify({
        title: 'Switch - ' + data.title,
        message: data.message,
        icon: path.join(enums_1.Switch.APP_PATH, enums_1.Switch.NOTI_ICON),
        sound: true,
        wait: true,
        hotApp: (data.hotApp) ? data.hotApp : null
    });
}
exports.switchMessage = switchMessage;
function registerNotifierOnClick() {
    const onclick = debounce((notifierObject, options, event) => {
        console.log(options.hotApp);
        if (options.hotApp)
            openHotApp(options.hotApp.path);
    }, 3000, false);
    notifier.on('click', onclick);
}
exports.registerNotifierOnClick = registerNotifierOnClick;
function getHotApps() {
    let rawdata = fs.readFileSync(path.join(__dirname, 'switch.json'));
    return JSON.parse(rawdata);
}
exports.getHotApps = getHotApps;
function saveHotApps(data) {
    fs.writeFile(path.join(__dirname, 'switch.json'), JSON.stringify(data), (err) => {
        if (err)
            throw err;
        console.log('[info] Saved hot apps!');
    });
}
exports.saveHotApps = saveHotApps;
function whichHotApp(rawcode, hotApps) {
    let whichHotWindowToOpen = hotApps.filter(app => app.rawcode == rawcode);
    if (whichHotWindowToOpen.length == 0)
        return null;
    return whichHotWindowToOpen[0];
}
exports.whichHotApp = whichHotApp;
function getAllProcessThatMatchPath(_path) {
    let processes = windowManager.getWindows().filter(window => path.basename(window.path) == path.basename(_path));
    if (processes == null || processes.length == 0)
        return null;
    return processes;
}
exports.getAllProcessThatMatchPath = getAllProcessThatMatchPath;
function getAllProcessThatMatchAppName(name) {
    let processes = windowManager.getWindows().filter(window => window.getTitle().includes(name));
    if (processes == null || processes.length == 0)
        return null;
    return processes;
}
exports.getAllProcessThatMatchAppName = getAllProcessThatMatchAppName;
function clearCurrentWidow() {
    const currentWindow = windowManager.getActiveWindow();
    if (currentWindow.isWindow()) {
        try {
            currentWindow.minimize();
        }
        catch (e) { }
    }
}
exports.clearCurrentWidow = clearCurrentWidow;
function MakeHotAppActive(hotProcesses) {
    hotProcesses.sort(function (a, b) {
        return a.processId - b.processId;
    });
    console.log(hotProcesses);
    let least = hotProcesses[0];
    if (least.isWindow()) {
        least.bringToTop();
        least.maximize();
    }
    else {
        least.shift();
        for (let i = 0; i < least.length; i++) {
            if (least[i].isWindow()) {
                const hot = least[i];
                least.bringToTop();
                least.maximize();
                break;
            }
        }
    }
}
exports.MakeHotAppActive = MakeHotAppActive;
function openHotApp(path) {
    console.log('ppp', path);
    open(path);
}
exports.openHotApp = openHotApp;
function debounce(callback, wait, immediate = false) {
    let timeout = null;
    return function () {
        const callNow = immediate && !timeout;
        const next = () => callback.apply(this, arguments);
        clearTimeout(timeout);
        timeout = setTimeout(next, wait);
        if (callNow) {
            next();
        }
    };
}
function minimizeCurrentWindow() {
    const current = windowManager.getActiveWindow();
    const info = current.getInfo();
    if (blackList.filter(item => info.path.includes(item)).length > 0) {
        console.log('cannot minize');
        return;
    }
    ;
    if (current.isWindow()) {
        current.minimize();
    }
}
exports.minimizeCurrentWindow = minimizeCurrentWindow;
function getFileAttribute(fname) {
    let propNames = ['Comments', 'InternalName', 'ProductName',
        'CompanyName', 'LegalCopyright', 'ProductVersion',
        'FileDescription', 'LegalTrademarks', 'PrivateBuild',
        'FileVersion', 'OriginalFilename', 'SpecialBuild'];
    let props = { 'FixedFileInfo': null, 'StringFileInfo': null, 'FileVersion': null };
    try {
        let fixedInfo = win32api.GetFileVersionInfo(fname, '\\');
        props['FixedFileInfo'] = fixedInfo;
        props['FileVersion'] = `${fixedInfo['FileVersionMS'] / 65536}.${fixedInfo['FileVersionMS'] % 65536}.${fixedInfo['FileVersionLS'] / 65536}.${fixedInfo['FileVersionLS'] % 65536}`;
        let [lang, codepage] = win32api.GetFileVersionInfo(fname, '\\VarFileInfo\\Translation')[0];
        let strInfo = {};
        for (let propName in propNames) {
            let strInfoPath = toUnicode(`\\StringFileInfo\\${lang}${codepage}\\${propName}`);
            strInfo[propName] = win32api.GetFileVersionInfo(fname, strInfoPath);
        }
        props['StringFileInfo'] = strInfo;
    }
    catch (e) {
        console.log(e);
    }
}
exports.getFileAttribute = getFileAttribute;
function toUnicode(str) {
    return str.split('').map(function (value, index, array) {
        var temp = value.charCodeAt(0).toString(16).toUpperCase();
        if (temp.length > 2) {
            return '\\u' + temp;
        }
        return value;
    }).join('');
}
exports.toUnicode = toUnicode;
//# sourceMappingURL=utils.js.map