import { BaseAnim, calculateResult } from "./base";
import { Event } from "./type";

export class FloatAnim extends BaseAnim {
    public events: Event[] = []
    public originValue?: number
    public eventIndex: number = 0
    calculate(currentTime: number): calculateResult<number> {
        this.updateTime(currentTime)
        let event = this.events[this.eventIndex]
        if(event == undefined) return {
            value: this.originValue!,
            notDefault: false,
            eventIndex: this.eventIndex
        }
        if (event.start == event.end) return {
            value: event.start,
            notDefault: true,
            eventIndex: this.eventIndex
        }
        let timePercentEnd = (currentTime - event.startTime) / (event.endTime - event.startTime);
        timePercentEnd = Math.min(1, timePercentEnd);
        let timePercentStart = 1 - timePercentEnd;
        return {
            value: event.start * timePercentStart + event.end * timePercentEnd,
            notDefault: true,
            eventIndex: this.eventIndex
        }
    }
    push(event: Event) {
        this.events.push(event)
    }
}