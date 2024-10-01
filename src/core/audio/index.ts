import { newLogger } from '../log'
import { IMediaInstance, Sound, sound } from '@pixi/sound';
const log = newLogger("WAudio")
sound.disableAutoPause = true
function generateRandomString(length: number): string {
    try {
        return self.crypto.randomUUID()
    } catch {
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }

        return result;
    }
}

export default class WAudio {
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
    static async from(src: any): Promise<WAudio> {
        let n = generateRandomString(32)
        return await new Promise((r) => {
            let _ = performance.now()
            let m = new this(n, sound.add(n, {
                source: src, preload: true, loaded: () => { 
                    log.debug("添加音频",n,"用时",(performance.now()-_).toFixed(0)+"ms")
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
