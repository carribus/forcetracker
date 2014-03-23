define('sound/track', function() {

    function Track() {
        this.notes = [];
        this.maxNotes = 32;
    }

    Track.prototype.setMaxNotes = function(maxNotes) {
        this.maxNotes = maxNotes;
        if ( this.notes.length > maxNotes ) {
            this.notes.splice(maxNotes-1, this.notes.length);
        }
    }

    Track.prototype.getNote = function(index) {
        return this.notes[index];
    }

    Track.prototype.setNote = function(index, note) {
        this.notes[index] = note;
    }

    Track.prototype.deleteNote = function(index, shiftUp) {
        if ( !shiftUp ) {
            this.setNote(index, null);
        } else {
            for ( var i = index; i < this.maxNotes; i++ ) {
                this.setNote(i, this.getNote(i+1));
            }
        }
    }

    Track.prototype.insertNote = function(index) {
        for ( var i = this.maxNotes-1; i > index; i-- ) {
            this.setNote(i, this.getNote(i-1));
        }
        this.setNote(index, null);
    }

    Track.prototype.copyTo = function(target) {
        var note, newNote;
        if ( target && target !== this && target instanceof Track ) {
            for ( var i = 0, len = this.notes.length; i < len; i++ ) {
                note = this.getNote(i);
                if ( note ) {
                    newNote = note.clone();
                    target.setNote(i, newNote);
                }
            }
        }
    }

    return Track;
})