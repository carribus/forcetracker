define('ui/inputhandler', [], function() {

    function InputHandler(ui) {
        var _ui = ui;

        this.onMouseDown = function(e) {
            var control;

            console.log('InputHandler: onMouseDown: %s', e.button);
            if (e.button == 0) { // left click
                if ( ui.controls.patternEditor.containsPoint(e.clientX, e.clientY) ) {
                    ui.controls.patternEditor.onClick(e.clientX, e.clientY);
                }
            }
        }

        this.onKeyDown = function(e) {
            console.log('InputHandler: onKeyDown: %s', e.keyCode);
        }

        this.onKeyUp = function(e) {
            console.log('InputHandler: onKeyUp: %s', e.keyCode);
        }

    }


    return InputHandler;
});