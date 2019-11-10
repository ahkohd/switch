"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("./enums");
const ostype = require("os").type();
const { windowManager } = require("node-window-manager");
const open = require('open');
const notifier = require('node-notifier');
const path = require('path');
const blackList = ['explorer.exe'];
const Conf = require('conf');
const config = new Conf({
    projectName: 'SwitchService',
    encryptionKey: '..kta#md!@a-k2j',
});
const log = switchLog.bind({ isDevMode: checkDevMode() });
const icoPath = (process.pkg) ? path.join(path.dirname(process.execPath), './switch.ico') : path.join(__dirname, '../assets/switch.ico');
const stringSimilarity = require('string-similarity');
log(enums_1.Switch.LOG_INFO, 'ENV', ostype);
function switchMessage(type, data) {
    notifier.notify({
        title: 'Switch - ' + data.title,
        message: data.message,
        icon: icoPath,
        sound: false,
        wait: true,
        hotApp: (data.hotApp) ? data.hotApp : null
    });
}
exports.switchMessage = switchMessage;
function registerNotifierOnClick() {
    const onclick = debounce((notifierObject, options, event) => {
        if (options.hotApp)
            openHotApp(options.hotApp.path);
    }, 3000, false);
    notifier.on('click', onclick);
}
exports.registerNotifierOnClick = registerNotifierOnClick;
function getHotApps() {
    const hotApps = config.get('hotApps');
    if (hotApps == null) {
        config.set('hotApps', []);
        return [];
    }
    else {
        return hotApps;
    }
}
exports.getHotApps = getHotApps;
function getConfig() {
    let settings = config.get('config');
    if (settings == null) {
        const initial = {
            autoHide: true,
            maximize: true,
            disableAltGr: false
        };
        config.set('config', initial);
        return initial;
    }
    else {
        return settings;
    }
}
exports.getConfig = getConfig;
function saveConfig(settings) {
    config.set('config', settings);
}
exports.saveConfig = saveConfig;
function saveHotApps(hotApps) {
    config.set('hotApps', hotApps);
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
    let process = windowManager.getWindows().filter(window => window.processId == pid);
    if (process.length == 0)
        return null;
    return process[0];
}
exports.getProcessWithPID = getProcessWithPID;
function getAllProcessThatMatchAppName(name, path) {
    let filterProcessByname = [];
    if (ostype == enums_1.Switch.WINDOWS) {
        filterProcessByname = windowManager.getWindows().filter(window => window.isVisible() && window.getTitle().toLowerCase().includes(name.split('.exe')[0].toLowerCase().replace(/[^a-zA-Z ]/, ' ')));
    }
    else {
        filterProcessByname = windowManager.getWindows().filter(window => window.path == path);
    }
    if (filterProcessByname == null || filterProcessByname.length == 0) {
        if (process.platform == 'darwin') {
            return null;
        }
        else {
            return processPathSimilarityMatch(windowManager.getWindows().filter(window => window.isVisible()), path, .65);
        }
    }
    else {
        const filterProcessByPath = filterProcessByname.filter(window => window.path.toLowerCase() == path.toLowerCase());
        if (filterProcessByPath == null || filterProcessByPath.length == 0) {
            return filterProcessByname;
        }
        else {
            return filterProcessByPath;
        }
    }
}
exports.getAllProcessThatMatchAppName = getAllProcessThatMatchAppName;
function processPathSimilarityMatch(processes, path, treshold) {
    let simScores = [];
    processes.forEach(process => {
        simScores.push(stringSimilarity.compareTwoStrings(path, process.path));
    });
    const highest = Math.max(...simScores);
    if (highest < treshold)
        return null;
    const finalProcesses = [];
    simScores.forEach((score, index) => {
        if (score == highest)
            finalProcesses.push(processes[index]);
    });
    return finalProcesses;
}
exports.processPathSimilarityMatch = processPathSimilarityMatch;
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
    log(enums_1.Switch.LOG_INFO, 'Sorted processes', hotProcesses);
    let least = hotProcesses[0];
    if (least.isWindow()) {
        least.bringToTop();
        if (!maximize) {
            least.restore();
        }
        else {
            least.maximize();
        }
    }
    else {
        least = hotProcesses;
        least.shift();
        for (let i = 0; i < least.length; i++) {
            if (least[i].isWindow()) {
                const hot = least[i];
                hot.bringToTop();
                if (!maximize) {
                    hot.restore();
                }
                else {
                    hot.maximize();
                }
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
exports.debounce = debounce;
function minimizeCurrentWindow() {
    if (process.platform == "darwin")
        return;
    const current = windowManager.getActiveWindow();
    const info = current.getInfo();
    if (blackList.filter(item => info.path.includes(item)).length > 0) {
        log(enums_1.Switch.LOG_INFO, 'Cannot minize');
        return;
    }
    ;
    if (current.isWindow() && current.getTitle().toLowerCase() != 'switch') {
        current.minimize();
    }
}
exports.minimizeCurrentWindow = minimizeCurrentWindow;
function checkDevMode() {
    if (process.argv[2]) {
        return (process.argv[2].toLowerCase() == '--dev') ? true : false;
    }
    else {
        return false;
    }
}
exports.checkDevMode = checkDevMode;
function switchLog(type, ...args) {
    if (this.isDevMode) {
        console.log('[' + type + ']:', ...args);
    }
}
exports.switchLog = switchLog;
function bringSwitchToFocus(pid) {
    if (process.platform == 'darwin') {
        try {
            const switchWindow = windowManager.getWindows().filter(window => window.processId == pid);
            console.log("FOCUSED SWITCH:", switchWindow.length > 0 ? true : false);
            switchWindow[0].bringToTop();
        }
        catch (e) { }
    }
}
exports.bringSwitchToFocus = bringSwitchToFocus;
//# sourceMappingURL=utils.js.map