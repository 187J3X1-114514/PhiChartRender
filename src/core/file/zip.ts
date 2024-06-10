import JSZip from 'jszip'
import { File } from './file'
import { newLogger } from '../log'
const log = newLogger("Zip")

export class Zip {
    public files:Map<string,File> = new Map<string,File>()
    public name:string
    constructor(files: File[],n:string) {
        files.forEach((file=>{
            this.files.set(file.name,file)
        }))
        this.name = n
    }
    get(name:string):File|undefined{
        return this.files.get(name)
    }
}

export async function loadZip(name:string,file: Blob|ArrayBuffer): Promise<Zip> {
    log.info("加载zip文件 "+name+" 中...")
    const zip = await (new JSZip()).loadAsync(file)
    const filesl:{"name":string,"file":JSZip.JSZipObject}[] = []
    const files:File[] = []
    zip.forEach((fname, file) => {
        if (!file.dir) {
            filesl.push({"name":fname,"file":file})
        }
    })
    for (let file of filesl){
        const f = new File(file.file)
        await f.getBlob()
        files.push(f)
        log.info("加载zip文件 "+name+" 中的 "+file.name+" 完成 "+((100/filesl.length)*(filesl.indexOf(file)+1)).toFixed(2)+"%")
    }
    log.info("加载zip文件 "+name+" 完成")
    return new Zip(files,name)
}