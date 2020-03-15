import { SwitchNotiMessage, SwitchHotApp, Settings } from "./interfaces";
import SWITCH from "./enums";
import TemplateText, { TEXT } from "./text";
import Logger from "./Logger";
const { windowManager } = require("node-window-manager");
const open = require("open");
const notifier = require("node-notifier");
const path = require("path");
const blackList = ["explorer.exe"];
const Conf = require("conf");
const config = new Conf({
  projectName: SWITCH.PROJECT_NAME,
  encryptionKey: SWITCH.PROJECT_PRIVATE_KEY
});

/**
 * Gets the normalized ICO path.
 */

export const icoPath = (process as any).pkg
  ? path.join(path.dirname(process.execPath), "./switch.ico")
  : path.join(__dirname, "../assets/switch.ico");
const stringSimilarity = require("string-similarity");

/**
 * Get the OS type..
 */

export const ostype = require("os").type();

/**
 * Sends  notification to the user
 * @param  {SWITCH.ERROR_NOTI | SWITCH.INFO_NOTI} type Type of notification
 * @param  {SwitchNotiMessage} data Information to be sent
 * @param  {} callback? If present, what to do when user reponds to notifcation
 */

export function switchMessage(
  type: SWITCH.ERROR_NOTI | SWITCH.INFO_NOTI,
  data: SwitchNotiMessage
) {
  notifier.notify({
    title: TEXT.SWITCH_PREFIX + data.title,
    message: data.message,
    icon: icoPath, // Absolute path (doesn't work on balloons)
    sound: false, // Only Notification Center or Windows Toasters
    wait: true, // Wait with callback, until user action is taken against notification
    hotApp: data.hotApp ? data.hotApp : null
  });
}

/**
 * Register an event handler to handle notifier onclick
 */
export function registerNotifierOnClick() {
  const onclick = debounce(
    (notifierObject, options, event) => {
      /// If hot app is assigned to an index in the dock,
      /// use its' path property to open hot app.
      if (options.hotApp) openHotApp(options.hotApp.path);
    },
    3000,
    false
  );
  notifier.on("click", onclick);
}

/**
 * Get the list of saved user's hotapps
 * @returns SwitchHotApp[]
 */

export function getHotApps(): SwitchHotApp[] {
  const hotApps = config.get("hotApps");
  if (hotApps == null) {
    config.set("hotApps", []);
    return [];
  } else {
    return hotApps;
  }
}

/**
 * Get saved settings from store
 */

export const getConfig = () => {
  let settings: Settings | null = config.get("config");
  if (settings == null) {
    const initial = {
      autoHide: true,
      maximize: true,
      disableAltGr: false
    };
    config.set("config", initial);
    return initial;
  } else {
    return settings;
  }
};

/**
 * Save config to store
 * @param {any} settings Settings to save
 */
export const saveConfig = (settings: Settings) => {
  config.set("config", settings);
};

/**
 * Saves hot apps to store
 * @param {SwitchHotApp[]} hotApps List of hot apps to save
 */

export const saveHotApps = hotApps => {
  config.set("hotApps", hotApps);
};

/**
 * Returns a hot app that match the given hot rawcode
 * @param  {number} rawcode Rawcode to match
 * @param  {SwitchHotApp[]} hotApps List of hot apps
 * @returns SwitchHotApp
 */

export const whichHotApp = (
  rawcode: number,
  hotApps: SwitchHotApp[]
): SwitchHotApp | null => {
  let whichHotWindowToOpen = hotApps.filter(app => app.rawcode == rawcode);
  if (whichHotWindowToOpen.length == 0) return null;
  return whichHotWindowToOpen[0];
};

/**
 * Returns all processes that matches the specified path
 * @param  {string} path Path of the process
 * @returns Window[] | null
 */

export const getAllProcessThatMatchPath = (_path: string) => {
  let processes = windowManager
    .getWindows()
    .filter(window => path.basename(window.path) == path.basename(_path));
  if (processes == null || processes.length == 0) return null;
  return processes;
};

/**
 * Find all processes that matches the given PID
 * @param  {number} pid PID of the process
 * @returns Window[] | null
 */

export const getProcessWithPID = (pid: number) => {
  let process = windowManager
    .getWindows()
    .filter(window => window.processId == pid);
  if (process.length == 0) return null;
  return process[0];
};

/**
 * Returns all processes (of visible windows) that match specified process name and path, if only
 * process name is matched, it returns else null
 * @param  {string} name Name of the process
 * @param {string} path Path of the process
 * @returns Window[] | null
 */

export const getAllProcessThatMatchAppName = (name: string, path: string) => {
  let filterProcessByname = [];
  if (ostype == SWITCH.WINDOWS) {
    /// Since `window.isVisible()` is only supported in windows.
    filterProcessByname = windowManager.getWindows().filter(
      window =>
        window.isVisible() &&
        window
          .getTitle()
          .toLowerCase()
          .includes(
            name
              .split(".exe")[0]
              .toLowerCase()
              .replace(/[^a-zA-Z ]/, " ")
          )
    );
  } else {
    filterProcessByname = windowManager
      .getWindows()
      .filter(window => window.path == path);
  }

  if (filterProcessByname == null || filterProcessByname.length == 0) {
    if (process.platform == "darwin") {
      return null;
      // return processPathSimilarityMatch(windowManager.getWindows(), path, .65);
    } else {
      return processPathSimilarityMatch(
        windowManager.getWindows().filter(window => window.isVisible()),
        path,
        0.65
      );
    }
  } else {
    const filterProcessByPath = filterProcessByname.filter(
      window => window.path.toLowerCase() == path.toLowerCase()
    );
    if (filterProcessByPath == null || filterProcessByPath.length == 0) {
      return filterProcessByname;
    } else {
      return filterProcessByPath;
    }
  }
};

/**
 * Gets the processes that as the path that is most similar to a given path and a treshold..
 * @param  {} processes List of processes to check
 * @param  {} path Path to match agianst
 * @param  {} treshold Threshold to mark a given path as similar.
 * @returns Window[] | null
 */

export const processPathSimilarityMatch = (
  processes,
  path,
  treshold
): Window[] | null => {
  /// Loop trough the processes list and look for the process with the most similar path
  /// and the similarity exceeds the given treshold.

  let simScores = [];
  /// calculate the similarity for all processes.
  processes.forEach(process => {
    simScores.push(stringSimilarity.compareTwoStrings(path, process.path));
  });

  /// Look for the highest score.
  const highest = Math.max(...simScores);
  if (highest < treshold) return null;

  /// Return processes that have these highest scores.
  const finalProcesses = [];
  simScores.forEach((score, index) => {
    if (score == highest) finalProcesses.push(processes[index]);
  });
  return finalProcesses;
};

/**
 * Minimize current window
 */
export const clearCurrentWidow = () => {
  const currentWindow = windowManager.getActiveWindow();
  if (currentWindow.isWindow()) {
    try {
      currentWindow.minimize();
    } catch (e) {}
  }
};

/**
 * Makes hot process that is a window active
 * 1. Gets the list of hot processes
 * 2. Sorts them in descending order of using their PID
 * 3. Checks if the least pid is a window
 * 4. Brings it to top
 * 5. Else looks next least pid that it a window in the list
 * 6. Then brings it to the top
 *
 * @param  {} hotProcesses - List of matched hot processess
 */

export const makeHotAppCurrentWindowOnTop = (
  hotProcesses: any[],
  maximize: boolean = true,
  logger: Logger
) => {
  /// Look for the least pid and is a window.
  hotProcesses.sort(function(a, b) {
    return b.processId - a.processId;
  });
  logger.log(SWITCH.LOG_INFO, TEXT.SORTED_PROCESSES, hotProcesses);
  /// Least pid
  let least = hotProcesses[0];
  // If is a window, bring it up and make active
  if (least.isWindow()) {
    least.bringToTop();
    if (!maximize) {
      least.restore();
    } else {
      least.maximize();
    }
  } else {
    /// Else loop to the rest and find the first windowed process.
    // remove the least one.
    least = hotProcesses;
    least.shift();
    for (let i = 0; i < least.length; i++) {
      if (least[i].isWindow()) {
        // Then bring the window to the top.
        const hot = least[i];
        hot.bringToTop();
        if (!maximize) {
          hot.restore();
        } else {
          hot.maximize();
        }
        break;
      }
    }
  }
};

/**
 * Opens a hotApp with the provided path
 * @param  {string} path
 */

export const openHotApp = (path: string) => {
  open(path);
};

/**
 * Debouncing enforces that a function not be called again until
 * a certain amount of time has passed without it being called
 * @param  {} callback What to do
 * @param  {} wait Duration to wait for in seconds
 * @param  {} immediate Default (false)
 */

export function debounce(callback, wait, immediate = false) {
  let timeout = null;
  return function() {
    const callNow = immediate && !timeout;
    const next = () => callback.apply(this, arguments);

    clearTimeout(timeout);
    timeout = setTimeout(next, wait);

    if (callNow) {
      next();
    }
  };
}

/**
 * Minimizes current window.
 * Useful to prevent user from tying uncessary input..
 */

export const minimizeCurrentWindow = (logger: Logger) => {
  if (process.platform == "darwin") return;
  const current = windowManager.getActiveWindow();
  const info = current.getInfo();
  // prevent minizing black listed apps..
  if (blackList.filter(item => info.path.includes(item)).length > 0) {
    logger.log(SWITCH.LOG_INFO, TEXT.UNABLE_TO_MINIMIZE);
    return;
  }
  if (current.isWindow() && current.getTitle().toLowerCase() != "switch") {
    current.minimize();
  }
};

/**
 * Returns `true` if Service is running in dev mode and `false` otherwise.
 */

export const isDevMode = () => {
  if (process.argv[2]) {
    return process.argv[2].toLowerCase() == "--dev" ? true : false;
  } else {
    return false;
  }
};

/**
 * This method brings `Switch` to top so that it can eat the next keystrokes
 * and prevents user from typing unintended text into their last active window.
 */

export const bringSwitchToFocus = (pid, logger: Logger) => {
  if (process.platform == "darwin") {
    try {
      const switchWindow = windowManager
        .getWindows()
        .filter(window => window.processId == pid);
      logger.log(TEXT.FOCUS_SWITCH, switchWindow.length > 0 ? true : false);
      switchWindow[0].bringToTop();
    } catch (e) {}
  }
};

/**
 * Shows a nofication to notify the user that a process
 * is not found
 */

export const notifyUserAProcessNotFound = (
  matchedHotApp: SwitchHotApp | null
) => {
  switchMessage(SWITCH.ERROR_NOTI, {
    title: TemplateText.errorTitle,
    message: TemplateText.processNotFound(matchedHotApp.name),
    hotApp: matchedHotApp
  });
};

/**
 * Shows a notification to the user that the hot app
 * that matches the hotkey is not found.
 *
 * @param keycode {number}
 * @param rawcode {number}
 * @param matchedHotApp {SwitchHotApp | null}
 */

export const notifyUserNoHotMatchHotKey = (
  keycode: number,
  rawcode: number,
  matchedHotApp: SwitchHotApp | null
) => {
  if (process.platform == "darwin") {
    if (keycode >= 0 && keycode <= 9) {
      this.ipc.sendShowClient();
      switchMessage(SWITCH.ERROR_NOTI, {
        title: TemplateText.errorTitle,
        message: TemplateText.noHotApp(keycode - 1),
        hotApp: matchedHotApp
      });
    }
  } else {
    if (rawcode >= 48 && rawcode <= 58) {
      this.ipc.sendShowClient();
      switchMessage(SWITCH.ERROR_NOTI, {
        title: TemplateText.errorTitle,
        message: TemplateText.noHotApp(rawcode - 48),
        hotApp: matchedHotApp
      });
    }
  }
};
