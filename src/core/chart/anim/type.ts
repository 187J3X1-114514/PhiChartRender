export interface BaseEvent {
    startTime: number
    endTime: number
}
export interface floorPositionEvent extends BaseEvent {
    floorPosition: number
}
export interface Event extends BaseEvent {
    start: number
    end: number
}
export interface OfficialChartEvent extends Event {
    start2: number
    end2: number
}
export interface ValueEvent extends BaseEvent {
    value: any
}
export interface BpmEvent extends BaseEvent {
    startTime: number
    endTime: number
    bpm: number
    holdBetween: number
}
export interface SpeedEvent extends ValueEvent {
    value: number
    floorPosition: number
}

export interface RPEEvent {
    startTime: number[],
    endTime: number[],
    easingType?: number,
    easingLeft?: number,
    easingRight?: number,
    start: number[] | number,
    end: number[] | number
}