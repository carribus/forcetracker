require.config({
    urlArgs: "bust=" + (new Date()).getTime()
});

require(['display', 'ui/ftui', 'sound/soundsystem', 'sound/pattern', 'sound/track', 'sound/note'], function(Display, ftUI, SoundSystem, Pattern, Track, Note) {
    console.log('Force Tracker starting...');

    Number.prototype.pad = function(toLength) {
        var str = '' + this.valueOf();
        for ( var i = str.length; i < toLength; i++ ) {
            str = '0' + str;
        }

        return str;
    };

    Number.prototype.toHex = function(width, upperCase) {
        var hex = this.valueOf().toString(16);
        for ( var i = hex.length; i < width; i++ ) {
            hex = '0' + hex;
        }
        return (upperCase ? hex.toUpperCase() : hex);
    }

    // create the display object
    var display = new Display().initialize();
    console.log('Display created:\n' +
        '\twidth: %s\n' +
        '\theight: %s', display.width, display.height);

    // create the sound system
    var sound = new SoundSystem();

    // create the ui
    var ui = new ftUI(display, sound);

    if ( sound ) {
        console.log('Sound System created:\n' +
            '\tSample Rate: %s', sound.context.sampleRate);

        sound.loadSamples([
            { name: 'kick', filename: 'samples/kick.wav' },
            { name: 'cymbal', filename: 'samples/cymbal.wav' },
            { name: 'hihat_closed', filename: 'samples/closed_hihat1.wav' },
            { name: 'hihat_open', filename: 'samples/open_hihat1.wav' },
            { name: 'snare1', filename: 'samples/snare1.wav' },
            { name: 'snare2', filename: 'samples/snare2.wav' },
            { name: 'snare3', filename: 'samples/snare3.wav' }
        ],
        onSamplesLoaded)
    }

    function onSamplesLoaded(/*sampleBank*/) {
        createPattern();
        createPattern();
        sound.setCurrentPattern(0);
        ui.controls.playSongButton.disabled =
            ui.controls.playPatternButton.disabled = false;
    }

    window.requestAnimationFrame(update);

    function update(dt) {
        window.requestAnimationFrame(update);
        sound.onTick(dt);
        ui.render();
    }

    ui.controls.createPatternButton.addEventListener('click', createPattern);
    ui.controls.playSongButton.addEventListener('click', playSong);
    ui.controls.playPatternButton.addEventListener('click', playPattern);
    ui.controls.applyTempoButton.addEventListener('click', applyTempo);
    ui.controls.addTrackButton.addEventListener('click', addTrack);
    ui.controls.delTrackButton.addEventListener('click', delTrack);
    ui.controls.nextPatternButton.addEventListener('click', nextPattern);
    ui.controls.prevPatternButton.addEventListener('click', prevPattern);
    ui.controls.addPatternButton.addEventListener('click', addPattern);
    ui.controls.dupPatternButton.addEventListener('click', duplicatePattern);

    function createPattern() {
        var pattern = new Pattern();
        var track, sample;
        var i;

        pattern.setNotesPerTrack(64);
        pattern.setTrackCount(4);
        pattern.setTempo(125);

        // bass drum track
        sample = sound.getSample('kick');
        track = pattern.getTrack(0);
        for ( i = 0; i < pattern.getNotesPerTrack(); i+=8 ) {
            track.setNote(i, new Note('C', false, 4, sample.index));
        }

        // hihat track
        sample = sound.getSample('hihat_closed');
        track = pattern.getTrack(1);
        for ( i = 0; i < pattern.getNotesPerTrack(); i+=2) {
            track.setNote(i, new Note('C', false, 5, sample.index));
        }

        // cymbal track
        sample = sound.getSample('cymbal');
        track = pattern.getTrack(2);
        for ( i = 4; i < pattern.getNotesPerTrack(); i+= 8) {
            track.setNote(i, new Note('C', false, 4, sample.index));
        }

        // snare track
        sample = sound.getSample('snare2');
        track = pattern.getTrack(3);
        for ( i = 8; i < pattern.getNotesPerTrack(); i+= 16) {
            track.setNote(i, new Note('C', false, 3, sample.index));
        }

        sound.addPattern(pattern);
    }

    function playSong() {
        sound.playSong();
        ui.controls.playSongButton.blur();
    }

    function playPattern() {
        sound.playPattern();
        ui.controls.playPatternButton.blur();
    }

    function applyTempo() {
        var pattern = sound.getPattern(sound.currentPattern);
        if ( pattern ) {
            pattern.setTempo(parseInt(ui.controls.tempoTextField.value));
        }
    }

    function addTrack() {
        var pattern = sound.getPattern(sound.currentPattern);
        if ( pattern ) {
            pattern.setTrackCount( pattern.getTrackCount()+1 );
        }
        sound._configureRouting();

        ui.controls.addTrackButton.blur();
    }

    function delTrack() {
        var pattern = sound.getPattern(sound.currentPattern);
        if ( pattern ) {
            pattern.setTrackCount( pattern.getTrackCount()-1 );
        }
        sound._configureRouting();
        ui.controls.delTrackButton.blur();
    }

    function nextPattern() {
        var pattern = sound.getPattern(sound.currentPattern+1);
        if ( pattern ) {
            sound.currentPattern++;
            sound.setCurrentPattern(sound.currentPattern);
        }
        console.log('sound.currentPattern: %s', sound.currentPattern);
    }

    function prevPattern() {
        var pattern = sound.getPattern(sound.currentPattern-1);
        if ( pattern ) {
            sound.currentPattern--;
            sound.setCurrentPattern(sound.currentPattern);
        }
        console.log('sound.currentPattern: %s', sound.currentPattern);
    }

    function addPattern() {
        var currentPattern = sound.getCurrentPattern();
        var newPattern = new Pattern();

        newPattern.setNotesPerTrack(currentPattern.getNotesPerTrack());
        newPattern.setTrackCount(currentPattern.getTrackCount());
        newPattern.setTempo(currentPattern.getTempo());
        sound.addPattern(newPattern);
        sound.setCurrentPattern(sound.getPatternCount()-1);
    }

    function duplicatePattern() {
        var newPattern = sound.clonePattern(sound.currentPattern);
        if ( newPattern ) {
            sound.addPattern(newPattern);
            sound.setCurrentPattern(sound.getPatternCount()-1);
        }
    }

});