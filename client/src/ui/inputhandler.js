export class InputHandler {
    constructor(ui) {
        this.soundSystem = ui.soundSystem;

        this.onMouseDown = (e) => {
            console.log('InputHandler: onMouseDown: %s', e.button);
            if (e.button == 0) { // left click
                ui.focusControl = null;
                if ( ui.controls.patternEditor.containsPoint(e.clientX, e.clientY) ) {
                    ui.focusControl = ui.controls.patternEditor;
                } else if ( ui.controls.sampleList.containsPoint(e.clientX, e.clientY) ) {
                    ui.focusControl = ui.controls.sampleList;
                }

                if ( ui.focusControl ) {
                    ui.focusControl.onClick(e.clientX, e.clientY);
                }
            }
        }

        this.onWheel = (e) => {
            if ( ui.controls.patternEditor.containsPoint(e.clientX, e.clientY) ) {
                ui.controls.patternEditor.scroll(0, e.wheelDeltaY/40*-1);
            }
        }

        this.onDragOver = (e) => {
            e.preventDefault();
            ui.controls.sampleList.highlightForDrop = ui.controls.sampleList.containsPoint(e.clientX, e.clientY);
        }

        this.onDrop = (e) => {
            ui.controls.sampleList.onDrop(e);
            e.preventDefault();
        }

        this.onKeyDown = (e) => {
            console.log('InputHandler: onKeyDown: %s', e.keyCode);
            if ( ui.focusControl ) {
                switch (e.keyCode) {
                    case    InputHandler.KEYS.VK_SPACE:
                        if ( this.soundSystem.playing ) {
                            this.soundSystem.playing = false;
                        } else {
                            if (e.ctrlKey || e.metaKey ) {
                                this.soundSystem.playSong();
                            } else {
                                this.soundSystem.playingSong = false;
                                this.soundSystem.playPattern();
                            }
                        }
                        break;

                    case    InputHandler.KEYS.VK_BRACKET_SQUARE_OPEN:
                        if (e.ctrlKey) {
                            this.soundSystem.setCurrentPattern( this.soundSystem.currentPattern-1 );
                        }
                        break;

                    case    InputHandler.KEYS.VK_BRACKET_SQUARE_CLOSE:
                        if (e.ctrlKey) {
                            this.soundSystem.setCurrentPattern( this.soundSystem.currentPattern+1 );
                        }
                        break;

                    case    InputHandler.KEYS.VK_PLUS:
                        if (e.ctrlKey && e.shiftKey) {
                            let currentPattern = this.soundSystem.getCurrentPattern();
                            let newPattern = new Pattern();

                            newPattern.setNotesPerTrack(currentPattern.getNotesPerTrack());
                            newPattern.setTrackCount(currentPattern.getTrackCount());
                            newPattern.setTempo(currentPattern.getTempo());
                            this.soundSystem.addPattern(newPattern);
                            this.soundSystem.setCurrentPattern(this.soundSystem.getPatternCount()-1);
                        }
                }

                ui.focusControl.onKeyDown(e);
            } else {
                console.log('No control has keyboard focus');
            }
        }

        this.onKeyUp = (e) => {
        }

    }

    static isNoteKey(keyCode) {
        const notes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        return (notes.indexOf(String.fromCharCode(keyCode)) != -1);
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
