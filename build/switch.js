"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("./enums");
const text_1 = require("./text");
const utils_1 = require("./utils");
const constants_1 = require("./constants");
const ioHook = require("iohook");
class Switch {
    constructor(ipc, logger) {
        this.ipc = ipc;
        this.logger = logger;
        this.disableKeyUpListen = false;
        this.config = utils_1.getConfig();
        this.hotApps = utils_1.getHotApps();
        this.handleIPCEvents();
    }
    registerListenersForUserInput() {
        if (process.platform == "win32")
            this.registerListenerWin32();
        if (process.platform == "darwin")
            this.registerListenerDarwin();
    }
    start() {
        ioHook.start(utils_1.isDevMode());
    }
    switchApp(event) {
        let matchedHotApp = utils_1.whichHotApp(process.platform == "darwin" ? event.keycode : event.rawcode, this.hotApps);
        if (!matchedHotApp) {
            utils_1.notifyUserNoHotMatchHotKey(event.keycode, event.rawcode, matchedHotApp);
            return;
        }
        utils_1.minimizeCurrentWindow(this.logger);
        const processes = utils_1.getAllProcessThatMatchAppName(matchedHotApp.name, matchedHotApp.path);
        if (processes) {
            utils_1.makeHotAppCurrentWindowOnTop(processes, this.config.maximize, this.logger);
            this.ipc.sendlastSwitched(matchedHotApp);
            this.logger.log(enums_1.default.LOG_INFO, `${text_1.TEXT.SWITCHED_HOTAPP} ${matchedHotApp.name}`);
        }
        else {
            utils_1.notifyUserAProcessNotFound(matchedHotApp);
        }
    }
    fnMethod(event) {
        if (event.altKey) {
            this.switchApp(event);
        }
    }
    registerListenerWin32() {
        ioHook.on("keyup", event => {
            if (this.disableKeyUpListen && event.rawcode != 164) {
                if (this.disableKeyUpListenTimeout)
                    clearTimeout(this.disableKeyUpListenTimeout);
                this.disableKeyUpListenTimeout = setTimeout(() => {
                    clearTimeout(this.disableKeyUpListenTimeout);
                    this.disableKeyUpListen = false;
                }, 1000);
                return;
            }
            this.fnMethod(event);
        });
        ioHook.on("keydown", event => {
            if (event.altKey) {
                if (this.config.disableAltGr && event.rawcode == 165) {
                    this.disableKeyUpListen = true;
                    return;
                }
                this.ipc.sendShowClient();
            }
        });
    }
    registerListenerDarwin() {
        for (const currentKey of constants_1.DARWIN_KEY_MAP) {
            ioHook.registerShortcut([3676, 3640, current.keycode], keys => {
                this.ipc.sendShowClient();
                this.switchApp(currentKey);
            });
            ioHook.registerShortcut([3675, 56, current.keycode], keys => {
                this.ipc.sendShowClient();
                this.switchApp(current);
            });
        }
        ioHook.registerShortcut([3676, 3640], () => {
            this.ipc.sendShowClient();
        });
        ioHook.registerShortcut([3675, 56], () => {
            this.ipc.sendShowClient();
        });
    }
    handleIPCEvents() {
        this.ipc.emitter.on("config-update", (settings) => {
            this.logger.log(enums_1.default.LOG_INFO, "Config update update received", settings);
            this.config = settings;
            utils_1.saveConfig(settings);
        });
        this.ipc.emitter.on("client-pid", pid => {
            this.clientPID = pid;
            this.logger.log(enums_1.default.LOG_INFO, text_1.TEXT.CLIENT_PID_MSG_PREFIX, pid);
        });
    }
}
exports.default = Switch;
//# sourceMappingURL=switch.js.map