define('sound/soundsystem', ['sound/pattern'], function(Pattern) {

    function SoundSystem() {
        this.context = null;
        this.sampleBank = [];
        this.patterns = [];
        this.trackRoutes = null;

        this.currentPattern = null;
        this.currentNote = 0;
        this.playing = false;
        this.lastTick = 0;

        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
        } catch (e) {
            console.error('Web Audio API is not supported in this browser');
        }
    }

    SoundSystem.prototype.loadSamples = function(samples, callback) {
        var _this = this;
        var counter = 0;
        if ( Array.isArray(samples) ) {
            for ( var i = 0, len = samples.length; i < len; i++ ) {
                var request = new XMLHttpRequest();
                request.responseType = 'arraybuffer';
                request.sample = samples[i];
                request.open('GET', samples[i].filename, true);

                request.onload = function() {
                    var _request = this;
                    var thisSample = this.sample;
                    _this.context.decodeAudioData(_request.response, function(buffer) {
                        thisSample.buffer = buffer;
                        _this.sampleBank.push(thisSample);
                        thisSample.index = _this.sampleBank.length-1;
                        if (++counter == samples.length) {
                            callback(_this.sampleBank);
                        }
                    })
                };

                request.onerror = function(e) {
                    console.log('sound error: ');
                    console.log(e);
                    counter++;
                }

                request.send();
            }
        }
    }

    SoundSystem.prototype.getSample = function(sampleName) {
        if ( typeof sampleName == 'string' ) {
            for ( var i = 0, len = this.sampleBank.length; i < len; i++ ) {
                if ( this.sampleBank[i].name == sampleName ) {
                    return this.sampleBank[i];
                }
            }
        } else if ( typeof sampleName == 'number') {
            return this.sampleBank[sampleName];
        }
        return null;
    }

    SoundSystem.prototype.addPattern = function(pattern) {
        this.patterns.push(pattern);
    }

    SoundSystem.prototype.getPattern = function(index) {
        return this.patterns[index];
    }

    SoundSystem.prototype.playPattern = function(pattern) {
        if ( pattern && pattern instanceof Pattern) {
            this.currentPattern = pattern;
            this._configureRouting();
            this.currentNote = 0;

            this.playing = true;
        }
    }

    SoundSystem.prototype.onTick = function(dt) {
        var pattern = this.currentPattern;
        var timePerNote, track, note, source

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
                            // connect the node to the appropriate channel's gainNode
                            source.connect(this.trackRoutes[i].gain);
                            source.noteOn(0);
                        }
                    }
                }
                if ( this.currentNote < pattern.getNotesPerTrack() ) {
                    this.currentNote++;
                } else {
                    this.playing = false;
                }

                this.lastTick = dt;
            }
        }
    }

    /**
     * Creates a BufferSource node from a pre-loaded audio sample and ensures that its playback is done at the requested
     * frequency (specified by the note)
     * @param note
     * @returns {*}
     * @private
     */
    SoundSystem.prototype._createBufferNode = function(note) {
        var source = this.context.createBufferSource();
        source.buffer = this.getSample(note.sampleID).buffer;
//        source.connect(this.context.destination);
        source.playbackRate.value = (note.getFrequency() / 440.0);

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
    SoundSystem.prototype._configureRouting = function() {
        var volNode, pannerNode, analyserNode;

        if ( this.currentPattern ) {
            var numTracks = this.currentPattern.getTrackCount();

            if ( !this.trackRoutes || numTracks != this.trackRoutes.length ) {
                console.log('Reconfiguring routing for pattern')
                this._clearRouting();
                this.trackRoutes = [];
                for ( var i = 0; i < numTracks; i++ ) {
                    volNode = this._createVolumeNode();
                    pannerNode = this._createPannerNode();
                    analyserNode = this._createAnalyserNode();
                    volNode.connect(pannerNode);
                    pannerNode.connect(analyserNode);
                    analyserNode.connect(this.context.destination);
                    this.trackRoutes[i] = {
                        gain: volNode,
                        panner: pannerNode,
                        analyser: analyserNode
                    };
                }
            } else {
                console.log('Routing for pattern stays the same');
            }
        }
    }

    SoundSystem.prototype._clearRouting = function() {
        if ( this.trackRoutes && this.trackRoutes.length ) {
            console.log('Clearing %s track routes', this.trackRoutes.length);
            for ( var i = 0, len = this.trackRoutes.length; i < len; i++ ) {
                this.trackRoutes[i].gain.disconnect();
                this.trackRoutes[i].panner.disconnect();
                this.trackRoutes[i].analyser.disconnect();
            }
        }
    }

    SoundSystem.prototype._createVolumeNode = function() {
        return this.context.createGainNode();
    }
    SoundSystem.prototype._createPannerNode = function() {
        return this.context.createPanner();
    }
    SoundSystem.prototype._createAnalyserNode = function() {
        return this.context.createAnalyser();
    }


    return SoundSystem;
})