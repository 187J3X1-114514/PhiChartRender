import { newLogger } from '../log'
import { type IMediaInstance, Sound, sound } from '@pixi/sound';
import { generateRandomString } from '../random';
const log = newLogger("Audio")
sound.disableAutoPause = true


export default class Audio {
    private soundName: string
    private sound: Sound
    private soundPlay?: IMediaInstance
    public progress: number = 0
    public currentTime: number = 0
    public onend?: () => any
    private constructor(n: string, s: Sound) {
        this.soundName = n
        this.sound = s
    }
    static async from(src: any, soundName: string = generateRandomString(32)): Promise<Audio> {
        return await new Promise((r) => {
            let _ = performance.now()
            let m = new this(soundName, sound.add(soundName, {
                source: src, preload: true, loaded: () => {
                    log.debug("添加音频", soundName, "用时", (performance.now() - _).toFixed(0) + "ms")
                    r(m)
                }
            }))
        })
    }
    reset() {
        this.progress = 0
        this.currentTime = 0
    }
    play(_withTimer = false) {
        if (this.sound.paused) {
            this.pause(false)
            return
        }
        this.soundPlay = this.sound.play() as IMediaInstance
        this.soundPlay.on("end", () => {
            if (this.onend) this.onend()
        })
        this.soundPlay.on("progress", (a, b) => {
            this.progress = a
            this.currentTime = a * b
        })
    }

    pause(s?: boolean) {
        this.sound.paused = s != undefined ? s : (this.sound.paused == undefined ? true : !this.sound.paused)
        this.sound.refreshPaused()
    }

    stop() {
        this.sound.stop()
    }
    seek(_duration: any) {
        this.soundPlay?.stop()
        this.soundPlay?.destroy()
        this.sound.stop()

        this.soundPlay = this.sound.play(
            {
                start: _duration
            }
        ) as IMediaInstance
        this.soundPlay.on("end", () => {
            if (this.onend) this.onend()
        })
        this.soundPlay.on("progress", (a, b) => {
            this.progress = a
            this.currentTime = a * b
        })
    }

    get isPaused() {
        return this.sound.paused
    }

    get isStoped() {
        return this.sound.paused
    }

    get duration() {
        return this.sound.duration
    }

    get volume() {
        return this.sound.volume;
    }

    set volume(value) {
        this.sound.volume = value
    }

    get speed() {
        return this.sound.speed
    }
    set speed(value) {
        this.sound.speed = value;
    }
}
