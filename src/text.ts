const TextTemplate = {
  errorTitle: "Yikes 🤔",
  processNotFound: name =>
    `It seems like ${
      name.split(".exe")[0]
    } is yet to be opened. Click to launch app! 🚀`,
  noHotApp: key =>
    `No hot app as been assigned to NUM ${key}, add one at the Switch dock! 👆 `
};

export default TextTemplate;

export enum TEXT {
  STARTED_IPC = "Started IPC channel",
  REQUEST_TO_UPDATE_CONFIG = "Receives request to update config",
  RECEIVES_CLIENT_ID = "Receives client PID",
  RECEIVES_GET_CONFIG = "Receives request to read configs",
  RECEIVES_SHOW_DOCK = "Show dock",
  UNABLE_MAKE_VISIBLE = "Unable to request to make client visible",
  UNABLE_START_SERVICE = "Fatal! Unable to start Switch Service IPC!",
  SWITCH_PREFIX = "Switch - ",
  SORTED_PROCESSES = "Sorted processes",
  UNABLE_TO_MINIMIZE = "Unable to minimize.",
  FOCUS_SWITCH = "FOCUSED SWITCH:",
  SWITCHED_HOTAPP = "Switched To ",
  CLIENT_PID_MSG_PREFIX = "CLIENT PID ::"
}
