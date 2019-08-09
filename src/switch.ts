import {
    whichHotApp,
    switchMessage,
    clearCurrentWidow,
    saveHotApps,
    MakeHotAppActive,
    getAllProcessThatMatchAppName,
    registerNotifierOnClick,
    minimizeCurrentWindow,
    getHotApps,
    makeClientActive,
} from './utils';

import { SwitchHotApp } from './interfaces';
import TemplateText from './text';
import { Switch } from './enums';
import { InterProcessChannel } from './interprocess';

const interChannel = new InterProcessChannel();
const ioHook = require('iohook');
const checkcaps = require('check-caps');
const secondKeyPressTimeout = 600;
let clientPID = null;


let hotapps: SwitchHotApp[] = getHotApps();

const useFnKey = true;
let timer = null;

/**
 * Called to activate hot app switching
 * @param  {} event
 */

function react(event) {
    let hotApp = whichHotApp(event.rawcode, hotapps);
    if (hotApp != null) {
        // If the hot app that match the rawcode is found...
        // get all process that match hot app's name and path
        let processes = getAllProcessThatMatchAppName(hotApp.name, hotApp.path);
        console.log('matched windows', processes);
        if (processes) {
            // Minimize current window
            minimizeCurrentWindow();
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
        console.log('(fn | r Alt) then  ', event.rawcode);
        clearTimeout(timer);
        timer = null;
        react(event);
    }
    if (event.rawcode == 255  || event.rawcode == 165) {
        // fn key is pressed
        if (timer != null) clearTimeout(timer);
        console.log('waiting for next key');
        makeClientActive(clientPID);
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

interChannel.emitter.on('update-hot-apps', (happs)=>{
    hotapps = happs;
    console.log(hotapps);
    console.log('[info] Hot apps update recived');
    saveHotApps(happs);
})


interChannel.emitter.on('client-pid', (pid)=>{
    clientPID = pid;
    console.log('[info] Hot client pid: '+pid);
})