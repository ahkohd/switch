"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const text_1 = require("./text");
const enums_1 = require("./enums");
const InterProcessChannel_1 = require("./InterProcessChannel");
const interChannel = new InterProcessChannel_1.InterProcessChannel();
const ioHook = require("iohook");
let clientPID = null;
let hotapps = utils_1.getHotApps();
let config = utils_1.getConfig();
const log = switchLog.bind({ isDevMode: utils_1.checkDevMode() });
let disableKeyUpListen = false;
let disableKeyUpListenTimeout;
function react(event) {
    let hotApp = utils_1.whichHotApp(process.platform == "darwin" ? event.keycode : event.rawcode, hotapps);
    if (hotApp != null) {
        utils_1.minimizeCurrentWindow();
        let processes = utils_1.getAllProcessThatMatchAppName(hotApp.name, hotApp.path);
        if (processes) {
            utils_1.MakeHotAppActive(processes, config.maximize);
            interChannel.sendlastSwitched(hotApp);
        }
        else {
            utils_1.switchMessage(enums_1.Switch.ERROR_NOTI, {
                title: text_1.default.errorTitle,
                message: text_1.default.processNotFound(hotApp.name),
                hotApp: hotApp
            });
        }
    }
    else {
        if (process.platform == "darwin") {
            if (event.keycode >= 0 && event.keycode <= 9) {
                interChannel.sendShowClient();
                utils_1.switchMessage(enums_1.Switch.ERROR_NOTI, {
                    title: text_1.default.errorTitle,
                    message: text_1.default.noHotApp(event.keycode - 1),
                    hotApp: hotApp
                });
            }
        }
        else {
            if (event.rawcode >= 48 && event.rawcode <= 58) {
                interChannel.sendShowClient();
                utils_1.switchMessage(enums_1.Switch.ERROR_NOTI, {
                    title: text_1.default.errorTitle,
                    message: text_1.default.noHotApp(event.rawcode - 48),
                    hotApp: hotApp
                });
            }
        }
    }
}
function fnMethod(event) {
    if (event.altKey) {
        react(event);
    }
}
if (process.platform == "win32") {
    ioHook.on("keyup", event => {
        if (disableKeyUpListen && event.rawcode != 164) {
            if (disableKeyUpListenTimeout)
                clearTimeout(disableKeyUpListenTimeout);
            disableKeyUpListenTimeout = setTimeout(() => {
                clearTimeout(disableKeyUpListenTimeout);
                disableKeyUpListen = false;
            }, 1000);
            return;
        }
        fnMethod(event);
    });
    ioHook.on("keydown", event => {
        if (event.altKey) {
            if (config.disableAltGr && event.rawcode == 165) {
                disableKeyUpListen = true;
                return;
            }
            interChannel.sendShowClient();
        }
    });
}
if (process.platform == "darwin") {
    const numKeys = [
        { keycode: 2, rawcode: 18 },
        { keycode: 3, rawcode: 19 },
        { keycode: 4, rawcode: 20 },
        { keycode: 5, rawcode: 21 },
        { keycode: 6, rawcode: 23 },
        { keycode: 7, rawcode: 22 },
        { keycode: 8, rawcode: 26 },
        { keycode: 9, rawcode: 28 },
        { keycode: 10, rawcode: 25 },
        { keycode: 11, rawcode: 29 }
    ];
    for (const current of numKeys) {
        ioHook.registerShortcut([3676, 3640, current.keycode], keys => {
            interChannel.sendShowClient();
            react(current);
        });
        ioHook.registerShortcut([3675, 56, current.keycode], keys => {
            interChannel.sendShowClient();
            react(current);
        });
    }
    ioHook.registerShortcut([3676, 3640], () => {
        interChannel.sendShowClient();
    });
    ioHook.registerShortcut([3675, 56], () => {
        interChannel.sendShowClient();
    });
}
utils_1.checkDevMode() ? ioHook.start(true) : ioHook.start();
utils_1.registerNotifierOnClick();
interChannel.emitter.on("update-hot-apps", happs => {
    hotapps = happs;
    log(enums_1.Switch.LOG_INFO, "Hot apps update received", hotapps);
    utils_1.saveHotApps(happs);
});
interChannel.emitter.on("config-update", (settings) => {
    log(enums_1.Switch.LOG_INFO, "Config update update received", settings);
    config = settings;
    utils_1.saveConfig(settings);
});
interChannel.emitter.on("client-pid", pid => {
    clientPID = pid;
    log(enums_1.Switch.LOG_INFO, "Hot client pid ::", pid);
});
//# sourceMappingURL=switch.js.map