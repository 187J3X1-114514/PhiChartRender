import { AnimFloat } from "../anim/Anim";
import { AnimVecFloat } from "../anim/AnimVec";
import { Vec2 } from "../types/data";
import { Destroyable } from "../types/object";

interface ObjectState {
    pos: Vec2<number>
    alpha: number
    rotation: number
    scale: Vec2<number>
}

export class BaseObject implements Destroyable {
    private _time: number = 0
    public pos: AnimVecFloat = new AnimVecFloat()
    public alpha: AnimFloat = new AnimFloat()
    public rotation: AnimFloat = new AnimFloat()
    public scale: AnimVecFloat = new AnimVecFloat()
    constructor() {
        this.pos.animX.defaultValue = 0
        this.pos.animY.defaultValue = 0
        this.scale.animX.defaultValue = 1
        this.scale.animY.defaultValue = 1
        this.alpha.defaultValue = 1
        this.rotation.defaultValue = 0
    }
    destory(): void {
        this.pos.destory()
        this.alpha.destory()
        this.rotation.destory()
        this.scale.destory()
    }
    get time() {
        return this._time
    }
    set time(time: number) {
        this._time = time
        this.pos.time = time
        this.alpha.time = time
        this.rotation.time = time
        this.scale.time = time
    }

    now(): ObjectState {
        return {
            pos: this.pos.now()!,
            alpha: this.alpha.now()!,
            rotation: this.rotation.now()!,
            scale: this.scale.now()!
        }
    }

    sort() {
        this.alpha.sort()
        this.pos.sort()
        this.rotation.sort()
        this.scale.sort()
    }

}