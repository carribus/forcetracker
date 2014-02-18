require.config({
    urlArgs: "bust=" + (new Date()).getTime()
});

require(['display', 'ui/ftui', 'sound/soundsystem', 'sound/pattern', 'sound/track', 'sound/note'], function(Display, ftUI, SoundSystem, Pattern, Track, Note) {
    console.log('Force Tracker starting...');

    var currentPatternIndex = 0;

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
    }

    window.requestAnimationFrame(update);

    function update(dt) {
        window.requestAnimationFrame(update);
        sound.onTick(dt);
        ui.render();
    }

    ui.controls.createPatternButton.addEventListener('click', createPattern);
    ui.controls.playPatternButton.addEventListener('click', playPattern);
    ui.controls.stopPatternButton.addEventListener('click', stopPattern);
    ui.controls.applyTempoButton.addEventListener('click', applyTempo);
    ui.controls.addTrackButton.addEventListener('click', addTrack);
    ui.controls.delTrackButton.addEventListener('click', delTrack);
    ui.controls.nextPatternButton.addEventListener('click', nextPattern);
    ui.controls.prevPatternButton.addEventListener('click', prevPattern);

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
        // TODO: Fix this private call
        sound.currentPattern = pattern;
        sound._configureRouting();

        ui.controls.playPatternButton.disabled = false;
    }

    function playPattern() {
        var pattern = sound.getPattern(currentPatternIndex);
        if ( pattern ) {
            sound.playPattern(pattern);
            ui.controls.stopPatternButton.disabled = false;
        }
    }

    function stopPattern() {
        sound.playing = false;
        ui.controls.stopPatternButton.disabled = true;
    }

    function applyTempo() {
        var pattern = sound.getPattern(currentPatternIndex);
        if ( pattern ) {
            pattern.setTempo(parseInt(ui.controls.tempoTextField.value));
        }
    }

    function addTrack() {
        var pattern = sound.getPattern(currentPatternIndex);
        if ( pattern ) {
            pattern.setTrackCount( pattern.getTrackCount()+1 );
        }
        sound._configureRouting();

        ui.controls.addTrackButton.blur();
    }

    function delTrack() {
        var pattern = sound.getPattern(currentPatternIndex);
        if ( pattern ) {
            pattern.setTrackCount( pattern.getTrackCount()-1 );
        }
        sound._configureRouting();
        ui.controls.delTrackButton.blur();
    }

    function nextPattern() {
        var pattern = sound.getPattern(currentPatternIndex+1);
        if ( pattern ) {
            currentPatternIndex++;
        }
    }

    function prevPattern() {

    }

});