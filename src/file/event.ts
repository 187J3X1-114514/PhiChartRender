import type { jsonEventLayer } from "../core/chart/types/judgeLine";
import { number } from "../core/verify";
import type { BpmEvent, Event, floorPositionEvent, RPEEvent, ValueEvent } from "../core/chart/anim/type";
import { ReadBufferDataView, WriteBufferDataView } from "./data_view";

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

export function buildRpeEventData(view: WriteBufferDataView, data: RPEEvent) {
    view.setInt32(data.startTime[0])
    view.setInt32(data.startTime[1])
    view.setInt32(data.startTime[2])
    view.setInt32(data.endTime[0])
    view.setInt32(data.endTime[1])
    view.setInt32(data.endTime[2])
    view.setInt32(data.easingType ? data.easingType : 1)
    view.setFloat64(data.easingLeft ? data.easingLeft : 0)
    view.setFloat64(data.easingRight ? data.easingRight : 1)

    if (!(data.start instanceof Array)) data.start = [data.start]
    if (!(data.end instanceof Array)) data.end = [data.end]

    view.setInt32(data.start.length)
    for (let d of data.start) {
        view.setFloat64(d)
    }
    view.setInt32(data.end.length)
    for (let d of data.end) {
        view.setFloat64(d)
    }
    if (data.start.length == 1) data.start = data.start[0]
    if (data.end.length == 1) data.end = data.end[0]
}

export function readRpeEventData(view: ReadBufferDataView): RPEEvent {
    let data: RPEEvent = {} as any;
    data.startTime = [
        view.getInt32(),
        view.getInt32(),
        view.getInt32()
    ]
    data.endTime = [
        view.getInt32(),
        view.getInt32(),
        view.getInt32()
    ]
    data.easingType = view.getInt32()
    data.easingLeft = view.getFloat64()
    data.easingRight = view.getFloat64()

    data.start = []
    let startLength = view.getInt32()
    for (let i = 0, length = startLength; i < length; i++) {
        data.start.push(view.getFloat64())
    }
    data.end = []
    let endLength = view.getInt32()
    for (let i = 0, length = endLength; i < length; i++) {
        data.end.push(view.getFloat64())
    }

    if (data.start.length == 1) data.start = data.start[0]
    if (data.end.length == 1) data.end = data.end[0]
    return data
}
/*
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
}*/

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

export function buildNumberValueEventData(view: WriteBufferDataView, data: ValueEvent) {
    view.setFloat64(data.startTime)
    view.setFloat64(data.endTime)
    view.setFloat64(data.value)

}

export function readNumberValueEventData(view: ReadBufferDataView): ValueEvent {
    let data: ValueEvent = {} as any;
    data.startTime = view.getFloat64()
    data.endTime = view.getFloat64()
    data.value = view.getFloat64()
    return data
}

export function buildColorValueEventData(view: WriteBufferDataView, data: ValueEvent) {
    view.setFloat64(data.startTime)
    view.setFloat64(data.endTime)
    view.setFloat64(data.value[0])
    view.setFloat64(data.value[1])
    view.setFloat64(data.value[2])
    view.setFloat64(data.value[3])

}

export function readColorValueEventData(view: ReadBufferDataView): ValueEvent {
    let data: ValueEvent = {} as any;
    data.startTime = view.getFloat64()
    data.endTime = view.getFloat64()
    data.value = [view.getFloat64(), view.getFloat64(), view.getFloat64(), view.getFloat64()]
    return data
}

export function buildStringValueEventData(view: WriteBufferDataView, data: ValueEvent) {
    view.setFloat64(data.startTime)
    view.setFloat64(data.endTime)
    view.setString(data.value)

}

export function readStringValueEventData(view: ReadBufferDataView): ValueEvent {
    let data: ValueEvent = {} as any;
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

export function buildBpmEventData(view: WriteBufferDataView, data: BpmEvent) {
    view.setFloat64(data.startTime)
    view.setFloat64(data.endTime)
    view.setFloat64(data.bpm)
    view.setFloat64(data.holdBetween)

}

export function readBpmEventData(view: ReadBufferDataView): BpmEvent {
    let data: BpmEvent = {} as any;
    data.startTime = view.getFloat64()
    data.endTime = view.getFloat64()
    data.bpm = view.getFloat64()
    data.holdBetween = view.getFloat64()
    return data
}

export function buildBaseBpmEventData(view: WriteBufferDataView, data: 
    { time: number[],bpm:number }
) {
    view.setInt32(data.time[0])
    view.setInt32(data.time[1])
    view.setInt32(data.time[2])
    view.setFloat64(data.bpm)

}

export function readBaseBpmEventData(view: ReadBufferDataView): { time: number[],bpm:number } {
    let data: { time: number[],bpm:number } = {} as any;
    data.time = [
        view.getInt32(),
        view.getInt32(),
        view.getInt32()
    ]
    data.bpm = view.getFloat64()
    return data
}