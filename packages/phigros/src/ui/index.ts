import { VERSION } from "pixi.js";
import { PACKAGE_JSON, GIT_HASH, BUILD_ENV, BUILDTIME } from "./env";

export async function reqFullSc() {
    try {
        if (document.fullscreenElement == null) {
            document.documentElement.requestFullscreen({
                navigationUI: "hide"
            })
        }
    } catch {
        return false
    }
    function getOppositeOrientation() {
        return screen
            .orientation
            .type
            .startsWith("portrait") ? "landscape" : "portrait";
    }
    if (getOppositeOrientation() == "landscape") { //怪了
        (screen as any).orientation.lock("landscape")
    }
}
export const APP = document.getElementById("app") as HTMLDivElement
export const version = `V${PACKAGE_JSON.version.split('v').pop()}-${GIT_HASH.slice(0,7).toLocaleUpperCase()}+pixi_${VERSION}@${BUILD_ENV.platform}/${BUILD_ENV.arch}/node${BUILD_ENV.versions.node}@BUILDTIME_${BUILDTIME}`