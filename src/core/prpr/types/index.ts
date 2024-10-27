import { rpeEvent } from "../../chart/baseEvents"

export default interface PrPrExtraJSON {
    bpm: { time: number[], bpm: number }[]
    videos: PrPrExtraVideo[],
    effects: PrPrExtraEffect[]
}
export interface PrPrExtraVideo {
    path: string,
    time: number[],
    scale: string,
    alpha: number | rpeEvent[],
    dim: number | rpeEvent[],
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
    vars: Record<string, rpeEvent[] | number | number[]>
}