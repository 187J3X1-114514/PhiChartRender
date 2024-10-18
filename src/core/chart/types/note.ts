import Judgeline from "../judgeline";

export interface noteData {
    type: number
    time: number
    positionX: number
    holdTime: number
    speed: number
}
export interface extendNoteData extends noteData {
    bpm: number
    isMulti: boolean
    judgeline: Judgeline
    id: number
    isAbove: boolean
    holdEndTime?: number
    holdLength?: number
    floorPosition?: number
    lineId?: number

}
export interface jsonNoteData {
    id: number
    type: number
    time: number
    holdTime: number
    holdTimeLength: number
    speed: number
    floorPosition: number
    holdLength: number
    endPosition: number
    positionX: number
    basicAlpha: number
    visibleTime: number
    yOffset: number
    xScale: number
    isAbove: boolean
    isFake: boolean
    isMulti: boolean
    useOfficialSpeed: boolean
    judgeline: number
    texture?: string
    hitsound?: string
}

export interface NoteParam {

    id?: number,
    type?: number,
    time?: number,
    holdTime?: number,
    speed?: number,
    floorPosition?: number,
    holdLength?: number,
    positionX?: number,
    basicAlpha?: number,
    visibleTime?: number,
    yOffset?: number,
    xScale?: number,
    isAbove?: boolean,
    isMulti?: boolean,
    isFake?: boolean
    judgeline?: Judgeline,
    useOfficialSpeed?: boolean,
    texture?: string,
    hitsound?: string,
    lineId?: number

}