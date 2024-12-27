import { gzipSync, decompressSync } from "fflate"
import { ResourceManager } from "../core/resource"
import { WriteBufferDataView, ReadBufferDataView } from "./data_view"
import Chart from "../core/chart"
import { ChartFile } from "./chart"
import { PrprExtraFile } from "./prpr"
import { ChartInfo, type PhiraChartInfo, type RPEChartInfo } from "../core/chart/chartinfo"
import { File } from "../core/file"
import { Texture } from "pixi.js"
import { generateRandomString } from "../core/random"

export interface ChartPackOption {
    compressPack: boolean,
    compressImage: boolean,
    compressImageQuality?: number
}

const DefaultOption: ChartPackOption = {
    compressPack: true,
    compressImage: false
}
async function _base64ToArrayBuffer(base64: string) {
    return await (await fetch(base64)).arrayBuffer();
}


export class ChartPack {
    private constructor() { }
    static async from(res: ResourceManager, option: ChartPackOption = DefaultOption) {
        let view = new WriteBufferDataView()

        let chartInfo = res.charts[Object.keys(res.charts)[0]]!
        let chart = res.files[chartInfo.chart] as Chart
        let prpr = chartInfo.get(res).prpr
        chartInfo.src.chart = chartInfo.src.chart.replace(chartInfo.dir, "")
        chartInfo.src.music = chartInfo.src.music.replace(chartInfo.dir, "")
        chartInfo.src.illustration = chartInfo.src.illustration.replace(chartInfo.dir, "")
        let info = JSON.stringify({ ...chartInfo.src, srcType: chartInfo.type })
        let allFile: Record<string, ArrayBuffer> = {}
        for (let f in res.srcFiles) {
            if (f != chartInfo.chart) {

                let _f = f.replace(chartInfo.dir, "")
                if (res.files[f]! instanceof Texture && option.compressImage) {
                    var canvas = document.createElement("canvas")
                    canvas.width = res.files[f]!.width
                    canvas.height = res.files[f]!.height
                    var ctx = canvas.getContext("2d")!
                    ctx.drawImage(await createImageBitmap(await res.srcFiles[f]!.getBlob()), 0, 0)
                    allFile[_f] = await _base64ToArrayBuffer(canvas.toDataURL("image/webp", option.compressImageQuality == undefined ? 0.8 : option.compressImageQuality))
                    continue
                }
                allFile[_f] = await res.srcFiles[f]!.async("arraybuffer")
            }
        }

        let chartFile = await ChartFile.from(chart)
        let prprFile = await PrprExtraFile.from(prpr)
        view.setString(info)
        view.setArrayBuffer(chartFile)
        view.setArrayBuffer(prprFile)
        view.setInt32(Object.keys(allFile).length)
        for (let f in allFile) {
            view.setString(f)
            view.setArrayBuffer(allFile[f])
        }
        let buf = view.build()
        let _view = new WriteBufferDataView()
        _view.setString("PHICHART")
        _view.setBool(option.compressPack!)
        if (option.compressPack!) {
            _view.setArrayBuffer(
                gzipSync(new Uint8Array(buf), {
                    mem: 12,
                    level: 9
                })
            )
        } else {
            _view.setArrayBuffer(buf)
        }
        return _view.build()
    }

    static async read(file: Uint8Array | ArrayBuffer) {
        let buf = file instanceof Uint8Array ? file.buffer : file;
        let view = new ReadBufferDataView(new DataView(buf))
        if (view.getString() != "PHICHART") throw ""
        if (view.getBool()) {
            view = new ReadBufferDataView(new DataView(decompressSync(view.getArrayBuffer()).buffer))
        }
        let info: (PhiraChartInfo | RPEChartInfo) & { srcType: string } = JSON.parse(view.getString())
        let resManager = new ResourceManager()
        let chartInfo = new ChartInfo("/" + info.chart, "/" + info.music, "/" + info.illustration, info)
        chartInfo.resManager = resManager
        resManager.charts[info.chart] = chartInfo
        chartInfo.setRoot("")
        let chart = await ChartFile.read(view.getArrayBuffer())
        let prpr = await PrprExtraFile.read(view.getArrayBuffer())
        chart.rootPath = ""
        resManager.files["/extra.json"] = prpr
        resManager.files["/" + info.chart] = chart
        let fileLength = view.getInt32()
        for (let i = 0, length = fileLength; i < length; i++) {
            let n = view.getString()
            await resManager.add(new File(new Blob([view.getArrayBuffer()]), n))
        }
        let baseDir = generateRandomString(24)
        chart.rootPath = baseDir
        for (let n in resManager.files) {
            let temp = resManager.files[n]
            delete resManager.files[n]
            resManager.files[baseDir + n] = temp
        }
        for (let n in resManager.srcFiles) {
            let temp = resManager.srcFiles[n]
            delete resManager.srcFiles[n]
            resManager.srcFiles[baseDir + n] = temp
        }
        chartInfo.chart = baseDir + chartInfo.chart
        chartInfo.illustration = baseDir + chartInfo.illustration
        chartInfo.music = baseDir + chartInfo.music
        chartInfo.dir = baseDir
        return {
            resourceManager: resManager,
            chartInfo: chartInfo
        }
    }
    static async check(file: Uint8Array | ArrayBuffer) {
        try {
            let buf = file instanceof Uint8Array ? file.buffer : file;
            let view = new ReadBufferDataView(new DataView(buf))
            if (view.getString() != "PHICHART") return false
        } catch {
            return false
        }
        return true

    }
}