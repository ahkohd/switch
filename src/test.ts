const { windowManager } = require("node-window-manager");
const current = windowManager.getActiveWindow();
console.log(current);
current.minimize();
console.log('worked!');