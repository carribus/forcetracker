define('ui/ftui', ['ui/inputhandler', 'ui/patterneditor', 'ui/samplelist', 'ui/visualiser'], function(InputHandler, PatternEditor, SampleList, Visualiser) {

    function ftUI(display, soundSystem) {
        this.display = display;
        this.soundSystem = soundSystem;
        this.inputHandler = new InputHandler(this);
        this.focusControl = null;
        this.margins = {left: 250, top: 100, right: 10, bottom: 110};
        this.controls = {
            patternEditor: null,
            createPatternButton: null,
            playPatternButton: null,
            tempoTextField: null,
            applyTempoButton: null,
            addTrackButton: null,
            trackCountTextField: null,
            delTrackButton: null
        }
        this.visualisers = {
            tracks: [],
            main: null
        }

        this._createUIElements();
        this._registerInputHandlers();
    }

    /**
     *
     * @private
     */
    ftUI.prototype._createUIElements = function() {
        var o;

        var createElement = function(type, text, x, y, w, h) {
            var e = document.createElement(type);
            e.innerHTML = text;
            e.style.position = 'absolute';
            e.style.left = x + 'px';
            e.style.top = y + 'px';
            e.style.width = w + 'px';
            e.style.height = h + 'px';
            document.body.appendChild(e);

            return e;
        }

        this.controls.patternEditor = new PatternEditor(this.display, {left: 250, top: 150, right: 10, bottom: 50} );
        this.controls.sampleList = new SampleList(this.display, {left: 10, top: 150, width: 230, bottom: 50});
        this.controls.createPatternButton = createElement('button', 'Create Drum Pattern', 10, 20, 100, 50);
        this.controls.playPatternButton = createElement('button', 'Play the Shizzle!', 120, 20, 120, 25);
        this.controls.playPatternButton.disabled = true;
        this.controls.stopPatternButton = createElement('button', 'Stop the Nizzle!', 120, 45, 120, 25);
        this.controls.stopPatternButton.disabled = true;
        this.controls.tempoTextField = createElement('input', null, 250, 20, 50, 16);
        this.controls.applyTempoButton = createElement('button', 'Apply Tempo', 310, 20, 100, 22);
        this.controls.delTrackButton = createElement('button', '-', 504, 20, 30, 22);
        this.controls.trackCountTextField = createElement('input', null, 535, 20, 30, 16);
        this.controls.trackCountTextField.style.textAlign = 'center';
        this.controls.trackCountTextField.setAttribute('readonly');
        this.controls.addTrackButton = createElement('button', '+', 572, 20, 30, 22);

        var o = createElement('div', 'Tracks: ', 450, 23, 50, 16);
        o.style.color = 'lightgrey';

        // create 16 track visualisers
        for ( var i = 0; i < 16; i++ ) {
            o = new Visualiser(this.display, {left: 10, top: 10, right: 100, bottom: 100});
            this.visualisers.tracks.push(o);
        }

        this.focusControl = this.controls.patternEditor;
    }

    /**
     * Registers event listeners for input events
     * @private
     */
    ftUI.prototype._registerInputHandlers = function() {
        this.display.canvas.addEventListener('mousedown', this.inputHandler.onMouseDown);
        this.display.canvas.addEventListener('mousewheel', this.inputHandler.onWheel);
        window.addEventListener('keydown', this.inputHandler.onKeyDown);
        window.addEventListener('keyup', this.inputHandler.onKeyUp);
    }

    ftUI.prototype._playPattern = function() {
        var pattern = this.soundSystem.getPattern(0);
        if ( pattern ) {
            if ( !this.soundSystem.playing ) {
                this.soundSystem.playPattern(pattern);
                this.controls.stopPatternButton.disabled = false;
            } else {
                this.soundSystem.playing = false;
            }
        }
    }

    ftUI.prototype.render = function() {
        var trackCount;

        if ( this.display) {
            var pattern = this.soundSystem.getPattern(0);
            if ( pattern ) {
                if ( this.controls.tempoTextField.value.length == 0 ) {
                    this.controls.tempoTextField.value = pattern.tempo.toString();
                }
                this.controls.trackCountTextField.value = pattern.getTrackCount().toString();
            }

            drawTracker.call(this);
        } else {
            console.error('No display object available during render');
        }
    }

    //
    // Module private functions
    //
    function drawTracker() {
        var ctx = this.display.context;
        var pattern = this.soundSystem.getPattern(0);

        ctx.save();

        drawBackground.call(this, this.display);

        var str = this.soundSystem.sampleBank.length + ' samples loaded';
        ctx.fillStyle = 'white';
        ctx.fillText(str, 200, 10);

        this.controls.sampleList.render(this.soundSystem.sampleBank, pattern, this.soundSystem.currentNote);
        this.controls.patternEditor.render(pattern, this.soundSystem.currentNote, this.soundSystem.playing);

        // render the track visualisers
        if ( pattern ) {
            var trackCount = pattern.getTrackCount();
            var patternRect = this.controls.patternEditor.rect;
            var trackWidth = 120;

            for ( var i = 0; i < trackCount; i++ ) {
                this.visualisers.tracks[i].dimensions = {
                    left: patternRect.x + trackWidth * i,
                    top: 105,
                    width: trackWidth,
                    height: 40
                };
                this.visualisers.tracks[i].setAnalyserNode(this.soundSystem.trackRoutes[i].analyser);
                this.visualisers.tracks[i].render();
            }
        }

        ctx.restore();
    }

    /**
     * Draws the background of the UI
     * @param display
     */
    function drawBackground(display) {
        var ctx = display.context;
        var margins = this.margins;

        ctx.fillStyle = display.canvas.style.backgroundColor;
        ctx.fillRect(0, 0, display.width, display.height);
    }

    return ftUI;
});