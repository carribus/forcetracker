define('ui/patterneditor', ['ui/component', 'ui/inputhandler', 'sound/note'], function(Component, InputHandler, Note) {

    function PatternEditor(display, dimensions) {
        Component.call(this, display, dimensions);
        this.trackWidth = 120;
        this.pattern = null;
        this.lastSampleID = 0;
        this.scrollOffset = {
            x: 0,
            y: 0
        }
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
            editPositionFill: 'rgb(32, 96, 32)',
            editEmptyNoteText: 'rgb(128, 192, 128)',
            emptyNoteText: 'rgb(128, 128, 128)'
        }
        this.editPosition = {
            track: 0,
            note: 0,
            position: 0
        }
        this.selection = {
            startTrack: -1,
            endTrack: -1,
            startNote: -1,
            endNote: -1
        }
        this.noteHeight = this.fonts.note.size;
    }
    PatternEditor.prototype = Object.create(Component.prototype);
    PatternEditor.prototype.constructor = PatternEditor;

    /**
     * Handles an 'onClick' callback. This can be generated by either mouse click or touch events
     * @param x x co-ordinate of the click
     * @param y y co-ordinate of the click
     */
    PatternEditor.prototype.onClick = function(x, y) {
        console.log('Pattern Editor clicked');
        var trackNumber = Math.floor((x - this.rect.x) / this.trackWidth);
        var noteNumber = this.scrollOffset.y + Math.floor((y - this.rect.y) / this.noteHeight);

        console.log('Click: Track %s, Note %s', trackNumber, noteNumber);

        this.editPosition.track = trackNumber;
        this.editPosition.note = noteNumber;
    }

    /**
     * Handled a 'keydown' event
     * @param e KeyboardEvent
     */
    PatternEditor.prototype.onKeyDown = function(e) {
        var note, char;

        switch (e.keyCode) {
            case    InputHandler.KEYS.VK_LEFT:
                this._navigateLeft();
                break;

            case    InputHandler.KEYS.VK_RIGHT:
                this._navigateRight();
                break;

            case    InputHandler.KEYS.VK_UP:
                this._navigateUp();
                break;

            case    InputHandler.KEYS.VK_DOWN:
                this._navigateDown();
                break;

            case    InputHandler.KEYS.VK_DELETE:
            case    InputHandler.KEYS.VK_MINUS:
                this.pattern.deleteNote(this.editPosition.track, this.editPosition.note, e.getModifierState('Control'));
                break;

            case    InputHandler.KEYS.VK_PLUS:
                this.pattern.insertNote(this.editPosition.track, this.editPosition.note);
                break;

            default:
                switch ( this.editPosition.position ) {
                    // note and octave
                    case    0:
                    case    1:
                    case    2:
                        char = String.fromCharCode(e.keyCode);

                        if ( InputHandler.isNoteKey(e.keyCode) ) {
                            note = this.pattern.getNote(this.editPosition.track, this.editPosition.note);
                            if ( !note ) {
                                note = new Note(char, e.getModifierState('Shift'), 4, this.lastSampleID);
                            } else {
                                note.noteName = char;
                                note.isSharp = e.getModifierState('Shift');
                            }

                            this.pattern.setNote(this.editPosition.track, this.editPosition.note, note);
                        } else if ( "0123456789".indexOf(char) != -1 ) {
                            note = this.pattern.getNote(this.editPosition.track, this.editPosition.note);
                            if ( note ) {
                                note.octave = parseInt(char);
                            }
                        } else {
                            note = this.pattern.getNote(this.editPosition.track, this.editPosition.note);
                            if ( note ) {
                                switch (e.keyCode ) {
                                    case    107:
                                    case    187:
                                        note.increment(1);
                                        break;

                                    case    109:
                                    case    189:
                                        note.increment(-1);
                                        break;
                                }
                            }
                        }
                        break;

                    // volume
                    case    4:
                    case    5:
                        var volume;

                        char = String.fromCharCode(e.keyCode);
                        if ( "0123456789ABCDEF".indexOf(char) != -1 ) {
                            note = this.pattern.getNote(this.editPosition.track, this.editPosition.note);
                            if ( !note ) {
                                note = new Note(null, false, null, null);
                                this.pattern.setNote(this.editPosition.track, this.editPosition.note, note);
                            }

                            if ( note ) {
                                if ( this.editPosition.position == 4 ) {
                                    volume = parseInt(char + '0', 16) | note.volume & 0x0F;
                                    this.editPosition.position++;
                                } else if ( this.editPosition.position == 5 ) {
                                    volume = parseInt(char, 16) | note.volume & 0xF0;
                                }
                                note.volume = volume;
                            }
                        }
                        break;

                    // sample
                    case    7:
                    case    8:
                        var char = String.fromCharCode(e.keyCode);
                        var sample;
                        if ( '0123456789'.indexOf(char) != -1 ) {
                            note = this.pattern.getNote(this.editPosition.track, this.editPosition.note);
                            if ( note ) {
                                if ( this.editPosition.position == 7 ) {
                                    sample = parseInt(char + '0', 16) | note.sampleID & 0x0F;
                                } else if ( this.editPosition.position == 8 ) {
                                    sample = parseInt(char, 16) | note.sampleID & 0xF0;
                                    this.editPosition.position++;
                                }
                                this.lastSampleID = note.sampleID = sample;
                                this.editPosition.position++;
                            }
                        }
                        break;
                }
                break;
        }
    }

    /**
     * Mouse wheel event handler
     * @param xOffset
     * @param yOffset
     */
    PatternEditor.prototype.scroll = function(xOffset, yOffset) {
        var visibleNotes = Math.floor((this.rect.h / this.fonts.note.size)-1);

        this.scrollOffset.x += xOffset;
        if ( this.scrollOffset.x < 0 ) {
            this.scrollOffset.x = 0;
        }

        this.scrollOffset.y += yOffset;
        if ( this.scrollOffset.y < 0 ) {
            this.scrollOffset.y = 0;
        }
        if ( this.scrollOffset.y + visibleNotes > this.pattern.getNotesPerTrack() ) {
            this.scrollOffset.y = this.pattern.getNotesPerTrack() - visibleNotes;
        }
    }

    PatternEditor.prototype.render = function(pattern, currentNote, isPlaying) {
        var rect, ctx;

        this.pattern = pattern;

        if ( this.display ) {
            ctx = this.display.context;
            this.rect = rect = this.calcRect();

            ctx.save();

            this._drawPattern(ctx, rect, pattern, currentNote, isPlaying);

            ctx.restore();

        }
    }

    PatternEditor.prototype._drawPattern = function(ctx, rect, pattern, currentNote, isPlaying) {
        var track, note, noteStr;
        var visibleNotes = Math.floor((rect.h / this.fonts.note.size)-1);
        var editedNote;

        isPlaying = isPlaying || false;

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
                var startNote;
                var offset = 0;

                if ( isPlaying ) {
                    startNote = currentNote;
                } else {
                    startNote = this.scrollOffset.y;
                    if ( startNote + visibleNotes > pattern.getNotesPerTrack() ) {
                        startNote = pattern.getNotesPerTrack() - visibleNotes;
                    }
                }

                if ( isPlaying ) {
                    this._ensureNoteIsVisible(0, currentNote);
                }
                for ( var j = 0, maxNotes = pattern.getNotesPerTrack(); j < maxNotes; j++ ) {
                    // the note
                    //  NOTE:OCTAVE
                    //  VOLUME[00-FF]
                    //  SAMPLE ID[00-FF]
                    //  EFFECT
                    editedNote = ( i == this.editPosition.track && j == this.editPosition.note );

                    if ( j < this.scrollOffset.y ) continue;

                    offset = j - this.scrollOffset.y;

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
                        noteStr =
                            (note.noteName != null? note.noteName : '.') +
                                (note.isSharp ? '#' : note.noteName ? '-' : '.') +
                                (note.octave ? note.octave : note.noteName ? '0' : '.') +
                                ' ' +
                                (note.volume != null ? note.volume.toHex(2, true) : '..') +
                                ' ' +
                                (note.sampleID != null ? note.sampleID.toHex(2, true) : '..') +
                                ' ' +
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
                    } else {
                        if ( editedNote ) {
                            ctx.fillStyle = this.colours.editEmptyNoteText;
                        } else {
                            ctx.fillStyle = this.colours.emptyNoteText;
                        }
                        noteStr = '... .. .. ...';
                    }

                    // check if we need to render character by character (for the note currently being edited)
                    if ( editedNote ) {
                        var charOffset = 0, charWidth, oldFillStyle;
                        for ( var c = 0, strLen = noteStr.length; c < strLen; c++ ) {
                            charWidth = ctx.measureText(noteStr[c]).width;
                            if ( c == this.editPosition.position ) {
                                oldFillStyle = ctx.fillStyle;
                                ctx.fillStyle = this.colours.editPositionFill;
                                ctx.fillRect(rect.x + i * this.trackWidth + 7 + charOffset, rect.y + offset * this.fonts.note.size, charWidth, this.noteHeight);
                                ctx.fillStyle = oldFillStyle;
                            }
                            ctx.fillText(noteStr[c], rect.x + i * this.trackWidth + 7 + charOffset, rect.y + offset * this.fonts.note.size);
                            charOffset += charWidth;
                        }
                    } else {
                        ctx.fillText(noteStr, rect.x + i * this.trackWidth + 7, rect.y + offset * this.fonts.note.size);
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

    PatternEditor.prototype._ensureNoteIsVisible = function(trackIndex, noteIndex) {
        var visibleNotes = Math.floor((this.rect.h / this.fonts.note.size)-1);

        if ( noteIndex < this.scrollOffset.y ) {
            this.scrollOffset.y = noteIndex;
        } else if ( noteIndex >= this.scrollOffset.y + visibleNotes ) {
            this.scrollOffset.y = noteIndex - visibleNotes;
        }
    }

    PatternEditor.prototype._navigateLeft = function() {
        if ( this.editPosition.position > 0 ) {
            this.editPosition.position--;
            if ( this.editPosition.position == 1 || this.editPosition.position == 3 || this.editPosition.position == 6 || this.editPosition.position == 9 ) {
                this.editPosition.position--;
            }
        } else {
            if ( this.editPosition.position == 0 && (this.editPosition.track > 0) ) {
                this.editPosition.track--;
                this.editPosition.position = 12;
            }
        }
    }

    PatternEditor.prototype._navigateRight = function() {
        if ( this.editPosition.position < 12 ) {
            this.editPosition.position++;
            if ( this.editPosition.position == 1 || this.editPosition.position == 3 || this.editPosition.position == 6 || this.editPosition.position == 9 ) {
                this.editPosition.position++;
            }
        } else {
            if ( this.pattern && (this.editPosition.track < this.pattern.getTrackCount()-1) ) {
                this.editPosition.track++;
                this.editPosition.position = 0;
            }
        }
    }

    PatternEditor.prototype._navigateUp = function() {
        if ( this.editPosition.note > 0 ) {
            this.editPosition.note--;
            this.editPosition.position = 0;
        }
        this._ensureNoteIsVisible(this.editPosition.track, this.editPosition.note);
    }

    PatternEditor.prototype._navigateDown = function() {
        if ( this.pattern && (this.editPosition.note < this.pattern.getNotesPerTrack()-1) ) {
            this.editPosition.note++;
            if ( this.editPosition.position <= 2 )  this.editPosition.position = 0;
            if ( this.editPosition.position >= 4 && this.editPosition.position <= 5 )   this.editPosition.position = 4;
        }
        this._ensureNoteIsVisible(this.editPosition.track, this.editPosition.note);
    }

    return PatternEditor;
});