var CssSyntaxError = require('./css-syntax-error');
var PreviousMap    = require('./previous-map');
var Parser         = require('./parser');

var path = require('path');

var sequence = 0;

class Input {
    constructor(css, opts = { }) {
        this.css  = css.toString();
        this.opts = opts;

        if ( this.css[0] == '\uFEFF' || this.css[0] == '\uFFFE' ) {
            this.css = this.css.slice(1);
        }

        sequence += 1;
        this.id   = '<input css ' + sequence + '>';

        this.safe = !!this.opts.safe;

        if ( this.opts.from ) {
            this.file = path.resolve(this.opts.from);
        }

        var map = new PreviousMap(this.css, this.opts, this.id);
        if ( map.text ) {
            this.map = map;
            var file = map.consumer().file;
            if ( !this.file && file ) this.file = this.mapResolve(file);
        }

        this.from = this.file ? this.file : this.id;
        if ( this.map ) this.map.file = this.from;
    }

    // Throw syntax error from this input
    error(message, line, column) {
        throw new CssSyntaxError(this, message, line, column);
    }

    // Get origin position of code if source map was given
    origin(line, column) {
        if ( !this.map ) return false;
        var consumer = this.map.consumer();

        var from = consumer.originalPositionFor({ line, column });
        if ( !from.source ) return false;

        var result = {
            file:   this.mapResolve(from.source),
            line:   from.line,
            column: from.column
        };

        var source = consumer.sourceContentFor(result.file);
        if ( source ) result.source = source;

        return result;
    }

    // Return path relative from source map root
    mapResolve(file) {
        return path.resolve(this.map.consumer().sourceRoot || '.', file);
    }
}

module.exports = Input;
