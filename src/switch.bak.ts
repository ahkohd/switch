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
const checkcaps = require('check-caps');
const secondKeyPressTimeout = 1000;

const hotapps: SwitchHotApp[] = getHotApps();
const alwaysMaximize = true;
let timer = null;



/*
 * Fires when on user's keyup
 */

ioHook.on('keyup', event => {


    if(event.keycode == 0 && timer != null)
    {
        timer = setTimeout(()=>{}, secondKeyPressTimeout);
    } else {
        clearTimeout(timer);
        timer = null;
    }

    console.log(event);
    // If caplocks is on of user holds alt key
    if (checkcaps.status() || event.altKey) {
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