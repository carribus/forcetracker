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
        }
    }

    return Track;
})