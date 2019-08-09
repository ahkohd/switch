"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const ipc = require('node-ipc');
class InterProcessChannel {
    constructor() {
        this.emitter = new events_1.EventEmitter();
        this.kickstart();
        console.log('[info]: started inter process communication channel!');
        ipc.server.start();
    }
    kickstart() {
        ipc.config.id = 'switch-service-channel';
        ipc.config.retry = 1500;
        ipc.config.silent = true;
        ipc.serve(() => ipc.server.on('switch-service-incoming', (message) => {
            const msg = JSON.parse(message);
            switch (msg.type) {
                case 'update-hot-apps':
                    this.emitter.emit('update-hot-apps', msg.data);
                    break;
                case 'client-pid':
                    this.emitter.emit('client-pid', msg.data);
            }
        }));
    }
}
exports.InterProcessChannel = InterProcessChannel;
//# sourceMappingURL=Interprocess.js.map