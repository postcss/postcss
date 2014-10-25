var PreviousMap = require('./previous-map');

// Error while CSS parsing
class CssSyntaxError extends Error {
    constructor(text, source, pos, file) {
        this.reason = text;

        if ( file instanceof PreviousMap ) {
            var map    = file.consumer();
            var origin = map.originalPositionFor(pos);

            this.file   = origin.source;
            this.line   = origin.line;
            this.column = origin.column;
            this.source = map.sourceContentFor(origin.source);

            this.generated = {
                line:   pos.line,
                column: pos.column,
                source: source
            };
            if ( file ) this.generated.file = file.file;
        } else {
            if ( file ) this.file = file;
            this.line   = pos.line;
            this.column = pos.column;
            this.source = source;
        }

        this.message  = file ? file : '<css input>';
        this.message += ':' + pos.line + ':' + pos.column + ': ' + text;
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

    toString() {
        var text = this.message;
        if ( this.source ) text += "\n" + this.highlight();
        return text;
    }
}

module.exports = CssSyntaxError;
