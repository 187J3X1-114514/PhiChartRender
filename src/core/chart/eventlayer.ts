import { FloatAnim } from "./anim/float";
import type { Event, ValueEvent } from "./anim/type";
import { ValueAnim } from "./anim/value";
import type { jsonEventLayer } from "./types/judgeLine";

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

    public speedIndex: number = 0;
    public moveXIndex: number = 0;
    public moveYIndex: number = 0;
    public alphaIndex: number = 0;
    public rotateIndex: number = 0;
    public moveYOriginValue?: number
    public alphaOriginValue?: number
    public rotateOriginValue?: number
    sort() {
        this.speed.sort();
        this.moveX.sort();
        this.moveY.sort();
        this.alpha.sort();
        this.rotate.sort();
    }

    set speedOriginValue(value: number) {

    }
    set moveXOriginValue(value: number) {

    }

    calcTime(currentTime: number) {
        let _posX = this.moveX.calculate(currentTime)
        let _posY = this.moveY.calculate(currentTime)
        let _alpha = this.alpha.calculate(currentTime)
        let _rotate = this.rotate.calculate(currentTime)
        //let _speed = this.speed.calculate(currentTime); <--有问题
        this._posX = _posX.notDefault ? _posX.value : this._posX
        this._posY = _posY.notDefault ? _posY.value : this._posY
        this._alpha = _alpha.notDefault ? _alpha.value : this._alpha
        this._rotate = _rotate.notDefault ? _rotate.value : this._rotate
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
