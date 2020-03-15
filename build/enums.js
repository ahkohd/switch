"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SWITCH;
(function (SWITCH) {
    SWITCH["VERSION"] = "0.0.1";
    SWITCH[SWITCH["ERROR_NOTI"] = 0] = "ERROR_NOTI";
    SWITCH[SWITCH["INFO_NOTI"] = 1] = "INFO_NOTI";
    SWITCH["NOTI_ICON"] = "";
    SWITCH["APP_PATH"] = "";
    SWITCH["LOG_INFO"] = "Info";
    SWITCH["LOG_ERROR"] = "Error";
    SWITCH["WINDOWS"] = "Windows_NT";
    SWITCH["SERVICE_LOGS"] = "SERVICE_LOGS";
    SWITCH["SENTRY_DNS"] = "https://57f0f5bf1422411ca17906d52bedb2ee@sentry.io/1541801";
    SWITCH["PROJECT_NAME"] = "SwitchService";
    SWITCH["PROJECT_PRIVATE_KEY"] = "..kta#md!@a-k2j";
})(SWITCH || (SWITCH = {}));
exports.default = SWITCH;
var IPC;
(function (IPC) {
    IPC["ID"] = "switch-service-channel";
    IPC["CLIENT_SENDS_MESSAGE"] = "switch-service-incoming";
    IPC["CLIENT_UPDATES_APP"] = "update-hot-apps";
    IPC["CLIENT_SENDS_PID"] = "client-pid";
    IPC["CLIENT_UPDATES_CONFIG"] = "config-update";
    IPC["CLIENT_REQUETS_SHOW_DOCK"] = "show-dock";
    IPC["SEND_MAKE_CLIENT_VISIBLE_REQUEST"] = "client-show";
    IPC["SEND_CONFIG_UPDATE_REQUEST"] = "config-update";
    IPC["SEND_LAST_SWITCHED_APP"] = "last-switched-app";
})(IPC = exports.IPC || (exports.IPC = {}));
//# sourceMappingURL=enums.js.map