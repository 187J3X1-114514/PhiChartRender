import { Texture } from "pixi.js"
import { File, FileType, loadZip } from "../file"
import WAudio from "../audio"
import Effect from "../effect"
import { loadText } from "./utils"
import { newLogger } from "../log"
import Chart from "../chart"
import { ChartInfo } from "../chart/chartinfo"
const log = newLogger("Resource Manger")

export class ResourceManger {
    private files: { [key: string]: Texture | WAudio | Chart | Effect[] | undefined }
    private srcFiles: { [key: string]: File | undefined }
    public charts: { [key: string]: ChartInfo | undefined }
    constructor() {
        this.files = {}
        this.srcFiles = {}
        this.charts = {}
    }
    reset() {
        this.files = {}
        this.srcFiles = {}
        this.charts = {}
    }
    async add(file: File) {
        let loadFile: Texture | WAudio | Chart | Effect[] | undefined = undefined

        switch (file.type) {
            case FileType.JSON:
                let json = JSON.parse(await loadText(file))
                if (file.name.endsWith("extra.json")) {
                    try {
                        loadFile = Effect.from(json)
                    } catch (e) {
                        log.error("加载prpr/phira的铺面拓展时出错 ->", e, "源文件 ->", json)
                    }
                } else {
                    try {
                        let yes = true
                        let info = await ChartInfo.fromRPE(file)
                        //for (let key in this.charts) {
                        //    if (((this.charts[key]!.chart.endsWith(info.chart) || info.chart.endsWith(this.charts[key]!.chart)) && yes)) { yes = false }
                        //    if (((this.charts[key]!.illustration.endsWith(info.illustration) || info.illustration.endsWith(this.charts[key]!.illustration)) && yes)) { yes = false }
                        //    if (((this.charts[key]!.music.endsWith(info.music) || info.music.endsWith(this.charts[key]!.music)) && yes)) { yes = false }
                        //}
                        let t = file.name.split('/')
                        t.pop()
                        info.setRoot(t.join("/"))
                        if (yes) this.charts[info.chart.split('/')[info.chart.split('/').length-1]] = info
                        loadFile = Chart.from(json)
                    } catch (e) {
                        log.error("加载铺面时出错 ->", e, "源文件 ->", file.name)
                    }
                }
                break
            case FileType.SOUND:
                try {
                    loadFile = await WAudio.from(await file.async("arraybuffer"), false)
                } catch (e) {
                    log.error("加载音频出错 ->", e, "源文件 ->", file.name)
                }
                break
            case FileType.CHARTINFO:
                if (file.extension == "yml") {
                    let yes = true
                    let info = await ChartInfo.fromYAML(file)
                    //for (let key in this.charts) {
                    //    if (((this.charts[key]!.chart.endsWith(info.chart) || info.chart.endsWith(this.charts[key]!.chart)) && yes)) { yes = false }
                    //    if (((this.charts[key]!.illustration.endsWith(info.illustration) || info.illustration.endsWith(this.charts[key]!.illustration)) && yes)) { yes = false }
                    //    if (((this.charts[key]!.music.endsWith(info.music) || info.music.endsWith(this.charts[key]!.music)) && yes)) { yes = false }
                    //}
                    let t = file.name.split('/')
                    t.pop()
                    info.setRoot(t.join("/"))
                    if (yes) this.charts[info.chart.split('/')[info.chart.split('/').length-1]] = info
                }
                break
            case FileType.VIDEO:
                try {
                    loadFile = await new Promise<Texture>(async (r) => {
                        const video = document.createElement("video")
                        video.src = URL.createObjectURL(await file.async("blob"))
                        r(Texture.from(video))
                        video.onload = () => {
                            document.body.append(video)
                        }
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
            case FileType.UNKNOWN:
                log.warn("未知类型 ->", file.name)
                break
        }
        log.info("加载文件 ->", file.name, "完成")
        if (loadFile != undefined) {
            let yes = true
            for (let key in this.srcFiles) {
                if ((((this.srcFiles[key]!.name).split('/').pop()!.endsWith(file.name.split('/').pop()!) || file.name.split('/').pop()!.endsWith(this.srcFiles[key]!.name.split('/').pop()!)) && yes)) { yes = false }
            }
            if (yes){
                this.files[file.name] = loadFile
                this.srcFiles[file.name] = file
            }

            return true
        } else {
            return false
        }
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
            let random = (+Math.random().toFixed(10)) * 10 ** 10
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
                    if (name.split('.').pop() == "zip") {
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
}