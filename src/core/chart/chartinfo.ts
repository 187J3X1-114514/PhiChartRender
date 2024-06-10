import { Texture } from "pixi.js"
import WAudio from "../audio"
import Chart from "."
import { ResourceManger } from "../resource"
import * as yaml from 'js-yaml'
import { File } from "../file"
import Effect from "../effect"

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
    public prpr: Effect[]
    public src: PhiraChartInfo | RPEChartInfo
    public type:string = "rpe"
    private dir: string = ""
    private constructor(c: string, m: string, i: string, src: PhiraChartInfo | RPEChartInfo, p: Effect[] = []) {
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
    static async from(file: File) {
        const data = yaml.load(await file.async("text")) as PhiraChartInfo
        return new this(data.chart, data.music, data.illustration, data)
    }
    static async fromYAML(file: File) {
        const data = yaml.load(await file.async("text")) as PhiraChartInfo
        let t = new this(data.chart, data.music, data.illustration, data)
        t.type = "phira"
        return t
    }
    static async fromRPE(file: File) {
        const data = JSON.parse(await file.async("text")).META
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
        let t = new this(newData.chart, newData.music, newData.illustration, newData)
        t.type = "rpe"
        return t
    }
    setRoot(path: string) {
        if (!this.chart.startsWith(path)) this.chart = path + "/" + this.chart
        if (!this.illustration.startsWith(path)) this.illustration = path + "/" + this.illustration
        if (!this.music.startsWith(path)) this.music = path + "/" + this.music
        this.dir = path
    }
}