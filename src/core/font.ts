import FontFaceObserver from 'fontfaceobserver';
export const fontPath = "assets/font/font.woff"
export const fontPathPhi = "assets/font/font_phi.woff"
export const OutGameFontName = "Font,phi"
export const InGameFontName = "phi,Font"
const style =
    `
@font-face {
    font-family: Font;
    src:
        url("${fontPath}2") format("woff2"),

}
@font-face {
    font-family: phi;
    src:
        url("${fontPathPhi}2") format("woff2"),
}
@font-face {
  font-display: swap;
  font-family: 'Fluent UI Emoji Flat';
  font-style: normal;
  font-weight: normal;
  src: url('assets/font/emoji.woff2') format('woff2');
}

`
const styleEl = document.createElement("style")
styleEl.innerHTML = style
document.head.appendChild(styleEl)
export const fontFaceObservernew = new FontFaceObserver("Font")
export const loadFont = async () => { await fontFaceObservernew.load(null, 3000000) }
await loadFont()
const mFaceObservernew = new FontFaceObserver("Material Icons")
await mFaceObservernew.load(null, 3000000)
const eFaceObservernew = new FontFaceObserver("Fluent UI Emoji Flat")
await eFaceObservernew.load(null, 3000000)


