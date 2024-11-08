import type { Event, OfficialChartEvent, floorPositionEvent, SpeedEvent, ValueEvent } from "../anim/type"
import type { extendNoteData } from "./note"

export interface judgeLineData {
    bpm: number
    notesAbove: extendNoteData[]
    notesBelow: extendNoteData[]
    speedEvents: SpeedEvent[]
    judgeLineMoveEvents: OfficialChartEvent[]
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
        color: ValueEvent[],
        scaleX: Event[],
        scaleY: Event[],
        text: ValueEvent[],
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
    speed: ValueEvent[]
    moveX: Event[]
    moveY: Event[]
    alpha: Event[]
    rotate: Event[]
}