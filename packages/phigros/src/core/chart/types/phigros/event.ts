interface speedEvent {
    startTime: number
    endTime: number
    value: number
}

interface judgeLineMoveEvent {
    startTime: number
    endTime: number
    start: number
    end: number
    start2: number
    end2: number
}

interface judgeLineRotateEvent {
    startTime: number
    endTime: number
    start: number
    end: number
}

interface judgeLineDisappearEvent {
    startTime: number
    endTime: number
    start: number
    end: number
}

export {
    type speedEvent,
    type judgeLineMoveEvent,
    type judgeLineRotateEvent,
    type judgeLineDisappearEvent
}