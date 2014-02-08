define('ui/ftui', ['ui/inputhandler', 'ui/patterneditor'], function(InputHandler, PatternEditor) {

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
            applyTempoButton: null
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

        this.controls.patternEditor = new PatternEditor(this.display, {left: 250, top: 100, right: 10, bottom: 110} );
        this.controls.createPatternButton = createElement('button', 'Create Drum Pattern', 10, 20, 100, 50);
        this.controls.playPatternButton = createElement('button', 'Play the Shizzle!', 120, 20, 120, 25);
        this.controls.playPatternButton.disabled = true;
        this.controls.stopPatternButton = createElement('button', 'Stop the Nizzle!', 120, 45, 120, 25);
        this.controls.stopPatternButton.disabled = true;
        this.controls.tempoTextField = createElement('input', null, 250, 20, 50, 16);
        this.controls.applyTempoButton = createElement('button', 'Apply Tempo', 310, 20, 100, 22);
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
        if ( this.display) {
            var pattern = this.soundSystem.getPattern(0);
            if ( pattern && this.controls.tempoTextField.value.length == 0 ) {
                this.controls.tempoTextField.value = pattern.tempo.toString();
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
        drawSamples.call(this, this.display);

        var str = this.soundSystem.sampleBank.length + ' samples loaded';
        ctx.fillStyle = 'white';
        ctx.fillText(str, 200, 10);

        this.controls.patternEditor.render(pattern, this.soundSystem.currentNote, this.soundSystem.playing);

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

    function drawSamples(display) {
        // TODO: Draw a list of samples to the screen
    }

    return ftUI;
});