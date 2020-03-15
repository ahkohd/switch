"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TextTemplate = {
    errorTitle: "Yikes 🤔",
    processNotFound: name => `It seems like ${name.split(".exe")[0]} is yet to be opened. Click to launch app! 🚀`,
    noHotApp: key => `No hot app as been assigned to NUM ${key}, add one at the Switch dock! 👆 `
};
exports.default = TextTemplate;
var TEXT;
(function (TEXT) {
    TEXT["STARTED_IPC"] = "Started IPC channel";
    TEXT["REQUEST_TO_UPDATE_CONFIG"] = "Receives request to update config";
    TEXT["RECEIVES_CLIENT_ID"] = "Receives client PID";
    TEXT["RECEIVES_GET_CONFIG"] = "Receives request to read configs";
    TEXT["RECEIVES_SHOW_DOCK"] = "Show dock";
    TEXT["UNABLE_MAKE_VISIBLE"] = "Unable to request to make client visible";
    TEXT["UNABLE_START_SERVICE"] = "Fatal! Unable to start Switch Service IPC!";
    TEXT["SWITCH_PREFIX"] = "Switch - ";
    TEXT["SORTED_PROCESSES"] = "Sorted processes";
    TEXT["UNABLE_TO_MINIMIZE"] = "Unable to minimize.";
    TEXT["FOCUS_SWITCH"] = "FOCUSED SWITCH:";
    TEXT["SWITCHED_HOTAPP"] = "Switched To ";
    TEXT["CLIENT_PID_MSG_PREFIX"] = "CLIENT PID ::";
})(TEXT = exports.TEXT || (exports.TEXT = {}));
//# sourceMappingURL=text.js.map