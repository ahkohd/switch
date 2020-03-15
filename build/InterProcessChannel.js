"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const enums_1 = require("./enums");
const text_1 = require("./text");
const ipc = require("node-ipc");
class InterProcessChannel {
    constructor(logger) {
        this.logger = logger;
        this.emitter = new events_1.EventEmitter();
        this.initIPCServer();
        ipc.server.start();
        logger.log(enums_1.default.LOG_INFO, text_1.TEXT.STARTED_IPC);
    }
    initIPCServer() {
        ipc.config.id = enums_1.IPC.ID;
        ipc.config.retry = 1500;
        ipc.config.silent = true;
        ipc.serve(() => ipc.server.on(enums_1.IPC.CLIENT_SENDS_MESSAGE, (message, _socket) => {
            this.socket = _socket;
            const msg = JSON.parse(message);
            switch (msg.type) {
                case enums_1.IPC.CLIENT_UPDATES_APP:
                    this.emitter.emit(enums_1.IPC.CLIENT_UPDATES_APP, msg.data);
                    this.logger.log(enums_1.default.LOG_INFO, text_1.TEXT.REQUEST_TO_UPDATE_CONFIG);
                    break;
                case enums_1.IPC.CLIENT_SENDS_PID:
                    this.emitter.emit(enums_1.IPC.CLIENT_SENDS_PID, msg.data);
                    this.logger.log(enums_1.default.LOG_INFO, text_1.TEXT.RECEIVES_CLIENT_ID);
                    break;
                case enums_1.IPC.CLIENT_UPDATES_CONFIG:
                    this.emitter.emit(enums_1.IPC.CLIENT_UPDATES_CONFIG, msg.data);
                    this.logger.log(enums_1.default.LOG_INFO, text_1.TEXT.RECEIVES_GET_CONFIG);
                    this.sendConfigUpdateToDockClient(msg.data);
                    break;
                case enums_1.IPC.CLIENT_REQUETS_SHOW_DOCK:
                    this.logger.log(enums_1.default.LOG_INFO, text_1.TEXT.RECEIVES_SHOW_DOCK);
                    this.sendShowClient();
                    break;
            }
        }));
    }
    sendShowClient() {
        try {
            this.send(enums_1.IPC.SEND_MAKE_CLIENT_VISIBLE_REQUEST, { show: true });
        }
        catch (e) {
            this.logger.log(enums_1.default.LOG_ERROR, text_1.TEXT.UNABLE_MAKE_VISIBLE);
        }
    }
    sendConfigUpdateToDockClient(update) {
        try {
            this.send(enums_1.IPC.SEND_CONFIG_UPDATE_REQUEST, update);
        }
        catch (e) { }
    }
    sendlastSwitched(app) {
        try {
            this.send(enums_1.IPC.SEND_LAST_SWITCHED_APP, { hotApp: app });
        }
        catch (e) { }
    }
    send(type, content) {
        ipc.server.emit(this.socket, type, content);
    }
}
exports.default = InterProcessChannel;
//# sourceMappingURL=InterProcessChannel.js.map