define('ui/samplelist', ['ui/component'], function(Component) {

    function SampleList(display, dimensions) {
        Component.call(this, display, dimensions)
        this.headers = [
            { label: 'ID', key: 'sampleID', width: 0.15, paddingV: 5, paddingH: 5 },
            { label: 'Sample', key: 'sampleName', width: 0.85, paddingV: 5, paddingH: 5 }
        ];
        this.fonts = {
            header: {
                name: 'Courier New',
                size: 14,
                weight: 'normal'
            }
        }
        this.colours = {
            headerFill: 'rgb(64, 64, 64)',
            headerText: 'rgb(255, 255, 255)',
            sampleFill: 'rgb(32, 32, 32)',
            sampleText: 'rgb(128, 128, 128)'
        }
    }
    SampleList.prototype = Object.create(Component.prototype);
    SampleList.prototype.constructor = SampleList;

    SampleList.prototype.onClick = function(x, y) {
        console.log('Sample List clicked');
    }

    SampleList.prototype.onKeyDown = function(e) {

    }

    SampleList.prototype.scroll = function(xOffset, yOffset) {

    }

    SampleList.prototype.render = function() {
        var ctx, rect;

        if ( this.display ) {
            ctx = this.display.context;
            this.rect = rect = this.calcRect();

            ctx.save();

            this._drawList(ctx, rect);

            ctx.restore();
        }
    }

    SampleList.prototype._drawList = function(ctx, rect) {
        this._drawFrame(ctx, rect);
        this._drawHeader(ctx, rect);
        this._drawItemList(ctx, rect);
    }

    SampleList.prototype._drawFrame = function(ctx, rect) {
        ctx.strokeStyle = 'rgb(128, 128, 128)';
        ctx.lineWidth = 0.5;
        ctx.fillStyle = 'rgb(16, 16, 16)';
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }

    SampleList.prototype._drawHeader = function(ctx, rect) {
//        ctx.textAlign = 'left';
//        ctx.textBaseline = 'top';
//        ctx.font = this.fonts.note.size + 'px' + ' ' + this.fonts.note.name + ' ';
//
//        for ( var i = 0, len = this.headers.length; i < len; i++ ) {
//
//        }
    }

    SampleList.prototype._drawItemList = function(ctx, rect) {

    }

    return SampleList;
})