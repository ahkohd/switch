const { windowManager } = require("node-window-manager");

const windows = windowManager.getWindows();
console.log(windows);