import { EventEmitter } from "events";
import { SwitchHotApp, ProcessMessage } from "./interfaces";
import { Switch } from './enums';
import { switchLog, checkDevMode } from './utils';

const log = switchLog.bind({ isDevMode: checkDevMode() });
const ipc = require('node-ipc');
let socket;

export class InterProcessChannel {
    emitter: EventEmitter;

    constructor() {
        this.emitter = new EventEmitter();
        // kick start communication channel
        this.kickstart();
        // start server..
        log(Switch.LOG_INFO, 'Started IPC channel');
        ipc.server.start();
    }

    /**
     * Starts the IPC and listens to incoming events 
     */
    kickstart() {
        // Config IPC
        ipc.config.id = 'switch-service-channel';
        ipc.config.retry = 1500;
        ipc.config.silent = true;

        // Serve, then listen to incoming events
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
                    // send config update to client..
                    this.sendConfigUpdateToDockClient(msg.data);
                    break;
                case 'show-dock':
                    console.log('[info] Show dock');
                    this.sendShowClient();
                    break;
            }
        }));
    }

    /**
     * Sends client-show event to the client(dock)
     */
    sendShowClient() {
        try {
            ipc.server.emit(socket, 'client-show', { show: true });
        } catch (e) { }
    }

    /**
     * Sends client-update event to the client(dock)
     */
    sendConfigUpdateToDockClient(update) {
        try {
            ipc.server.emit(socket, 'config-update', update);
        } catch (e) { }
    }

    /**
     * Sends last-switched-app event to the client(dock)
     */
    sendlastSwitched(app: SwitchHotApp) {
        try {
            ipc.server.emit(socket, 'last-switched-app', { hotApp: app });
        } catch (e) { }
    }
}