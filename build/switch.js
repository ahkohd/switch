"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const text_1 = require("./text");
const enums_1 = require("./enums");
const interprocess_1 = require("./interprocess");
const robotjs = require('robotjs');
const interChannel = new interprocess_1.InterProcessChannel();
const ioHook = require('iohook');
const checkcaps = require('check-caps');
const secondKeyPressTimeout = 600;
let clientPID = null;
let hotapps = utils_1.getHotApps();
const useFnKey = true;
let timer = null;
function react(event) {
    let hotApp = utils_1.whichHotApp(event.rawcode, hotapps);
    if (hotApp != null) {
        utils_1.minimizeCurrentWindow();
        let processes = utils_1.getAllProcessThatMatchAppName(hotApp.name, hotApp.path);
        console.log('matched windows', processes);
        if (processes) {
            utils_1.MakeHotAppActive(processes);
        }
        else {
            utils_1.switchMessage(enums_1.Switch.ERROR_NOTI, { title: text_1.default.errorTitle, message: text_1.default.processNotFound(hotApp.name), hotApp: hotApp });
        }
    }
    else {
        if (event.rawcode >= 48 && event.rawcode <= 58) {
            utils_1.makeClientActive(clientPID);
            utils_1.switchMessage(enums_1.Switch.ERROR_NOTI, { title: text_1.default.errorTitle, message: text_1.default.noHotApp(event.rawcode - 48), hotApp: hotApp });
        }
    }
}
function capsMethod(event) {
    if (checkcaps.status() || event.altKey) {
        react(event);
    }
}
function fnMethod(event) {
    if (event.altKey) {
        react(event);
    }
}
ioHook.on('keyup', event => {
    if (useFnKey) {
        fnMethod(event);
    }
    else {
        capsMethod(event);
    }
});
ioHook.start();
ioHook.start(true);
utils_1.registerNotifierOnClick();
interChannel.emitter.on('update-hot-apps', (happs) => {
    hotapps = happs;
    console.log(hotapps);
    console.log('[info] Hot apps update recived');
    utils_1.saveHotApps(happs);
});
interChannel.emitter.on('client-pid', (pid) => {
    clientPID = pid;
    console.log('[info] Hot client pid: ' + pid);
});
//# sourceMappingURL=switch.js.map