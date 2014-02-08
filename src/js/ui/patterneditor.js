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
        this.colours = {
            defaultText: 'rgb(164, 164, 164)',
            playingNoteText: 'white',
            playingNoteFill: 'rgb(32, 32, 32)',
            editNoteText: 'rgb(164, 255, 164)',
            editNoteFill: 'rgb(16, 64, 16)',
            editEmptyNoteText: 'rgb(128, 192, 128)',
            emptyNoteText: 'rgb(128, 128, 128)'
        }
        this.editPosition = {
            track: -1,
            note: -1

        }
        this.noteHeight = this.fonts.note.size;
    }

    PatternEditor.prototype.containsPoint = function(x, y) {
        return ( x >= this.rect.x && x <= this.rect.x + this.rect.w && y >= this.rect.y && y <= this.rect.y + this.rect.h );
    }

    PatternEditor.prototype.onClick = function(x, y) {
        console.log('Pattern Editor clicked');
        var trackNumber = Math.floor((x - this.rect.x) / this.trackWidth);
        var noteNumber = Math.floor((y - this.rect.y) / this.noteHeight);

        console.log('Click: Track %s, Note %s', trackNumber, noteNumber);

        this.editPosition.track = trackNumber;
        this.editPosition.note = noteNumber;
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
        var editedNote;

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
                    editedNote = ( i == this.editPosition.track && j == this.editPosition.note );

                    offset = j - startNote;
                    // fill the line's background
                    if ( j == currentNote) {
                        ctx.fillStyle = this.colours.playingNoteFill;
                        ctx.fillRect(rect.x + i * this.trackWidth, rect.y + offset * this.fonts.note.size, this.trackWidth, this.noteHeight);
                    }

                    // check if the current note in the current track is being edited
                    if ( editedNote ) {
                        ctx.fillStyle = this.colours.editNoteFill;
                        ctx.fillRect(rect.x + i * this.trackWidth, rect.y + offset * this.fonts.note.size, this.trackWidth, this.noteHeight);
                    }

                    note = track.getNote(j);
                    if ( note ) {
                        noteStr = note.getNoteName() + (note.isSharp ? '#' : '-') + note.octave + ' ' +
                            (note.volume ? note.volume : '..') + ' ' +
                            note.sampleID.pad(2) + ' ' +
                            '...';
                        if ( j == currentNote) {
                            ctx.fillStyle = this.colours.playingNoteText;
                        } else {
                            if ( editedNote ) {
                                ctx.fillStyle = this.colours.editNoteText;
                            } else {
                                ctx.fillStyle = this.colours.defaultText;
                            }
                        }
                        ctx.fillText(noteStr, rect.x + i * this.trackWidth + 7, rect.y + offset * this.fonts.note.size);
                    } else {
                        if ( editedNote ) {
                            ctx.fillStyle = this.colours.editEmptyNoteText;
                        } else {
                            ctx.fillStyle = this.colours.emptyNoteText;
                        }
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