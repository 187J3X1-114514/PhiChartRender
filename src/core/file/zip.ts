import SevenZip, { type SevenZipModule } from "7z-wasm";
import { File } from './file'
import { newLogger } from '../log'
import { mimeTypes } from './minetype';
import { join, NativeFile } from './utils';
import { Archive as LibArchive } from 'libarchive.js';
import JSZip from "jszip"
import { generateRandomString } from "../random";



const log = newLogger("Zip")
export class _7zip {
    public js7z: SevenZipModule = {} as any
    public isRuning: boolean = false
    private outCache: string = ''
    public lastRuningCode: number | undefined = undefined
    private ePath: string = "/7_zip_work/extract/"
    private aPath: string = "/7_zip_work/add/"
    private exitCallback: () => any = () => { }
    public FS = this.js7z.FS
    static async create() {
        var _n_7z = new this()
        let js7z_wasm = await fetch("/assets/dep/7zz.wasm")
        if (!js7z_wasm.ok) js7z_wasm = await fetch("/assets/dep/7zz.wasm")
        _n_7z.js7z = await (SevenZip as any)({
            print: (t: string) => { _n_7z._print(t) },
            printErr: (t: string) => { _n_7z._printErr(t) },
            wasmBinary: await js7z_wasm.arrayBuffer(),
            quit: (t: number, _: any) => { _n_7z._onExit(t) }
        })
        _n_7z.FS = _n_7z.js7z.FS
        _n_7z.FS.mkdir("/7_zip_work")
        _n_7z.FS.mkdir(_n_7z.ePath)
        _n_7z.FS.mkdir(_n_7z.aPath)
        return _n_7z
    }
    private _onExit(code: number) {
        this.isRuning = false
        this.lastRuningCode = code

        if (code == 0) {
            log.info(`7-ZIP输出：${this.outCache}`)
        }
        if (code == 1) {
            log.warn(`7-ZIP产生警告：${this.outCache}`)
        }
        if (code == 2) {
            log.fatal(`7-ZIP产生致命错误：${this.outCache}`)
        }
        if (code == 7) {
            log.error(`7-ZIP命令行错误：${this.outCache}`)
        }
        if (code == 8) {
            log.fatal(`7-ZIP没有足够的内存：${this.outCache}`)
        }
        log.debug(`code：${code}`)
        this.exitCallback()
    }
    private _print(text: string) {
        if (this.isRuning) {
            this.outCache = this.outCache + text + "\n"
        }
    }
    private _printErr(text: string) {
        if (this.isRuning) {
            this.outCache = this.outCache + text + "\n"
        }
    }
    async callMain(args: string[]) {
        this.outCache = ""
        this.exitCallback = () => { }
        this.isRuning = true
        return await new Promise((r) => {
            this.exitCallback = () => { r(this.outCache) }
            try {
                this.js7z.callMain(args)
            } catch {
                log.error("似乎在运行7-zip时遇到了一些问题，命令行：", args.join(" "))
            }
        })
    }
    async load(src: Blob | ArrayBuffer | Uint8Array, a_name?: string) {
        let u8array
        a_name = generateRandomString(16)
        let e_path = a_name
        a_name = a_name + "_src"
        if (src instanceof Blob) {
            u8array = new Uint8Array(await src.arrayBuffer())
        } else if (src instanceof ArrayBuffer) {
            u8array = new Uint8Array(src)
        } else {
            u8array = src
        }

        let path = join(this.ePath, e_path)
        this.FS.writeFile("/" + a_name, u8array)
        this.FS.mkdir(path)
        await this.callMain(["e", "/" + a_name, "-o" + path])
        return {
            extractPath: path,
            archivePath: "/" + a_name
        }
    }
    fileType(path: string) {
        let f
        try {
            f = this.FS.stat(path)
        } catch {
            return 0
        }
        if (this.FS.isFile(f.mode)) return 1
        if (this.FS.isDir(f.mode)) return 2
        return 0
    }
    listDir(path: string) {
        let ps = this.FS.readdir(path)
        ps.splice(ps.indexOf("."), 1)
        ps.splice(ps.indexOf(".."), 1)
        return ps
    }
    listAllDir(path: string) {
        let t = this.fileType(path)
        let s
        switch (t) {
            case 0:
                return undefined
            case 1:
                return path.split('/').pop()
            case 2:
                s = this.listDir(path)
                let l: any = {}
                for (let fn of s) {
                    (l as any)[fn] = this.listAllDir(join(path, fn))
                }
                return l
        }
    }
    async get(path: string): Promise<{ [key: string]: File | any } | undefined> {
        let t = this.fileType(path)
        let s
        switch (t) {
            case 0:
                return undefined
            case 1:
                s = this.readFile(path)
                this.FS.close
                let f = new File(new Blob([s], {
                    type: mimeTypes.getType(path)
                }), path.split('/').pop())
                return f
            case 2:
                s = this.listDir(path)
                let l: any = {}
                for (let fn of s) {
                    (l as any)[fn] = await this.get(join(path, fn))
                }
                return l
        }
    }
    readFile(name: string) {
        let _s = this.FS.stat(name)
        this.FS.chmod(name, 777) // <-为什么Js上的FS要有权限系统啊啊啊啊啊啊
        let s = this.FS.open(name, "r", _s.mode)
        let temp = new Uint8Array(_s.size)
        this.FS.read(s, temp, 0, _s.size, 0)
        let o = new Uint8Array(temp)
        temp = null as any
        this.FS.close(s)
        return o
    }
    rmDir(path: string) {
        //this.FS.chmod(path,777)
        let t = this.fileType(path)
        let s
        switch (t) {
            case 0:
                return
            case 1:
                this.FS.unlink(path)
                return
            case 2:
                s = this.listDir(path)
                for (let fn of s) {
                    this.rmDir(join(path, fn))
                }
                return
        }
    }

}
export var isInit7zip = false
export var _7ZIP = undefined as any
export var isInitLibArchive = false
export async function init7ZIP() {

    if (_7ZIP == undefined) {
        log.info("初始化7-zip中")
        _7ZIP = await _7zip.create()
    }
    isInit7zip = true
}

export async function initLibArchive() {
    if (!isInitLibArchive) {
        log.info("初始化LibArchive中")
        LibArchive.init({
            workerUrl: 'assets/dep/worker-bundle.js'
        });
    }
    isInitLibArchive = true
}

export class Archive {
    public files: Map<string, File> = new Map<string, File>()
    public name: string
    constructor(files: File[], n: string) {
        files.forEach((file => {
            this.files.set(file.name, file)
        }))
        this.name = n
    }
    get(name: string): File | undefined {
        return this.files.get(name)
    }
}

export async function loadZipUse7zWASM(name: string, file: Blob | ArrayBuffer): Promise<Archive> {
    await init7ZIP()
    log.info("加载压缩包文件 " + name + " 中...")
    const zip = await _7ZIP.load(file, name)
    const filel = await _7ZIP.get(zip.extractPath)!
    const files: { "name": string, "file": File }[] = []
    for (let k in filel) {
        if (!(filel[k] instanceof File)) continue
        files.push({ "name": k, "file": filel[k] })
    }
    let o = []
    for (let file of files) {
        const f = file.file
        await f.getBlob()
        o.push(f)
    }
    try {
        _7ZIP.rmDir(zip.extractPath)
        _7ZIP.FS.unlink(zip.archivePath)
    } catch {

    }

    log.info("加载压缩包文件 " + name + " 完成")
    return new Archive(o, name)
}

function toFile(name: string, file: Blob | ArrayBuffer) {
    let nfile
    if (file instanceof Blob) {
        nfile = new NativeFile([file], name)
    } else {
        nfile = new NativeFile([new Blob([file])], name)
    }
    return nfile

}

export async function loadZipUseLibarchivejs(name: string, file: Blob | ArrayBuffer): Promise<Archive> {
    await initLibArchive()
    log.info("加载压缩包文件 " + name + " 中...")
    const archive = await LibArchive.open(toFile(name, file))
    const obj = await archive.extractFiles();
    const files: { "name": string, "file": File }[] = []

    for (let key of Object.keys(obj)) {
        if (obj[key] instanceof NativeFile) {
            files.push({ "name": key, "file": new File(new Blob([await obj[key].arrayBuffer()]), key) })
        }
    }
    let o = []
    for (let file of files) {
        const f = file.file
        await f.getBlob()
        o.push(f)
    }
    log.info("加载压缩包文件 " + name + " 完成")
    return new Archive(o, name)
}


export async function loadZipUseJSZip(name: string, file: Blob | ArrayBuffer): Promise<Archive> {
    return new Promise<Archive>(async (r) => {
        log.info("加载压缩包文件 " + name + " 中...");
        const archive = await JSZip.loadAsync(file)
        const obj: any = {};
        for (let key of Object.keys(archive.files)) {
            if (!archive.files[key].dir) {
                obj[archive.files[key].name] = await archive.files[key].async("arraybuffer")
            }

        }
        const files: { "name": string, "file": File }[] = []

        for (let key of Object.keys(obj)) {
            files.push({ "name": key, "file": new File(new Blob([obj[key]]), key) })
        }
        let o = []
        for (let file of files) {
            const f = file.file
            await f.getBlob()
            o.push(f)
        }
        log.info("加载压缩包文件 " + name + " 完成")
        r(new Archive(o, name))
    })

}