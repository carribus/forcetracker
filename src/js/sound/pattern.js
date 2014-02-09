define('sound/pattern', ['sound/track'], function(Track) {

    function Pattern() {
        this.tracks = [];
        this.notesPerTrack = 32;
        this.tempo = 120;
    }

    Pattern.prototype.getTrackCount = function() {
        return this.tracks.length;
    }

    Pattern.prototype.setTrackCount = function(numTracks) {
        var track;
        this.tracks = [];
        for ( var i = 0; i < numTracks; i++ ) {
            track = new Track();
            track.setMaxNotes(this.notesPerTrack);
            this.tracks.push(track);
        }
    }

    Pattern.prototype.setNotesPerTrack = function(notesPerTrack) {
        this.notesPerTrack = notesPerTrack;
        if ( this.tracks.length ) {
            for ( var i = 0; i < this.tracks.length; i++ ) {
                this.tracks[i].setMaxNotes(notesPerTrack);
            }
        }
    }

    Pattern.prototype.getNotesPerTrack = function() {
        return this.notesPerTrack;
    }

    Pattern.prototype.getTrack = function(index) {
        var track = null;
//        console.log('getTrack(' + typeof index + ')');

        if ( typeof index == 'number' ) {
            track = this.tracks[index];
        }

        return track;
    }

    Pattern.prototype.setTempo = function(tempo) {
        this.tempo = tempo;
    }

    Pattern.prototype.getTempo = function() {
        return this.tempo;
    }

    Pattern.prototype.setNote = function(trackIndex, noteIndex, note) {
        var track = this.getTrack(trackIndex);

        if ( track ) {
            track.setNote(noteIndex, note);
        }
    }

    Pattern.prototype.getNote = function(trackIndex, noteIndex) {
        var track = this.getTrack(trackIndex);

        return (track ? track.getNote(noteIndex) : null);
    }

    Pattern.prototype.deleteNote = function(trackIndex, noteIndex, shiftUp) {
        var track = this.getTrack(trackIndex);

        if ( track ) {
            track.deleteNote(noteIndex, shiftUp);
        }
    }

    return Pattern;
})