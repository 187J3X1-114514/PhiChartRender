import { getOrCreateCacheDATA } from "../ui/data"
import { STATUS } from "../ui/status";

export const fontPath = "/assets/font/font.woff2"
export const fontPathPhi = "/assets/font/font_phi.woff2"
export const emojiFontPath = "/assets/font/emoji.woff2"
export const OutGameFontName = "Font,phi"
export const InGameFontName = "phi,Font"
/////////////////////
STATUS.setStatusInfo(emojiFontPath)
const emojiFont = new FontFace("Fluent UI Emoji Flat", await (await getOrCreateCacheDATA(emojiFontPath)).arrayBuffer(), {
    display: "swap",
    style: "normal",
    weight: "normal"
});
document.fonts.add(emojiFont);
emojiFont.load();
/////////////////////
STATUS.setStatusInfo(fontPathPhi)
const phiFont = new FontFace("phi", await (await getOrCreateCacheDATA(fontPathPhi)).arrayBuffer());
document.fonts.add(phiFont);
phiFont.load();
/////////////////////
STATUS.setStatusInfo(fontPath)
const pageFont = new FontFace("Font", await (await getOrCreateCacheDATA(fontPath)).arrayBuffer(),);
document.fonts.add(pageFont);
pageFont.load();
/////////////////////

export const loadFont = async () => {
    return await new Promise((r) => {
        document.fonts.ready.then(() => {
            r(null)
        });
    })
}


