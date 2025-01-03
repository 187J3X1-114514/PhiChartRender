import { FloatAnim } from "./anim/float";
import type { Event } from "./anim/type";
import { ValueAnim } from "./anim/value";
import { jsonEventLayer } from "./types/json/judgeLine";

export default class EventLayer {
    public speed: ValueAnim = new ValueAnim()
    public moveX: FloatAnim = new FloatAnim();
    public moveY: FloatAnim = new FloatAnim();
    public alpha: FloatAnim = new FloatAnim();
    public rotate: FloatAnim = new FloatAnim();

    _speed: number = 0;
    _posX: number = 0;
    _posY: number = 0;
    _alpha: number = 0;
    _rotate: number = 0;
    sort() {
        this.speed.sort();
        this.moveX.sort();
        this.moveY.sort();
        this.alpha.sort();
        this.rotate.sort();
    }

    constructor() {
        this.speed.originValue = 1
        this.moveX.originValue = 0
        this.moveY.originValue = 0
        this.rotate.originValue = 0
        this.alpha.originValue = 1
    }

    calcTime(currentTime: number) {
        let _posX = this.moveX.calculate(currentTime)
        let _posY = this.moveY.calculate(currentTime)
        let _alpha = this.alpha.calculate(currentTime)
        let _rotate = this.rotate.calculate(currentTime)
        this._posX = _posX.value
        this._posY = _posY.value
        this._alpha = _alpha.value
        this._rotate = _rotate.value
        for (let i = 0, length = this.speed.events.length; i < length; i++) {
            let event = this.speed.events[i];
            if (event.endTime < currentTime) continue;
            if (event.startTime > currentTime) break;
            this._speed = event.value!;
        }
        return { alpha: _alpha.notDefault, x: _posX.notDefault, y: _posY.notDefault, rotate: _rotate.notDefault }
    }

    exportToJson() {
        return {
            speed: this.speed.events,
            moveX: this.moveX.events,
            moveY: this.moveY.events,
            alpha: this.alpha.events,
            rotate: this.rotate.events,
        } as jsonEventLayer
    }

    static from(data: jsonEventLayer) {
        let ev = new EventLayer()
        ev.speed.events = data.speed
        ev.alpha.events = data.alpha
        ev.moveX.events = data.moveX
        ev.moveY.events = data.moveY
        ev.rotate.events = data.rotate
        return ev
    }

    do(fn: (input: Event[]) => Event[]) {
        this.alpha.events = fn(this.alpha.events)
        this.moveX.events = fn(this.moveX.events)
        this.moveY.events = fn(this.moveY.events)
        this.rotate.events = fn(this.rotate.events)
    }

}
