import { PrprExtra } from "../core/prpr/prpr";
import { ReadBufferDataView, WriteBufferDataView } from "./data_view";
import type { PrPrExtraJSON, PrPrExtraEffect, PrPrExtraVideo } from "../core/prpr/types";
import { buildBaseBpmEventData, buildRpeEventData, readBaseBpmEventData, readRpeEventData } from "./event";
import type { rpeEvent } from "../core/chart/baseEvents";

export function buildVideoEventData(view: WriteBufferDataView, data: PrPrExtraVideo) {
    view.setString(data.path)
    view.setString(data.scale)
    view.setInt32(data.time[0])
    view.setInt32(data.time[1])
    view.setInt32(data.time[2])

    view.setInt32(data.startTime[0])
    view.setInt32(data.startTime[1])
    view.setInt32(data.startTime[2])

    view.setInt32(data.endTime[0])
    view.setInt32(data.endTime[1])
    view.setInt32(data.endTime[2])

    view.setInt32(data.easingType)
    view.setFloat64(data.easingLeft)
    view.setFloat64(data.easingRight)

    if (!(data.alpha instanceof Array)) {
        data.alpha = [
            {
                startTime: [0, 0, 1],
                endTime: [99999, 0, 1],
                easingType: 1,
                easingLeft: 0,
                easingRight: 1,
                start: data.alpha,
                end: data.alpha
            }
        ]
    }
    view.setInt32(data.alpha.length)
    for (let d of data.alpha) {
        let br = new WriteBufferDataView()
        buildRpeEventData(br, d)
        view.setArrayBuffer(br.build())
        br = undefined as any;
    }



    if (!(data.dim instanceof Array)) {
        data.dim = [
            {
                startTime: [0, 0, 1],
                endTime: [99999, 0, 1],
                easingType: 1,
                easingLeft: 0,
                easingRight: 1,
                start: data.dim,
                end: data.dim
            }
        ]
    }
    view.setInt32(data.dim.length)
    for (let d of data.dim) {
        let br = new WriteBufferDataView()
        buildRpeEventData(br, d)
        view.setArrayBuffer(br.build())
        br = undefined as any;
    }
}

export function readVideoEventData(view: ReadBufferDataView): PrPrExtraVideo {
    let data: PrPrExtraVideo = {} as any;
    data.path = view.getString()
    data.scale = view.getString()
    data.time = [
        view.getInt32(),
        view.getInt32(),
        view.getInt32()
    ]
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

    data.alpha = []
    let alphaLength = view.getInt32()
    for (let i = 0, length = alphaLength; i < length; i++) {
        let buf = view.getArrayBuffer()
        data.alpha.push(readRpeEventData(new ReadBufferDataView(new DataView(buf.buffer, buf.byteOffset))))
    }

    data.dim = []
    let dimLength = view.getInt32()
    for (let i = 0, length = dimLength; i < length; i++) {
        let buf = view.getArrayBuffer()
        data.dim.push(readRpeEventData(new ReadBufferDataView(new DataView(buf.buffer, buf.byteOffset))))
    }

    return data
}

export function buildEffectData(view: WriteBufferDataView, data: PrPrExtraEffect) {
    view.setInt32(data.start[0])
    view.setInt32(data.start[1])
    view.setInt32(data.start[2])

    view.setInt32(data.end[0])
    view.setInt32(data.end[1])
    view.setInt32(data.end[2])

    view.setString(data.shader)
    view.setBool(data.global == undefined ? false : data.global)
    if (data.vars == undefined) data.vars = {}
    for (let _var in data.vars) {
        let uni = data.vars[_var]
        if (uni instanceof Array) {
            if (typeof uni[0] == "number") {
                uni = [{
                    startTime: [0, 0, 1],
                    endTime: [99999, 0, 1],
                    easingType: 1,
                    easingLeft: 0,
                    easingRight: 1,
                    start: uni as any,
                    end: uni as any
                }]
            }
        } else {
            uni = [{
                startTime: [0, 0, 1],
                endTime: [99999, 0, 1],
                easingType: 1,
                easingLeft: 0,
                easingRight: 1,
                start: uni,
                end: uni
            }]
        }
    }
    let allVar: Record<string, rpeEvent[]> = data.vars as any
    view.setInt32(Object.keys(allVar).length)
    for (let _var in allVar) {
        view.setString(_var)
        view.setInt32(allVar[_var].length)
        for (let _ev of allVar[_var]) {
            let br = new WriteBufferDataView()
            buildRpeEventData(br, _ev)
            view.setArrayBuffer(br.build())
            br = undefined as any;
        }
    }
}

export function readEffectData(view: ReadBufferDataView) {
    let data: PrPrExtraEffect = {} as any;
    data.start = [
        view.getInt32(),
        view.getInt32(),
        view.getInt32()
    ]
    data.end = [
        view.getInt32(),
        view.getInt32(),
        view.getInt32()
    ]
    data.shader = view.getString()
    data.global = view.getBool()
    data.vars = {}

    let varsLength = view.getInt32()
    for (let i = 0, length = varsLength; i < length; i++) {
        let _var = view.getString()
        let _varLength = view.getInt32()
        data.vars[_var] = []
        for (let i = 0, length = _varLength; i < length; i++) {
            let buf = view.getArrayBuffer()
            data.vars[_var].push(
                readRpeEventData(
                    new ReadBufferDataView(
                        new DataView(
                            buf.buffer,
                            buf.byteOffset
                        )
                    )
                ) as any
            )
        }
    }

    return data
}

export class PrprExtraFile {
    private constructor() { }
    static async from(prpr: PrprExtra) {
        let src = prpr.src
        if (src.bpm == undefined) src.bpm = []
        if (src.effects == undefined) src.effects = []
        if (src.videos == undefined) src.videos = []
        let view = new WriteBufferDataView()
        view.setInt32(src.bpm.length)
        view.setInt32(src.videos.length)
        view.setInt32(src.effects.length)
        for (let bpm of src.bpm) {
            buildBaseBpmEventData(view, bpm)
        }

        for (let video of src.videos) {
            buildVideoEventData(view, video)
        }

        for (let effect of src.effects) {
            buildEffectData(view, effect)
        }
        let buf = view.build()
        return buf
    }

    static async read(file: Uint8Array | ArrayBuffer) {
        let buf = file instanceof Uint8Array ? file.buffer : file;
        let src = {} as any as PrPrExtraJSON
        let view = new ReadBufferDataView(new DataView(buf))
        let bpmLength = view.getInt32()
        let videosLength = view.getInt32()
        let effectsLength = view.getInt32()
        src.bpm = []
        for (let i = 0, length = bpmLength; i < length; i++) {
            src.bpm.push(readBaseBpmEventData(view))
        }
        if (videosLength != 0) {
            src.videos = []
            for (let i = 0, length = videosLength; i < length; i++) {
                src.videos.push(readVideoEventData(view))
            }
        }
        if (effectsLength != 0) {
            src.effects = []
            for (let i = 0, length = effectsLength; i < length; i++) {
                src.effects.push(readEffectData(view))
            }
        }
        return PrprExtra.from(src)
    }
}