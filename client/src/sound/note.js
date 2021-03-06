export class Note {
    constructor(noteName, isSharp, octave, sampleID) {
        this.noteName = noteName;
        this.isSharp = isSharp;
        this.octave = octave;
        this.volume = null;
        this.sampleID = sampleID;
    }

    getNoteName() {
        return this.noteName ? this.noteName + (this.isSharp ? '#' : '') : '..';
    }

    getFrequency() {
        const calcDistanceFromA4 = (note) => {
            let centerNote = { noteName: 'A', octave: 4 };
            let distance;
            let indexA = Note.noteNames.indexOf(note.getNoteName()), indexB = Note.noteNames.indexOf(centerNote.noteName);

            distance = (note.octave - centerNote.octave) * 12 + (indexA - indexB);

            return Math.pow(2, distance/12) * 440;
        }

        return calcDistanceFromA4(this);
    }

    increment(semitones) {
        if (semitones) {
            let index = Note.noteNames.indexOf(this.getNoteName());

            // TODO: Rewrite this so that it actually works
            if (index != -1) {
                if (index + semitones < 0) {
                    index = Note.noteNames.length + (index + semitones);
                    this.octave -= 1;
                } else {
                    if (index + semitones >= Note.noteNames.length) {
                        this.octave += 1;
                    }
                    index = (index + semitones) % Note.noteNames.length;
                }
                this.noteName = Note.noteNames[index];
                if (this.noteName.length == 2) {
                    this.noteName = this.noteName[0];
                    this.isSharp = true;
                } else {
                    this.isSharp = false;
                }
                // this.octave += Math.floor((index + semitones) / Note.noteNames.length);
            }
        }
    }

    toString() {
        return this.noteName + (this.isSharp ? '#' : '-') + this.octave;
    }

    clone() {
        let newNote = new Note();
        newNote.noteName = this.noteName;
        newNote.isSharp = this.isSharp;
        newNote.octave = this.octave;
        newNote.volume = this.volume;
        newNote.sampleID = this.sampleID;

        return newNote;
    }

    deserialise(data) {
        this.noteName = data.noteName;
        this.isSharp = data.isSharp;
        this.octave = data.octave;
        this.volume = data.volume;
        this.sampleID = data.sampleID;
    }
}

Note.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
