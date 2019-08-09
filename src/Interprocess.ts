import { EventEmitter } from "events";

const ipc = require('node-ipc');

export interface ProcessMessage
{
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
        ipc.serve(() => ipc.server.on('switch-service-incoming', (message) => {
            const msg: ProcessMessage = JSON.parse(message);
            switch(msg.type)
            {
                case 'update-hot-apps':
                    this.emitter.emit('update-hot-apps', msg.data)
                    break;
                case 'client-pid':
                    this.emitter.emit('client-pid', msg.data);
            }
        }));
    }
}