export interface baseEvent {
    startTime: number
    endTime: number
}
export interface floorPositionEvent extends baseEvent {
    floorPosition: number
}
export interface Event extends baseEvent {
    start: number
    end: number
}
export interface Event2 extends Event {
    start2: number
    end2: number
}
export interface valueEvent extends baseEvent {
    value: any
}
export interface bpmEvent extends baseEvent {
    startTime: number
    endTime: number
    bpm: number
    holdBetween: number
}
export interface speedEvent extends valueEvent {
    value: number
    floorPosition: number
}
export interface valueAndEvent extends baseEvent {
    start?: number
    end?: number
    value?: number
}

export interface effectEvent {
    startTime: number[],
    endTime: number[],
    easingType: number,
    easingLeft: number,
    easingRight: number,
    start: number[] | number,
    end: number[] | number
}