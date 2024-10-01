import { Application, Container, Graphics } from "pixi.js";

export default class Editor {
    constructor(music, effects) {
        this.source = effects;
        this.music = music;
        this.handle = window.open("about:blank", "_blank", "popup,width=800,height=750");
        this.setup();
        console.log("Editor Setup Complete");
    }

    qs(selector) {
        return this.handle.document.querySelector(selector);
    }

    setup() {
        this.handle.document.write(`
<!DOCTYPE html>
<html>
    <head>
        <title>Editor</title>
        <style></style>
    </head>
    <body>
        <div id="editor">
            <div id="toolbar">
                <button id="bar-run">Save</button>
                <button id="bar-download">Download</button>
                <input type="range" min="0" max="1000" value="0" id="bar-slider" class="slider" width="10px"></input>
                <label for="bar-slider" id="bar-time">00:00</label>
                <button id="bar-play">Play</button>
                <button id="bar-pause">Pause</button>
                <button id="bar-slow">-</button>
                <button id="bar-fast">+</button>
                <label> 1/<input type="text" id="content-beat-fraction" class="value-drag beat-fraction" value="4"></input></label>
            </div>
            <div id="tab">
                <div id="header"></div>
                <div id="content">
                    <div id="content-settings>
                        <label>Name: <input type="text" id="content-name"></input></label><br>
                        <label>Start Beat: <input type="text" id="content-start-beat" class="value-drag"></input></label><br>
                        <label>End Beat: <input type="text" id="content-end-beat" class="value-drag"></input></label><br>
                        <input type="checkbox" id="content-global-checkbox">Global</input></label><br>
                        <label>Code: <input type="text" id="content-code"></input></label><br>
                        <button id="content-compile">Compile</button>
                    </div>
                    <div id="content-timeline">
                        <canvas id="content-canvas" style="float:left;"></canvas>
                        <div id="content-value-edit">
                            <input type="checkbox" id="content-value-static-checkbox">Static</input></label><br>
                            <input type="text" id="content-value-static" class="value-drag" placeholder="Static Value"></input>
                            <div id="content-value-container">
                                <label>Start Beat: <input type="text" id="content-value-start-beat" class="value-drag"></input></label><br>
                                <label>End Beat:<input type="text" id="content-value-end-beat" class="value-drag"></input></label><br>
                                <label>Ease Type: <input type="text" id="content-value-ease-type" class="value-drag"></input></label><br>
                                <label>Start Value: <input type="text" id="content-value-start"></input></label><br>
                                <label>End Value: <input type="text" id="content-value-end"></input></label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
        `);

        this.render = new Application({
            width: 300,
            height: 500,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            antialias: true,
            transparent: true,
            view: this.qs("#content-canvas")
        });

        let bg = new Graphics();
        bg.beginFill(0xBBBBBB);
        bg.drawRect(0, 0, 300, 500);
        bg.endFill();
        bg.zIndex = -1;

        this.render.stage.addChild(bg);

        this.dom = {
            toolbar: {
                toolbar: this.qs("#toolbar"),
                run: this.qs("#bar-run"),
                download: this.qs("#bar-download"),
                slider: this.qs("#bar-slider"),
                time: this.qs("#bar-time"),
                play: this.qs("#bar-play"),
                pause: this.qs("#bar-pause"),
                slow: this.qs("#bar-slow"),
                fast: this.qs("#bar-fast"),
                beatFraction: this.qs("#content-beat-fraction")
            },
            tab: {
                header: this.qs("#header"),
                content: this.qs("#content")
            },
            settings: {
                name: this.qs("#content-name"),
                startBeat: this.qs("#content-start-beat"),
                endBeat: this.qs("#content-end-beat"),
                global: this.qs("#content-global-checkbox"),
                code: this.qs("#content-code"),
                compile: this.qs("#content-compile")
            },
            timeline: {
                canvas: this.qs("#content-canvas"),
                valueEdit: this.qs("#content-value-edit"),
                staticCheckbox: this.qs("#content-value-static-checkbox"),
                staticValue: this.qs("#content-value-static"),
                valueContainer: this.qs("#content-value-container"),
                valueStartBeat: this.qs("#content-value-start-beat"),
                valueEndBeat: this.qs("#content-value-end-beat"),
                valueEaseType: this.qs("#content-value-ease-type"),
                valueStart: this.qs("#content-value-start"),
                valueEnd: this.qs("#content-value-end")
            }
        };

        this.dom.toolbar.slider.oninput = (e) => {
            if (!this.music.isPaused) this.music.pause();
            this.music.seek((e.target.value / 1000 - this.music.progress) * this.music.duration);
        };

        this.dom.toolbar.play.onclick = () => {
            if (this.music.isPaused) this.music.play();
        };

        this.dom.toolbar.pause.onclick = () => {
            if (!this.music.isPaused) this.music.pause();
        }

        this.dom.toolbar.slow.onclick = () => {
            this.music.speed *= 0.5;
        };

        this.dom.toolbar.fast.onclick = () => {
            this.music.speed *= 2;
        };
    }

    tick(currentTime) {
        this.dom.toolbar.slider.value = this.music.progress * 1000;
        this.dom.toolbar.time.innerHTML = new Date(Math.floor(currentTime) * 1000).toISOString().substring(14, 19);
    }
}