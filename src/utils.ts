import { SwitchNotiMessage, SwitchHotApp } from './interfaces';
import { Switch } from './enums';
const { windowManager } = require("node-window-manager");
const open = require('open');

const notifier = require('node-notifier');
const path = require('path');
const blackList = ['explorer.exe'];


const Conf = require('conf');
const config = new Conf({
    encryptionKey: '..kta#md!@a-k2j',
});

/**
 * Sends  notification to the user
 * @param  {Switch.ERROR_NOTI | Switch.INFO_NOTI} type Type of notification
 * @param  {SwitchNotiMessage} data Information to be sent
 * @param  {} callback? If present, what to do when user reponds to notifcation
 */
export function switchMessage(type: Switch.ERROR_NOTI | Switch.INFO_NOTI, data: SwitchNotiMessage) {

    notifier.notify(
        {
            title: 'Switch - ' + data.title,
            message: data.message,
            icon: path.join(__dirname, '../', 'assets', 'switch.ico'), // Absolute path (doesn't work on balloons)
            sound: false, // Only Notification Center or Windows Toasters
            wait: true, // Wait with callback, until user action is taken against notification
            hotApp: (data.hotApp) ? data.hotApp : null
        });
}

/**
 * Register an event handler to handle notifier onclick
 */
export function registerNotifierOnClick() {
    const onclick = debounce((notifierObject, options, event) => {
        // if hot app is present use its' path path property to open hot app.
        console.log(options.hotApp)
        if (options.hotApp) openHotApp(options.hotApp.path);

    }, 3000, false);
    notifier.on('click', onclick);
}

/**
 * Get the list of saved user's hotapps
 * @returns SwitchHotApp[]
 */
export function getHotApps(): SwitchHotApp[] {
    const hotApps = config.get('hotApps');
    if (hotApps == null) {
        config.set('hotApps', []);
        return [];
    } else {
        return hotApps;
    }
}

/**
 * Get saved settings from store
 */
export function getConfig() {
    let settings = config.get('config');
    if (settings == null) {
        const initial = {
            autoHide: true,
            maximize: true
        };
        config.set('config', initial);
        return initial;
    } else {
        return settings;
    }
}

/** 
 * Save config to store
 * @param {any} settings Settings to save
 */
export function saveConfig(settings) {
    config.set('config', settings);
}

/** 
 * Saves hot apps to store
 * @param {SwitchHotApp[]} hotApps List of hot apps to save
 */
export function saveHotApps(hotApps) {
    config.set('hotApps', hotApps)
}

/**
 * Returns a hot app that match the given hot rawcode
 * @param  {number} rawcode Rawcode to match
 * @param  {SwitchHotApp[]} hotApps List of hot apps
 * @returns SwitchHotApp
 */
export function whichHotApp(rawcode: number, hotApps: SwitchHotApp[]): SwitchHotApp | null {
    let whichHotWindowToOpen = hotApps.filter(app => app.rawcode == rawcode);
    if (whichHotWindowToOpen.length == 0) return null;
    return whichHotWindowToOpen[0];
}

/**
 * Returns all processes that matches the specified path
 * @param  {string} path Path of the process
 * @returns Window[] | null
 */
export function getAllProcessThatMatchPath(_path: string) {
    let processes = windowManager.getWindows().filter(window => path.basename(window.path) == path.basename(_path));
    if (processes == null || processes.length == 0) return null;
    return processes;
}

/**
 * Find all processes that matches the given PID
 * @param  {number} pid PID of the process
 * @returns Window[] | null
 */
export function getProcessWithPID(pid: number) {
    let process = windowManager.getWindows().filter(window => window.processId == pid);
    if (process.length == 0) return null;
    return process[0];
}

/**
 * Returns all processes that match specified process name and path, if only
 * process name is matched, it returns else null
 * @param  {string} name Name of the process
 * @param {string} path Path of the process
 * @returns Window[] | null
 */
export function getAllProcessThatMatchAppName(name: string, path: string) {

    const filterProcessByname = windowManager.getWindows().filter(window => window.getTitle().toLowerCase().includes(name.split('.exe')[0].toLowerCase().replace(/[^a-zA-Z ]/, ' ')));
    if (filterProcessByname == null || filterProcessByname.length == 0) {
        return null;
    } else {
        const filterProcessByPath = filterProcessByname.filter(window => window.path.toLowerCase() == path.toLowerCase());
        if (filterProcessByPath == null || filterProcessByPath.length == 0) {
            return filterProcessByname;
        } else {
            return filterProcessByPath;
        }
    }
}

/** 
 * Minimize current window
 */
export function clearCurrentWidow() {
    const currentWindow = windowManager.getActiveWindow();
    if (currentWindow.isWindow()) {
        try {
            currentWindow.minimize();
        } catch (e) { }
    }
}

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

export function MakeHotAppActive(hotProcesses: any[], maximize: boolean = true) {
    // look for the least pid and is a window.
    hotProcesses.sort(function (a, b) {
        return b.processId - a.processId
    });
    console.log(hotProcesses);
    // least pid 
    let least = hotProcesses[0];
    // if is a window, bring it up and make active
    if (least.isWindow()) {
        least.bringToTop();
        if (!maximize) {
            least.restore();
        } else {
            least.maximize();
        }
    } else {
        // else loop to the rest and find the 1st windowed process..
        // remove the least one
        least = hotProcesses;
        least.shift();
        for (let i = 0; i < least.length; i++) {
            if (least[i].isWindow()) {
                // Then bring the window to the top.
                const hot = least[i];
                hot.bringToTop();
                if(!maximize) {
                    hot.restore();
                } else {
                    hot.maximize();
                }
                break;
            }
        }
    }
}

/**
 * Opens a hotApp with the provided path
 * @param  {string} path
 */
export function openHotApp(path: string) {
    open(path);
}

/**
 * Debouncing enforces that a function not be called again until
 * a certain amount of time has passed without it being called
 * @param  {} callback What to do
 * @param  {} wait Duration to wait for in seconds
 * @param  {} immediate Default (false)
 */
export function debounce(callback, wait, immediate = false) {
    let timeout = null

    return function () {
        const callNow = immediate && !timeout
        const next = () => callback.apply(this, arguments)

        clearTimeout(timeout)
        timeout = setTimeout(next, wait)

        if (callNow) {
            next()
        }
    }
}

/**
 * Minimizes current window.
 * Useful to prevent user from tying uncessary input..
 */
export function minimizeCurrentWindow() {
    const current = windowManager.getActiveWindow();
    const info = current.getInfo();
    // prevent minizing black listed apps..
    if (blackList.filter(item => info.path.includes(item)).length > 0) { console.log('cannot minize'); return };
    if (current.isWindow() && current.getTitle().toLowerCase() != 'switch') {
        current.minimize();
    }
}