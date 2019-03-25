import { Pattern } from "./pattern.js";
import { Note } from "./note.js";

export class SoundSystem {
    constructor() {
        this.context = null;
        this.sampleBank = [];
        this.patterns = [];
        this.trackRoutes = null;
        this.sampleRoute = null;

        this.currentPattern = 0;
        this.currentNote = 0;
        this.playing = false;
        this.playingSong = false;
        this.lastTick = 0;

        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
        } catch (e) {
            console.error('Web Audio API is not supported in this browser');
        }
    }

    loadSamples(samples, callback) {
        let counter = 0;
        const createRequest = (sample) => {
            let _this = this;
            let request = new XMLHttpRequest();
            request.responseType = 'arraybuffer';
            request.sample = sample;

            request.onload = function() {
                // let _request = this;
                let thisSample = this.sample;
                _this.context.decodeAudioData(this.response, function (buffer) {
                    thisSample.buffer = buffer;
                    _this.sampleBank.push(thisSample);
                    thisSample.index = _this.sampleBank.length - 1;
                    if (++counter == samples.length) {
                        callback(_this.sampleBank);
                    }
                })
            };

            request.onerror = function (e) {
                console.log('sound error: ');
                console.log(e);
                counter++;
            }

            return request;
        }

        if (Array.isArray(samples)) {
            for (let s of samples) {
                let request = createRequest(s);
                request.open('GET', s.filename, true);
                request.send();
            }
        }
    }

    getSample(sampleName) {
        if (typeof sampleName == 'string') {
            for (let i = 0, len = this.sampleBank.length; i < len; i++) {
                if (this.sampleBank[i].name == sampleName) {
                    return this.sampleBank[i];
                }
            }
        } else if (typeof sampleName == 'number') {
            return this.sampleBank[sampleName];
        }
        return null;
    }

    playSample(sampleIndex) {
        let volNode, pannerNode, note, source;

        // create the WebAudio route for playing the sample
        if (!this.sampleRoute) {
            volNode = this._createVolumeNode();
            pannerNode = this._createPannerNode();
            volNode.connect(pannerNode);
            pannerNode.connect(this.context.destination);
            this.sampleRoute = {
                gain: volNode,
                panner: pannerNode
            };
        }

        // create the note (C4)
        note = new Note('C', false, 4, sampleIndex);
        source = this._createBufferNode(note);
        if (source) {
            this.stopSample();
            // reference the new source node
            this.sampleRoute.source = source;
            // connect the node to the appropriate channel's gainNode
            source.connect(this.sampleRoute.gain);
            source.start(0);
        }
    }

    stopSample() {
        if ( this.sampleRoute && this.sampleRoute.source ) {
            this.sampleRoute.source.stop(0);
            this.sampleRoute.source.disconnect();
            this.sampleRoute.source = null;
        }
    }

    addPattern(pattern) {
        this.patterns.push(pattern);
    }

    removePattern(patternIndex) {
        let oldPattern = this.patterns.splice(patternIndex, 1);
        if (this.currentPattern >= this.patterns.length) {
            this.currentPattern = this.patterns.length-1;
        }
        return oldPattern;
    }

    getCurrentPattern() {
        return this.patterns[this.currentPattern];
    }

    setCurrentPattern(patternIndex) {
        if ( patternIndex >= 0 && patternIndex <= this.patterns.length-1 ) {
            this.currentPattern = patternIndex;
            this._configureRouting();
        }
    }

    getPatternCount() {
        return this.patterns.length;
    }

    getPattern(index) {
        return this.patterns[index];
    }

    playPattern(patternIndex) {
        patternIndex = patternIndex != undefined ? patternIndex : this.currentPattern
        let pattern = this.getPattern(patternIndex);
        if ( pattern instanceof Pattern) {
            this.stopSample();
            this.currentPattern = patternIndex;
            this._configureRouting();
            this.currentNote = 0;

            this.playing = true;
        }
    }

    clonePattern(patternIndex) {
        patternIndex = patternIndex != undefined ? patternIndex : this.currentPattern;
        let pattern = this.getPattern(patternIndex);
        let newPattern;

        if ( pattern && pattern instanceof Pattern ) {
            newPattern = new Pattern();
            pattern.copyTo(newPattern);
        }

        return newPattern;
    }

    playSong() {
        this.playingSong = true;
        this.stopSample();
        this.playPattern(0);
    }

    onTick(dt) {
        let pattern = this.getCurrentPattern();
        let timePerNote, note, source

        if ( pattern && this.playing ) {
            timePerNote = 60 / pattern.tempo * 100;
            if ( dt - this.lastTick >= timePerNote ) {
                // loop through the tracks
                for ( var i = 0, numTracks = pattern.getTrackCount(); i < numTracks; i++ ) {
                    note = pattern.getTrack(i).getNote(this.currentNote);
                    if ( note ) {
                        // if we have a note to play, do it
                        source = this._createBufferNode(note);
                        if ( source ) {
                            if ( this.trackRoutes[i].source ) {
                                this.trackRoutes[i].source.stop(0);
                            }
                            // reference the new source node
                            this.trackRoutes[i].source = source;
                            // connect the node to the appropriate channel's gainNode
                            source.connect(this.trackRoutes[i].gain);
                            this.trackRoutes[i].gain.gain.value = (note.volume ? note.volume : 255) / 255;
                            source.start(0);
                        } else {
                            if ( note.volume != null ) {
                                this.trackRoutes[i].gain.gain.value = note.volume / 255;
                            }
                        }
                    }
                }
                if ( this.currentNote < pattern.getNotesPerTrack()-1 ) {
                    this.currentNote++;
                } else {
                    if ( this.playingSong ) {
                        if ( this.currentPattern < this.patterns.length-1 ) {
                            this.currentPattern++;
                            this.currentNote = 0;
                            this._configureRouting();
                        } else {
                            this.playing = this.playingSong = false;
                        }
                    } else {
                        this.playing = false;
                    }
                }

                 this.lastTick = dt;
            }
        }
    }

    serialise() {
        let data = {
            format: "forcetracker",
            version: "1.0.0",
            numPatterns: this.patterns.length,
            samples: [],
            patterns: [],
        }

        for (let sample of this.sampleBank) {
            data.samples.push({
                name: sample.name,
                filename: sample.filename,
                index: sample.index
            });
        }

        for (let pattern of this.patterns) {
            data.patterns.push(pattern.serialise());
        }
        return data;
    }

    /**
     * Creates a BufferSource node from a pre-loaded audio sample and ensures that its playback is done at the requested
     * frequency (specified by the note)
     * @param note
     * @returns {*}
     * @private
     */
    _createBufferNode(note) {
        let source;

        if ( note.noteName != null && note.sampleID != null ) {
            source = this.context.createBufferSource();
            source.buffer = this.getSample(note.sampleID).buffer;
            source.playbackRate.value = (note.getFrequency() / 440.0);
        }

        return source;
    }

    /**
     * Configures AudioNode routing for the current pattern
     *
     * Each track has the following DEFAULT routing:
     *
     *  GainNode -> PannerNode -> AnalyserNode -> destination
     *
     * When the track plays, the source of each note will be connected to the GainNode
     *
     * @private
     */
    _configureRouting() {
        if ( this.currentPattern >= 0) {
            let numTracks = this.getCurrentPattern().getTrackCount();

            if ( !this.trackRoutes ) {
//                console.log('Configuring routing for pattern')
                this.trackRoutes = [];
                for ( let i = 0; i < numTracks; i++ ) {
                    this._addRouteForTrack(i);
                }
            } else {
                if ( this.trackRoutes.length != numTracks ) {
//                    console.log('Reconfiguring routing for pattern: %s tracks to %s tracks', this.trackRoutes.length, numTracks);
                    this._updateRouting(numTracks);
                } else {
//                    console.log('Routing for pattern stays the same');
                }
            }
        }
    }

    _addRouteForTrack(trackIndex) {
        let volNode, pannerNode, analyserNode;

        volNode = this._createVolumeNode();
        pannerNode = this._createPannerNode();
        analyserNode = this._createAnalyserNode();
        volNode.connect(pannerNode);
        pannerNode.connect(analyserNode);
        analyserNode.connect(this.context.destination);
        analyserNode.fftSize = 64;
        this.trackRoutes[trackIndex] = {
            gain: volNode,
            panner: pannerNode,
            analyser: analyserNode
        };
    }

    _updateRouting(numTracks) {
        if ( this.trackRoutes && this.trackRoutes.length ) {
            if ( numTracks > this.trackRoutes.length ) {
                for ( let i = this.trackRoutes.length; i < numTracks; i++ ) {
                    this._addRouteForTrack(i);
                }
            } else if ( numTracks < this.trackRoutes.length ) {
                // disconnect the nodes
                for ( let i = this.trackRoutes.length-1; i >= numTracks; i-- ) {
                    this._clearRoutingForTrack(i+1);
                }
                this.trackRoutes.splice(numTracks-1, this.trackRoutes.length - numTracks);
            }
        }
    }

    _clearRoutingForTrack(trackIndex) {
        if ( this.trackRoutes && this.trackRoutes.length > trackIndex) {
            if ( this.trackRoutes[trackIndex].source ) {
                this.trackRoutes[trackIndex].source.disconnect();
            }
            this.trackRoutes[trackIndex].gain.disconnect();
            this.trackRoutes[trackIndex].panner.disconnect();
            this.trackRoutes[trackIndex].analyser.disconnect();
        }
    }

    _createVolumeNode() {
        return this.context.createGain();
    }
    _createPannerNode() {
        return this.context.createPanner();
    }
    _createAnalyserNode() {
        return this.context.createAnalyser();
    }
}
