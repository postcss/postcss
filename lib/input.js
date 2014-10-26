var CssSyntaxError = require('./css-syntax-error');
var PreviousMap    = require('./previous-map');

var path = require('path');

var sequence = 0;

class Input {
    constructor(css, opts = { }) {
        this.css  = css.toString();
        this.opts = opts;

        sequence += 1;
        this.id   = '<input css ' + sequence + '>';

        this.safe = !!this.opts.safe;

        if ( this.opts.map == 'inline' ) {
            this.opts.map = { inline: true };
        }
        if ( this.opts.from ) {
            this.file = path.resolve(this.opts.from);
        }

        var map = new PreviousMap(this.css, this.opts, this.id);
        if ( map.text ) {
            this.map = map;
            var mapObj = map.consumer();
            if ( !this.file && mapObj.file ) {
                this.file = path.resolve(mapObj.sourceRoot || '.', mapObj.file);
            }
        }

        this.from = this.file ? this.file : this.id;
        if ( this.map ) this.map.file = this.from;
    }

    error(message, pos) {
        throw new CssSyntaxError(this, pos, message);
    }
}

module.exports = Input;
