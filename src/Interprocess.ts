import { EventEmitter } from "events";
import { SwitchHotApp } from "./interfaces";

const ipc = require('node-ipc');

let socket;
export interface ProcessMessage {
    type: string,
    data: any,
}

export class InterProcessChannel {


    emitter: EventEmitter;
    constructor() {
        this.emitter = new EventEmitter();
        // kick start communication channel
        this.kickstart();
        // start server..
        console.log('[info]: started inter process communication channel!');
        ipc.server.start();
    }


    kickstart() {

        ipc.config.id = 'switch-service-channel';
        ipc.config.retry = 1500;
        ipc.config.silent = true;
        ipc.serve(() => ipc.server.on('switch-service-incoming', (message, _socket) => {
            socket = _socket;
            const msg: ProcessMessage = JSON.parse(message);
            switch (msg.type) {
                case 'update-hot-apps':
                    this.emitter.emit('update-hot-apps', msg.data)
                    break;
                case 'client-pid':
                    this.emitter.emit('client-pid', msg.data);
                    break;
                case 'config-update':
                    this.emitter.emit('config-update', msg.data);
                    break;
                case 'show-dock':
                    console.log('[info] Show dock');
                    this.sendShowClient();
                    break;
            }
        }));
    }

    sendShowClient() {
        ipc.server.emit(socket, 'client-show', { show: true });
    }

    sendlastSwitched(app: SwitchHotApp) {
        ipc.server.emit(socket, 'last-switched-app', { hotApp: app });
    }
}