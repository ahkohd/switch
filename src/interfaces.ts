import  { Switch } from './enums';

export interface SwitchNotiMessage
{
    title: string,
    message: string,
    hotApp?: SwitchHotApp
}


export interface SwitchHotApp
{
    name: string,
    keycode: number,
    path: string
}