define('ui/ftui', function() {

    function ftUI(display, soundSystem) {
        this.display = display;
        this.soundSystem = soundSystem;
        this.margins = {left: 10, top: 100, right: 10, bottom: 10};
        this.trackWidth = 120;
        this.fonts = {
            note: {
                name: 'Courier New',
                size: 14,
                weight: 'normal'
            }
        }
    }

    ftUI.prototype.render = function() {
        if ( this.display) {
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
                for ( var j = 0, maxNotes = pattern.getNotesPerTrack(); j < maxNotes; j++ ) {
                    // the note
                    //  NOTE:OCTAVE
                    //  VOLUME[00-FF]

                    note = track.getNote(j);
                    if ( note ) {
                        noteStr = note.getNoteName() + (note.isSharp ? '#' : '-') + note.octave + ' ' +
                                  (note.volume ? note.volume : '..') + ' ' +
                                  '.. ' +
                                  note.sampleID.pad(3);
                        ctx.fillText(noteStr, margins.left + i * this.trackWidth + 7, margins.top + j * this.fonts.note.size);
                    } else {
                        ctx.fillText('... .. .. ...', margins.left + i * this.trackWidth + 7, margins.top + j * this.fonts.note.size);
                    }
                }
            }
            ctx.stroke();
        }
    }

    return ftUI;
})