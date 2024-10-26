import { Texture } from "pixi.js"
import { File, FileType, loadZip } from "../file"
import Audio from "../audio"
import { loadText, isArchive } from "./utils"
import { newLogger } from "../log"
import Chart from "../chart"
import { ChartInfo } from "../chart/chartinfo"
import { PrprExtra } from "../prpr/prpr"
import { generateRandomString } from "../random"

/*
  这坨屎以后会重写
*/

const log = newLogger("Resource Manger")

export class ResourceManager {
    public files: { [key: string]: Texture | Audio | Chart | PrprExtra | string | undefined }
    public srcFiles: { [key: string]: File | undefined }
    public charts: { [key: string]: ChartInfo | undefined }
    constructor() {
        this.files = {}
        this.srcFiles = {}
        this.charts = {}
    }
    destroy() {
        this.files = {}
        this.srcFiles = {}
        this.charts = {}
    }
    async add(file: File, __log = true) {
        let loadFile: Texture | Audio | Chart | PrprExtra | undefined | string = undefined
        await fixType(file)
        try {
            switch (file.type) {
                case FileType.CHART:
                    try {
                        let text = await loadText(file)
                        let yes = true
                        let info = await ChartInfo.from(file, this)
                        let t = file.name.split('/')
                        t.pop()
                        info.setRoot(t.join("/"))
                        let n_ = info.chart.split('/')[info.chart.split('/').length - 1]
                        if (yes && (n_ != "" && n_ != undefined)) this.charts[n_] = info
                        loadFile = await Chart.from(text)
                    } catch (e) {
                        log.error("加载铺面时出错 ->", e, "源文件 ->", file.name)
                    }
                    break
                case FileType.JSON:
                    let json
                    try {
                        json = JSON.parse(await loadText(file))
                    } catch {
                        log.warn("这似乎不是一个有效的JSON文件", file.name)
                        json = await loadText(file)
                        file.type = FileType.CHART
                        file.extension = (() => {
                            let _ = file.extension.split(".")
                            _.pop()
                            _.push("pec")
                            return _.join(".")
                        })()
                        await this.add(file, false)
                        break
                    }

                    if (file.name.endsWith("extra.json")) {
                        try {
                            loadFile = PrprExtra.from(json)
                        } catch (e) {
                            log.error("加载prpr/phira的铺面拓展时出错 ->", e, "源文件 ->", json)
                        }
                    } else {
                        try {
                            let yes = true
                            let info = await ChartInfo.from(file, this)
                            let t = file.name.split('/')
                            t.pop()
                            info.setRoot(t.join("/"))
                            let n_ = info.chart.split('/')[info.chart.split('/').length - 1]
                            if (yes && (n_ != "" && n_ != undefined)) this.charts[n_] = info
                            loadFile = await Chart.from(json)
                        } catch (e) {
                            log.error("加载铺面时出错 ->", e, "源文件 ->", file.name)
                        }
                    }
                    break
                case FileType.SOUND:
                    try {

                        loadFile = await Audio.from(await file.async("arraybuffer"))
                    } catch (e) {
                        log.error("加载音频出错 ->", e, "源文件 ->", file.name)
                    }
                    break
                case FileType.CHARTINFO:
                    let yes = true
                    let info = await ChartInfo.from(file, this)
                    let t = file.name.split('/')
                    t.pop()
                    info.setRoot(t.join("/"))
                    let n_ = info.chart.split('/')[info.chart.split('/').length - 1]
                    if (yes && (n_ != "" && n_ != undefined)) this.charts[n_] = info

                    break
                case FileType.VIDEO:
                    try {
                        loadFile = await new Promise<Texture>(async (r) => {
                            const video = document.createElement("video")
                            video.src = URL.createObjectURL(await file.async("blob"))
                            video.pause()
                            video.volume = 0
                            r(Texture.from(video))
                        })

                    } catch (e) {
                        log.error("加载视频出错 ->", e, "源文件 ->", file.name)
                    }
                    break
                case FileType.IMG:
                    try {
                        loadFile = Texture.from(await createImageBitmap(await file.async("blob")))
                    } catch (e) {
                        log.error("加载图片出错 ->", e, " 源文件 ->", file.name)
                    }
                    break
                case FileType.SHADER:
                    try {
                        loadFile = await file.async("text")
                    } catch (e) {
                        log.error("加载图片出错 ->", e, " 源文件 ->", file.name)
                    }
                    break
                case FileType.UNKNOWN:
                    log.warn("未知类型 ->", file.name)
                    break
            }
            if (__log) log.info("加载文件 ->", file.name, "完成")
            if (loadFile != undefined) {
                let yes = true
                //for (let key in this.srcFiles) {
                //    if ((((this.srcFiles[key]!.name).split('/').pop()!.endsWith(file.name.split('/').pop()!) || file.name.split('/').pop()!.endsWith(this.srcFiles[key]!.name.split('/').pop()!)) && yes)) { yes = false }
                //}
                if (yes && (file.name != "" && file.name != undefined)) {
                    this.files[file.name] = loadFile
                    this.srcFiles[file.name] = file
                    return true
                }
            }
        } catch (e) {
            log.error("加载文件", file.name, "时发生错误,详情:", e)
        }

        return false
    }
    async addList(files: File[]) {
        new Promise(async (r) => {
            for (let a of files) {
                await this.add(a)
            }
            r(null)

        })
    }
    get(name: string) {
        return this.files[name]
    }
    getAll() {
        return this.files
    }
    async load(name: string, file: Blob | ArrayBuffer) {
        const zip = await loadZip(name, file)
        for (let f of zip.files) {
            let file = f[1]
            file.name = name + "/" + file.name
            await this.add(file)
        }
    }
    async loads(file: FileList | undefined | null) {
        if (file) {
            let random = generateRandomString(8)
            let a = 0
            let b = 0
            for (let _b in this.files) a++
            log.info(await new Promise(async (r) => {
                let all = ''
                for (let i = 0; i < file!.length; i++) {
                    const fa = file!.item(i)!
                    all = all + fa.name! + " ,"
                }
                all.slice(0, -1)
                log.info("开始加载", file.length, "个文件 ->", all)
                for (let i = 0; i < file!.length; i++) {
                    const fa = file!.item(i)!
                    let name = fa.name!
                    if (isArchive(name.split('.').pop())) {
                        await this.load(fa.name!, await fa.arrayBuffer()!)
                    } else {
                        await this.add(await File.from(fa, random + "/" + fa.name!))
                    }
                }
                for (let _b in this.files) b++
                r("加载完成,共加载了 " + (b - a) + " 个文件")
            }))

        }
    }
    async getFilesByType(type: FileType) {
        let list = []
        for (let a in this.files) {
            if (this.srcFiles[a]!.type == type) list.push(this.files[a]!)
        }
        return list
    }
    getFileList() {
        let keys: string[] = []
        for (let key in this.files) {
            keys.push(key)
        }
        return keys
    }
}

async function fixType(file: File) {
    try {
        var t = await loadText(file)
    } catch {
        return
    }
    try {
        JSON.parse(t)
        file.type = FileType.JSON
    } catch {
        if (file.type == FileType.CHART || file.type == FileType.JSON) {
            if (Number.isNaN(parseInt(t.split("\n")[0]))) {
                file.type = FileType.CHARTINFO
            } else {
                file.type = FileType.CHART
                file.extension = "pec"
            }
        }

    }
}