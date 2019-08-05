"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const text_1 = require("./text");
const enums_1 = require("./enums");
const ioHook = require('iohook');
const checkcaps = require('check-caps');
const secondKeyPressTimeout = 700;
const hotapps = utils_1.getHotApps();
const alwaysMaximize = true;
const useFnKey = true;
let timer = null;
function react(event) {
    let hotApp = utils_1.whichHotApp(event.keycode, hotapps);
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
        console.log('(fn | r Alt) then  ', event.keycode);
        clearTimeout(timer);
        timer = null;
        react(event);
    }
    if (event.keycode == 0 || event.keycode == 3640) {
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
//# sourceMappingURL=switch.js.map