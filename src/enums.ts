enum SWITCH {
  VERSION = "0.0.1",
  ERROR_NOTI = 0,
  INFO_NOTI = 1,
  NOTI_ICON = "",
  APP_PATH = "",
  LOG_INFO = "Info",
  LOG_ERROR = "Error",
  WINDOWS = "Windows_NT",
  SERVICE_LOGS = "SERVICE_LOGS",
  SENTRY_DNS = "https://57f0f5bf1422411ca17906d52bedb2ee@sentry.io/1541801",
  PROJECT_NAME = "SwitchService",
  PROJECT_PRIVATE_KEY = "..kta#md!@a-k2j"
}
export default SWITCH;

export enum IPC {
  ID = "switch-service-channel",
  CLIENT_SENDS_MESSAGE = "switch-service-incoming",
  CLIENT_UPDATES_APP = "update-hot-apps",
  CLIENT_SENDS_PID = "client-pid",
  CLIENT_UPDATES_CONFIG = "config-update",
  CLIENT_REQUETS_SHOW_DOCK = "show-dock",
  SEND_MAKE_CLIENT_VISIBLE_REQUEST = "client-show",
  SEND_CONFIG_UPDATE_REQUEST = "config-update",
  SEND_LAST_SWITCHED_APP = "last-switched-app"
}
