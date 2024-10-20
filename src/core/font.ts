import { getOrCreateCacheDATA } from "../ui/data"

export const fontPath = "/assets/font/font.woff2"
export const fontPathPhi = "/assets/font/font_phi.woff2"
export const emojiFontPath = "/assets/font/emoji.woff2"
export const OutGameFontName = "Font,phi"
export const InGameFontName = "phi,Font"

const emojiFont = new FontFace("Fluent UI Emoji Flat", await (await getOrCreateCacheDATA(emojiFontPath)).arrayBuffer(), {
    display: "swap",
    style: "normal",
    weight: "normal"
});
const phiFont = new FontFace("phi", await (await getOrCreateCacheDATA(fontPathPhi)).arrayBuffer());
const pageFont = new FontFace("Font", await (await getOrCreateCacheDATA(fontPath)).arrayBuffer(),);
document.fonts.add(emojiFont);
document.fonts.add(phiFont);
document.fonts.add(pageFont);
emojiFont.load();
phiFont.load();
pageFont.load();

export const loadFont = async () => {
    return await new Promise((r) => {
        document.fonts.ready.then(() => {
            r(null)
        });
    })
}


