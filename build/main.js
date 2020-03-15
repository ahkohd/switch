"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("./Logger");
const utils_1 = require("./utils");
const enums_1 = require("./enums");
const InterProcessChannel_1 = require("./InterProcessChannel");
const text_1 = require("./text");
const switch_1 = require("./switch");
const run = () => {
    const logger = new Logger_1.default(utils_1.isDevMode(), enums_1.default.SENTRY_DNS);
    try {
        const ipc = new InterProcessChannel_1.default(logger);
        logger.addIPC(ipc);
        logger.log(enums_1.default.LOG_INFO, "ENV", utils_1.ostype);
        const app = new switch_1.default(ipc, logger);
        app.registerListenersForUserInput();
        app.start();
    }
    catch (e) {
        logger.log(enums_1.default.LOG_ERROR, text_1.TEXT.UNABLE_START_SERVICE);
    }
};
run();
//# sourceMappingURL=main.js.map