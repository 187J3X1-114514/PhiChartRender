import PhiGame from "../../core/game";
import { _getPauseOverlayData, _setPauseOverlayData, _shouldShowPauseOverlay } from "../App.vue";

export class PauseScreen {
    private game: PhiGame
    private status: 1 | 2 | 3 | 0 = 0 // 1-返回 2-重试 3-继续
    constructor(game: PhiGame) {
        this.game = game
        this.game.on("pause", () => { this._onPause() })
        _setPauseOverlayData({
            open: false,
            hide: true,
            showCountdownTime: true,
            callbacks: {
                onclosed: () => {
                    switch (this.status) {
                        case 1:
                            this.game.stop()
                        case 2:
                            this.restart()
                        case 3:
                            this._start()
                    }
                },
                onNoCountdownTimeClosed: () => { },
                clickBackButton: () => {
                    this.status = 1
                    _getPauseOverlayData().value!.showCountdownTime = false
                    _shouldShowPauseOverlay(false)
                },
                clickContinueButton: () => {
                    this.status = 3
                    _getPauseOverlayData().value!.showCountdownTime = true
                    _shouldShowPauseOverlay(false)
                },
                clickRetryButton: () => {
                    this.status = 2
                    _getPauseOverlayData().value!.showCountdownTime = false
                    _shouldShowPauseOverlay(false)
                }
            }
        })
    }

    static bindGame(game: PhiGame) {
        let _ = new this(game)
        return _
    }

    private open() {
        _getPauseOverlayData().value!.hide = false
        _shouldShowPauseOverlay(true)
    }

    private _start() {
        if (this.game.isPaused) {
            this.game.pause()
        }
    }

    restart() {
        this.game.restart()
    }

    private _onPause() {
        this.open()
    }
}