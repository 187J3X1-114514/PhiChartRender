import FontFaceObserver from 'fontfaceobserver';
export const fontPath = "assets/font/font.woff"
export const fontName = "Font"
const style =
    `
@font-face {
    font-family: ${fontName};
    src: url('${fontPath}');
}
`
const styleEl = document.createElement("style")
styleEl.innerHTML = style
document.head.appendChild(styleEl)
export const fontFaceObservernew = new FontFaceObserver(fontName)
export const loadFont = async () => { await fontFaceObservernew.load(null, 30000) }
