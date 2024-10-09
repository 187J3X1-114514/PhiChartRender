export const fontPath = "assets/font/font.woff"
export const fontPathPhi = "assets/font/font_phi.woff"
export const OutGameFontName = "Font,phi"
export const InGameFontName = "phi,Font"

const emojiFont = new FontFace("Fluent UI Emoji Flat", "url(assets/font/emoji.woff2)",{
    display:"swap",
    style:"normal",
    weight:"normal"
});
const phiFont = new FontFace("phi", `url("${fontPathPhi}2")`,);
const pageFont = new FontFace("Font", `url("${fontPath}2")`,);
document.fonts.add(emojiFont);
document.fonts.add(phiFont);
document.fonts.add(pageFont);
emojiFont.load();
phiFont.load();
pageFont.load();

export const loadFont = async () => {
    return await new Promise((r)=>{
        document.fonts.ready.then(() => {
            r(null)
        });
    })
}


