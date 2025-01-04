export enum WriteDataType {
    INT32, UINT8, FLOAT64, INT8,BUFFER
}
export interface WriteData {
    type: WriteDataType,
    data: any
}
export class WriteBufferDataView {
    public totalLength: number = 0
    public data: WriteData[] = []
    constructor() { }

    addWriteData(type: WriteDataType, data: any) {
        this.data.push({
            type: type,
            data: data
        })
    }

    setInt32(v: number) {
        this.addWriteData(WriteDataType.INT32, v)
        this.totalLength += 4
    }

    setInt8(v: number) {
        this.addWriteData(WriteDataType.INT8, v)
        this.totalLength += 1
    }

    setString(v: string) {
        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(v);
        this.setArrayBuffer(uint8Array.buffer)
    }

    setBool(v: boolean) {
        this.addWriteData(WriteDataType.UINT8, v ? 1 : 0)
        this.totalLength++
    }

    setFloat64(v: number) {
        this.addWriteData(WriteDataType.FLOAT64, v)
        this.totalLength += 8
    }

    setArrayBuffer(v:ArrayBuffer){
        this.addWriteData(WriteDataType.BUFFER, new Uint8Array(v))
        this.totalLength += v.byteLength+4
    }

    build() {
        let buffer = new ArrayBuffer(this.totalLength)
        let view = new DataView(buffer)
        let offset = 0
        for (let d of this.data) {
            switch (d.type) {
                case WriteDataType.INT32:
                    view.setInt32(offset, d.data)
                    offset += 4
                    break
                case WriteDataType.UINT8:
                    view.setUint8(offset, d.data)
                    offset++
                    break
                case WriteDataType.INT8:
                    view.setInt8(offset, d.data)
                    offset++
                    break
                case WriteDataType.FLOAT64:
                    view.setFloat64(offset, d.data)
                    offset += 8
                    break
                case WriteDataType.BUFFER:
                    view.setInt32(offset, d.data.byteLength)
                    offset+=4
                    for (let i = 0; i < d.data.byteLength; i++) {
                        view.setUint8(offset+i,d.data[i])
                    }
                    offset+=d.data.byteLength
            }
        }
        this.data = null as any
        return buffer
    }

}

export class ReadBufferDataView {
    public view: DataView;
    public offset: number = 0;
    public totalLength: number = 0

    constructor(view: DataView) {
        this.view = view;
    }

    getInt32(): number {
        const v = this.view.getInt32(this.offset);
        this.offset += 4
        this.totalLength += 4
        return v;
    }

    getInt8(): number {
        const v = this.view.getInt8(this.offset);
        this.offset += 1
        this.totalLength += 1
        return v;
    }

    getString(): string {
        const decoder = new TextDecoder();
        const str = decoder.decode(this.getArrayBuffer());
        return str;
    }

    getBool(): boolean {
        const v = this.view.getUint8(this.offset);
        this.offset++;
        this.totalLength++
        return v === 1;
    }

    getFloat64(): number {
        const v = this.view.getFloat64(this.offset);
        this.offset += 8;
        this.totalLength += 8
        return v;
    }

    getArrayBuffer(){
        const length = this.getInt32();
        const uint8Array = (new Uint8Array(this.view.buffer, this.offset, length)).slice(0,length);
        this.offset += length;
        this.totalLength += length
        return uint8Array;
    }
}