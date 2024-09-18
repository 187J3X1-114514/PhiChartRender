import { invoke } from '@tauri-apps/api/core'
import { WebviewWindow, getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import Cookies from 'js-cookie'
import { newLogger } from '../core/log'
export const ON_TAURI = (window as any).__TAURI__ != undefined
const log = newLogger("Tauri")
const topAppBar = document.getElementById("top-app-bar")!
const navigationDrawer = document.getElementById("navigation-drawer")!
const navigationRail = document.getElementById("navigation-rail")!
export const RUN_RS_FN = async (name: string, other?: any) => {
    await invoke(name, other)
}
export var MAINWINDOW_HWND = -114514
export enum BACKGROUND_STYLE {
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
    var HWND: number = await invoke("get_window_handle")
    log.info("主窗口句柄", HWND)
    MAINWINDOW_HWND = HWND
    await set_wa(38, 4)
    await main()
}

export async function set_wa(attribute: number, value: number) {
    return await invoke("set_wa", { hwnd: HWND, attribute: attribute, value: value })
}
export async function get_theme() {
    return await invoke("get_theme") as number
}

export async function main() {
    //Cookies.get("backgroundstyle")
    topAppBar.classList.add("tauri")
    navigationDrawer.classList.add("tauri")
    navigationRail.classList.add("tauri")
}
