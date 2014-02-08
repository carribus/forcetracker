define('ui/inputhandler', [], function() {

    function InputHandler(ui) {
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
            console.log('onWheel');
            console.log(e);
            if ( ui.controls.patternEditor.containsPoint(e.clientX, e.clientY) ) {
                ui.controls.patternEditor.scroll(0, e.wheelDeltaY/40*-1);
            }
        }

        this.onKeyDown = function(e) {
//            console.log('InputHandler: onKeyDown: %s', e.keyCode);
            if (e.keyCode == InputHandler.KEYS.VK_SPACE ) {
                ui._playPattern();
            }
            if ( ui.focusControl ) {
                ui.focusControl.onKeyDown(e);
            } else {
                console.log('No control has keyboard focus');
            }
        }

        this.onKeyUp = function(e) {
            console.log('InputHandler: onKeyUp: %s', e.keyCode);
        }

    }

    InputHandler.KEYS = {
        VK_SPACE: 32,
        VK_LEFT: 37,
        VK_RIGHT: 39,
        VK_UP: 38,
        VK_DOWN: 40,
        VK_DELETE: 46
    }


    return InputHandler;
});