
import * as t from "io-ts"
import * as pixi from 'pixi.js'
import Audio from '../audio/index'
import { Zip } from "../file"
import { loadTextures } from "./utils"
import { newLogger } from "../log"
import { STATUS } from "../../ui/status"
const log = newLogger("Resource Pack")
export interface ResourcePackInfo {
    hitFx: {
        width: number
        height: number
        image: string
        color: {
            perfect: string
            good: string
        }
    }
    holdAtlas: number[] //end，head
    holdAtlasMH: number[] //end，head
    note: {
        tap: string[]
        drag: string[]
        hold: string[]
        flick: string[]
    }
    judgeLine: {
        ap: string
        fc: string
        image: string
    }
    sound: {
        tap: string
        drag: string
        hold: string
        flick: string
    }
}
const ResourcePackInfoSchema = t.type({
    hitFx: t.type({
        width: t.number,
        height: t.number,
        image: t.string,
        color: t.type({
            perfect: t.string,
            good: t.string,
        })
    }),
    holdAtlas: t.array(t.number),
    holdAtlasMH: t.array(t.number),
    note: t.type({
        tap: t.array(t.string),
        drag: t.array(t.string),
        hold: t.array(t.string),
        flick: t.array(t.string)
    }),
    judgeLine: t.type({
        ap: t.string,
        fc: t.string,
        image: t.string
    }),
    sound: t.type({
        tap: t.string,
        drag: t.string,
        hold: t.string,
        flick: t.string
    })

})

export interface PhiAssets {
    hitFx: pixi.Texture[]
    note: {
        hold: {
            head: pixi.Texture
            body: pixi.Texture
            end: pixi.Texture
        }
        holdMH: {
            head: pixi.Texture
            body: pixi.Texture
            end: pixi.Texture
        }
        tapMH: pixi.Texture
        dragMH: pixi.Texture
        flickMH: pixi.Texture
        tap: pixi.Texture
        drag: pixi.Texture
        flick: pixi.Texture
    }
    judgeLine: pixi.Texture

    sound: {
        tap: Audio
        drag: Audio
        hold: Audio
        flick: Audio
    }
    __src_sound: {
        tap: Blob
        drag: Blob
        hold: Blob
        flick: Blob
    }
}

export class ResourcePackInfo {
    public hitFx: {
        width: number
        height: number
        image: string
        color: {
            perfect: string
            good: string
        }
    }
    public holdAtlas: number[]
    public holdAtlasMH: number[]
    public note: {
        tap: string[]
        drag: string[]
        hold: string[]
        flick: string[]
    }
    public judgeLine: {
        ap: string
        fc: string
        image: string
    }
    public sound: {
        tap: string
        drag: string
        hold: string
        flick: string
    }

    private constructor(
        hitFx: any,
        holdAtlas: any,
        holdAtlasMH: any,
        note: any,
        judgeLine: any,
        sound: any
    ) {
        this.hitFx = hitFx
        this.holdAtlas = holdAtlas
        this.holdAtlasMH = holdAtlasMH
        this.note = note
        this.judgeLine = judgeLine
        this.sound = sound
    }

    public static from(data: any): ResourcePackInfo {
        const json = data
        const result = ResourcePackInfoSchema.decode(json)
        if (result._tag == "Right") {
            return new ResourcePackInfo(
                json.hitFx,
                json.holdAtlas,
                json.holdAtlasMH,
                json.note,
                json.judgeLine,
                json.sound
            )
        } else {
            log.error("资源包信息解析失败 -> ", json)
            throw new Error("资源包信息解析失败")
        }

    }
}

export class ResourcePack {
    public info: ResourcePackInfo
    public Assets: PhiAssets
    private constructor(d: ResourcePackInfo, a: PhiAssets) {
        this.info = d
        this.Assets = a
    }
    static async load(zip: Zip) {
        const data = JSON.parse(await (await zip.get("info.json")!.getBlob()).text())
        const info = ResourcePackInfo.from(data)
        log.info('开始加载资源包 -> ' + zip.name)
        var texture
        var textureBase
        STATUS.setStatusInfo("hold")
        texture = await loadTextures(zip.get(info.note.hold[0])!)
        const rectangleholdE = new pixi.Rectangle(0, 0, texture.width, info.holdAtlas[0]);
        const holdE = new pixi.Texture({
            source: texture.source, frame: rectangleholdE
        })
        const rectangleholdH = new pixi.Rectangle(0, texture.height - info.holdAtlas[0], texture.width, info.holdAtlas[1]);
        const holdH = new pixi.Texture({
            source: texture.source, frame: rectangleholdH
        })
        const rectangleholdB = new pixi.Rectangle(0, info.holdAtlas[0], texture.width, texture.height - (info.holdAtlas[0] + info.holdAtlas[1]));
        const holdB = new pixi.Texture({
            source: texture.source, frame: rectangleholdB
        })
        log.info('hold(无多押)音符加载完成')
        texture = await loadTextures(zip.get(info.note.hold[1])!)
        const rectangleholdMHE = new pixi.Rectangle(0, 0, texture.width, info.holdAtlasMH[0]);
        const holdMHE = new pixi.Texture({
            source: texture.source, frame: rectangleholdMHE
        })
        const rectangleholdMHH = new pixi.Rectangle(0, texture.height - info.holdAtlasMH[0], texture.width, info.holdAtlasMH[1]);
        const holdMHH = new pixi.Texture({
            source: texture.source, frame: rectangleholdMHH
        })
        const rectangleholdMHB = new pixi.Rectangle(0, info.holdAtlasMH[0], texture.width, texture.height - (info.holdAtlasMH[0] + info.holdAtlasMH[1]));
        const holdMHB = new pixi.Texture({
            source: texture.source, frame: rectangleholdMHB
        })
        log.info('hold(有多押)音符加载完成')

        STATUS.setStatusInfo("judgeLine")
        texture = await createImageBitmap(await zip.get(info.judgeLine.image)?.getBlob()!)
        const judgeLine = pixi.Texture.from(texture)
        log.info('判定线加载完成')

        STATUS.setStatusInfo("note")
        const note = {
            hold: {
                head: holdH,
                body: holdB,
                end: holdE,
            },
            holdMH: {
                head: holdMHH,
                body: holdMHB,
                end: holdMHE,
            },
            tapMH: await loadTextures(zip.get(info.note.tap[1])!),
            dragMH: await loadTextures(zip.get(info.note.drag[1])!),
            flickMH: await loadTextures(zip.get(info.note.flick[1])!),
            tap: await loadTextures(zip.get(info.note.tap[0])!),
            drag: await loadTextures(zip.get(info.note.drag[0])!),
            flick: await loadTextures(zip.get(info.note.flick[0])!)
        }
        log.info('所有Note加载完成')

        STATUS.setStatusInfo("sound")
        const __src_noteSound = {
            tap: (await zip.get(info.sound.tap!)?.getBlob())!,
            drag: (await zip.get(info.sound.drag!)?.getBlob())!,
            flick: (await zip.get(info.sound.flick!)?.getBlob())!,
            hold: (await zip.get(info.sound.hold!)?.getBlob())!
        }
        const noteSound = {
            tap: await Audio.from(await __src_noteSound.tap.arrayBuffer()),
            drag: await Audio.from(await __src_noteSound.drag.arrayBuffer()),
            flick: await Audio.from(await __src_noteSound.flick.arrayBuffer()),
            hold: await Audio.from(await __src_noteSound.hold.arrayBuffer())
        }

        log.info('音效加载完成')

        STATUS.setStatusInfo("hitEffect")
        let HitFxW
        let HitFxH
        var textureList = []
        textureBase = pixi.Texture.from(await createImageBitmap(await zip.get(info.hitFx.image)!.getBlob()))
        HitFxW = textureBase.width / info.hitFx.width
        HitFxH = textureBase.height / info.hitFx.height
        for (let indexH = 0; indexH < info.hitFx.height; indexH++) {
            for (let indexW = 0; indexW < info.hitFx.width; indexW++) {
                let rectangleHitFxTex = new pixi.Rectangle(HitFxW * indexW, HitFxH * indexH, HitFxW, HitFxH)
                textureList.push(new pixi.Texture({
                    source: textureBase.source,
                    frame: rectangleHitFxTex
                }
                ))
            }
        }
        log.info('打击效果加载完成')
        const assets = {
            judgeLine: judgeLine, note: note, sound: noteSound, hitFx: textureList, __src_sound: __src_noteSound
        } as PhiAssets
        log.info('资源包 -> ' + zip.name + ' 加载完成')
        return new this(info, assets)
    }
}
