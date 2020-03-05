"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("./Logger");
const utils_1 = require("./utils");
const enums_1 = require("./enums");
const InterProcessChannel_1 = require("./InterProcessChannel");
const run = () => {
    const logger = new Logger_1.default(utils_1.isDevMode(), enums_1.default.SENTRY_DNS);
    try {
        const ipc = new InterProcessChannel_1.default(logger);
        logger.addIPC(ipc);
    }
    catch (e) {
        logger.log(enums_1.default.LOG_ERROR, "Fatal! Unable to start Switch Service IPC!");
    }
};
run();
//# sourceMappingURL=index.js.map