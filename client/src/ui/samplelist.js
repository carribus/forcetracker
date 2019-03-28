import { Component } from "./component.js";

export class SampleList extends Component {
    /**
     * SampleList UI component
     * @param display
     * @param dimensions
     * @param ui
     * @constructor
     */
    constructor(display, dimensions, ui) {
        super(display, dimensions);
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

    onClick(x, y) {
        let sampleIndex = this.getSampleAt(x, y);

        if ( sampleIndex >= 0 && sampleIndex < this.ui.soundSystem.sampleBank.length ) {
            this.ui.soundSystem.playSample(sampleIndex);
        }
    }

    onKeyDown(e) {

    }

    scroll(xOffset, yOffset) {

    }

    onDrop(e) {
        let validTypes = ['audio/wav'];
        let acceptedFiles = [];
        let files = e.dataTransfer.files;

        this.highlightForDrop = false;
        if ( files.length > 0 ) {
            for ( let i = 0; i < files.length; i++ ) {
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

    getSampleAt(x, y) {
        let itemHeight = this.fonts.item.size + 10;
        let itemIndex = Math.floor( (y - this.fonts.header.size - 10 - this.rect.y) / itemHeight);

        return itemIndex;
    }

    /**
     *
     * @param sampleBank
     * @param pattern
     * @param currentNote
     */
    render(sampleBank, pattern, currentNote) {
        let ctx;

        if ( this.display ) {
            ctx = this.display.context;
            this.rect = this.calcRect();

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
    _drawList(sampleBank, pattern, currentNote) {
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
    _drawFrame(ctx, rect) {
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
    _drawHeader(ctx, rect) {
        let hRect = { x: rect.x, y: rect.y, w: rect.w, h: rect.h };
        let lastX = rect.x;

        hRect.h = this.fonts.header.size + 10;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = this.fonts.header.size + 'px' + ' ' + this.fonts.header.name + ' ';

        for ( let i = 0, len = this.headers.length; i < len; i++ ) {
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
    _drawItemList(ctx, rect, sampleBank, pattern, currentNote) {
        let sampleCount = sampleBank.length;
        let hRect = { x: rect.x, y: rect.y + this.fonts.header.size + 10, w: rect.w, h: rect.h - (this.fonts.header.size + 10) };
        let lastX = rect.x;
        let labels = ['index', 'name'];
        let activeSamples = this._getCurrentActiveSamples(pattern, currentNote);

        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = this.fonts.item.size + 'px' + ' ' + this.fonts.item.name + ' ';


        // fill the background of the item panel
        ctx.fillStyle = this.colours.sampleFill;
        ctx.fillRect(hRect.x, hRect.y, hRect.w, hRect.h);

        hRect.h = this.fonts.item.size + 10;

        for ( let i = 0; i < sampleCount; i++ ) {
            lastX = rect.x;

            if ( activeSamples.indexOf(i) != -1 ) {
                ctx.fillStyle = this.colours.sampleHighlightFill;
                ctx.fillRect(rect.x, hRect.y, hRect.w, hRect.h);
                ctx.fillStyle = this.colours.sampleHighlightText;
            } else {
                ctx.fillStyle = this.colours.sampleText;
            }

            for ( let j = 0, len = labels.length; j < len; j++ ) {
                hRect.x = lastX;
                hRect.w = rect.w * this.headers[j].width;
                if (sampleBank[i] && sampleBank[i][labels[j]] !== undefined) {
                    switch ( labels[j] ) {
                        case    'index':
                            ctx.fillText(sampleBank[i][labels[j]].toHex(2, true), hRect.x + 5, hRect.y + hRect.h / 2);
                            break;

                        default:
                            ctx.fillText(sampleBank[i][labels[j]], hRect.x + 5, hRect.y + hRect.h/2);
                    }
                } else {
                    console.warn(`i = ${i}, j = ${j}`)
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
    _getCurrentActiveSamples(pattern, currentNote) {
        let samples = [];
        if ( pattern ) {
            let note;
            let trackCount = pattern.getTrackCount();

            for ( let i = 0; i < trackCount; i++ ) {
                note = pattern.getNote(i, currentNote);
                if ( note ) {
                    samples.push(note.sampleID);
                }
            }
        }

        return samples;
    }
}