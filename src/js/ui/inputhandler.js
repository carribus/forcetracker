define('ui/inputhandler', [], function() {

    function InputHandler(ui) {
        var _ui = ui;

        this.onMouseDown = function(e) {
            var control;

            console.log('InputHandler: onMouseDown: %s', e.button);
            if (e.button == 0) { // left click
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