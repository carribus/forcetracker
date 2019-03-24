export class Track {
    constructor() {
        this.notes = [];
        this.maxNotes = 32;
    }

    setMaxNotes(maxNotes) {
        this.maxNotes = maxNotes;
        if ( this.notes.length > maxNotes ) {
            this.notes.splice(maxNotes-1, this.notes.length);
        }
    }

    getNote(index) {
        return this.notes[index];
    }

    setNote(index, note) {
        this.notes[index] = note;
    }

    deleteNote(index, shiftUp) {
        if ( !shiftUp ) {
            this.setNote(index, null);
        } else {
            for ( let i = index; i < this.maxNotes; i++ ) {
                this.setNote(i, this.getNote(i+1));
            }
        }
    }

    insertNote(index) {
        for ( let i = this.maxNotes-1; i > index; i-- ) {
            this.setNote(i, this.getNote(i-1));
        }
        this.setNote(index, null);
    }

    copyTo(target) {
        let note, newNote;
        if ( target && target !== this && target instanceof Track ) {
            for ( let i = 0, len = this.notes.length; i < len; i++ ) {
                note = this.getNote(i);
                if ( note ) {
                    newNote = note.clone();
                    target.setNote(i, newNote);
                }
            }
        }
    }
}