define('ui/ftui', function() {

    function ftUI(display, soundSystem) {
        this.display = display;
        this.soundSystem = soundSystem;
        this.margins = {left: 250, top: 100, right: 10, bottom: 110};
        this.trackWidth = 120;
        this.fonts = {
            note: {
                name: 'Courier New',
                size: 14,
                weight: 'normal'
            }
        }
        this.controls = {
            createPatternButton: null,
            playPatternButton: null,
            tempoTextField: null,
            applyTempoButton: null
        }

        this._createUIElements();
    }

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

        this.controls.createPatternButton = createElement('button', 'Create Drum Pattern', 10, 20, 100, 50);
        this.controls.playPatternButton = createElement('button', 'Play the Shizzle!', 120, 20, 120, 25);
        this.controls.playPatternButton.disabled = true;
        this.controls.stopPatternButton = createElement('button', 'Stop the Nizzle!', 120, 45, 120, 25);
        this.controls.stopPatternButton.disabled = true;
        this.controls.tempoTextField = createElement('input', null, 250, 20, 50, 16);
        this.controls.applyTempoButton = createElement('button', 'Apply Tempo', 310, 20, 100, 22);
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
        ctx.save();

        drawBackground.call(this, this.display);
        drawSamples.call(this, this.display);
        var str = this.soundSystem.sampleBank.length + ' samples loaded';
        ctx.fillStyle = 'white';
        ctx.fillText(str, 200, 10);
        drawPattern.call(this, this.display);

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

    function drawPattern(display) {
        var ctx = display.context;
        var margins = this.margins;
        var pattern = this.soundSystem.getPattern(0);
        var track, note, noteStr;
        var visibleNotes = Math.floor(((display.height - margins.bottom) - margins.top) / this.fonts.note.size)-1;

        ctx.strokeStyle = 'rgb(128, 128, 128)';
        ctx.lineWidth = 0.5;
        ctx.fillStyle = 'rgb(16, 16, 16)';
        ctx.fillRect(margins.left, margins.top, display.width - (margins.left + margins.right), display.height - (margins.top + margins.bottom));
        ctx.strokeRect(margins.left, margins.top, display.width - (margins.left + margins.right), display.height - (margins.top + margins.bottom));

        // draw the tracks
        if ( pattern ) {
            ctx.strokeStyle = 'rgb(128, 128, 128)';
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.lineWidth = 7;
            ctx.font = this.fonts.note.size + 'px' + ' ' + this.fonts.note.name + ' ';
            ctx.beginPath();
            for ( var i = 0, len = pattern.getTrackCount(); i < len; i++ ) {
                track = pattern.getTrack(i);
                ctx.moveTo(margins.left + i * this.trackWidth, margins.top);
                ctx.lineTo(margins.left + i * this.trackWidth, display.height - margins.bottom);

                // draw the notes
                var startNote = this.soundSystem.currentNote - visibleNotes;
                var offset = 0;
                startNote = startNote < 0 ? 0 : startNote;
                for ( var j = startNote, maxNotes = pattern.getNotesPerTrack(); j < maxNotes; j++ ) {
                    // the note
                    //  NOTE:OCTAVE
                    //  VOLUME[00-FF]
                    //  SAMPLE ID[00-FF]
                    //  EFFECT

                    offset = j - startNote;
                    // fill the line's background
                    if ( j == this.soundSystem.currentNote) {
                        ctx.fillStyle = 'rgb(32, 32, 32)';
                        ctx.fillRect(margins.left + i * this.trackWidth, margins.top + offset * this.fonts.note.size, this.trackWidth, this.fonts.note.size+2);
                    } else {
                        ctx.fillStyle = 'rgb(16, 16, 16)';
                    }

                    note = track.getNote(j);
                    if ( note ) {
                        noteStr = note.getNoteName() + (note.isSharp ? '#' : '-') + note.octave + ' ' +
                                  (note.volume ? note.volume : '..') + ' ' +
                                  note.sampleID.pad(2) + ' ' +
                                  '...';
                        if ( j == this.soundSystem.currentNote) {
                            ctx.fillStyle = 'white';
                        } else {
                            ctx.fillStyle = 'rgb(164, 164, 164)';
                        }
                        ctx.fillText(noteStr, margins.left + i * this.trackWidth + 7, margins.top + offset * this.fonts.note.size);
                    } else {
                        ctx.fillStyle = 'rgb(128, 128, 128)';
                        ctx.fillText('... .. .. ...', margins.left + i * this.trackWidth + 7, margins.top + offset * this.fonts.note.size);
                    }

                    if ( margins.top + offset * this.fonts.note.size + this.fonts.note.size*2 >= display.height - margins.bottom) {
                        break;
                    }
                }
            }
            ctx.moveTo(margins.left + i * this.trackWidth, margins.top);
            ctx.lineTo(margins.left + i * this.trackWidth, display.height - margins.bottom);

            ctx.stroke();
        }
    }

    return ftUI;
})