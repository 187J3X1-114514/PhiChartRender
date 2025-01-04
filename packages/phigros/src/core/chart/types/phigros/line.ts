import { speedEvent, judgeLineMoveEvent, judgeLineRotateEvent, judgeLineDisappearEvent } from "./event"
import { phiNote } from "./note"

interface judgeLine {
    bpm: number
    notesAbove: phiNote[]
    notesBelow: phiNote[]
    speedEvents: speedEvent[]
    judgeLineMoveEvents: judgeLineMoveEvent[]
    judgeLineRotateEvents: judgeLineRotateEvent[]
    judgeLineDisappearEvents: judgeLineDisappearEvent[]
}

export {
    type judgeLine
}