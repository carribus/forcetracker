define('ui/visualiser', ['ui/component'], function(Component) {

    console.log('loading visualiser');
    function Visualiser(display, dimensions) {
        Component.call(this, display, dimensions);
        this.analyser = null;
        this.colours = {
            border: 'rgb(32, 32, 32)',
            fill: 'rgb(16, 16, 16)',
            graph: 'white'
        }
        this.frequencyData = null;
    }
    Visualiser.prototype = Object.create(Component.prototype);
    Visualiser.prototype.constructor = Visualiser;

    Visualiser.prototype.setAnalyserNode = function(analyser) {
        this.analyser = analyser;
    }

    Visualiser.prototype.render = function() {
        this.rect= this.calcRect();

        this.display.context.save();

        this._drawFrame();
        this._drawGraph();

        this.display.context.restore();
    }

    Visualiser.prototype._drawFrame = function() {
        var ctx = this.display.context;

        ctx.strokeStyle = this.colours.border;
        ctx.fillStyle = this.colours.fill;
        ctx.fillRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
        ctx.strokeRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
    }

    Visualiser.prototype._drawGraph = function() {
        if ( !this.frequencyData ) {
            this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        }

        var segmentLength = this.rect.w / this.frequencyData.length;
        var ctx = this.display.context;
        var scale = this.rect.h / 255;

        this.analyser.getByteFrequencyData(this.frequencyData);

        ctx.strokeStyle = this.colours.graph;
        ctx.beginPath();
        ctx.moveTo(this.rect.x, this.rect.y + this.rect.h - this.frequencyData[0]*scale);
        for ( var i = 1; i < this.frequencyData.length; i++ ) {
            ctx.lineTo(this.rect.x + segmentLength*i, this.rect.y + this.rect.h - this.frequencyData[i]*scale);
//            console.log(this.frequencyData[i]);
        }
        ctx.stroke();
    }

    return Visualiser;
})