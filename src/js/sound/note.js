define('sound/note', [], function() {

    function Note(noteName, isSharp, octave, sampleID) {
        this.noteName = noteName;
        this.isSharp = isSharp;
        this.octave = octave;
        this.volume = null;
        this.sampleID = sampleID;
    }

    Note.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    Note.prototype.getNoteName = function() {
        return this.noteName ? this.noteName + (this.isSharp ? '#' : '') : '..';
    }

    Note.prototype.getFrequency = function() {
        var calcDistanceFromA4 = function(note) {
            var centerNote = { noteName: 'A', octave: 4 };
            var distance;
            var indexA = Note.noteNames.indexOf(note.getNoteName()), indexB = Note.noteNames.indexOf(centerNote.noteName);

            distance = (note.octave - centerNote.octave) * 12 + (indexA - indexB);

            return Math.pow(2, distance/12) * 440;
        }

        return calcDistanceFromA4(this);
    }

    Note.prototype.increment = function(semitones) {
        var numSemitones = semitones || 1;
        var index = Note.noteNames.indexOf(this.getNoteName());

        // TODO: Rewrite this so that it actually works
        if ( index != -1 ) {
            this.noteName = Note.noteNames[(index + numSemitones) % Note.noteNames.length];
            if ( this.noteName.length == 2 ) {
                this.noteName = this.noteName[0];
                this.isSharp = true;
            } else {
                this.isSharp = false;
            }
            this.octave += Math.floor((index + numSemitones) / Note.noteNames.length);
        }
    }

    Note.prototype.toString = function() {
        return this.noteName + (this.isSharp ? '#' : '-') + this.octave;
    }

    return Note;
})