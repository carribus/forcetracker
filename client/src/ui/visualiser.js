import { Component } from "./component.js";

export class Visualiser extends Component {
    constructor(display, dimensions) {
        super(display, dimensions);
        this.analyser = null;
        this.colours = {
            border: 'rgb(32, 32, 32)',
            fill: 'rgb(16, 16, 16)',
            graph: 'white'
        }
        this.frequencyData = null;
    }

    setAnalyserNode(analyser) {
        this.analyser = analyser;
    }

    render() {
        this.rect= this.calcRect();

        this.display.context.save();

        this._drawFrame();
        this._drawGraph();

        this.display.context.restore();
    }

    _drawFrame() {
        let ctx = this.display.context;

        ctx.strokeStyle = this.colours.border;
        ctx.fillStyle = this.colours.fill;
        ctx.fillRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
        ctx.strokeRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
    }

    _drawGraph() {
        if ( !this.frequencyData ) {
            this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        }

        let segmentLength = this.rect.w / this.frequencyData.length;
        let ctx = this.display.context;
        let scale = this.rect.h / 255;

        this.analyser.getByteFrequencyData(this.frequencyData);

        ctx.strokeStyle = this.colours.graph;
        ctx.beginPath();
        ctx.moveTo(this.rect.x, this.rect.y + this.rect.h - this.frequencyData[0]*scale);
        for ( let i = 1; i < this.frequencyData.length; i++ ) {
            ctx.lineTo(this.rect.x + segmentLength*i, this.rect.y + this.rect.h - this.frequencyData[i]*scale);
        }
        ctx.stroke();
    }
}