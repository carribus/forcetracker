define('ui/inputhandler', ['sound/pattern'], function(Pattern) {

    function InputHandler(ui) {
        var _this = this;
        this.soundSystem = ui.soundSystem;

        this.onMouseDown = function(e) {
            console.log('InputHandler: onMouseDown: %s', e.button);
            if (e.button == 0) { // left click
                if ( ui.controls.patternEditor.containsPoint(e.clientX, e.clientY) ) {
                    ui.focusControl = ui.controls.patternEditor;
                    ui.controls.patternEditor.onClick(e.clientX, e.clientY);
                }
            }
        }

        this.onWheel = function(e) {
            if ( ui.controls.patternEditor.containsPoint(e.clientX, e.clientY) ) {
                ui.controls.patternEditor.scroll(0, e.wheelDeltaY/40*-1);
            }
        }

        this.onDragOver = function(e) {
            e.preventDefault();
            ui.controls.sampleList.highlightForDrop = ui.controls.sampleList.containsPoint(e.clientX, e.clientY);
        }

        this.onDrop = function(e) {
            ui.controls.sampleList.onDrop(e);
            e.preventDefault();
        }

        this.onKeyDown = function(e) {
            console.log('InputHandler: onKeyDown: %s', e.keyCode);
            if ( ui.focusControl ) {
                switch (e.keyCode) {
                    case    InputHandler.KEYS.VK_SPACE:
                        if ( _this.soundSystem.playing ) {
                            _this.soundSystem.playing = false;
                        } else {
                            if (e.ctrlKey || e.metaKey ) {
                                _this.soundSystem.playSong();
                            } else {
                                _this.soundSystem.playingSong = false;
                                _this.soundSystem.playPattern();
                            }
                        }
                        break;

                    case    InputHandler.KEYS.VK_BRACKET_SQUARE_OPEN:
                        if (e.ctrlKey) {
                            _this.soundSystem.setCurrentPattern( _this.soundSystem.currentPattern-1 );
                        }
                        break;

                    case    InputHandler.KEYS.VK_BRACKET_SQUARE_CLOSE:
                        if (e.ctrlKey) {
                            _this.soundSystem.setCurrentPattern( _this.soundSystem.currentPattern+1 );
                        }
                        break;

                    case    InputHandler.KEYS.VK_PLUS:
                        if (e.ctrlKey && e.shiftKey) {
                            var currentPattern = _this.soundSystem.getCurrentPattern();
                            var newPattern = new Pattern();

                            newPattern.setNotesPerTrack(currentPattern.getNotesPerTrack());
                            newPattern.setTrackCount(currentPattern.getTrackCount());
                            newPattern.setTempo(currentPattern.getTempo());
                            _this.soundSystem.addPattern(newPattern);
                            _this.soundSystem.setCurrentPattern(_this.soundSystem.getPatternCount()-1);
                        }
                }

                ui.focusControl.onKeyDown(e);
            } else {
                console.log('No control has keyboard focus');
            }
        }

        this.onKeyUp = function(e) {
        }

    }

    InputHandler.KEYS = {
        VK_SPACE: 32,
        VK_LEFT: 37,
        VK_RIGHT: 39,
        VK_UP: 38,
        VK_DOWN: 40,
        VK_DELETE: 46,
        VK_PLUS: 107,
        VK_MINUS: 109,
        VK_BRACKET_SQUARE_OPEN: 219,
        VK_BRACKET_SQUARE_CLOSE: 221
    }

    InputHandler.isNoteKey = function(keyCode) {
        var notes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        return (notes.indexOf(String.fromCharCode(keyCode)) != -1);
    }

    return InputHandler;
});