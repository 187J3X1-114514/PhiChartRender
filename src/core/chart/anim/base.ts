import { BaseEvent, Event } from "./type";

export interface calculateResult<T> {
    value: T,
    notDefault: boolean
    eventIndex: number
}

export abstract class BaseAnim {
    public events: BaseEvent[] = []
    public eventIndex: number = 0
    private _time: number = 0
    protected valueCalculator(events: Event[], currentTime: number, originValue: number = 0, _eventIndex: number = 0): calculateResult<number> {
        for (let i = _eventIndex, length = events.length; i < length; i++) {
            let event = events[i];
            if (event.endTime < currentTime) continue;
            if (event.startTime > currentTime) break;
            if (event.start == event.end) return {
                value: event.start,
                notDefault: true,
                eventIndex: i
            }

            let timePercentEnd = (currentTime - event.startTime) / (event.endTime - event.startTime);
            let timePercentStart = 1 - timePercentEnd;

            return {
                value: event.start * timePercentStart + event.end * timePercentEnd,
                notDefault: true,
                eventIndex: i
            }
        }
        return {
            value: originValue,
            notDefault: false,
            eventIndex: _eventIndex
        }
    }

    abstract calculate(currentTime: number): any
    push(event: BaseEvent) {
        this.events.push(event)
    }
    sort() {
        const sorter = (a: { startTime: number }, b: { startTime: number }) => a.startTime - b.startTime;
        this.events.sort(sorter);
    }
    protected updateTime(time: number) {
        if (this.events.length === 0) return;
        while (this.eventIndex < this.events.length - 1 && this.events[this.eventIndex + 1].startTime <= time) {
            this.eventIndex++;
        }
        while (this.eventIndex > 0 && this.events[this.eventIndex].startTime > time) {
            this.eventIndex--;
        }
    }

}