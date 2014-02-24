define('ui/samplelist', ['ui/component'], function(Component) {

    /**
     * SampleList UI component
     * @param display
     * @param dimensions
     * @constructor
     */
    function SampleList(display, dimensions, ui) {
        Component.call(this, display, dimensions);
        this.ui = ui;
        this.highlightForDrop = false;
        this.headers = [
            { label: 'ID', key: 'sampleID', width: 0.15 },
            { label: 'Sample', key: 'sampleName', width: 0.85 }
        ];
        this.fonts = {
            header: {
                name: 'Courier New',
                size: 14,
                weight: 'normal'
            },
            item: {
                name: 'Courier New',
                size: 14,
                weight: 'normal'
            }
        }
        this.colours = {
            frameStroke: 'rgb(128, 128, 128)',
            frameFill: 'rgb(16, 16, 16)',
            frameStrokeDrop: 'rgb(128, 196, 128)',
            frameFillDrop: 'rgb(16, 48, 16)',
            headerFill: 'rgb(64, 64, 64)',
            headerText: 'rgb(255, 255, 255)',
            sampleFill: 'rgb(16, 16, 16)',
            sampleText: 'rgb(128, 128, 164)',
            sampleHighlightText: 'rgb(196, 196, 255)',
            sampleHighlightFill: 'rgb(16,48,96)'
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

    SampleList.prototype.onDrop = function(e) {
        var validTypes = ['audio/wav'];
        var acceptedFiles = [];
        var files = e.dataTransfer.files;

        this.highlightForDrop = false;
        if ( files.length > 0 ) {
            for ( var i = 0; i < files.length; i++ ) {
                if ( validTypes.indexOf(files[i].type) != -1 ) {
                    console.log('Accepting sample: %s', files[i].name);
                    acceptedFiles.push(files[i]);
                } else {
                    console.log('invalid sample file type: %s', files[i].name);
                }
            }
        }

        if ( this.ui ) {
            this.ui.startSampleUpload(acceptedFiles);
        }
    }

    /**
     *
     * @param sampleBank
     * @param pattern
     * @param currentNote
     */
    SampleList.prototype.render = function(sampleBank, pattern, currentNote) {
        var ctx, rect;

        if ( this.display ) {
            ctx = this.display.context;
            this.rect = rect = this.calcRect();

            ctx.save();

            this._drawList(sampleBank, pattern, currentNote);

            ctx.restore();
        }
    }

    /**
     *
     * @param ctx
     * @param rect
     * @param sampleBank
     * @param pattern
     * @param currentNote
     * @private
     */
    SampleList.prototype._drawList = function(sampleBank, pattern, currentNote) {
        this._drawFrame(this.display.context, this.rect);
        this._drawHeader(this.display.context, this.rect);
        this._drawItemList(this.display.context, this.rect, sampleBank, pattern, currentNote);
    }

    /**
     *
     * @param ctx
     * @param rect
     * @private
     */
    SampleList.prototype._drawFrame = function(ctx, rect) {
        ctx.strokeStyle = this.highlightForDrop ? this.colours.frameStrokeDrop : this.colours.frameStroke;
        ctx.lineWidth = this.highlightForDrop ? 2.0 : 0.5;
        ctx.fillStyle = this.highlightForDrop ? this.colours.frameFillDrop : this.colours.frameFill;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }

    /**
     *
     * @param ctx
     * @param rect
     * @private
     */
    SampleList.prototype._drawHeader = function(ctx, rect) {
        var hRect = { x: rect.x, y: rect.y, w: rect.w, h: rect.h };
        var lastX = rect.x;

        hRect.h = this.fonts.header.size + 10;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = this.fonts.header.size + 'px' + ' ' + this.fonts.header.name + ' ';

        for ( var i = 0, len = this.headers.length; i < len; i++ ) {
            hRect.x = lastX;
            hRect.w = rect.w * this.headers[i].width;
            ctx.fillStyle = this.colours.headerFill;
            ctx.fillRect(hRect.x, hRect.y, hRect.w, hRect.h);
            ctx.fillStyle = this.colours.headerText;
            ctx.fillText(this.headers[i].label, hRect.x + hRect.w/2, hRect.y + hRect.h/2);

            lastX = hRect.x + hRect.w;
        }
    }

    /**
     *
     * @param ctx
     * @param rect
     * @param sampleBank
     * @param pattern
     * @param currentNote
     * @private
     */
    SampleList.prototype._drawItemList = function(ctx, rect, sampleBank, pattern, currentNote) {
        var sampleCount = sampleBank.length;
        var hRect = { x: rect.x, y: rect.y + this.fonts.header.size + 10, w: rect.w, h: rect.h - (this.fonts.header.size + 10) };
        var lastX = rect.x;
        var labels = ['index', 'name'];
        var activeSamples = this._getCurrentActiveSamples(pattern, currentNote);

        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = this.fonts.item.size + 'px' + ' ' + this.fonts.item.name + ' ';


        // fill the background of the item panel
        ctx.fillStyle = this.colours.sampleFill;
        ctx.fillRect(hRect.x, hRect.y, hRect.w, hRect.h);

        hRect.h = this.fonts.item.size + 10;

        for ( var i = 0; i < sampleCount; i++ ) {
            lastX = rect.x;

            if ( activeSamples.indexOf(i) != -1 ) {
                ctx.fillStyle = this.colours.sampleHighlightFill;
                ctx.fillRect(rect.x, hRect.y, hRect.w, hRect.h);
                ctx.fillStyle = this.colours.sampleHighlightText;
            } else {
                ctx.fillStyle = this.colours.sampleText;
            }

            for ( var j = 0, len = labels.length; j < len; j++ ) {
                hRect.x = lastX;
                hRect.w = rect.w * this.headers[j].width;
                switch ( labels[j] ) {
                    case    'index':
                        ctx.fillText(sampleBank[i][labels[j]].toHex(2, true), hRect.x + 5, hRect.y + hRect.h/2);
                        break;

                    default:
                        ctx.fillText(sampleBank[i][labels[j]], hRect.x + 5, hRect.y + hRect.h/2);
                }
                lastX = hRect.x + hRect.w;
            }
            hRect.y += hRect.h;
            hRect.w = rect.w;
        }
    }

    /**
     *
     * @param pattern
     * @param currentNote
     * @returns {Array}
     * @private
     */
    SampleList.prototype._getCurrentActiveSamples = function(pattern, currentNote) {
        var samples = [];
        if ( pattern ) {
            var note;
            var trackCount = pattern.getTrackCount();

            for ( var i = 0; i < trackCount; i++ ) {
                note = pattern.getNote(i, currentNote);
                if ( note ) {
                    samples.push(note.sampleID);
                }
            }
        }

        return samples;
    }

    return SampleList;
})