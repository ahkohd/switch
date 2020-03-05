import SWITCH from "./enums";

export interface SwitchNotiMessage {
  title: string;
  message: string;
  hotApp?: SwitchHotApp;
}

export interface ProcessMessage {
  type: string;
  data: any;
}

export interface SwitchHotApp {
  name: string;
  rawcode: number;
  path: string;
  pid: number;
}

export interface Settings {
  autoHide: boolean;
  maximize: boolean;
  placement: string;
  disableAltGr: boolean;
}
