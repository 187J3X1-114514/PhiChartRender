import { Texture } from "pixi.js"

export async function blurImage(img: Texture, callback: (a: Texture) => any, r: number = 7) {
    let tc = document.createElement("canvas")
    let c = tc.getContext("2d")!
    c.fillStyle = "blur("+r+"px)"
    c.drawImage((img.baseTexture.resource as any).source, 0, 0)
    let a = Texture.from(await createImageBitmap(tc))
    callback(a)
    return a
}