define('ui/component', [], function() {

    function Component(display, dimensions) {
        this.display = display;
        this.dimensions = dimensions;
        this.rect = null;
    }

    Component.prototype.containsPoint = function(x, y) {
        return ( x >= this.rect.x && x <= this.rect.x + this.rect.w && y >= this.rect.y && y <= this.rect.y + this.rect.h );
    }

    Component.prototype.onClick = function(x, y) {
    }

    Component.prototype.onKeyDown = function(e) {
    }

    Component.prototype.scroll = function(xOffset, yOffset) {
    }

    Component.prototype.calcRect = function() {
        var canvas;
        var rect = { x: 0, y: 0, w: 0, h: 0 };

        if ( this.dimensions && this.display ) {
            canvas = this.display.canvas;
            rect.x = this.dimensions.left;
            rect.y = this.dimensions.top;
            if ( this.dimensions.right ) {
                rect.w = canvas.width - this.dimensions.right - rect.x;
            } else if ( this.dimensions.width ) {
                rect.w = this.dimensions.width;
            }
            if ( this.dimensions.bottom ) {
                rect.h = canvas.height - this.dimensions.bottom - rect.y;
            } else if ( this.dimensions.height ) {
                rect.h = this.dimensions.height;
            }
        }

        return rect;
    }

    return Component;
})