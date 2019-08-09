const { windowManager } = require("node-window-manager");
console.log(windowManager.getWindows().filter(window => window.getTitle().toLowerCase().includes("notepad".split('.exe')[0].toLowerCase()) && window.path.toLowerCase() == "C:\\Windows\\System32\\notepad.exe".toLowerCase()));
//# sourceMappingURL=test.js.map