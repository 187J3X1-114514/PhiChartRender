import { loadText } from "../resource/utils"

export enum FileType {
    JSON,
    SOUND,
    CHARTINFO,
    VIDEO,
    IMG,
    UNKNOWN,
    CHART,
    SHADER
}

export class File {
    public name: string
    private file: Blob
    public type: FileType
    public size?: number
    public extension: string
    private blob?: Blob
    private done: boolean = false

    constructor(file: Blob, name?: string) {
        this.name = name ? name : (file as any).name
        this.file = file
        if (name) (this.file as any).name = name
        this.extension = (this.name.split('.').pop() || '').toLowerCase()//<-血的教训
        switch (this.extension) {
            case 'json':
                this.type = FileType.JSON
                break
            case 'pec':
                this.type = FileType.CHART
                break
            case 'ogg':
                this.type = FileType.SOUND
                break
            case 'mp3':
                this.type = FileType.SOUND
                break
            case 'wav':
                this.type = FileType.SOUND
                break
            case 'yml':
                this.type = FileType.CHARTINFO
                break
            case 'txt':
                this.type = FileType.CHARTINFO
                break
            case 'mp4':
                this.type = FileType.VIDEO
                break
            case 'webm':
                this.type = FileType.VIDEO
                break
            case 'jpg':
                this.type = FileType.IMG
                break
            case 'png':
                this.type = FileType.IMG
                break
            case 'webp':
                this.type = FileType.IMG
                break
            case 'bmp':
                this.type = FileType.IMG
                break
            case 'jpeg':
                this.type = FileType.IMG
                break
            case 'fs':
                this.type = FileType.SHADER
                break
            default:
                this.type = FileType.UNKNOWN
                break
        }

        this.load()
    }

    private async load(): Promise<void> {
        this.blob = (this.file as Blob)
        this.size = (this.file as Blob).size
        this.done = true
    }

    async getBlob(): Promise<Blob> {
        if (this.done) {
            return this.blob!
        } else {
            return new Promise((resolve) => {
                const interval = setInterval(() => {
                    if (this.done) {
                        clearInterval(interval)
                        resolve(this.blob!)
                    }
                }, 100)
            })
        }
    }
    async async<T extends OutputType>(type: T): Promise<OutputByType[T]> {


        const file = this.file as Blob
        switch (type) {
            case 'base64':
                return await new Promise((r) => {
                    const fileReader = new FileReader();

                    fileReader.onload = (e) => {
                        r(e.target!.result);
                    };
                    fileReader.readAsDataURL(file)
                })
            case 'text':
                return await file.text()
            case 'uint8array':
                return (await file.stream().getReader().read()).value
            case 'arraybuffer':
                return await file.arrayBuffer()
            case 'blob':
                return file
            default:
                return undefined
        }


    }


    static async from(file: globalThis.File, name?: string): Promise<File> {
        return await new Promise((r) => {
            r(new File(file.slice(0, file.size, file.type), name ? name : file.name))
        })
    }
    static async fromList(file: FileList): Promise<File[]> {
        return new Promise(async (r) => {
            const out: File[] = []

            for (let i = 0; i < file.length; i++) {
                const f = file.item(i)!
                out.push(await this.from(f))
            }
            r(out)
        })
    }
}
interface OutputByType {
    base64: string;
    string: string;
    text: string;
    binarystring: string;
    array: number[];
    uint8array: Uint8Array;
    arraybuffer: ArrayBuffer;
    blob: Blob;
    nodebuffer: any;
}
type OutputType = keyof OutputByType;
