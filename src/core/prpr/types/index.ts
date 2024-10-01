export default interface PrPrExtraJSON {
    bpm: { time: number[], bpm: number }[]
    videos: PrPrExtraVideo[],
    effects: PrPrExtraEffect[]
}
export interface PrPrExtraVideo {
    path: string,
    time: number[] | number,
    scale: string,
    alpha: number,
    dim: number,
    startTime: number[] | number,
    endTime: number[] | number,
    easingType: number,
    easingLeft: number,
    easingRight: number

}
export interface PrPrExtraEffect {
    start: number[],
    end: number[],
    shader: string,
    vars: any

}