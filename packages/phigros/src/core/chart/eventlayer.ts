import { FloatAnim } from "./anim/float";
import type { Event } from "./anim/type";
import { ValueAnim } from "./anim/value";

export default class EventLayer {
    public speedAnim: ValueAnim = new ValueAnim()
    public moveXAnim: FloatAnim = new FloatAnim();
    public moveYAnim: FloatAnim = new FloatAnim();
    public alphaAnim: FloatAnim = new FloatAnim();
    public rotateAnim: FloatAnim = new FloatAnim();

    speed: number = 0;
    posX: number = 0;
    posY: number = 0;
    alpha: number = 0;
    rotate: number = 0;
    sort() {
        this.speedAnim.sort();
        this.moveXAnim.sort();
        this.moveYAnim.sort();
        this.alphaAnim.sort();
        this.rotateAnim.sort();
    }

    constructor() {
        this.speedAnim.originValue = 1
        this.moveXAnim.originValue = 0
        this.moveYAnim.originValue = 0
        this.rotateAnim.originValue = 0
        this.alphaAnim.originValue = 1
    }

    calcTime(currentTime: number) {
        let _posX = this.moveXAnim.calculate(currentTime)
        let _posY = this.moveYAnim.calculate(currentTime)
        let _alpha = this.alphaAnim.calculate(currentTime)
        let _rotate = this.rotateAnim.calculate(currentTime)
        this.posX = _posX.value
        this.posY = _posY.value
        this.alpha = _alpha.value
        this.rotate = _rotate.value
        for (let i = 0, length = this.speedAnim.events.length; i < length; i++) {
            let event = this.speedAnim.events[i];
            if (event.endTime < currentTime) continue;
            if (event.startTime > currentTime) break;
            this.speed = event.value!;
        }
        return { alpha: _alpha.notDefault, x: _posX.notDefault, y: _posY.notDefault, rotate: _rotate.notDefault }
    }

    do(fn: (input: Event[]) => Event[]) {
        this.alphaAnim.events = fn(this.alphaAnim.events)
        this.moveXAnim.events = fn(this.moveXAnim.events)
        this.moveYAnim.events = fn(this.moveYAnim.events)
        this.rotateAnim.events = fn(this.rotateAnim.events)
    }

}
