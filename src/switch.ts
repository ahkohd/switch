import { 
    getHotApps,
    whichHotApp,
    getAllProcessThatMatchPath,
    switchMessage,
    clearCurrentWidow,
    MakeHotAppActive,
    getAllProcessThatMatchAppName,
    registerNotifierOnClick
 } from './utils';

import { SwitchHotApp } from './interfaces';
import TemplateText from './text';
import { Switch } from './enums';
const ioHook = require('iohook');

const hotapps: SwitchHotApp[] = getHotApps();
const alwaysMaximize = true;


/*
 * Fires when on user's keyup
 */

ioHook.on('keyup', event => {
    // If user holds the alt key
    if (event.altKey) {
        let hotApp = whichHotApp(event.keycode, hotapps);
        if (hotApp) {
            // If the hot app that match the keycode is found...
            // get all process that match hot app's path
            const processes = getAllProcessThatMatchAppName(hotApp.name);
            if (processes) {
                // Minimize current window
                clearCurrentWidow();
                // Make hotapp active
                MakeHotAppActive(processes);
            } else {
                switchMessage(Switch.ERROR_NOTI, { title: TemplateText.errorTitle, message: TemplateText.processNotFound(hotApp.name), hotApp: hotApp });
            }
        }
    }
});

// Register and start hook.
ioHook.start();

// Alternatively, pass true to start in DEBUG mode.
ioHook.start(true);

// Registers the on toast click event handler.
registerNotifierOnClick();