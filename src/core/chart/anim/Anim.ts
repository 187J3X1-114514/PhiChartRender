import { Destroyable } from "../types/object"

export interface BaseEvent<V> {
    startTime: number
    endTime: number
    start: V,
    end: V
}

export interface BaseAnim<V, _T extends BaseEvent<V>> extends Destroyable {
    time: number
    now(): any
    sort(): void
}
export const EVENTSORTER = (a: BaseEvent<any>, b: BaseEvent<any>) => a.startTime - b.startTime;
export type Event = BaseEvent<number>
export type InterpolationFunction<T> = (events: BaseEvent<T>[], eventIndex: number, time: number) => T

export class Anim<V, T extends BaseEvent<V>> implements BaseAnim<V, T> {
    private _time: number = 0
    public eventIndex: number = 0
    public noInterpolation: boolean
    public defaultValue?: V;
    private interpolationFunction: InterpolationFunction<V>
    events: T[]
    constructor(events: T[] = [], noInterpolation: boolean = false, interpolationFunction: InterpolationFunction<V>) {
        this.events = events
        this.noInterpolation = noInterpolation
        this.interpolationFunction = interpolationFunction
    }
    destory(): void {
        this.events = []
    }

    push(event: T) {
        this.events.push(event)
    }

    get time() {
        return this._time
    }

    get length() {
        return this.events.length
    }

    set time(time: number) {
        this._time = time
        this._updateTime()
    }

    private _updateTime() {
        if (this.events.length === 0) return;
        while (this.eventIndex < this.events.length - 1 && this.events[this.eventIndex + 1].startTime <= this._time) {
            this.eventIndex++;
        }
        while (this.eventIndex > 0 && this.events[this.eventIndex].startTime > this._time) {
            this.eventIndex--;
        }
    }

    get lastEventIndex() {
        return this.length - 1
    }

    nextEvent(eventIndex: number) {
        if (eventIndex >= this.lastEventIndex) {
            return this.events[this.lastEventIndex]
        } else {
            return this.events[eventIndex]
        }
    }


    now(): V | undefined {
        if (this.length === 0) return this.defaultValue;
        return this.interpolationFunction(this.events, this.eventIndex, this._time)
    }

    sort() {
        this.events.sort(EVENTSORTER)
    }
}

export const floatInterpolationFunction: InterpolationFunction<number> =
    (events: BaseEvent<number>[], eventIndex: number, time: number) => {
        let event = events[eventIndex];
        if (event.start === event.end) return event.start;
        let timePercent = (time - event.startTime) / (event.endTime - event.startTime);
        return event.start + (event.end - event.start) * timePercent;
    }
export const valueInterpolationFunction: InterpolationFunction<number> =
    (events: BaseEvent<number>[], eventIndex: number, time: number) => {
        let event = events[eventIndex];
        return event.end;
    }

export class AnimFloat extends Anim<number, BaseEvent<number>> {
    constructor(events: BaseEvent<number>[] = [], noInterpolation: boolean = false) {
        super(events, noInterpolation, floatInterpolationFunction)
    }
}

export class AnimValue extends Anim<number, BaseEvent<number>> {
    constructor(events: BaseEvent<number>[] = [], noInterpolation: boolean = true) {
        super(events, noInterpolation, valueInterpolationFunction)
    }
}