import PhiGame from "../../core/game";

export class PauseScreen {
    private game: PhiGame
    private element: HTMLDivElement
    constructor(game: PhiGame) {
        this.game = game
        this.element = document.createElement("div")
    }

    static bindGame(game: PhiGame) {
        let _ = new this(game)
        return _
    }

    open() {

    }

    close(waitTime: number = -1) {

    }

    start() {
        if (this.game.isPaused) {
            this.game.pause()
        }
    }

    restart() {
        this.game.restart()
    }
}