import { Container, Graphics, Sprite, Texture } from "pixi.js";
import { PrPrExtraVideo } from "../types";
import { Event } from "../../chart/baseEvents";
import { SizerData } from "../../types/params";

export class PrprVideo {
    public video: HTMLVideoElement = {} as any
    public scaleType: 'cropCenter' | 'inside' | 'fit' = 'cropCenter'
    public alpha: Event[] = []
    public dim: Event[] = []
    public _alpha: number = 1
    public _dim: number = 1
    public sprite: Container = {} as any
    public videoSprite: Sprite = {} as any
    public dimSprite: Graphics = {} as any
    public start: number = 0
    public end: number = 0
    static from(tex: Texture, data: PrPrExtraVideo) {
        let pv = new this()
        if (tex._source.resource instanceof HTMLVideoElement) {
            pv.video = tex._source.resource
            pv.video.pause()
        }
        pv.scaleType = data.scale as any
        pv.alpha = data.alpha as any
        pv.dim = data.dim as any
        pv.start = data.time as any as number
        pv.end = pv.start + pv.video.duration
        pv.sprite = new Container()
        pv.videoSprite = new Sprite(tex)
        pv.dimSprite = new Graphics()
        pv.dimSprite.rect(0, 0, tex.width * 100, tex.height * 100)
        pv.dimSprite.fill({
            color: "#000000"
        })
        pv.dimSprite.alpha = 0
        pv.videoSprite.alpha = 1
        pv.videoSprite.zIndex = 10
        pv.dimSprite.zIndex = 20
        pv.sprite.addChild(pv.videoSprite)
        pv.sprite.addChild(pv.dimSprite)
        return pv
    }
    calcTime(currentTime: number) {
        this._alpha = 1
        this._dim = 1
        //同步
        //this.video.currentTime = Math.min(Math.max(currentTime - this.start, 0), this.video.duration)
        for (let i = 0, length = this.alpha.length; i < length; i++) {
            let event = this.alpha[i];
            if (event.start == event.end) { this._alpha = event.start; continue; }
            if (event.endTime < currentTime) continue;
            if (event.startTime > currentTime) break;

            let timePercentEnd = (currentTime - event.startTime) / (event.endTime - event.startTime);
            let timePercentStart = 1 - timePercentEnd;
            this._alpha = event.start * timePercentStart + event.end * timePercentEnd;
        }
        for (let i = 0, length = this.dim.length; i < length; i++) {
            let event = this.dim[i];
            if (event.start == event.end) { this._dim = event.start; continue; }
            if (event.endTime < currentTime) continue;
            if (event.startTime > currentTime) break;

            let timePercentEnd = (currentTime - event.startTime) / (event.endTime - event.startTime);
            let timePercentStart = 1 - timePercentEnd;
            this._dim = event.start * timePercentStart + event.end * timePercentEnd;
        }
        this.sprite.alpha = this._alpha
        this.dimSprite.alpha = 1 - this._dim
    }
    pause() {
        this.videoSprite.texture._source.resource.pause()
    }
    play() {
        this.videoSprite.texture._source.resource.play()
    }
    resize(size: SizerData) {
        let scaleX
        let scaleY
        let x
        let y

        switch (this.scaleType) {
            case "cropCenter":
                scaleY = size.height / this.videoSprite.texture.height
                scaleX = scaleY
                this.videoSprite.anchor.set(0.5)
                x = size.width / 2
                y = size.height / 2
                break
            case "inside":
                scaleY = size.height / this.videoSprite.texture.height
                scaleX = scaleY
                this.videoSprite.anchor.set(0.5)
                x = size.width / 2
                y = size.height / 2
                break
            case "fit":
                scaleX = size.width / this.videoSprite.texture.width
                scaleY = size.height / this.videoSprite.texture.height
                this.videoSprite.anchor.set(0)
                x = 0
                y = 0
                break
        }
        this.videoSprite.scale.x = scaleX
        this.videoSprite.scale.y = scaleY
        this.dimSprite.position.set(-10000, -10000)
        this.sprite.position.set(x, y)
    }
}