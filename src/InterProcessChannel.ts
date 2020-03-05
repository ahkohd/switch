import { EventEmitter } from "events";
import { SwitchHotApp, ProcessMessage } from "./interfaces";
import SWITCH, { IPC } from "./enums";
import { TEXT } from "./text";
import Logger from "./Logger";
const ipc = require("node-ipc");

export default class InterProcessChannel {
  emitter: EventEmitter;
  socket: any;

  constructor(public logger: Logger) {
    this.emitter = new EventEmitter();
    this.initIPCServer();
    ipc.server.start();
    logger.log(SWITCH.LOG_INFO, TEXT.STARTED_IPC);
  }

  /**
   * Setup the IPC server and sets handlers listens to incoming events.
   */

  initIPCServer() {
    /// Configure IPC.
    ipc.config.id = IPC.ID;
    ipc.config.retry = 1500;
    ipc.config.silent = true;

    /// Serve, then listen to incoming events.
    ipc.serve(() =>
      ipc.server.on(IPC.CLIENT_SENDS_MESSAGE, (message, _socket) => {
        /// Incomming messages.
        this.socket = _socket;
        const msg: ProcessMessage = JSON.parse(message);
        switch (msg.type) {
          case IPC.CLIENT_UPDATES_APP:
            this.emitter.emit(IPC.CLIENT_UPDATES_APP, msg.data);
            this.logger.log(SWITCH.LOG_INFO, TEXT.REQUEST_TO_UPDATE_CONFIG);
            break;
          case IPC.CLIENT_SENDS_PID:
            this.emitter.emit(IPC.CLIENT_SENDS_PID, msg.data);
            this.logger.log(SWITCH.LOG_INFO, TEXT.RECEIVES_CLIENT_ID);
            break;
          case IPC.CLIENT_UPDATES_CONFIG:
            this.emitter.emit(IPC.CLIENT_UPDATES_CONFIG, msg.data);
            this.logger.log(SWITCH.LOG_INFO, TEXT.RECEIVES_GET_CONFIG);
            this.sendConfigUpdateToDockClient(msg.data);
            break;
          case IPC.CLIENT_REQUETS_SHOW_DOCK:
            this.logger.log(SWITCH.LOG_INFO, TEXT.RECEIVES_SHOW_DOCK);
            this.sendShowClient();
            break;
        }
      })
    );
  }

  /**
   * Sends client-show event to the client(dock)
   */

  sendShowClient() {
    try {
      this.send(IPC.SEND_MAKE_CLIENT_VISIBLE_REQUEST, { show: true });
    } catch (e) {
      this.logger.log(SWITCH.LOG_ERROR, TEXT.UNABLE_MAKE_VISIBLE);
    }
  }

  /**
   * Sends client-update event to the client(dock)
   */

  sendConfigUpdateToDockClient(update) {
    try {
      this.send(IPC.SEND_CONFIG_UPDATE_REQUEST, update);
    } catch (e) {}
  }

  /**
   * Sends last-switched-app event to the client(dock)
   */

  sendlastSwitched(app: SwitchHotApp) {
    try {
      this.send(IPC.SEND_LAST_SWITCHED_APP, { hotApp: app });
    } catch (e) {}
  }

  /**
   * Sends custom message to client
   */

  public send(type: string, content: Object) {
    ipc.server.emit(this.socket, type, content);
  }
}
