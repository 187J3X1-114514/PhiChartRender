import { Vec2 } from "../types/data";
import { AnimFloat, BaseAnim, BaseEvent } from "./Anim";

export class AnimVecFloat implements BaseAnim<number, BaseEvent<number>> {
    private _time: number = 0
    private noInterpolation: boolean
    public animX: AnimFloat
    public animY: AnimFloat
    constructor(noInterpolation: boolean = false) {
        this.noInterpolation = noInterpolation
        this.animX = new AnimFloat([], this.noInterpolation)
        this.animY = new AnimFloat([], this.noInterpolation)
    }
    do(callback: (events: BaseEvent<number>[]) => BaseEvent<number>[]): void {
        this.animX.do(callback);
        this.animY.do(callback);
    }
    get time() {
        return this._time
    }
    set time(time: number) {
        this._time = time
        this.animX.time = time
        this.animY.time = time
    }
    now(): Vec2<number> | undefined {
        return Vec2(this.animX.now()!, this.animY.now()!)
    }
    sort(): void {
        this.animX.sort()
        this.animY.sort()
    }

    destory(): void {
        this.animX.destory()
        this.animY.destory()
    }

}