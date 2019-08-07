"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const text_1 = require("./text");
const enums_1 = require("./enums");
const interprocess_1 = require("./interprocess");
const interChannel = new interprocess_1.InterProcessChannel();
const ioHook = require('iohook');
const checkcaps = require('check-caps');
const secondKeyPressTimeout = 700;
let hotapps = utils_1.getHotApps();
const alwaysMaximize = true;
const useFnKey = true;
let timer = null;
function react(event) {
    let hotApp = utils_1.whichHotApp(event.rawcode, hotapps);
    if (hotApp) {
        const processes = utils_1.getAllProcessThatMatchAppName(hotApp.name);
        if (processes) {
            utils_1.clearCurrentWidow();
            utils_1.MakeHotAppActive(processes);
        }
        else {
            utils_1.switchMessage(enums_1.Switch.ERROR_NOTI, { title: text_1.default.errorTitle, message: text_1.default.processNotFound(hotApp.name), hotApp: hotApp });
        }
    }
}
function capsMethod(event) {
    if (checkcaps.status() || event.altKey) {
        react(event);
    }
}
function fnMethod(event) {
    if (timer != null) {
        console.log('(fn | r Alt) then  ', event.rawcode);
        clearTimeout(timer);
        timer = null;
        react(event);
    }
    if (event.rawcode == 255 || event.rawcode == 165) {
        if (timer != null)
            clearTimeout(timer);
        console.log('waiting for next key');
        utils_1.minimizeCurrentWindow();
        timer = setTimeout(() => {
            console.log('timed out');
            clearTimeout(timer);
            timer = null;
        }, secondKeyPressTimeout);
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
interChannel.emitter.on('update-hot-apps', (hotapps) => {
    console.log('event recieved!', hotapps);
});
//# sourceMappingURL=switch.js.map