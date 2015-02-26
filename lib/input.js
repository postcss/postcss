import CssSyntaxError from './css-syntax-error';
import PreviousMap    from './previous-map';
import Parser         from './parser';

import path from 'path';

var sequence = 0;

export default class Input {
    constructor(css, opts = { }) {
        this.css = css.toString();

        if ( this.css[0] == '\uFEFF' || this.css[0] == '\uFFFE' ) {
            this.css = this.css.slice(1);
        }

        this.safe = !!opts.safe;

        if ( opts.from ) this.file = path.resolve(opts.from);

        var map = new PreviousMap(this.css, opts, this.id);
        if ( map.text ) {
            this.map = map;
            var file = map.consumer().file;
            if ( !this.file && file ) this.file = this.mapResolve(file);
        }

        if ( this.file ) {
            this.from = this.file;
        } else {
            sequence += 1;
            this.id   = '<input css ' + sequence + '>';
            this.from = this.id;
        }
        if ( this.map ) this.map.file = this.from;
    }

    error(message, line, column) {
        var error = new CssSyntaxError(message);

        var origin = this.origin(line, column);
        if ( origin ) {
            error = new CssSyntaxError(message, origin.line, origin.column,
                origin.source, origin.file);

            error.generated = {
                line:   line,
                column: column,
                source: this.css
            };
            if ( this.file ) error.generated.file = this.file;
        } else {
            error = new CssSyntaxError(message, line, column,
                this.css, this.file);
        }

        return error;
    }

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

    mapResolve(file) {
        return path.resolve(this.map.consumer().sourceRoot || '.', file);
    }
}
