"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const text_1 = require("./text");
const enums_1 = require("./enums");
const ioHook = require('iohook');
const hotapps = utils_1.getHotApps();
const alwaysMaximize = true;
ioHook.on('keyup', event => {
    if (event.altKey) {
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
});
ioHook.start();
ioHook.start(true);
utils_1.registerNotifierOnClick();
//# sourceMappingURL=switch.js.map