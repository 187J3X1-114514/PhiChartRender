//●REC

/*
import { FFmpeg } from '@ffmpeg/ffmpeg';
import PhiGame from '../../core/game'
import { loadZip } from '../../core/file';
import { Recorder, Encoders } from "canvas-record";

const _FFMPEG = new FFmpeg()
export async function load_ffmpeg(m?: boolean) {
    let base_url = window.location.href.split("?")[0].endsWith("/") ? window.location.href.split("?")[0] : window.location.href.split("?")[0] + "/"
    let ffmpeg_7z_path = base_url + "assets/dep/ffmpeg.7z"
    let ffmpeg_7z = await loadZip("ffmpeg.7z", await (await fetch(ffmpeg_7z_path)).arrayBuffer())
    let url = [URL.createObjectURL(await ffmpeg_7z.get("ffmpeg-core.js")?.getBlob()!), URL.createObjectURL(await ffmpeg_7z.get("ffmpeg-core.wasm")?.getBlob()!), URL.createObjectURL(await ffmpeg_7z.get("ffmpeg-core.worker.js")?.getBlob()!)]

    return await _FFMPEG.load({
        coreURL: url[0],
        wasmURL: url[1],
        ...(m ? { workerURL: url[2] } : {})
    })
}

class record {
    public fps: number
    public maxFps: number
    public images: Uint8Array[] = []
    private isPause: boolean = false
    constructor(fps: number, maxFps: number) {
        this.fps = fps
        this.maxFps = maxFps
    }
    add(image: Uint8Array) {
        this.images.push(image)
    }
    start_record(canvas: HTMLCanvasElement, beforeFn: () => void) {
        const fn = async () => {
            if (!this.isPause) {
                await beforeFn()
                setTimeout(async () => { await fn() }, 1000 / this.maxFps)
            }
        }
        fn()
    }
    pause_record() {
        this.isPause = !this.isPause
    }
}
export class RecordGame {
    public fps: number
    public game: PhiGame
    public totalFrame: number
    public recordedFrame: number = 0
    public rec: record
    public progress_: number[] = [0, 0]
    public onend: () => void = () => { }
    public images_chunks = 256

    public chunks = 0
    public tchunks = 0
    constructor(fps: number, game: PhiGame) {
        this.fps = fps
        this.game = game;
        this.totalFrame = parseInt((this.game.chart.music.duration * this.fps).toFixed())
        this.tchunks = Math.ceil(this.totalFrame / this.images_chunks)
        this.game.app.ticker.stop()
        this.game.chart.music.volume = 0
        this.rec = new record(fps, fps * 4)
    }
    private cbs: ((a: Blob) => void)[] = []
    get_webm(callback: (a: Blob) => void) {
        this.cbs.push(callback)
    }
    async start_record() {
        const gl = (this.game.app.canvas.getContext("webgl") != null ? this.game.app.canvas.getContext("webgl") : this.game.app.canvas.getContext("webgl2"))!
        let msg = ""
        _FFMPEG.on("log", (a) => {
            msg = msg + a.message + "\n"
        })
        _FFMPEG.on("progress", (a) => {
            console.log(a.progress, a.time)
        })
        let isC = false
        this.game.resize(true)
        this.game.start()
        this.game.app.ticker.stop()
        let temp: Uint8Array[][] = new Array()
        for (let i = 0, length = this.tchunks; i < length; i++) temp.push([])
        const downloadBlob = (blobUrl: string, fileName: string) => {
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = fileName || 'file';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        };
        let rec = new Recorder(gl, {
            duration: this.totalFrame * (1 / this.fps),
            frameRate: this.fps,
            encoder: new Encoders["WebCodecsEncoder"](),
            encoderOptions: {
                bitrate: 2_000_0000,
                alpha: "discard", // "keep"
                bitrateMode: "variable", // "constant"
                latencyMode: "quality", // "realtime" (faster encoding)
                hardwareAcceleration: "no-preference", // "prefer-hardware" "prefer-software"
            },
            extension: "mp4",
            target: "in-browser",
        })
        await rec.start()
        this.rec.start_record(this.game.app.canvas, async () => {
            if (!isC) { ; isC = true }//; _FFMPEG.createDir("/" + this.images_path);
            this.game.calcTickByCurrentTime(this.currentTime)
            this.game.chart.music.volume = 0
            this.game.app.render()
            this.recordedFrame++
            await rec.step()
            if (this.recordedFrame >= this.totalFrame) {
                this.onend()
                let o = await rec.stop()
                console.log(o)
                if (o instanceof Blob) {
                    downloadBlob(URL.createObjectURL(o), "test.mp4")
                } else {
                    downloadBlob(URL.createObjectURL(new Blob([o as any])), "test.mp4")
                }
                return
            }
        })
    }
    pause_record() {
        this.rec.pause_record()
    }
    get currentTime() {
        return this.progress * this.game.chart.music.duration
    }
    get progress() {
        return this.recordedFrame / this.totalFrame
    }
}*/