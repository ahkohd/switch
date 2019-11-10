"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const enums_1 = require("./enums");
const utils_1 = require("./utils");
const log = utils_1.switchLog.bind({ isDevMode: utils_1.checkDevMode() });
const ipc = require('node-ipc');
let socket;
class InterProcessChannel {
    constructor() {
        this.emitter = new events_1.EventEmitter();
        this.kickstart();
        log(enums_1.Switch.LOG_INFO, 'Started IPC channel');
        ipc.server.start();
    }
    kickstart() {
        ipc.config.id = 'switch-service-channel';
        ipc.config.retry = 1500;
        ipc.config.silent = true;
        ipc.serve(() => ipc.server.on('switch-service-incoming', (message, _socket) => {
            socket = _socket;
            const msg = JSON.parse(message);
            switch (msg.type) {
                case 'update-hot-apps':
                    this.emitter.emit('update-hot-apps', msg.data);
                    break;
                case 'client-pid':
                    this.emitter.emit('client-pid', msg.data);
                    break;
                case 'config-update':
                    this.emitter.emit('config-update', msg.data);
                    this.sendConfigUpdateToDockClient(msg.data);
                    break;
                case 'show-dock':
                    console.log('[info] Show dock');
                    this.sendShowClient();
                    break;
            }
        }));
    }
    sendShowClient() {
        try {
            ipc.server.emit(socket, 'client-show', { show: true });
        }
        catch (e) { }
    }
    sendConfigUpdateToDockClient(update) {
        try {
            ipc.server.emit(socket, 'config-update', update);
        }
        catch (e) { }
    }
    sendlastSwitched(app) {
        try {
            ipc.server.emit(socket, 'last-switched-app', { hotApp: app });
        }
        catch (e) { }
    }
}
exports.InterProcessChannel = InterProcessChannel;
//# sourceMappingURL=Interprocess.js.map