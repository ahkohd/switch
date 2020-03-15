import InterProcessChannel from "./InterProcessChannel";
import SWITCH from "./enums";
import Logger from "./Logger";
import { TEXT } from "./text";
import { SwitchHotApp, Settings } from "./interfaces";
import {
  getHotApps,
  whichHotApp,
  minimizeCurrentWindow,
  getAllProcessThatMatchAppName,
  makeHotAppCurrentWindowOnTop,
  getConfig,
  notifyUserAProcessNotFound,
  notifyUserNoHotMatchHotKey,
  isDevMode,
  saveConfig
} from "./utils";
import { DARWIN_KEY_MAP } from "./constants";
const ioHook = require("iohook");

export default class Switch {
  private clientPID;
  private config;
  private hotApps: Array<SwitchHotApp>;
  private disableKeyUpListen: boolean = false;
  private disableKeyUpListenTimeout: any;

  constructor(private ipc: InterProcessChannel, private logger: Logger) {
    this.config = getConfig();
    this.hotApps = getHotApps();
    this.handleIPCEvents();
  }

  /**
   * uses `iohook` to register functions that will
   * get called when some keycombos are matched
   *
   */

  public registerListenersForUserInput() {
    if (process.platform == "win32") this.registerListenerWin32();
    if (process.platform == "darwin") this.registerListenerDarwin();
  }

  /**
   * starts `iohook`.
   * `Switch` starts listening for input.
   */
  public start() {
    ioHook.start(isDevMode());
  }

  /**
   * Switch to an hot app that matches the assigned keycode
   * @param  {} event
   */

  switchApp(event: any) {
    let matchedHotApp: SwitchHotApp | null = whichHotApp(
      process.platform == "darwin" ? event.keycode : event.rawcode,
      this.hotApps
    );
    if (!matchedHotApp) {
      notifyUserNoHotMatchHotKey(event.keycode, event.rawcode, matchedHotApp);
      return;
    }
    minimizeCurrentWindow(this.logger);
    const processes = getAllProcessThatMatchAppName(
      matchedHotApp.name,
      matchedHotApp.path
    );
    if (processes) {
      makeHotAppCurrentWindowOnTop(
        processes,
        this.config.maximize,
        this.logger
      );
      this.ipc.sendlastSwitched(matchedHotApp);
      this.logger.log(
        SWITCH.LOG_INFO,
        `${TEXT.SWITCHED_HOTAPP} ${matchedHotApp.name}`
      );
    } else {
      notifyUserAProcessNotFound(matchedHotApp);
    }
  }

  /**
   * Activates hot app switch if user holds the alt key.
   * `win-32`
   * @param  {} event
   */

  fnMethod(event) {
    if (event.altKey) {
      this.switchApp(event);
    }
  }

  /**
   * Register Handler to listen for io hook events.
   * `win-32`
   */

  registerListenerWin32() {
    ioHook.on("keyup", event => {
      // if altgr is disabled do not show dock...
      if (this.disableKeyUpListen && event.rawcode != 164) {
        if (this.disableKeyUpListenTimeout)
          clearTimeout(this.disableKeyUpListenTimeout);
        this.disableKeyUpListenTimeout = setTimeout(() => {
          clearTimeout(this.disableKeyUpListenTimeout);
          this.disableKeyUpListen = false;
        }, 1000);
        return;
      }
      this.fnMethod(event);
    });

    ioHook.on("keydown", event => {
      if (event.altKey) {
        // If alt key is pressed, show dock
        // if altgr is disabled do not show...
        if (this.config.disableAltGr && event.rawcode == 165) {
          this.disableKeyUpListen = true;
          return;
        }
        this.ipc.sendShowClient();
      }
    });
  }

  /**
   * Register Handler to listen for io hook events.
   * `darwin`
   */

  registerListenerDarwin() {
    for (const currentKey of DARWIN_KEY_MAP) {
      /// register shortcut keys for
      /// LEFT
      /// Cmd+Option + (1 to 9)
      ioHook.registerShortcut([3676, 3640, current.keycode], keys => {
        this.ipc.sendShowClient();
        this.switchApp(currentKey);
      });

      // RIGHT
      ioHook.registerShortcut([3675, 56, current.keycode], keys => {
        this.ipc.sendShowClient();
        this.switchApp(current);
      });
    }

    /// Listen for when user taps LEFT Comand+Options
    ioHook.registerShortcut([3676, 3640], () => {
      this.ipc.sendShowClient();
    });

    /// Listen for when user taps RIGHT Comand+Options
    ioHook.registerShortcut([3675, 56], () => {
      this.ipc.sendShowClient();
    });
  }

  /**
   * Register listens for IPC events
   */

  handleIPCEvents() {
    /**
     * Fires when config
     * update is recieved from client
     */
    this.ipc.emitter.on("config-update", (settings: Settings) => {
      this.logger.log(
        SWITCH.LOG_INFO,
        "Config update update received",
        settings
      );
      this.config = settings;
      saveConfig(settings);
    });

    /**
     * Fires when docks PID
     * update is recieved from client
     */
    this.ipc.emitter.on("client-pid", pid => {
      this.clientPID = pid;
      this.logger.log(SWITCH.LOG_INFO, TEXT.CLIENT_PID_MSG_PREFIX, pid);
    });
  }
}
