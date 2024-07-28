import { invoke } from '@tauri-apps/api/core'
import { WebviewWindow, getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import Cookies from 'js-cookie'
import { newLogger } from '../core/log'
export const ON_TAURI = (window as any).__TAURI__ != undefined
const log = newLogger("Tauri")
export enum BACKGROUND_STYLE{
    AUTO,
    NONE,
    MICA,
    ACRYLIC,
    MICAALT,
    COLOR
}
if (ON_TAURI) {
    const appWindow = getCurrentWebviewWindow()
    document.documentElement.classList.add("transparent")
    var HWND = await invoke("get_window_handle")
    appWindow.maximize()
    log.info("主窗口句柄",HWND)
}

export async function set_wa(attribute: number, value: number) {
    return await invoke("set_wa", { hwnd: HWND, attribute: attribute, value: value })
}



export async function main() {
    Cookies.get("backgroundstyle")
}
