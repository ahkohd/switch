import { SwitchNotiMessage, SwitchHotApp } from './interfaces';
import { Switch } from './enums';
const { windowManager } = require("node-window-manager");
const childProcess = require('child_process');
const open = require('open');

const notifier = require('node-notifier');
const path = require('path');


/**
 * Sends crossplatform notification to the user
 * @param  {Switch.ERROR_NOTI | Switch.INFO_NOTI} type Type of notification
 * @param  {SwitchNotiMessage} data Information to be send
 * @param  {} callback? If present, activation to do when user reponds to notifcation
 */

export function switchMessage(type: Switch.ERROR_NOTI | Switch.INFO_NOTI, data: SwitchNotiMessage) {

    notifier.notify(
        {
            title: 'Switch - ' + data.title,
            message: data.message,
            icon: path.join(Switch.APP_PATH, Switch.NOTI_ICON), // Absolute path (doesn't work on balloons)
            sound: true, // Only Notification Center or Windows Toasters
            wait: true, // Wait with callback, until user action is taken against notification
            hotApp: (data.hotApp) ? data.hotApp : null
        });
}


export function registerNotifierOnClick()
{
    const onclick = debounce((notifierObject, options, event) => {
        // if hot app is present use its' path path property to open hot app.
        console.log(options.hotApp)
        if (options.hotApp) openHotApp(options.hotApp.path);

    }, 3000, false);
    notifier.on('click', onclick);
}


/**
 * Get the list of saved user's favourite apps
 */

export function getHotApps(): SwitchHotApp[] {
    return [{
        name: 'Brave',
        keycode: 2,
        path: 'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'
    }, {
        name: 'Code',
        keycode: 3,
        path: 'C:\\Program Files\\Microsoft VS Code\\Code.exe'
    }, {
        name: 'MagicaVoxel',
        keycode: 4,
        path: 'C:\\Program Files\\MagicaVoxel-0.98.2-win\\MagicaVoxel.exe'
    }];
}

/**
 * Returns a hot app that matches the given hot keycode
 * @param  {number} keycode
 * @param  {SwitchHotApp[]} hotApps
 * @returns SwitchHotApp
 */

export function whichHotApp(keycode: number, hotApps: SwitchHotApp[]): SwitchHotApp | null {
    let whichHotWindowToOpen = hotApps.filter(app => app.keycode == keycode);
    if (whichHotWindowToOpen.length == 0) return null;
    return whichHotWindowToOpen[0];
}

/**
 * Returns all processes that matches the specified path
 * @param  {string} path
 * @returns Window
 */
export function getAllProcessThatMatchPath(path: string) {
    let processes = windowManager.getWindows().filter(window => window.path == path);
    if (processes == null || processes.length == 0) return null;
    return processes;
}


/**
 * Returns all processes that matches the specified app name
 * @param  {string} name
 * @returns Window
 */

export function getAllProcessThatMatchAppName(name: string) {
    let processes = windowManager.getWindows().filter(window => window.getTitle().includes(name));
    if (processes == null || processes.length == 0) return null;
    return processes;
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
 * @param  {} hotProcesses
 */

export function MakeHotAppActive(hotProcesses) {
    for (let i = 0; i < hotProcesses.length; i++) {
        // Look for the first matched hot process that is a window
        if (hotProcesses[i].isWindow()) {
            console.log(hotProcesses);
            // Then bring the window to the top.
            hotProcesses[i].bringToTop();
            // if (Switch.ALWAYS_MAXIMIZE_WINDOW == 1) {
            // Maximize it
            hotProcesses[i].maximize();
            // }
            break;
        }
    }
}
/**
 * Opens a hotApp with the provided path
 * @param  {string} path
 */
export function openHotApp(path: string) {
    console.log('ppp', path);
    open(path);

}

/**
 * Debouncing enforces that a function not be called again until
 * a certain amount of time has passed without it being called
 * @param  {} callback
 * @param  {} wait
 * @param  {} immediate=false
 */
function debounce(callback, wait, immediate = false) {
    let timeout = null 
    
    return function() {
      const callNow = immediate && !timeout
      const next = () => callback.apply(this, arguments)
      
      clearTimeout(timeout)
      timeout = setTimeout(next, wait)
  
      if (callNow) {
        next()
      }
    }
  }