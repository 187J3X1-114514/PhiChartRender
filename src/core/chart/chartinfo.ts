import { Texture } from "pixi.js"
import Audio from "../audio"
import Chart from "."
import { ResourceManager } from "../resource"
import * as yaml from 'js-yaml'
import { File } from "../file"
import * as StackBlur from 'stackblur-canvas';
import { PrprExtra } from "../prpr/prpr"
import { printImage } from "../utils"
import { GlobalSettings } from "../global_setting"

export interface PhiraChartInfo extends BaseChartInfo {
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
export interface BaseChartInfo {
    name: string
    music: string
    illustration: string
    chart: string
}
export interface RPEChartInfo extends BaseChartInfo {
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
    public dir: string = ""
    public resManager?: ResourceManager
    constructor(c: string, m: string, i: string, src: PhiraChartInfo | RPEChartInfo, p: PrprExtra = undefined as any) {
        this.chart = c
        this.illustration = i
        this.music = m
        this.src = src
        this.prpr = p
    }
    get(resMan: ResourceManager) {
        (resMan.get(this.chart) as Chart).rootPath = this.dir
        let c = resMan.get(this.chart) as Chart
        c.info = {
            name: this.src.name,
            artist: this.src.composer,
            author: this.src.charter,
            bgAuthor: "",
            difficult: this.src.level,
            md5: ""
        };
        let d = {
            chart: c,
            music: resMan.get(this.music) as Audio,
            illustration: resMan.get(this.illustration) as Texture,
            prpr: resMan.get(this.dir + '/' + "extra.json")
        } as any as ChartData
        if (!d.prpr) {
            d.prpr = PrprExtra.from({} as any)
        }
        return d

    }
    static async from(file: File, resManager: ResourceManager) {
        var data: any
        var t: ChartInfo
        switch (file.extension) {
            case "yml":
                data = (yaml.load(await file.async("text")) as PhiraChartInfo) as any
                t = new this(data.chart, data.music, data.illustration, data)
                t.resManager = resManager
                t.type = "phira"
                return t
            case "json":
                data = JSON.parse(await file.async("text"))
                if (data.formatVersion) {
                    return new this("", "", "", (undefined as unknown) as any)
                } else {
                    data = data.META
                }
                let newData = {
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
                t.resManager = resManager
                t.type = "rpe"
                return t
            case "txt":
                let _data = (await file.async("text")) as string
                let _txt_info = loadTxtChartInfo(_data) as any
                let _newData = {
                    RPEVersion: 100,
                    offset: 0,
                    ..._txt_info

                } as RPEChartInfo
                t = new this(_newData.chart, _newData.music, _newData.illustration, _newData)
                t.resManager = resManager
                t.type = "txt"
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
        const img = (this.resManager!.get(this.illustration) as Texture)._source.resource as ImageBitmap
        const c = document.createElement("canvas")
        const ctx = c.getContext("2d")!
        c.width = img.width
        c.height = img.height
        ctx.drawImage(img, 0, 0)
        StackBlur.canvasRGB(c, 0, 0, img.width, img.height, r)
        const newImg = Texture.from(await createImageBitmap(c, {
            resizeWidth: img.width * GlobalSettings.backgroundResolution!,
            resizeHeight: img.height * GlobalSettings.backgroundResolution!
        }))
        this.resManager!.files[this.illustration] = newImg
    }
}
function loadTxtChartInfo(str: string) {
    let list = str.split("\n")
    if (list[0].includes("#")) {
        let Data: RPEChartInfo = {} as any
        list.slice(1).forEach((line) => {
            try {
                let _ = line.split(":")
                let name = _[0].trim()
                let value = _[1].trim()
                switch (name) {
                    case 'Name':
                        Data.name = value
                        break
                    case 'Song':
                        Data.music = value
                        break
                    case 'Picture':
                        Data.illustration = value
                        break
                    case 'Chart':
                        Data.chart = value
                        break
                    case 'Level':
                        Data.level = value
                        break
                    case 'Composer':
                        Data.composer = value
                        break
                    case 'Charter':
                        Data.charter = value
                        break
                }
            } catch { }
        })
        return Data
    } else {
        printImage(0.5)
        throw "铺面信息格式错误"
    }
}

export interface ChartData {
    chart: Chart;
    music: Audio;
    illustration: Texture;
    prpr: PrprExtra;
}