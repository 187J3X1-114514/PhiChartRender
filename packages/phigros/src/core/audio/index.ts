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
        return new Promise((r) => {
            const startTime = performance.now()
            const instance = new this(soundName, sound.add(soundName, {
                source: src,
                preload: true,
                loaded: () => {
                    log.debug("添加音频", soundName, "用时", (performance.now() - startTime).toFixed(0) + "ms")
                    instance.sound.singleInstance = true
                    r(instance)
                }
            }))
        })
    }

    reset() {
        this.progress = 0
        this.currentTime = 0
        this.seek(0)
        this.pause(true)
        
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
        this.soundPlay.on("progress", (a: number, b: number) => {
            this.progress = a
            this.currentTime = a * b
        })
    }

    pause(s?: boolean) {
        this.sound.paused = s !== undefined ? s : !this.sound.paused
        this.sound.refreshPaused()
    }

    stop() {
        this.sound.stop()
    }

    seek(_duration: any) {
        let p = this.sound.paused
        if (this.soundPlay) {
            this.soundPlay.stop()
            this.soundPlay.destroy()
        }
        this.sound.stop()
        this.soundPlay = this.sound.play({ start: _duration }) as IMediaInstance
        if (p) {
            this.sound.paused = true
            this.sound.refreshPaused()
        }
        this.soundPlay.on("end", () => {
            if (this.onend) this.onend()
        })
        this.soundPlay.on("progress", (a: number, b: number) => {
            this.progress = a
            this.currentTime = a * b
        })
    }

    get isPaused() {
        return this.sound.paused
    }

    get isStopped() {
        return this.sound.paused
    }

    get duration() {
        return this.sound.duration
    }

    get volume() {
        return this.sound.volume
    }

    set volume(value: number) {
        this.sound.volume = value
    }

    get speed() {
        return this.sound.speed
    }

    set speed(value: number) {
        this.sound.speed = value
    }
}