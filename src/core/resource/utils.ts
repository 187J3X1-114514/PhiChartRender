import * as pixi from 'pixi.js'
import { File } from "../file"
export async function loadTextures(src: string | HTMLImageElement | File): Promise<pixi.Texture> {
    if (src instanceof HTMLImageElement) {
        return await pixi.Assets.load({
            src: src.src,
            format: src.src.includes('.') ? src.src.split(".")[src.src.split(".").length - 1] : undefined,
            loadParser: 'loadTextures'
        })
    } else if (src instanceof File) {
        return await pixi.Assets.load({
            src: URL.createObjectURL(await src.getBlob()),
            format: src.name.split(".")[src.name.split(".").length - 1],
            loadParser: 'loadTextures'
        })
    } else if (typeof src === 'string') {
        return await pixi.Assets.load({
            src: src,
            format: src.split(".")[src.split(".").length - 1],
            loadParser: 'loadTextures'
        })
    } else {
        return await pixi.Assets.load("")
    }
}
export async function loadText(file:File){
    return await (await file.getBlob()).text()
}