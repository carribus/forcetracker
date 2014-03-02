define('sound/soundsystem', ['sound/pattern'], function(Pattern) {

    function SoundSystem() {
        this.context = null;
        this.sampleBank = [];
        this.patterns = [];
        this.trackRoutes = null;

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

    SoundSystem.prototype.removePattern = function(patternIndex) {
        var pattern = this.patterns.splice(patternIndex, 1);
        return pattern;
    }

    SoundSystem.prototype.getCurrentPattern = function() {
        return this.patterns[this.currentPattern];
    }

    SoundSystem.prototype.setCurrentPattern = function(patternIndex) {
        this.currentPattern = patternIndex;
        this._configureRouting();
    }

    SoundSystem.prototype.getPatternCount = function() {
        return this.patterns.length;
    }

    SoundSystem.prototype.getPattern = function(index) {
        return this.patterns[index];
    }

    SoundSystem.prototype.playPattern = function(patternIndex) {
        patternIndex = patternIndex != undefined ? patternIndex : this.currentPattern
        var pattern = this.getPattern(patternIndex);
        if ( pattern instanceof Pattern) {
            this.currentPattern = patternIndex;
            this._configureRouting();
            this.currentNote = 0;

            this.playing = true;
        }
    }

    SoundSystem.prototype.playSong = function() {
        this.playingSong = true;
        this.playPattern(0);
    }

    SoundSystem.prototype.onTick = function(dt) {
        var pattern = this.getCurrentPattern();
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

    /**
     * Creates a BufferSource node from a pre-loaded audio sample and ensures that its playback is done at the requested
     * frequency (specified by the note)
     * @param note
     * @returns {*}
     * @private
     */
    SoundSystem.prototype._createBufferNode = function(note) {
        var source;

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
    SoundSystem.prototype._configureRouting = function() {
        if ( this.currentPattern >= 0) {
            var numTracks = this.getCurrentPattern().getTrackCount();

            if ( !this.trackRoutes ) {
//                console.log('Configuring routing for pattern')
                this.trackRoutes = [];
                for ( var i = 0; i < numTracks; i++ ) {
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

    SoundSystem.prototype._addRouteForTrack = function(trackIndex) {
        var volNode, pannerNode, analyserNode;

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

    SoundSystem.prototype._updateRouting = function(numTracks) {
        if ( this.trackRoutes && this.trackRoutes.length ) {
            if ( numTracks > this.trackRoutes.length ) {
                for ( var i = this.trackRoutes.length; i < numTracks; i++ ) {
                    this._addRouteForTrack(i);
                }
            } else if ( numTracks < this.trackRoutes.length ) {
                // disconnect the nodes
                for ( var i = this.trackRoutes.length-1; i >= numTracks; i-- ) {
                    this._clearRoutingForTrack(i+1);
                }
                this.trackRoutes.splice(numTracks-1, this.trackRoutes.length - numTracks);
            }
        }
    }

    SoundSystem.prototype._clearRoutingForTrack = function(trackIndex) {
        if ( this.trackRoutes && this.trackRoutes.length > trackIndex) {
            if ( this.trackRoutes[trackIndex].source ) {
                this.trackRoutes[trackIndex].source.disconnect();
            }
            this.trackRoutes[trackIndex].gain.disconnect();
            this.trackRoutes[trackIndex].panner.disconnect();
            this.trackRoutes[trackIndex].analyser.disconnect();
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