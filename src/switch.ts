import {
    getHotApps,
    whichHotApp,
    switchMessage,
    clearCurrentWidow,
    MakeHotAppActive,
    getAllProcessThatMatchAppName,
    registerNotifierOnClick,
    minimizeCurrentWindow
} from './utils';

import { SwitchHotApp } from './interfaces';
import TemplateText from './text';
import { Switch } from './enums';
const ioHook = require('iohook');
const checkcaps = require('check-caps');
const secondKeyPressTimeout = 700;

const hotapps: SwitchHotApp[] = getHotApps();
const alwaysMaximize = true;
const useFnKey = true;
let timer = null;


/**
 * Called to activate hot app switching
 * @param  {} event
 */

function react(event) {
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

/**
 * This method activates hot app switch if user turns on caps key
 * or hold the alt key
 * @param  {} event
 */
function capsMethod(event) {
    // If caplocks on is react..
    if (checkcaps.status() || event.altKey) {
        react(event);
    }
}

/**
 * This methond activates hot app switch if user click (fn | r alt) key then the hot app code
 * and any key afterwards
 * @param  {} event
 */
function fnMethod(event) {
    // detects fn + key combo..
    if (timer != null) {
        console.log('(fn | r Alt) then  ', event.keycode);
        clearTimeout(timer);
        timer = null;
        react(event);
    }
    if (event.rawcode == 255  || event.keycode == 3640) {
        // fn key is pressed
        if (timer != null) clearTimeout(timer);
        console.log('waiting for next key');
        // hide current window
        minimizeCurrentWindow();
        timer = setTimeout(() => {
            console.log('timed out');
            clearTimeout(timer);
            timer = null;
        }, secondKeyPressTimeout);
    }
}

/*
 * Fires when on user's keyup
 */

ioHook.on('keyup', event => {
    // console.log(event);
    if (useFnKey) {
        // Fn or Right Alt key capture methohd.
        fnMethod(event);
    } else {
        // caps capture method.
        capsMethod(event);
    }
});

// Register and start hook.
ioHook.start();

// Alternatively, pass true to start in DEBUG mode.
ioHook.start(true);

// Registers the on toast click event handler.
registerNotifierOnClick();

console.log("SWICTH SERVICE");