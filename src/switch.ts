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
    checkDevMode,
    switchLog,
    bingSwitchToFocus
} from './utils';

import { SwitchHotApp, Settings } from './interfaces';
import TemplateText from './text';
import { Switch } from './enums';
import { InterProcessChannel } from './interprocess';

const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'https://57f0f5bf1422411ca17906d52bedb2ee@sentry.io/1541801' });

const interChannel = new InterProcessChannel();
const ioHook = require('iohook');

let clientPID = null;
let hotapps: SwitchHotApp[] = getHotApps();
let config = getConfig();
const log = switchLog.bind({isDevMode: checkDevMode()});
let disableKeyUpListen = false;
let disableKeyUpListenTimeout;

/**
 * Called to activate hot app switching
 * @param  {} event
 */
function react(event) {
    let hotApp = whichHotApp((process.platform == "darwin" ? event.keycode : event.rawcode), hotapps);
    if (hotApp != null) {
        // Minimize current window
        minimizeCurrentWindow();
        // If the hot app that match the rawcode is found...
        // get all process that match hot app's name and path
        let processes = getAllProcessThatMatchAppName(hotApp.name, hotApp.path);
        // log(Switch.LOG_INFO, 'matched windows', processes);
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
    
        if(process.platform == 'darwin')
        {
            if (event.keycode >= 0 && event.keycode <= 9) {
                interChannel.sendShowClient();
                switchMessage(Switch.ERROR_NOTI, { title: TemplateText.errorTitle, message: TemplateText.noHotApp(event.keycode -1), hotApp: hotApp });
            }
        } else {
            if (event.rawcode >= 48 && event.rawcode <= 58) {
                interChannel.sendShowClient();
                switchMessage(Switch.ERROR_NOTI, { title: TemplateText.errorTitle, message: TemplateText.noHotApp(event.rawcode - 48), hotApp: hotApp });
            }
        }


    }
}

/**
 * Activates hot app switch if user holds the alt key
 * @param  {} event
 */
function fnMethod(event) {
    // if altgr is disabled do not switch...

    if (event.altKey) {
        react(event);
    }
}

/**
 * Fires on user's keyup
 */

 ioHook.on('keyup', event => {
    // if altgr is disabled do not show dock...
    if (disableKeyUpListen && event.rawcode != 164) {
        if(disableKeyUpListenTimeout) clearTimeout(disableKeyUpListenTimeout);
        disableKeyUpListenTimeout = setTimeout(() => {
            clearTimeout(disableKeyUpListenTimeout)
            disableKeyUpListen = false;
           }, 1000);
        return;
    };
    fnMethod(event);
});


/**
 * Fires on user's keydown
 */
ioHook.on('keydown', event => {
    if (event.altKey) {
        // focus on swicth to prevent keystokes entering other apps..
        bingSwitchToFocus(clientPID);
        // If alt key is pressed, show dock
        // if altgr is disabled do not show...
        if(config.disableAltGr && event.rawcode == 165) {
            disableKeyUpListen = true;
            return;
        }
        interChannel.sendShowClient();
    }
});

// Register and start hook.
(checkDevMode()) ? ioHook.start(true) : ioHook.start();

// Registers the on toast click event handler.
registerNotifierOnClick();
 
/**
 * Fires when hot apps list 
 * update is recieved from client
 */
interChannel.emitter.on('update-hot-apps', (happs) => {
    hotapps = happs;
    log(Switch.LOG_INFO, 'Hot apps update received', hotapps);
    saveHotApps(happs);
});

/**
 * Fires when config 
 * update is recieved from client
 */
interChannel.emitter.on('config-update', (settings: Settings) => {
    log(Switch.LOG_INFO, 'Config update update received', settings);
    config = settings;
    saveConfig(settings);
});

/**
 * Fires when docks PID
 * update is recieved from client
 */
interChannel.emitter.on('client-pid', (pid) => {
    clientPID = pid;
    log(Switch.LOG_INFO, 'Hot client pid ::', pid);
});