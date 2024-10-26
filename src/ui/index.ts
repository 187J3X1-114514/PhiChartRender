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