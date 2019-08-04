const { windowManager } = require("node-window-manager");
const ioHook = require('iohook');

// App name and shortcut keycodes..
const hotSwitches = [{
    name: 'Brave',
    keycode: 2,
}, {
    name: 'Code',
    keycode: 3,
}];

const alwaysMaximize = true;

ioHook.on('keyup', event => {
    // 1. When use holds the alt key
    if (event.altKey) {
        // 2. Find the app with the registered keycode that match the keycode the user just press
        let whichHotWindowToOpen = hotSwitches.filter(hot => hot.keycode == event.keycode);
        // 3. If found:
        if (whichHotWindowToOpen.length > 0) {
            // 4. We only use the first match
            whichHotWindowToOpen = whichHotWindowToOpen[0];
            try {
                // 5. Get all windows that matches the app title
                let windows = windowManager.getWindows().filter(window => window.getTitle().includes(whichHotWindowToOpen.name));
                // 6. If none is found exit the function
                if (windows == null) return
                // 7. If the current process is a window, minimize it.
                const currentWindow = windowManager.getActiveWindow();
                if (currentWindow.isWindow()) {
                    try {
                        currentWindow.minimize();
                    } catch (e) {}
                }
                // 8. Loop to the matched windows list an..
                for (let i = 0; i < windows.length; i++) {
                    // 9. Look for the first matched process that is a window
                    if (windows[i].isWindow()) {
                        console.log(whichHotWindowToOpen);
                        // 10. then bring the window to top.
                        windows[i].bringToTop();
                        if (alwaysMaximize) {
                            // 11. Maximize it
                            windows[i].maximize();
                        }
                        break;
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
    }
});

// Register and start hook
ioHook.start();

// Alternatively, pass true to start in DEBUG mode.
ioHook.start(true);