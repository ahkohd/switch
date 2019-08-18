"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const text_1 = require("./text");
const enums_1 = require("./enums");
const interprocess_1 = require("./interprocess");
const interChannel = new interprocess_1.InterProcessChannel();
const ioHook = require('iohook');
let clientPID = null;
let hotapps = utils_1.getHotApps();
let config = utils_1.getConfig();
const log = utils_1.switchLog.bind({ isDevMode: utils_1.checkDevMode() });
function react(event) {
    let hotApp = utils_1.whichHotApp(event.rawcode, hotapps);
    if (hotApp != null) {
        utils_1.minimizeCurrentWindow();
        let processes = utils_1.getAllProcessThatMatchAppName(hotApp.name, hotApp.path);
        if (processes) {
            utils_1.MakeHotAppActive(processes, config.maximize);
            interChannel.sendlastSwitched(hotApp);
        }
        else {
            utils_1.switchMessage(enums_1.Switch.ERROR_NOTI, { title: text_1.default.errorTitle, message: text_1.default.processNotFound(hotApp.name), hotApp: hotApp });
        }
    }
    else {
        if (event.rawcode >= 48 && event.rawcode <= 58) {
            interChannel.sendShowClient();
            utils_1.switchMessage(enums_1.Switch.ERROR_NOTI, { title: text_1.default.errorTitle, message: text_1.default.noHotApp(event.rawcode - 48), hotApp: hotApp });
        }
    }
}
function fnMethod(event) {
    if (event.altKey) {
        react(event);
    }
}
ioHook.on('keyup', event => {
    fnMethod(event);
});
ioHook.on('keydown', event => {
    if (event.altKey) {
        interChannel.sendShowClient();
    }
});
ioHook.start();
ioHook.start(true);
utils_1.registerNotifierOnClick();
interChannel.emitter.on('update-hot-apps', (happs) => {
    hotapps = happs;
    log(enums_1.Switch.LOG_INFO, 'Hot apps update received', hotapps);
    utils_1.saveHotApps(happs);
});
interChannel.emitter.on('config-update', (settings) => {
    log(enums_1.Switch.LOG_INFO, 'Config update update received', settings);
    config = settings;
    utils_1.saveConfig(settings);
});
interChannel.emitter.on('client-pid', (pid) => {
    clientPID = pid;
    log(enums_1.Switch.LOG_INFO, 'Hot client pid ::', pid);
});
//# sourceMappingURL=switch.js.map