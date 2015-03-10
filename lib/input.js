import CssSyntaxError from './css-syntax-error';
import PreviousMap    from './previous-map';

import path from 'path';

let sequence = 0;

export default class Input {
    constructor(css, opts = { }) {
        this.css = css.toString();

        if ( this.css[0] === '\uFEFF' || this.css[0] === '\uFFFE' ) {
            this.css = this.css.slice(1);
        }

        this.safe = !!opts.safe;

        if ( opts.from ) this.file = path.resolve(opts.from);

        let map = new PreviousMap(this.css, opts, this.id);
        if ( map.text ) {
            this.map = map;
            let file = map.consumer().file;
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

    error(message, line, column, opts = { }) {
        let error = new CssSyntaxError(message);

        let origin = this.origin(line, column);
        if ( origin ) {
            error = new CssSyntaxError(message, origin.line, origin.column,
                origin.source, origin.file, opts.plugin);
        } else {
            error = new CssSyntaxError(message, line, column,
                this.css, this.file, opts.plugin);
        }

        error.generated = {
            line:   line,
            column: column,
            source: this.css
        };
        if ( this.file ) error.generated.file = this.file;

        return error;
    }

    origin(line, column) {
        if ( !this.map ) return false;
        let consumer = this.map.consumer();

        let from = consumer.originalPositionFor({ line, column });
        if ( !from.source ) return false;

        let result = {
            file:   this.mapResolve(from.source),
            line:   from.line,
            column: from.column
        };

        let source = consumer.sourceContentFor(result.file);
        if ( source ) result.source = source;

        return result;
    }

    mapResolve(file) {
        return path.resolve(this.map.consumer().sourceRoot || '.', file);
    }
}
