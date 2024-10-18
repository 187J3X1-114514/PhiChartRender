import Chart, { arrangeLineEvents, arrangeSingleValueLineEvents } from "../core/chart";
import { jsonEventLayer, jsonJudgeLineData } from "../core/chart/types/judgeLine";
import { number, text } from "../core/verify";
import { bpmEvent, Event, floorPositionEvent, valueAndEvent, valueEvent } from "../core/chart/baseEvents";
import { ReadBufferDataView, WriteBufferDataView } from "./data_view";
import { jsonNoteData } from "../core/chart/types/note";
import Judgeline from "../core/chart/judgeline";
import Note from "../core/chart/note";
import { gzipSync,decompressSync } from 'fflate';

export function buildJudgeLineData(view: WriteBufferDataView, data: jsonJudgeLineData) {
    view.setInt32(data.id)
    view.setString(text(data.texture, ""))
    view.setInt32(data.parentLine != undefined ? data.parentLine : -1)
    view.setBool(data.isText)
    view.setInt32(data.zIndex)
    view.setBool(data.isCover)
    view.setBool(data.useOfficialScale)
    view.setString(text(data.text, ""))
    view.setString(text(data.attachUI, ""))
}

export function readJudgeLineData(view: ReadBufferDataView): jsonJudgeLineData {
    let data: jsonJudgeLineData = {} as any;
    data.id = view.getInt32()
    data.texture = view.getString()
    data.texture = data.texture == "" ? undefined! : data.texture
    data.parentLine = view.getInt32()
    data.parentLine = data.parentLine == -1 ? undefined! : data.parentLine
    data.isText = view.getBool()
    data.zIndex = view.getInt32()
    data.isCover = view.getBool()
    data.useOfficialScale = view.getBool()
    data.text = view.getString()
    data.text = data.text == "" ? undefined! : data.text
    data.attachUI = view.getString()
    data.attachUI = data.attachUI == "" ? undefined! : data.attachUI
    return data
}

export function buildEventData(view: WriteBufferDataView, data: Event) {
    view.setFloat64(data.startTime)
    view.setFloat64(data.endTime)
    view.setFloat64(data.start)
    view.setFloat64(data.end)

}

export function readEventData(view: ReadBufferDataView): Event {
    let data: Event = {} as any;
    data.startTime = view.getFloat64()
    data.endTime = view.getFloat64()
    data.start = view.getFloat64()
    data.end = view.getFloat64()
    return data
}

export function buildValueAndEventData(view: WriteBufferDataView, data: valueAndEvent) {
    view.setFloat64(data.startTime)
    view.setFloat64(data.endTime)
    view.setFloat64(number(data.start, 0))
    view.setFloat64(number(data.end, 0))
    view.setFloat64(number(data.value, 0))
}

export function readValueAndEventData(view: ReadBufferDataView): valueAndEvent {
    let data: valueAndEvent = {} as any;
    data.startTime = view.getFloat64()
    data.endTime = view.getFloat64()
    data.start = view.getFloat64()
    data.end = view.getFloat64()
    data.value = view.getFloat64()
    return data
}

export function buildFloorPositionEventData(view: WriteBufferDataView, data: floorPositionEvent) {
    view.setFloat64(data.startTime)
    view.setFloat64(data.endTime)
    view.setFloat64(data.floorPosition)

}

export function readFloorPositionEventData(view: ReadBufferDataView): floorPositionEvent {
    let data: floorPositionEvent = {} as any;
    data.startTime = view.getFloat64()
    data.endTime = view.getFloat64()
    data.floorPosition = view.getFloat64()
    return data
}

export function buildNumberValueEventData(view: WriteBufferDataView, data: valueEvent) {
    view.setFloat64(data.startTime)
    view.setFloat64(data.endTime)
    view.setFloat64(data.value)

}

export function readNumberValueEventData(view: ReadBufferDataView): valueEvent {
    let data: valueEvent = {} as any;
    data.startTime = view.getFloat64()
    data.endTime = view.getFloat64()
    data.value = view.getFloat64()
    return data
}

export function buildColorValueEventData(view: WriteBufferDataView, data: valueEvent) {
    view.setFloat64(data.startTime)
    view.setFloat64(data.endTime)
    view.setFloat64(data.value[0])
    view.setFloat64(data.value[1])
    view.setFloat64(data.value[2])
    view.setFloat64(data.value[3])

}

export function readColorValueEventData(view: ReadBufferDataView): valueEvent {
    let data: valueEvent = {} as any;
    data.startTime = view.getFloat64()
    data.endTime = view.getFloat64()
    data.value = [view.getFloat64(), view.getFloat64(), view.getFloat64(), view.getFloat64()]
    return data
}

export function buildStringValueEventData(view: WriteBufferDataView, data: valueEvent) {
    view.setFloat64(data.startTime)
    view.setFloat64(data.endTime)
    view.setString(data.value)

}

export function readStringValueEventData(view: ReadBufferDataView): valueEvent {
    let data: valueEvent = {} as any;
    data.startTime = view.getFloat64()
    data.endTime = view.getFloat64()
    data.value = view.getString()
    return data
}

export function buildEventLayerData(view: WriteBufferDataView, data: jsonEventLayer) {
    view.setInt32(data.speed.length)
    view.setInt32(data.moveX.length)
    view.setInt32(data.moveY.length)
    view.setInt32(data.alpha.length)
    view.setInt32(data.rotate.length)
    for (let e of data.speed) {
        let br = new WriteBufferDataView()
        buildNumberValueEventData(br, e)
        view.setArrayBuffer(br.build())
        br = undefined as any;
    }
    for (let e of data.moveX) {
        let br = new WriteBufferDataView()
        buildEventData(br, e)
        view.setArrayBuffer(br.build())
        br = undefined as any;
    }
    for (let e of data.moveY) {
        let br = new WriteBufferDataView()
        buildEventData(br, e)
        view.setArrayBuffer(br.build())
        br = undefined as any;
    }
    for (let e of data.alpha) {
        let br = new WriteBufferDataView()
        buildEventData(br, e)
        view.setArrayBuffer(br.build())
        br = undefined as any;
    }
    for (let e of data.rotate) {
        let br = new WriteBufferDataView()
        buildEventData(br, e)
        view.setArrayBuffer(br.build())
        br = undefined as any;
    }
}

export function readEventLayerData(view: ReadBufferDataView): jsonEventLayer {
    let data: jsonEventLayer = {
        speed: [],
        moveX: [],
        moveY: [],
        alpha: [],
        rotate: []
    } as any;
    let speedLength = view.getInt32()
    let moveXLength = view.getInt32()
    let moveYLength = view.getInt32()
    let alphaLength = view.getInt32()
    let rotateLength = view.getInt32()
    for (let i = 0, length = speedLength; i < length; i++) {
        let buf = view.getArrayBuffer()
        data.speed.push(readNumberValueEventData(new ReadBufferDataView(new DataView(buf.buffer, buf.byteOffset))))
    }
    for (let i = 0, length = moveXLength; i < length; i++) {
        let buf = view.getArrayBuffer()
        data.moveX.push(readEventData(new ReadBufferDataView(new DataView(buf.buffer, buf.byteOffset))))
    }
    for (let i = 0, length = moveYLength; i < length; i++) {
        let buf = view.getArrayBuffer()
        data.moveY.push(readEventData(new ReadBufferDataView(new DataView(buf.buffer, buf.byteOffset))))
    }
    for (let i = 0, length = alphaLength; i < length; i++) {
        let buf = view.getArrayBuffer()
        data.alpha.push(readEventData(new ReadBufferDataView(new DataView(buf.buffer, buf.byteOffset))))
    }
    for (let i = 0, length = rotateLength; i < length; i++) {
        let buf = view.getArrayBuffer()
        data.rotate.push(readEventData(new ReadBufferDataView(new DataView(buf.buffer, buf.byteOffset))))
    }
    return data
}


export function buildOtherEventData(view: WriteBufferDataView, data: jsonJudgeLineData) {
    view.setInt32(data.floorPositions.length)
    view.setInt32(data.extendEvent.color.length)
    view.setInt32(data.extendEvent.scaleX.length)
    view.setInt32(data.extendEvent.scaleY.length)
    view.setInt32(data.extendEvent.text.length)
    view.setInt32(data.extendEvent.incline.length)
    view.setInt32(data.noteControls.alpha.length)
    view.setInt32(data.noteControls.scale.length)
    view.setInt32(data.noteControls.x.length)
    for (let e of data.floorPositions) {
        let br = new WriteBufferDataView()
        buildFloorPositionEventData(br, e)
        view.setArrayBuffer(br.build())
        br = undefined as any;
    }
    for (let e of data.extendEvent.color) {
        let br = new WriteBufferDataView()
        buildColorValueEventData(br, e)
        view.setArrayBuffer(br.build())
        br = undefined as any;
    }
    for (let e of data.extendEvent.scaleX) {
        let br = new WriteBufferDataView()
        buildEventData(br, e)
        view.setArrayBuffer(br.build())
        br = undefined as any;
    }
    for (let e of data.extendEvent.scaleY) {
        let br = new WriteBufferDataView()
        buildEventData(br, e)
        view.setArrayBuffer(br.build())
        br = undefined as any;
    }
    for (let e of data.extendEvent.text) {
        let br = new WriteBufferDataView()
        buildStringValueEventData(br, e)
        view.setArrayBuffer(br.build())
        br = undefined as any;
    }
    for (let e of data.extendEvent.incline) {
        let br = new WriteBufferDataView()
        buildEventData(br, e)
        view.setArrayBuffer(br.build())
        br = undefined as any;
    }

    for (let e of data.noteControls.scale) {
        let br = new WriteBufferDataView()
        buildEventData(br, e)
        view.setArrayBuffer(br.build())
        br = undefined as any;
    }
    for (let e of data.noteControls.alpha) {
        let br = new WriteBufferDataView()
        buildEventData(br, e)
        view.setArrayBuffer(br.build())
        br = undefined as any;
    }
    for (let e of data.noteControls.x) {
        let br = new WriteBufferDataView()
        buildEventData(br, e)
        view.setArrayBuffer(br.build())
        br = undefined as any;
    }

}

export function readOtherEventData(view: ReadBufferDataView): jsonJudgeLineData {
    let data: jsonJudgeLineData = {
        floorPositions: [],
        extendEvent: {
            color: [],
            scaleX: [],
            scaleY: [],
            text: [],
            incline: []
        },
        noteControls: {
            alpha: [],
            scale: [],
            x: [],
        }
    } as any;
    let floorPositionsLength = view.getInt32()
    let colorLength = view.getInt32()
    let scaleXLength = view.getInt32()
    let scaleYLength = view.getInt32()
    let textLength = view.getInt32()
    let inclineLength = view.getInt32()
    let alphaLength = view.getInt32()
    let scaleLength = view.getInt32()
    let xLength = view.getInt32()
    for (let i = 0, length = floorPositionsLength; i < length; i++) {
        let buf = view.getArrayBuffer()
        data.floorPositions.push(readFloorPositionEventData(new ReadBufferDataView(new DataView(buf.buffer, buf.byteOffset))))
    }
    for (let i = 0, length = colorLength; i < length; i++) {
        let buf = view.getArrayBuffer()
        data.extendEvent.color.push(readColorValueEventData(new ReadBufferDataView(new DataView(buf.buffer, buf.byteOffset))))
    }
    for (let i = 0, length = scaleXLength; i < length; i++) {
        let buf = view.getArrayBuffer()
        data.extendEvent.scaleX.push(readEventData(new ReadBufferDataView(new DataView(buf.buffer, buf.byteOffset))))
    }
    for (let i = 0, length = scaleYLength; i < length; i++) {
        let buf = view.getArrayBuffer()
        data.extendEvent.scaleY.push(readEventData(new ReadBufferDataView(new DataView(buf.buffer, buf.byteOffset))))
    }
    for (let i = 0, length = textLength; i < length; i++) {
        let buf = view.getArrayBuffer()
        data.extendEvent.text.push(readStringValueEventData(new ReadBufferDataView(new DataView(buf.buffer, buf.byteOffset))))
    }
    for (let i = 0, length = inclineLength; i < length; i++) {
        let buf = view.getArrayBuffer()
        data.extendEvent.incline.push(readEventData(new ReadBufferDataView(new DataView(buf.buffer, buf.byteOffset))))
    }
    for (let i = 0, length = scaleLength; i < length; i++) {
        let buf = view.getArrayBuffer()
        data.noteControls.scale.push(readEventData(new ReadBufferDataView(new DataView(buf.buffer, buf.byteOffset))))
    }
    for (let i = 0, length = alphaLength; i < length; i++) {
        let buf = view.getArrayBuffer()
        data.noteControls.alpha.push(readEventData(new ReadBufferDataView(new DataView(buf.buffer, buf.byteOffset))))
    }
    for (let i = 0, length = xLength; i < length; i++) {
        let buf = view.getArrayBuffer()
        data.noteControls.x.push(readEventData(new ReadBufferDataView(new DataView(buf.buffer, buf.byteOffset))))
    }
    return data
}

export function buildAllJudgeLineData(view: WriteBufferDataView, data: jsonJudgeLineData) {
    buildJudgeLineData(view, data)
    buildOtherEventData(view, data)
    view.setInt32(data.eventLayers.length)
    for (let i of data.eventLayers) {
        buildEventLayerData(view, i)
    }
}

export function readAllJudgeLineData(view: ReadBufferDataView): jsonJudgeLineData {
    let rd = {
        ...readJudgeLineData(view), ...readOtherEventData(view)
    }
    let l = view.getInt32()
    let evls = []
    for (let i = 0, length = l; i < length; i++) {
        evls.push(readEventLayerData(view))
    }
    rd.eventLayers = evls
    return rd
}

export function buildNoteData(view: WriteBufferDataView, data: jsonNoteData) {
    view.setInt32(data.id)
    view.setInt8(data.type)
    view.setFloat64(data.time)
    view.setFloat64(data.holdTime)
    view.setFloat64(data.holdTimeLength)
    view.setFloat64(data.speed)
    view.setFloat64(data.floorPosition)
    view.setFloat64(data.holdLength)
    view.setFloat64(data.endPosition)
    view.setFloat64(data.positionX)
    view.setFloat64(data.basicAlpha)
    view.setFloat64(data.visibleTime)
    view.setFloat64(data.yOffset)
    view.setFloat64(data.xScale)
    view.setBool(data.isAbove)
    view.setBool(data.isFake)
    view.setBool(data.isMulti)
    view.setBool(data.useOfficialSpeed)
    view.setInt32(data.judgeline)
    view.setString(text(data.texture, ""))
    view.setString(text(data.hitsound, ""))


}

export function readNoteData(view: ReadBufferDataView): jsonNoteData {
    let data: jsonNoteData = {} as any;
    data.id = view.getInt32();
    data.type = view.getInt8();
    data.time = view.getFloat64();
    data.holdTime = view.getFloat64();
    data.holdTimeLength = view.getFloat64();
    data.speed = view.getFloat64();
    data.floorPosition = view.getFloat64();
    data.holdLength = view.getFloat64();
    data.endPosition = view.getFloat64();
    data.positionX = view.getFloat64();
    data.basicAlpha = view.getFloat64();
    data.visibleTime = view.getFloat64();
    data.yOffset = view.getFloat64();
    data.xScale = view.getFloat64();
    data.isAbove = view.getBool();
    data.isFake = view.getBool();
    data.isMulti = view.getBool();
    data.useOfficialSpeed = view.getBool();
    data.judgeline = view.getInt32();
    data.texture = view.getString();
    data.hitsound = view.getString();
    data.texture = data.texture == "" ? undefined! : data.texture
    data.hitsound = data.hitsound == "" ? undefined! : data.hitsound
    return data;
}

export function buildBpmEventData(view: WriteBufferDataView, data: bpmEvent) {
    view.setFloat64(data.startTime)
    view.setFloat64(data.endTime)
    view.setFloat64(data.bpm)
    view.setFloat64(data.holdBetween)

}

export function readBpmEventData(view: ReadBufferDataView): bpmEvent {
    let data: bpmEvent = {} as any;
    data.startTime = view.getFloat64()
    data.endTime = view.getFloat64()
    data.bpm = view.getFloat64()
    data.holdBetween = view.getFloat64()
    return data
}

function toArrayBuffer(d: Uint8Array | ArrayBuffer) {
    if (d instanceof Uint8Array) {
        return d.buffer
    }
    return d
}

export class ChartFile {
    private constructor() { }
    static async from(chart: Chart) {
        let view = new WriteBufferDataView()
        view.setFloat64(chart.offset)
        /////////////////////////////
        let judgelines = []
        for (let i of chart.judgelines) {
            judgelines.push(i.exportToJson())
        }

        view.setInt32(chart.judgelines.length)
        for (let d of judgelines) {
            buildAllJudgeLineData(view, d)
        }
        /////////////////////////////
        let otherJudgelines = []
        for (let i of chart.othersJudgeLine) {
            otherJudgelines.push(i.exportToJson())
        }
        view.setInt32(chart.othersJudgeLine.length)
        for (let d of otherJudgelines) {
            buildAllJudgeLineData(view, d)
        }
        /////////////////////////////
        let notes = []
        for (let i of chart.notes) {
            notes.push(i.exportToJson())
        }
        view.setInt32(chart.notes.length)
        for (let d of notes) {
            buildNoteData(view, d)
        }
        /////////////////////////////
        view.setInt32(chart.bpmList.length)
        for (let d of chart.bpmList) {
            buildBpmEventData(view, d)
        }
        /////////////////////////////
        let buf = view.build()
        return gzipSync(new Uint8Array(buf), {
            level: 9,
            mem: 12
        }).buffer
    }

    static async read(file: Uint8Array | ArrayBuffer) {
        let buf = decompressSync(file instanceof Uint8Array ? file : new Uint8Array(file)).buffer;
        let chart = new Chart()
        let view = new ReadBufferDataView(new DataView(buf))
        chart.offset = view.getFloat64()
        /////////////////////////////
        let judgelines = []

        let judgelinesLength = view.getInt32()
        for (let i = 0, length = judgelinesLength; i < length; i++) {
            judgelines.push(Judgeline.from(readAllJudgeLineData(view)))
        }
        /////////////////////////////
        let otherJudgelines = []

        let otherJudgelinesLength = view.getInt32()
        for (let i = 0, length = otherJudgelinesLength; i < length; i++) {
            otherJudgelines.push(Judgeline.from(readAllJudgeLineData(view)))
        }
        /////////////////////////////
        let notes = []
        let notesLength = view.getInt32()
        for (let i = 0, length = notesLength; i < length; i++) {
            notes.push(Note.from(readNoteData(view)))
        }
        /////////////////////////////
        for (let i = 0, length = view.getInt32(); i < length; i++) {
            chart.bpmList.push(readBpmEventData(view))
        }
        /////////////////////////////
        chart.judgelines = judgelines
        chart.othersJudgeLine = otherJudgelines
        chart.notes = notes
        chart.judgelines.forEach((judgeline) => {
            judgeline.eventLayers.forEach((eventLayer) => {
                /* eventLayer.speed = utils.arrangeSameSingleValueEvent(eventLayer.speed); */
                eventLayer.moveX = arrangeLineEvents(eventLayer.moveX);
                eventLayer.moveY = arrangeLineEvents(eventLayer.moveY);
                eventLayer.rotate = arrangeLineEvents(eventLayer.rotate);
                eventLayer.alpha = arrangeLineEvents(eventLayer.alpha);
            });

            for (const name in judgeline.extendEvent) {
                if (name !== 'color' && name !== 'text')
                    (judgeline.extendEvent as any)[name] = arrangeLineEvents((judgeline.extendEvent as any)[name]);
                else
                    judgeline.extendEvent[name] = arrangeSingleValueLineEvents(judgeline.extendEvent[name]);
            }

            judgeline.sortEvent();
        });
        chart.readLineTextureInfo([]);
        chart.sortJudgelines()
        const getJudgeLineByID = (id: number) => {
            for (let jl of chart.judgelines) {
                if (jl.id == id) {
                    return jl
                }
            }
            for (let jl of chart.othersJudgeLine) {
                if (jl.id == id) {
                    return jl
                }
            }
            return undefined
        }
        chart.judgelines.forEach((judgeline) => {
            judgeline.parentLine = getJudgeLineByID(judgeline as any)!
        });
        chart.notes.forEach((note) => {
            note.judgeline = getJudgeLineByID(note.judgeline as any)!
        });
        return chart
    }
}