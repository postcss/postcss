// Error while CSS parsing
class CssSyntaxError extends Error {
    constructor(text, source, pos, file) {
        this.file     = file;
        this.line     = pos.line;
        this.column   = pos.column;
        this.source   = source;
        this.message  = "Can't parse CSS: " + text;
        this.message += ' at line ' + pos.line + ':' + pos.column;
        if ( file ) this.message += ' in ' + file;
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
            color = process.stdout.isTTY && !process.env.NODE_DISABLE_COLORS;
        }

        if ( color ) {
            mark += "\x1B[1;31m^\x1B[0m";
        } else {
            mark += '^';
        }

        return prev + broken + mark + next;
    }

    toString() {
        return this.message + "\n" + this.highlight();
    }
}

module.exports = CssSyntaxError;
