import warnOnce from './warn-once';

export default class CssSyntaxError extends SyntaxError {

    constructor(message, line, column, source, file, plugin) {
        super(message);
        this.reason = message;

        if ( file )   this.file   = file;
        if ( source ) this.source = source;
        if ( plugin ) this.plugin = plugin;
        if ( typeof line !== 'undefined' && typeof column !== 'undefined' ) {
            this.line   = line;
            this.column = column;
        }

        this.setMessage();

        if ( Error.captureStackTrace ) {
            Error.captureStackTrace(this, CssSyntaxError);
        }
    }

    setMessage() {
        this.message  = this.plugin ? this.plugin + ': ' : '';
        this.message += this.file ? this.file : '<css input>';
        if ( typeof this.line !== 'undefined' ) {
            this.message += ':' + this.line + ':' + this.column;
        }
        this.message += ': ' + this.reason;
    }

    showSourceCode(color) {
        if ( !this.source ) return '';

        let num   = this.line - 1;
        let lines = this.source.split('\n');

        let prev   = num > 0 ? lines[num - 1] + '\n' : '';
        let broken = lines[num];
        let next   = num < lines.length - 1 ? '\n' + lines[num + 1] : '';

        let mark = '\n';
        for ( let i = 0; i < this.column - 1; i++ ) {
            mark += ' ';
        }

        if ( typeof color === 'undefined' && typeof process !== 'undefined' ) {
            if ( process.stdout && process.env ) {
                color = process.stdout.isTTY &&
                       !process.env.NODE_DISABLE_COLORS;
            }
        }

        if ( color ) {
            mark += '\x1B[1;31m^\x1B[0m';
        } else {
            mark += '^';
        }

        return '\n' + prev + broken + mark + next;
    }

    highlight(color) {
        warnOnce('CssSyntaxError#highlight is deprecated and will be ' +
                 'removed in 5.0. Use error.showSourceCode instead.');
        return this.showSourceCode(color).replace(/^\n/, '');
    }

    setMozillaProps() {
        let sample = Error.call(this, this.message);
        if ( sample.columnNumber ) this.columnNumber = this.column;
        if ( sample.description )  this.description  = this.message;
        if ( sample.lineNumber )   this.lineNumber   = this.line;
        if ( sample.fileName )     this.fileName     = this.file;
    }

    toString() {
        return this.name + ': ' + this.message + this.showSourceCode();
    }

}

CssSyntaxError.prototype.name = 'CssSyntaxError';
