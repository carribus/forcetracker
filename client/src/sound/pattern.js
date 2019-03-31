import { Track } from "./track.js";

export class Pattern {
    constructor() {
        this.tracks = [];
        this.notesPerTrack = 32;
        this.tempo = 120;
    }

    getTrackCount() {
        return this.tracks.length;
    }

    setTrackCount(numTracks) {
        let track;
        let inc = numTracks > this.tracks.length ? 1 : -1;

        while ( numTracks != this.tracks.length ) {
            if ( inc == 1 ) {
                track = new Track();
                track.setMaxNotes(this.notesPerTrack);
                this.tracks.push(track);
            } else if ( inc == -1 ) {
                this.tracks.splice( this.tracks.length-1 );
            }
        }
    }

    setNotesPerTrack(notesPerTrack) {
        this.notesPerTrack = notesPerTrack;
        if ( this.tracks.length ) {
            for ( let i = 0; i < this.tracks.length; i++ ) {
                this.tracks[i].setMaxNotes(notesPerTrack);
            }
        }
    }

    getNotesPerTrack() {
        return this.notesPerTrack;
    }

    getTrack(index) {
        let track = null;

        if ( typeof index == 'number' ) {
            track = this.tracks[index];
        }

        return track;
    }

    setTempo(tempo) {
        this.tempo = tempo;
    }

    getTempo() {
        return this.tempo;
    }

    setNote(trackIndex, noteIndex, note) {
        let track = this.getTrack(trackIndex);

        if ( track ) {
            track.setNote(noteIndex, note);
        }
    }

    getNote(trackIndex, noteIndex) {
        let track = this.getTrack(trackIndex);

        return (track ? track.getNote(noteIndex) : null);
    }

    deleteNote(trackIndex, noteIndex, shiftUp) {
        let track = this.getTrack(trackIndex);

        if ( track ) {
            track.deleteNote(noteIndex, shiftUp);
        }
    }

    deleteNotes(trackStart, trackEnd, noteStart, noteEnd) {
        let track;
        for (let t = trackStart; t <= trackEnd; t++) {
            track = this.getTrack(t);
            if (track) {
                for (let n = noteStart; n <= noteEnd; n++) {
                        track.deleteNote(n, false);
                }
            }
        }
    }

    insertNote(trackIndex, noteIndex) {
        let track = this.getTrack(trackIndex);

        if ( track ) {
            track.insertNote(noteIndex);
        }
    }

    copyTo(target) {
        if ( target && target !== this && target instanceof Pattern ) {
            target.setTrackCount(this.getTrackCount());
            target.setNotesPerTrack(this.getNotesPerTrack());
            target.setTempo(this.getTempo());

            for ( let i = 0, len = this.getTrackCount(); i < len; i++ ) {
                this.getTrack(i).copyTo(target.getTrack(i));
            }
        }
    }

    serialise() {
        let data = {
            notesPerTrack: this.notesPerTrack,
            tempo: this.tempo,
            tracks: this.tracks,
        }
        return data;
    }

    deserialise(data) {
        this.notesPerTrack = data.notesPerTrack;
        this.tempo = data.tempo;
        for (let track of data.tracks) {
            let t = new Track();
            t.deserialise(track);
            this.tracks.push(t);
        }
    }
}