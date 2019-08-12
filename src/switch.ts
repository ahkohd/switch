import {
    whichHotApp,
    switchMessage,
    saveHotApps,
    MakeHotAppActive,
    getAllProcessThatMatchAppName,
    registerNotifierOnClick,
    minimizeCurrentWindow,
    getHotApps,
    saveConfig,
    getConfig,
} from './utils';

import { SwitchHotApp } from './interfaces';
import TemplateText from './text';
import { Switch } from './enums';
import { InterProcessChannel } from './interprocess';

const interChannel = new InterProcessChannel();
const ioHook = require('iohook');

let clientPID = null;
let hotapps: SwitchHotApp[] = getHotApps();
let config = getConfig();

/**
 * Called to activate hot app switching
 * @param  {} event
 */
function react(event) {

    let hotApp = whichHotApp(event.rawcode, hotapps);
    if (hotApp != null) {
        // Minimize current window
        minimizeCurrentWindow();
        // If the hot app that match the rawcode is found...
        // get all process that match hot app's name and path
        let processes = getAllProcessThatMatchAppName(hotApp.name, hotApp.path);
        console.log('matched windows', processes);
        if (processes) {
            // minimizeCurrentWindow();
            // Make hotapp active
            MakeHotAppActive(processes, config.maximize);
            interChannel.sendlastSwitched(hotApp);
        } else {
            switchMessage(Switch.ERROR_NOTI, { title: TemplateText.errorTitle, message: TemplateText.processNotFound(hotApp.name), hotApp: hotApp });
        }
    } else {
        // if not hot app found make the client active..
        if (event.rawcode >= 48 && event.rawcode <= 58) {
            interChannel.sendShowClient();
            switchMessage(Switch.ERROR_NOTI, { title: TemplateText.errorTitle, message: TemplateText.noHotApp(event.rawcode - 48), hotApp: hotApp });
        }

    }
}

/**
 * Activates hot app switch if user holds the alt key
 * @param  {} event
 */
function fnMethod(event) {
    if (event.altKey) {
        react(event);
    }
}

/**
 * Fires on user's keyup
 */
ioHook.on('keyup', event => {
    fnMethod(event);
});

/**
 * Fires on user's keydown
 */
ioHook.on('keydown', event => {
    if (event.altKey) {
        // If alt key is pressed, show dock
        interChannel.sendShowClient();
    }
});

// Register and start hook.
ioHook.start();

// Alternatively, pass true to start in DEBUG mode.
ioHook.start(true);

// Registers the on toast click event handler.
registerNotifierOnClick();
 
/**
 * Fires when hot apps list 
 * update is recieved from client
 */
interChannel.emitter.on('update-hot-apps', (happs) => {
    hotapps = happs;
    console.log(hotapps);
    console.log('[info] Hot apps update recived');
    saveHotApps(happs);
});

/**
 * Fires when config 
 * update is recieved from client
 */
interChannel.emitter.on('config-update', (settings) => {
    console.log('[info] Config update recieved.', settings);
    config = settings;
    saveConfig(settings);
});

/**
 * Fires when docks PID
 * update is recieved from client
 */
interChannel.emitter.on('client-pid', (pid) => {
    clientPID = pid;
    console.log('[info] Hot client pid: ' + pid);
});