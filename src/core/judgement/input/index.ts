import type { SizerData } from '../../types/params';
import InputPoint from './point';
import { Graphics } from 'pixi.js';



export default class Input {

    inputs: InputPoint[]
    renderSize: SizerData
    sprite: Graphics | undefined
    _inputPointSize: number = 30
    _isPaused: boolean = false
    public onchange?: () => void
    constructor(params: any = {}) {
        if (!params.canvas) throw new Error('You cannot add inputs without a canvas');

        this.inputs = [];
        this.renderSize = {} as SizerData
        if (!params.record && params.canvas instanceof HTMLCanvasElement) this.addListenerToCanvas(params.canvas);
        this.reset();
    }

    setRenderSize(a: any) {
        this.renderSize = a
    }

    addListenerToCanvas(canvas: HTMLCanvasElement) {

        const passiveIfSupported = { passive: false };

        canvas.addEventListener('touchstart', (a) => this.touchStart(a), passiveIfSupported);
        canvas.addEventListener('touchmove', (a) => this.touchMove(a), passiveIfSupported);
        canvas.addEventListener('touchend', (a) => this.touchEnd(a), passiveIfSupported);
        canvas.addEventListener('touchcancel', (a) => this.touchEnd(a), passiveIfSupported);

        canvas.addEventListener('mousedown', (a) => this.mouseStart(a), passiveIfSupported);
        canvas.addEventListener('mousemove', (a) => this.mouseMove(a));
        canvas.addEventListener('mouseup', (a) => this.mouseEnd(a));

        canvas.addEventListener('contextmenu', this._noCanvasMenu, passiveIfSupported);
    }

    removeListenerFromCanvas(canvas: HTMLCanvasElement) {
        if (!(canvas instanceof HTMLCanvasElement)) throw new Error('This is not a canvas');

        canvas.removeEventListener('touchstart', (a) => this.touchStart(a));
        canvas.removeEventListener('touchmove', (a) => this.touchMove(a));
        canvas.removeEventListener('touchend', (a) => this.touchEnd(a));
        canvas.removeEventListener('touchcancel', (a) => this.touchEnd(a));

        canvas.removeEventListener('mousedown', (a) => this.mouseStart(a));
        canvas.removeEventListener('mousemove', (a) => this.mouseMove(a));
        canvas.removeEventListener('mouseup', (a) => this.mouseEnd(a));

        canvas.removeEventListener('contextmenu', this._noCanvasMenu);
    }

    reset() {
        this.inputs.length = 0;
    }
    private _noCanvasMenu(e: MouseEvent) {
        e.preventDefault()
    }

    createSprite(stage: any, showInputPoint = true) {
        if (true) {
            this.sprite = new Graphics();
            this.sprite.zIndex = 99999;
            stage.addChild(this.sprite);
        }
    }

    addInput(type: string, id: number, x: number, y: number) {
        const { inputs } = this;
        let idx = inputs.findIndex(point => point.type === type && point.id === id);
        if (idx !== -1) inputs.splice(idx, 1);
        inputs.push(new InputPoint(type, id, x, y));
        this._change()
    }

    moveInput(type: string, id: number, x: number, y: number) {
        const { inputs } = this;
        let point = inputs.find(point => point.type === type && point.id === id);
        if (point) point.move(x, y);
        this._change()
    }

    removeInput(type: string, id: number) {
        const { inputs } = this;
        let point = inputs.find(point => point.type === type && point.id === id);
        if (point) point.isActive = false;
        this._change()
    }

    calcTick() {
        const { inputs } = this;

        if (this.sprite) this.sprite.clear();

        for (let i = 0, length = inputs.length; i < length; i++) {
            let point = inputs[i];

            if (this.sprite) {
                this.sprite
                    .circle(point.x, point.y, this._inputPointSize)
                    .fill({ color: !point.isTapped ? 0xFFFF00 : point.isMoving ? 0x00FFFF : 0xFF00FF })
            }

            if (point.isActive) {
                point.isTapped = true;
                point.isMoving = false;
            }
            else {
                inputs.splice(i--, 1);
                length -= 1;
            }
        }
    }

    resizeSprites(size: any) {
        this.renderSize = size;
        this._inputPointSize = this.renderSize.heightPercent * 30;
    }

    destroySprites() {
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = undefined;
        }
    }
    touchStart(e: any) {
        e.preventDefault();
        for (const i of e.changedTouches) {
            let { clientX, clientY, identifier } = i;
            clientX *= window.devicePixelRatio
            clientY *= window.devicePixelRatio
            this.addInput('touch', identifier, clientX - this.renderSize.widthOffset, clientY);
        }
    }

    touchMove(e: any) {
        e.preventDefault();
        for (const i of e.changedTouches) {
            let { clientX, clientY, identifier } = i;
            clientX *= window.devicePixelRatio
            clientY *= window.devicePixelRatio
            this.moveInput('touch', identifier, clientX - this.renderSize.widthOffset, clientY);
        }
    }

    touchEnd(e: any) {
        e.preventDefault();
        for (const i of e.changedTouches) {
            this.removeInput('touch', i.identifier);
        }
    }

    mouseStart(e: any) {
        e.preventDefault();
        let { clientX, clientY, button } = e;
        clientX *= window.devicePixelRatio
        clientY *= window.devicePixelRatio
        this.addInput('mouse', button, clientX - this.renderSize.widthOffset, clientY);
    }

    mouseMove(e: any) {
        let { clientX, clientY, button } = e;
        clientX *= window.devicePixelRatio
        clientY *= window.devicePixelRatio
        this.moveInput('mouse', button, clientX - this.renderSize.widthOffset, clientY);
    }

    mouseEnd(e: any) {
        this.removeInput('mouse', e.button);
    }

    private _change() {
        if (this.onchange) this.onchange()
    }
}