"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("./enums");
const text_1 = require("./text");
const { windowManager } = require("node-window-manager");
const open = require("open");
const notifier = require("node-notifier");
const path = require("path");
const blackList = ["explorer.exe"];
const Conf = require("conf");
const config = new Conf({
    projectName: enums_1.default.PROJECT_NAME,
    encryptionKey: enums_1.default.PROJECT_PRIVATE_KEY
});
exports.icoPath = process.pkg
    ? path.join(path.dirname(process.execPath), "./switch.ico")
    : path.join(__dirname, "../assets/switch.ico");
const stringSimilarity = require("string-similarity");
exports.ostype = require("os").type();
function switchMessage(type, data) {
    notifier.notify({
        title: text_1.TEXT.SWITCH_PREFIX + data.title,
        message: data.message,
        icon: exports.icoPath,
        sound: false,
        wait: true,
        hotApp: data.hotApp ? data.hotApp : null
    });
}
exports.switchMessage = switchMessage;
function registerNotifierOnClick() {
    const onclick = debounce((notifierObject, options, event) => {
        if (options.hotApp)
            exports.openHotApp(options.hotApp.path);
    }, 3000, false);
    notifier.on("click", onclick);
}
exports.registerNotifierOnClick = registerNotifierOnClick;
function getHotApps() {
    const hotApps = config.get("hotApps");
    if (hotApps == null) {
        config.set("hotApps", []);
        return [];
    }
    else {
        return hotApps;
    }
}
exports.getHotApps = getHotApps;
exports.getConfig = () => {
    let settings = config.get("config");
    if (settings == null) {
        const initial = {
            autoHide: true,
            maximize: true,
            disableAltGr: false
        };
        config.set("config", initial);
        return initial;
    }
    else {
        return settings;
    }
};
exports.saveConfig = (settings) => {
    config.set("config", settings);
};
exports.saveHotApps = hotApps => {
    config.set("hotApps", hotApps);
};
exports.whichHotApp = (rawcode, hotApps) => {
    let whichHotWindowToOpen = hotApps.filter(app => app.rawcode == rawcode);
    if (whichHotWindowToOpen.length == 0)
        return null;
    return whichHotWindowToOpen[0];
};
exports.getAllProcessThatMatchPath = (_path) => {
    let processes = windowManager
        .getWindows()
        .filter(window => path.basename(window.path) == path.basename(_path));
    if (processes == null || processes.length == 0)
        return null;
    return processes;
};
exports.getProcessWithPID = (pid) => {
    let process = windowManager
        .getWindows()
        .filter(window => window.processId == pid);
    if (process.length == 0)
        return null;
    return process[0];
};
exports.getAllProcessThatMatchAppName = (name, path) => {
    let filterProcessByname = [];
    if (exports.ostype == enums_1.default.WINDOWS) {
        filterProcessByname = windowManager.getWindows().filter(window => window.isVisible() &&
            window
                .getTitle()
                .toLowerCase()
                .includes(name
                .split(".exe")[0]
                .toLowerCase()
                .replace(/[^a-zA-Z ]/, " ")));
    }
    else {
        filterProcessByname = windowManager
            .getWindows()
            .filter(window => window.path == path);
    }
    if (filterProcessByname == null || filterProcessByname.length == 0) {
        if (process.platform == "darwin") {
            return null;
        }
        else {
            return exports.processPathSimilarityMatch(windowManager.getWindows().filter(window => window.isVisible()), path, 0.65);
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
};
exports.processPathSimilarityMatch = (processes, path, treshold) => {
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
};
exports.clearCurrentWidow = () => {
    const currentWindow = windowManager.getActiveWindow();
    if (currentWindow.isWindow()) {
        try {
            currentWindow.minimize();
        }
        catch (e) { }
    }
};
exports.MakeHotAppActive = (hotProcesses, maximize = true, logger) => {
    hotProcesses.sort(function (a, b) {
        return b.processId - a.processId;
    });
    logger.log(enums_1.default.LOG_INFO, text_1.TEXT.SORTED_PROCESSES, hotProcesses);
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
};
exports.openHotApp = (path) => {
    open(path);
};
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
exports.minimizeCurrentWindow = (logger) => {
    if (process.platform == "darwin")
        return;
    const current = windowManager.getActiveWindow();
    const info = current.getInfo();
    if (blackList.filter(item => info.path.includes(item)).length > 0) {
        logger.log(enums_1.default.LOG_INFO, text_1.TEXT.UNABLE_TO_MINIMIZE);
        return;
    }
    if (current.isWindow() && current.getTitle().toLowerCase() != "switch") {
        current.minimize();
    }
};
exports.isDevMode = () => {
    if (process.argv[2]) {
        return process.argv[2].toLowerCase() == "--dev" ? true : false;
    }
    else {
        return false;
    }
};
exports.bringSwitchToFocus = (pid, logger) => {
    if (process.platform == "darwin") {
        try {
            const switchWindow = windowManager
                .getWindows()
                .filter(window => window.processId == pid);
            logger.log(text_1.TEXT.FOCUS_SWITCH, switchWindow.length > 0 ? true : false);
            switchWindow[0].bringToTop();
        }
        catch (e) { }
    }
};
//# sourceMappingURL=utils.js.map