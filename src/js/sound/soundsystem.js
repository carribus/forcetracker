define('sound/soundsystem', ['sound/pattern'], function(Pattern) {

    function SoundSystem() {
        this.context = null;
        this.sampleBank = [];
        this.patterns = [];

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

    return SoundSystem;
})