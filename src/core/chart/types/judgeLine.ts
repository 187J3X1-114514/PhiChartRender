import { Event, Event2, floorPositionEvent, speedEvent,  valueEvent } from "../baseEvents"
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

export interface jsonJudgeLineData {
    id: number;
    texture: string;
    isText: boolean;
    parentLine: number;
    zIndex: number;
    isCover: boolean;
    useOfficialScale: boolean;
    text: string
    eventLayers: jsonEventLayer[];
    floorPositions: floorPositionEvent[];
    extendEvent: {
        color: valueEvent[],
        scaleX: Event[],
        scaleY: Event[],
        text: valueEvent[],
        incline: Event[]
    };
    noteControls: {
        alpha: Event[],
        scale: Event[],
        x: Event[],
    };
    attachUI: string;
}

export interface jsonEventLayer{
    speed: valueEvent[]
    moveX: Event[]
    moveY: Event[]
    alpha: Event[]
    rotate: Event[]
}