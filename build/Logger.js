"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("./enums");
const Sentry = require("@sentry/node");
class Logger {
    constructor(devMode, sentryDSN) {
        this.devMode = devMode;
        Sentry.init({
            dsn: sentryDSN
        });
    }
    logToClient(payload) {
        if (this.ipc)
            this.ipc.send(enums_1.default.SERVICE_LOGS, payload);
    }
    log(type, ...args) {
        if (this.devMode) {
            console.log("[" + type + "]:", ...args);
        }
        this.logToClient({ type, logs: [...args] });
    }
    addIPC(ipc) {
        this.ipc = ipc;
    }
}
exports.default = Logger;
//# sourceMappingURL=Logger.js.map