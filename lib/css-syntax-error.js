var PreviousMap = require('./previous-map');

var path = require('path');

// Error while CSS parsing
class CssSyntaxError extends Error {
    constructor(input, pos, message) {
        this.reason = message;

        var origin = input.origin(pos);

        if ( origin ) {
            for ( var name in origin ) {
                this[name] = origin[name];
            }

            this.generated = {
                line:   pos.line,
                column: pos.column,
                source: input.css
            };
            if ( input.file ) this.generated.file = input.file;
        } else {
            if ( input.file ) this.file = input.file;
            this.line   = pos.line;
            this.column = pos.column;
            this.source = input.css;
        }

        this.message  = this.file ? this.file : '<css input>';
        this.message += ':' + pos.line + ':' + pos.column + ': ' + message;
    }

    // Return source of broken lines
    highlight(color) {
        var num   = this.line - 1;
        var lines = this.source.split('\n');

        var prev   = num > 0 ? lines[num - 1] + '\n' : '';
        var broken = lines[num];
        var next   = num < lines.length - 1 ? '\n' + lines[num + 1] : '';

        var mark = '\n';
        for ( var i = 0; i < this.column - 1; i++ ) {
            mark += ' ';
        }

        if ( typeof(color) == 'undefined' && typeof(process) != 'undefined' ) {
            if ( process.stdout && process.env ) {
                color = process.stdout.isTTY &&
                       !process.env.NODE_DISABLE_COLORS;
            }
        }

        if ( color ) {
            mark += "\x1B[1;31m^\x1B[0m";
        } else {
            mark += '^';
        }

        return prev + broken + mark + next;
    }

    toString() {
        var text = this.message;
        if ( this.source ) text += "\n" + this.highlight();
        return text;
    }
}

module.exports = CssSyntaxError;
