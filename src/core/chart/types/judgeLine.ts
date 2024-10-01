import { Event, Event2, speedEvent } from "../baseEvents"
import { extendNoteData } from "./note"

export interface judgeLineData {
    bpm: number
    notesAbove: extendNoteData[]
    notesBelow: extendNoteData[]
    speedEvents: speedEvent[]
    judgeLineMoveEvents: Event2[]
    judgeLineRotateEvents: Event[]
    judgeLineDisappearEvents: Event[]
}