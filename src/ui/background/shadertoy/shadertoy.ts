import { Effect, getRealTime } from "./effect"

export class ShaderToy {
    public mAudioContext: AudioContext | undefined = undefined as any;
    public mCreated: boolean = false;
    public mEffect: any;
    public mTo!: number;
    public mTOffset!: number;
    public mCanvas!: HTMLCanvasElement;
    public mFpsFrame!: number;
    public mFpsTo!: number;
    public mIsPaused: boolean = true;
    public mForceFrame: boolean = true;
    public mInfo: any;
    public mCode!: string;
    mTf: number = 0;
    mMouseIsDown: boolean = false;
    public mMouseOriX: number = 0;
    public mMouseOriY: number = 0;
    public mMousePosX: number = 0;
    public mMousePosY: number = 0;
    constructor(element: HTMLCanvasElement) {
        this.mAudioContext = new AudioContext();
        this.mCreated = false;
        this.mEffect = null;
        this.mTo = getRealTime();
        this.mTOffset = 0;
        this.mCanvas = element;
        this.mTo = getRealTime();
        this.mTf = this.mTOffset;
        this.mFpsTo = this.mTo;
        this.mMouseIsDown = false;
        this.mMouseOriX = 0;
        this.mMouseOriY = 0;
        this.mMousePosX = 0;
        this.mMousePosY = 0;
        const resizeCB = (xres: number, yres: number) => { this.mForceFrame = true; };
        const crashCB = () => { /*iReportCrash(gShaderID);*/ };
        this.mEffect = new Effect(null, this.mAudioContext, this.mCanvas, null, this, true, false, resizeCB, crashCB);
        this.mCreated = true;
    }
    startRendering() {
    }
    render() {
        if (this.mIsPaused && !this.mForceFrame) {
            this.mEffect.UpdateInputs(0, false);
            return;
        }
        this.mForceFrame = false;
        var time = getRealTime();
        var ltime = this.mTOffset + time - this.mTo;
        if (this.mIsPaused) ltime = this.mTf; else this.mTf = ltime;
        var dtime = 1000.0 / 60.0;
        this.mEffect.Paint(ltime / 1000.0, dtime / 1000.0, 60, this.mMouseOriX, this.mMouseOriY, this.mMousePosX, this.mMousePosY, this.mIsPaused);
        this.mFpsFrame++;
        if ((time - this.mFpsTo) > 1000) {
            var ffps = 1000.0 * this.mFpsFrame / (time - this.mFpsTo);
            this.mFpsFrame = 0;
            this.mFpsTo = time;
        }
    }
    Stop() {
        this.mIsPaused = true;
        this.mEffect.StopOutputs();
    };
    pauseTime() {
        var time = getRealTime();
        if (!this.mIsPaused) {
            this.Stop();
        }
        else {
            this.mTOffset = this.mTf;
            this.mTo = time;
            this.mIsPaused = false;
            this.mEffect.ResumeOutputs();
            this.mCanvas.focus(); // put mouse/keyboard focus on canvas
        }
    };
    resetTime() {
        this.mTOffset = 0;
        this.mTo = getRealTime();
        this.mTf = 0;
        this.mFpsTo = this.mTo;
        this.mFpsFrame = 0;
        this.mForceFrame = true;
        this.mEffect.ResetTime();
        this.mCanvas.focus(); // put mouse/keyboard focus on canvas
    };
    GetTotalCompilationTime() {
        return this.mEffect.GetTotalCompilationTime();
    };
    Load(jsn: any) {
        try {
            var res = this.mEffect.Load(jsn, false);
            this.mCode = res.mShader;

            if (res.mFailed === false) {
                //this.resetTime();
                this.mForceFrame = true;
            }

            this.mInfo = jsn.info;

            return {
                mFailed: false,
                mDate: jsn.info.date,
                mViewed: jsn.info.viewed,
                mName: jsn.info.name,
                mUserName: jsn.info.username,
                mDescription: jsn.info.description,
                mLikes: jsn.info.likes,
                mPublished: jsn.info.published,
                mHasLiked: jsn.info.hasliked,
                mTags: jsn.info.tags
            };

        }
        catch (e) {
            return { mFailed: true };
        }
    }
    Compile(onResolve: any) {
        this.mEffect.Compile(true, onResolve);
    };
}

export async function iCompileAndStart(viewerParent: HTMLCanvasElement, jsnShader: any) {
    return new Promise<ShaderToy>((r) => {
        var gShaderToy = new ShaderToy(viewerParent);
        var gRes = gShaderToy.Load(jsnShader[0])
        if (gRes.mFailed) {
            gShaderToy.pauseTime();
            gShaderToy.resetTime();
        }
        else {
            gShaderToy.Compile((worked: boolean) => {
                if (!worked) return;
                if (gShaderToy.mIsPaused) {
                    gShaderToy.Stop();
                }
                gShaderToy.render();
                gShaderToy.pauseTime()
                r(gShaderToy)
            });
        }
    })
}