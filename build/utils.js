"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("./enums");
const { windowManager } = require("node-window-manager");
const fs = require('fs');
const open = require('open');
const notifier = require('node-notifier');
const path = require('path');
const blackList = ['explorer.exe'];
function switchMessage(type, data) {
    notifier.notify({
        title: 'Switch - ' + data.title,
        message: data.message,
        icon: path.join(enums_1.Switch.APP_PATH, enums_1.Switch.NOTI_ICON),
        sound: false,
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
function getProcessWithPID(pid) {
    console.log(pid);
    let process = windowManager.getWindows().filter(window => window.processId == pid);
    if (process.length == 0)
        return null;
    return process[0];
}
exports.getProcessWithPID = getProcessWithPID;
function getAllProcessThatMatchAppName(name, path) {
    let processes = windowManager.getWindows().filter(window => window.getTitle().toLowerCase().includes(name.split('.exe')[0].toLowerCase().replace(/[^a-zA-Z ]/, ' ')) && window.path.toLowerCase() == path.toLowerCase());
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
function MakeHotAppActive(hotProcesses, maximize = true) {
    hotProcesses.sort(function (a, b) {
        return b.processId - a.processId;
    });
    console.log(hotProcesses);
    let least = hotProcesses[0];
    if (least.isWindow()) {
        least.bringToTop();
        if (maximize)
            least.maximize();
    }
    else {
        least = hotProcesses;
        least.shift();
        for (let i = 0; i < least.length; i++) {
            if (least[i].isWindow()) {
                const hot = least[i];
                hot.bringToTop();
                hot.maximize();
                break;
            }
        }
    }
}
exports.MakeHotAppActive = MakeHotAppActive;
function openHotApp(path) {
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
    if (current.isWindow() && current.getTitle().toLowerCase() != 'switch') {
        current.minimize();
    }
}
exports.minimizeCurrentWindow = minimizeCurrentWindow;
function makeClientActive(pid) {
    if (pid == null)
        return;
    const getSwitchWindow = windowManager.getWindows().filter(win => win.processId == pid);
    if (getSwitchWindow.length != 0) {
        MakeHotAppActive(getSwitchWindow, false);
    }
}
exports.makeClientActive = makeClientActive;
//# sourceMappingURL=utils.js.map