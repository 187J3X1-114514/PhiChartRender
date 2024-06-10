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