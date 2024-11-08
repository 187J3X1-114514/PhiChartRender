import type { RPEEvent } from "../../chart/anim/type"

export interface PrPrExtraJSON {
    bpm: { time: number[], bpm: number }[]
    videos: PrPrExtraVideo[],
    effects: PrPrExtraEffect[]
}
export interface PrPrExtraVideo {
    path: string,
    time: number[],
    scale: string,
    alpha: number | RPEEvent[],
    dim: number | RPEEvent[],
    startTime: number[],
    endTime: number[],
    easingType: number,
    easingLeft: number,
    easingRight: number
}
export interface PrPrExtraEffect {
    start: number[],
    end: number[],
    shader: string,
    global?: boolean,
    vars: Record<string, RPEEvent[] | number | number[]>
}