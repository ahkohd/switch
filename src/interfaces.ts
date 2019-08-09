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
    rawcode: number,
    path: string,
    pid: number
}