import { Texture } from "pixi.js"
import WAudio from "../audio"
import Chart from "."
import { ResourceManger } from "../resource"
import * as yaml from 'js-yaml'
import { File } from "../file"
import * as StackBlur from 'stackblur-canvas';
import { PrprExtra } from "../prpr/prpr"

interface PhiraChartInfo extends BaseChartInfo {
    id: number
    uploader: number
    difficulty: number
    level: string
    charter: string
    composer: string
    format: string
    illustration: string
    previewStart: number
    previewEnd: number
    aspectRatio: number
    backgroundDim: number
    lineLength: number
    offset: number
    tip: string
    tags: string[]
    intro: string
    holdPartialCover: boolean
    created: Date
    updated: Date
    chartUpdated: Date
}
interface BaseChartInfo {
    name: string
    music: string
    illustration: string
    chart: string
}
interface RPEChartInfo extends BaseChartInfo {
    RPEVersion: number
    charter: string
    composer: string
    level: string
    offset: number
}

export class ChartInfo {
    public illustration: string
    public music: string
    public chart: string
    public prpr: PrprExtra
    public src: PhiraChartInfo | RPEChartInfo
    public type: string = "rpe"
    private dir: string = ""
    private resManger?: ResourceManger
    private constructor(c: string, m: string, i: string, src: PhiraChartInfo | RPEChartInfo, p: PrprExtra = undefined as any) {
        this.chart = c
        this.illustration = i
        this.music = m
        this.src = src
        this.prpr = p
    }
    get(resMan: ResourceManger) {
        (resMan.get(this.chart) as Chart).rootPath = this.dir
        return {
            chart: resMan.get(this.chart) as Chart,
            music: resMan.get(this.music) as WAudio,
            illustration: resMan.get(this.illustration) as Texture,
            prpr: resMan.get(this.dir + '/' + "extra.json")
        }

    }
    static async from(file: File, resManger: ResourceManger) {
        var data: any
        var t: ChartInfo
        switch (file.extension) {
            case "yml":
                data = (yaml.load(await file.async("text")) as PhiraChartInfo) as any
                t = new this(data.chart, data.music, data.illustration, data)
                t.resManger = resManger
                t.type = "phira"
                return t
            case "json":
                data = JSON.parse(await file.async("text")).META
                const newData = {
                    RPEVersion: data.RPEVersion,
                    charter: data.charter,
                    composer: data.composer,
                    level: data.level,
                    offset: data.offset,
                    name: data.name,
                    music: data.song,
                    illustration: data.background,
                    chart: file.name,
                } as RPEChartInfo
                t = new this(newData.chart, newData.music, newData.illustration, newData)
                t.resManger = resManger
                t.type = "rpe"
                return t
            default:
                return new this("", "", "", (undefined as unknown) as any)
        }
    }
    setRoot(path: string) {
        if (!this.chart.startsWith(path)) this.chart = path + "/" + this.chart
        if (!this.illustration.startsWith(path)) this.illustration = path + "/" + this.illustration
        if (!this.music.startsWith(path)) this.music = path + "/" + this.music
        this.dir = path
    }
    async blur(r: number) {
        const img = (this.resManger!.get(this.illustration) as Texture)._source.resource as ImageBitmap
        const c = document.createElement("canvas")
        const ctx = c.getContext("2d")!
        c.width = img.width
        c.height = img.height
        ctx.drawImage(img,0,0)
        StackBlur.canvasRGB(c,0,0,img.width,img.height,r)
        const newImg = Texture.from(await createImageBitmap(c))
        this.resManger!.files[this.illustration] = newImg
    }
}