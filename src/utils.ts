import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
export const mainWebview = WebviewWindow.getByLabel('main')!
mainWebview.setFullscreen(false)
export function isWeb() {
    return ((window as any).__TAURI_INTERNALS__) ? true : false
}
export const launchFullscreen = () => {
    const element = document.documentElement
    if (element?.requestFullscreen) {
        element?.requestFullscreen()
    } else if ((element as any)?.mozRequestFullScreen) {
        (element as any)?.mozRequestFullScreen()
    } else if ((element as any)?.webkitRequestFullscreen) {
        (element as any)?.webkitRequestFullscreen()
    } else if ((element as any)?.msRequestFullscreen) {
        (element as any)?.msRequestFullscreen()
    }
    mainWebview.setFullscreen(true)
}

export const exitFullscreen = () => {
    if (document?.exitFullscreen) {
        document?.exitFullscreen()
    } else if ((document as any)?.mozCancelFullScreen) {
        (document as any)?.mozCancelFullScreen()
    } else if ((document as any)?.webkitExitFullscreen) {
        (document as any)?.webkitExitFullscreen()
    }
    mainWebview.setFullscreen(false)
}
export const isFullscreen = () => {
    return document.fullscreenElement !== null

}
export const updataFullscreen = (e?: boolean) => {
    if (isFullscreen()) {
        (e != undefined ? (e ? launchFullscreen : exitFullscreen) : exitFullscreen)()
    } else {
        (e != undefined ? (e ? launchFullscreen : exitFullscreen) : launchFullscreen)()
    }
}

export function openFilePicker(fn: (c: FileList | null, a: HTMLInputElement, b: Event) => any, accept?: string, multiple?: boolean) {
    const inpEle = document.createElement("input");
    inpEle.id = `__file_${Math.trunc(Math.random() * 100000)}`;
    inpEle.type = "file";
    inpEle.style.display = "none";
    // 文件类型限制
    accept && (inpEle.accept = accept);
    // 多选限制
    multiple && (inpEle.multiple = multiple);
    inpEle.addEventListener("change", event => fn(inpEle.files, inpEle, event), { once: true });
    inpEle.click();
}