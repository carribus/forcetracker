import { InputHandler } from "./inputhandler.js";
import { PatternEditor } from "./patterneditor.js";
import { SampleList } from "./samplelist.js";
import { Visualiser } from "./visualiser.js";

export class FTUI {
    constructor(display, soundSystem) {
        this.display = display;
        this.soundSystem = soundSystem;
        this.inputHandler = new InputHandler(this);
        this.focusControl = null;
        this.margins = { left: 250, top: 100, right: 10, bottom: 110 };
        this.controls = {
            patternEditor: null,
            createPatternButton: null,
            playSongButton: null,
            tempoTextField: null,
            applyTempoButton: null,
            addTrackButton: null,
            trackCountTextField: null,
            delTrackButton: null,
            prevPatternButton: null,
            patternIndicatorField: null,
            nextPatternButton: null,
            addPatternButton: null,
            delPatternButton: null,
            dupPatternButton: null,

            saveSongButton: null,
            loadSongButton: null
        }
        this.visualisers = {
            tracks: [],
            main: null
        }
        this.renderer = new Renderer(this);

        this._createUIElements();
        this._registerInputHandlers();
    }

    /**
     *
     * @private
     */
    _createUIElements() {
        const createElement = function (type, text, x, y, w, h) {
            let e = document.createElement(type);
            e.innerHTML = text;
            e.style.position = 'absolute';
            e.style.left = x + 'px';
            e.style.top = y + 'px';
            e.style.width = w + 'px';
            e.style.height = h + 'px';
            document.body.appendChild(e);

            return e;
        }

        this.controls.patternEditor = new PatternEditor(this.display, { left: 250, top: 150, right: 10, bottom: 50 });
        this.controls.sampleList = new SampleList(this.display, { left: 10, top: 150, width: 230, bottom: 50 }, this);
        this.controls.createPatternButton = createElement('button', 'Create Drum Pattern', 10, 20, 100, 50);
        this.controls.playSongButton = createElement('button', 'Play Song', 120, 20, 120, 25);
        this.controls.playSongButton.title = 'Play Song\nShortcut: Ctrl-Space';
        this.controls.playSongButton.disabled = true;
        this.controls.playPatternButton = createElement('button', 'Play Pattern', 120, 45, 120, 25);
        this.controls.playPatternButton.title = 'Play Pattern\nShortcut: Space';
        this.controls.playPatternButton.disabled = true;
        this.controls.tempoTextField = createElement('input', null, 250, 20, 50, 16);
        this.controls.applyTempoButton = createElement('button', 'Apply Tempo', 310, 20, 100, 22);
        this.controls.delTrackButton = createElement('button', '-', 504, 20, 30, 22);
        this.controls.trackCountTextField = createElement('input', null, 535, 20, 30, 16);
        this.controls.trackCountTextField.style.textAlign = 'center';
        this.controls.trackCountTextField.setAttribute('readonly', true);
        this.controls.addTrackButton = createElement('button', '+', 572, 20, 30, 22);
        this.controls.prevPatternButton = createElement('button', '<', 504, 50, 30, 22);
        this.controls.prevPatternButton.title = 'Previous Pattern\nShortcut: Ctrl-[';
        this.controls.patternIndicatorField = createElement('input', null, 535, 50, 30, 16);
        this.controls.patternIndicatorField.style.textAlign = 'center';
        this.controls.patternIndicatorField.setAttribute('readonly', true);
        this.controls.nextPatternButton = createElement('button', '>', 572, 50, 30, 22);
        this.controls.nextPatternButton.title = 'Next Pattern\nShortcut: Ctrl-]';
        this.controls.addPatternButton = createElement('button', '+', 602, 50, 30, 22);
        this.controls.addPatternButton.title = 'Add Pattern\nShortcut: Ctrl-Shift-+';
        this.controls.delPatternButton = createElement('button', '-', 632, 50, 30, 22);
        this.controls.delPatternButton.title = "Del Pattern";
        this.controls.dupPatternButton = createElement('button', 'Dupe', 504, 73, 99, 22);
        this.controls.saveSongButton = createElement('button', 'Save', 800, 20, 50, 22);
        this.controls.loadSongButton = createElement('button', 'Load', 800, 45, 50, 22);

        let o = createElement('div', 'Tracks: ', 450, 23, 50, 16);
        o.style.color = 'lightgrey';

        o = createElement('div', 'Patterns: ', 443, 52, 50, 16);
        o.style.color = 'lightgrey';

        // create 16 track visualisers
        for (let i = 0; i < 16; i++) {
            o = new Visualiser(this.display, { left: 10, top: 10, right: 100, bottom: 100 });
            this.visualisers.tracks.push(o);
        }

        this.focusControl = this.controls.patternEditor;
    }

    /**
     * Registers event listeners for input events
     * @private
     */
    _registerInputHandlers() {
        this.display.canvas.addEventListener('mousedown', this.inputHandler.onMouseDown);
        this.display.canvas.addEventListener('mousewheel', this.inputHandler.onWheel);
        this.display.canvas.addEventListener('dragover', this.inputHandler.onDragOver);
        this.display.canvas.addEventListener('drop', this.inputHandler.onDrop);
        window.addEventListener('keydown', this.inputHandler.onKeyDown);
        window.addEventListener('keyup', this.inputHandler.onKeyUp);
    }

    startSampleUpload(fileArray) {
        let _this = this;
        for (let i = 0; i < fileArray.length; i++) {
            let reader = new FileReader();
            reader.sample = {
                name: fileArray[i].name,
                filename: fileArray[i].name
            }
            reader.onload = function (e) {
                let _reader = this;
                _this.soundSystem.context.decodeAudioData(e.currentTarget.result, function (buffer) {
                    _reader.sample.buffer = buffer;
                    _reader.sample.index = _this.soundSystem.sampleBank.length;
                    _this.soundSystem.sampleBank.push(_reader.sample);
                })
            }
            reader.readAsArrayBuffer(fileArray[i]);
        }
    }

    render() {
        if (this.display) {
            let pattern = this.soundSystem.getCurrentPattern();
            if (pattern) {
                if (this.controls.tempoTextField.value.length == 0) {
                    this.controls.tempoTextField.value = pattern.tempo.toString();
                }
                this.controls.trackCountTextField.value = pattern.getTrackCount().toString();

                this.controls.patternIndicatorField.value = (this.soundSystem.patterns.indexOf(pattern) + 1) + '/' + this.soundSystem.getPatternCount();
            }

            this.renderer.drawTracker(this);
        } else {
            console.error('No display object available during render');
        }
    }
}

class Renderer {
    constructor(ui) {
        this.ui = ui;
    }

    drawTracker() {
        let ui = this.ui;
        let ctx = ui.display.context;
        let pattern = ui.soundSystem.getCurrentPattern();

        ctx.save();

        this.drawBackground(ui.display);

        let str = ui.soundSystem.sampleBank.length + ' samples loaded';
        ctx.fillStyle = 'white';
        ctx.fillText(str, 10, 140);

        ui.controls.sampleList.render(ui.soundSystem.sampleBank, pattern, ui.soundSystem.currentNote);
        ui.controls.patternEditor.render(pattern, ui.soundSystem.currentNote, ui.soundSystem.playing);

        // render the track visualisers
        if (pattern) {
            let trackCount = pattern.getTrackCount();
            let patternRect = ui.controls.patternEditor.rect;
            let trackWidth = 120;

            for (let i = 0; i < trackCount; i++) {
                ui.visualisers.tracks[i].dimensions = {
                    left: patternRect.x + trackWidth * i,
                    top: 105,
                    width: trackWidth,
                    height: 40
                };
                if (ui.soundSystem.trackRoutes) {
                    ui.visualisers.tracks[i].setAnalyserNode(ui.soundSystem.trackRoutes[i].analyser);
                    ui.visualisers.tracks[i].render();
                }
            }
        }

        ctx.restore();
    }

    /**
     * Draws the background of the UI
     * @param display
     */
    drawBackground(display) {
        let ctx = display.context;

        ctx.fillStyle = display.canvas.style.backgroundColor;
        ctx.fillRect(0, 0, display.width, display.height);
    }
}
