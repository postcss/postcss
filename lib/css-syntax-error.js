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
}

module.exports = CssSyntaxError;
