//●REC

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { loadZip } from '../../core/file';
import PhiGame from '@/core/game';
import { WebCodecsEncoder } from './WebCodecsEncoder';

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

export interface GameRecorderConfig {
    width: number
    height: number
    fps: number
    game: PhiGame
}

export class GameRecorder {
    private game: PhiGame
    public config: GameRecorderConfig
    public encoder: WebCodecsEncoder
    public context: WebGL2RenderingContext | WebGLRenderingContext
    public frameCount: number = 0
    public time: number = 0
    public totalFrame: number
    public stepTime: number
    constructor(config: GameRecorderConfig) {
        this.game = config.game
        this.config = config
        this.totalFrame = config.fps * this.game.chart.music.duration
        this.stepTime = 1 / config.fps
        this.context = this.game.app.getGLContext()
        this.encoder = new WebCodecsEncoder();
        this.encoder.width = config.width
        this.encoder.height = config.height
    }

    async init() {
        this.encoder.width = this.config.width
        this.encoder.height = this.config.height
        this.encoder.frameRate = this.config.fps
        await this.encoder.init()
    }

    async step() {
        await this.encoder.encode(await this.getFrame(), this.frameCount)
        this.frameCount++
        this.time = this.time + this.stepTime
        console.log(this)
    }
    async getFrame() {
        return new VideoFrame(this.context.canvas, {
            timestamp: this.time * 1_000_000,
        });
    }
}