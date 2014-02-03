define('display', function() {

    function Display() {
        this.parentElem = null;
        this.canvas = null;
        this.context = null;
        this.width = null;
        this.height = null;
    }

    Display.prototype.initialize = function(parentElem) {
        this.parentElem = parentElem || document.body;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width = window.innerWidth;
        this.canvas.height = this.height = window.innerHeight;
        this.canvas.id = 'main';
        this.parentElem.appendChild(this.canvas);
        // set the canvas style
        this.canvas.style.backgroundColor = 'rgb(32, 32, 32)';
        // get the context
        this.context = this.canvas.getContext('2d');

        // listen to the resize event
        window.addEventListener('resize', this.onWindowResize.bind(this));
        return this;
    }

    Display.prototype.onWindowResize = function(e) {
        this.canvas.width = this.width = window.innerWidth;
        this.canvas.height = this.height = window.innerHeight;
    }

    return Display;
})