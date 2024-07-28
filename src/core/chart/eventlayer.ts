import { Event, valueAndEvent } from "./baseEvents";

export default class EventLayer {
    public speed: valueAndEvent[] = []//{ startTime: number, endTime: number, start?: number, end?: number, value?: number }[] = [];
    public moveX: Event[] = [];
    public moveY: Event[] = [];
    public alpha: Event[] = [];
    public rotate: Event[] = [];

    _speed: number = 0;
    _posX: number = 0;
    _posY: number = 0;
    _alpha: number = 0;
    _rotate: number = 0;

    public speedIndex: number = 0;
    public moveXIndex: number = 0;
    public moveYIndex: number = 0;
    public alphaIndex: number = 0;
    public rotateIndex: number = 0;
    public speedOriginValue?: number
    public moveXOriginValue?: number
    public moveYOriginValue?: number
    public alphaOriginValue?: number
    public rotateOriginValue?: number
    sort() {
        const sorter = (a: { startTime: number }, b: { startTime: number }) => a.startTime - b.startTime;
        this.speed.sort(sorter);
        this.moveX.sort(sorter);
        this.moveY.sort(sorter);
        this.alpha.sort(sorter);
        this.rotate.sort(sorter);
    }

    calcTime(currentTime: number) {
        this._posX = this.valueCalculator(this.moveX, currentTime, this.moveXOriginValue || this._posX);
        this._posY = this.valueCalculator(this.moveY, currentTime, this.moveYOriginValue || this._posY);
        this._alpha = this.valueCalculator(this.alpha, currentTime, this.alphaOriginValue || this._alpha);
        this._rotate = this.valueCalculator(this.rotate, currentTime, this.rotateOriginValue || this._rotate);

        for (let i = 0, length = this.speed.length; i < length; i++) {
            let event = this.speed[i];
            if (event.endTime < currentTime) continue;
            if (event.startTime > currentTime) break;

            this._speed = event.value!;
        }
    }

    valueCalculator(events: { startTime: number, endTime: number, start: number, end: number }[], currentTime: number, originValue: number = 0, _eventIndex: number = 0): number {
        for (let i = _eventIndex, length = events.length; i < length; i++) {
            let event = events[i];
            if (event.endTime < currentTime) continue;
            if (event.startTime > currentTime) break;
            if (event.start == event.end) return event.start

            let timePercentEnd = (currentTime - event.startTime) / (event.endTime - event.startTime);
            let timePercentStart = 1 - timePercentEnd;

            return event.start * timePercentStart + event.end * timePercentEnd;
        }
        //if (events[_eventIndex - 1]) {
        //    return events[_eventIndex - 1].end;
        //}
        return originValue;
    }
}
