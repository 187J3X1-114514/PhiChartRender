import { invoke } from '@tauri-apps/api/core'
import { getCurrentWebviewWindow, WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { newLogger } from '../core/log'
import { platform } from '@tauri-apps/plugin-os';
export const ON_TAURI = (window as any).__TAURI_INTERNALS__ != undefined
export const log = newLogger("Tauri")
export const OS_NAME = ON_TAURI ? platform() : "web"
export const ON_WINDOWS = OS_NAME == "windows"
export const ON_LINUX = OS_NAME == "linux"
export const ON_MACOS = OS_NAME == "macos"
export const ON_ANDROID = OS_NAME == "android"
export const ON_IOS = OS_NAME == "ios"
export const ON_MOBILE = ON_ANDROID || ON_IOS
export const ON_PC = ON_WINDOWS || ON_LINUX || ON_MACOS
export var appWindow: WebviewWindow
//const topAppBar = document.getElementById("top-app-bar")!
//const navigationDrawer = document.getElementById("navigation-drawer")!
//const navigationRail = document.getElementById("navigation-rail")!
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
    appWindow = getCurrentWebviewWindow();
    (window as any).appWindow = appWindow
    await main()
}

export async function set_wa(attribute: number, value: number) {
    if (!ON_WINDOWS || !ON_TAURI) return
    return await invoke("set_wa", { hwnd: MAINWINDOW_HWND, attribute: attribute, value: value })
}
export async function set_theme(value: number) {
    if (!ON_WINDOWS || !ON_TAURI) return
    return await RUN_RS_FN("set_theme", { hwnd: MAINWINDOW_HWND, mode: value })
}
export async function get_theme() {
    if (!ON_WINDOWS || !ON_TAURI) return
    return await invoke("get_theme") as number
}

export async function main() {
    if (ON_WINDOWS) {
        document.documentElement.classList.add("transparent")
        var HWND: number = await invoke("get_window_handle")
        log.info("主窗口句柄", HWND)
        MAINWINDOW_HWND = HWND
        await set_wa(38, 4)
        await appWindow.setDecorations(true)
        await appWindow.setDecorations(false)
    }
}

export function rgb2ColorRef(rgb: number = 0) {
    const r = (rgb >> 16) & 0xFF;
    const g = (rgb >> 8) & 0xFF;
    const b = rgb & 0xFF;

    return ((b & 0xFF) << 16) | ((g & 0xFF) << 8) | (r & 0xFF);
}