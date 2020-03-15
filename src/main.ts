import Logger from "./Logger";
import { isDevMode, ostype } from "./utils";
import SWITCH from "./enums";
import InterProcessChannel from "./InterProcessChannel";
import { TEXT } from "./text";
import Switch from "./switch";

const run = () => {
  const logger = new Logger(isDevMode(), SWITCH.SENTRY_DNS);
  try {
    const ipc = new InterProcessChannel(logger);
    logger.addIPC(ipc);
    logger.log(SWITCH.LOG_INFO, "ENV", ostype);
    const app = new Switch(ipc, logger);
    app.registerListenersForUserInput();
    app.start();
  } catch (e) {
    logger.log(SWITCH.LOG_ERROR, TEXT.UNABLE_START_SERVICE);
  }
};

run();
