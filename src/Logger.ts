import InterProcessChannel from "./InterProcessChannel";
import SWITCH from "./enums";
const Sentry = require("@sentry/node");

export default class Logger {
  private ipc: InterProcessChannel;

  constructor(public devMode: boolean, sentryDSN: string) {
    /// Initialize sentry for remote logging.
    Sentry.init({
      dsn: sentryDSN
    });
  }

  /**
   * Sends logs to client...
   * @param {string} type
   * @param {string} msg
   */

  logToClient(payload: Object) {
    if (this.ipc) this.ipc.send(SWITCH.SERVICE_LOGS, payload);
  }

  /**
   * Logs msg to client and console.
   * The later is true in dev mode.
   *
   * @param {string} type
   * @param {string} msg
   */

  log(type: string, ...args: any[]) {
    if (this.devMode) {
      /// log to console.
      console.log("[" + type + "]:", ...args);
    }
    this.logToClient({ type, logs: [...args] });
  }

  /**
   *  Adds IPC to Logger.
   * This will be used for logging errors to client.
   */
  addIPC(ipc: InterProcessChannel) {
    this.ipc = ipc;
  }
}
