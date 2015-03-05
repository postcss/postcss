import PreviousMap from './previous-map';

export default class CssSyntaxError extends SyntaxError {
    constructor(message, line, column, source, file, plugin) {
        this.reason = message;

        this.message  = plugin ? plugin + ':' : '';
        this.message += file ? file : '<css input>';
        if ( typeof(line) != 'undefined' && typeof(column) != 'undefined' ) {
            this.line   = line;
            this.column = column;
            this.message += ':' + line + ':' + column + ': ' + message;
        } else {
            this.message += ': ' + message;
        }

        if ( file )   this.file   = file;
        if ( source ) this.source = source;
        if ( plugin ) this.plugin = plugin;

        if ( Error.captureStackTrace ) {
            Error.captureStackTrace(this, CssSyntaxError);
        }
    }

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

    setMozillaProps() {
        var sample = Error.call(this, message);
        if ( sample.columnNumber ) this.columnNumber = this.column;
        if ( sample.description )  this.description  = this.message;
        if ( sample.lineNumber )   this.lineNumber   = this.line;
        if ( sample.fileName )     this.fileName     = this.file;
    }

    toString() {
        var text = this.message;
        if ( this.source ) text += "\n" + this.highlight();
        return this.name + ': ' + text;
    }
}

CssSyntaxError.prototype.name = 'CssSyntaxError';
