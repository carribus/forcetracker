define('ui/patterneditor', function() {

    function PatternEditor(display, dimensions) {
        this.display = display;
        this.dimensions = dimensions;
        this.trackWidth = 120;
        this.rect = null;
        this.fonts = {
            note: {
                name: 'Courier New',
                size: 14,
                weight: 'normal'
            }
        }

    }

    PatternEditor.prototype.containsPoint = function(x, y) {
        return ( x >= this.rect.x && x <= this.rect.x + this.rect.w && y >= this.rect.y && y <= this.rect.y + this.rect.h );
    }

    PatternEditor.prototype.onClick = function(x, y) {
        // TODO: You left off here. Need to calculate which track and corresponding note was clicked.
        console.log('Pattern Editor clicked');
    }

    PatternEditor.prototype.render = function(pattern, currentNote) {
        var rect, ctx;
        if ( this.display ) {
            ctx = this.display.context;
            this.rect = rect = this._calcRect();

            ctx.save();

            this._drawPattern(ctx, rect, pattern, currentNote);

            ctx.restore();

        }
    }

    PatternEditor.prototype._drawPattern = function(ctx, rect, pattern, currentNote) {
        var track, note, noteStr;
        var visibleNotes = Math.floor((rect.h / this.fonts.note.size)-1);

        ctx.strokeStyle = 'rgb(128, 128, 128)';
        ctx.lineWidth = 0.5;
        ctx.fillStyle = 'rgb(16, 16, 16)';
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

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
                ctx.moveTo(rect.x + i * this.trackWidth, rect.y);
                ctx.lineTo(rect.x + i * this.trackWidth, rect.y + rect.h);

                // draw the notes
                var startNote = currentNote - visibleNotes;
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
                    if ( j == currentNote) {
                        ctx.fillStyle = 'rgb(32, 32, 32)';
                        ctx.fillRect(rect.x + i * this.trackWidth, rect.y + offset * this.fonts.note.size, this.trackWidth, this.fonts.note.size+2);
                    }

                    note = track.getNote(j);
                    if ( note ) {
                        noteStr = note.getNoteName() + (note.isSharp ? '#' : '-') + note.octave + ' ' +
                            (note.volume ? note.volume : '..') + ' ' +
                            note.sampleID.pad(2) + ' ' +
                            '...';
                        if ( j == currentNote) {
                            ctx.fillStyle = 'white';
                        } else {
                            ctx.fillStyle = 'rgb(164, 164, 164)';
                        }
                        ctx.fillText(noteStr, rect.x + i * this.trackWidth + 7, rect.y + offset * this.fonts.note.size);
                    } else {
                        ctx.fillStyle = 'rgb(128, 128, 128)';
                        ctx.fillText('... .. .. ...', rect.x + i * this.trackWidth + 7, rect.y + offset * this.fonts.note.size);
                    }

                    if ( rect.y + offset * this.fonts.note.size + this.fonts.note.size*2 >= rect.y + rect.h) {
                        break;
                    }
                }
            }
            ctx.moveTo(rect.x + i * this.trackWidth, rect.y);
            ctx.lineTo(rect.x + i * this.trackWidth, rect.y + rect.h);

            ctx.stroke();
        }
    }

    PatternEditor.prototype._calcRect = function() {
        var canvas;
        var rect = { x: 0, y: 0, w: 0, h: 0 };

        if ( this.dimensions && this.display ) {
            canvas = this.display.canvas;
            rect.x = this.dimensions.left;
            rect.y = this.dimensions.top;
            if ( this.dimensions.right ) {
                rect.w = canvas.width - this.dimensions.right - rect.x;
            } else if ( this.dimensions.width ) {
                rect.w = this.dimensions.width;
            }
            if ( this.dimensions.bottom ) {
                rect.h = canvas.height - this.dimensions.bottom - rect.y;
            } else if ( this.dimensions.height ) {
                rect.h = this.dimensions.height;
            }
        }

        return rect;
    }

    return PatternEditor;
});