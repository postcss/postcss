var CssSyntaxError = require('./css-syntax-error');

var spaces = { };
(
    ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005' +
    '\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000' +
    String.fromCharCode(65279)
).split('').forEach(i => spaces[i] = 1);

class Tokenizer {
    constructor(source, opts = { }, prevMap = false) {
        this.opts    = opts;
        this.source  = source;
        this.prevMap = prevMap;
        this.tokens  = [];

        this.pos    = -1;
        this.line   = 1;
        this.column = 0;

        this.next   = this.source[0];
        this.letter = undefined;
    }

    loop() {
        while ( this.move() ) {
            switch ( this.letter ) {
                case '"':
                case "'":
                    this.string();
                    break;

                case '/':
                    if ( this.next === "*") {
                        this.comment();
                    } else {
                        this.word();
                    }
                    break;

                case '(':
                    this.brackets();
                    break;

                case '@':
                    this.atWord();
                    break;

                case '{':
                case '}':
                case ':':
                case ';':
                    this.char();
                    break;

                default:
                    if ( spaces[this.letter] ) {
                        this.space();
                    } else {
                        this.word();
                    }
                    break;
            }
        }
    }

    string() {
        var start   = this.getSource();
        var quote   = this.letter;
        var escape  = false;
        var content = this.letter;
        while ( this.move() ) {
            content += this.letter;
            if ( escape ) {
                escape = false;
            } else if ( this.letter == '\\' ) {
                escape = true;
            } else if ( this.letter == quote ) {
                quote = false;
                break;
            }
        }

        if ( quote ) {
            if ( this.opts.safe ) {
                content += quote;
            } else {
                this.error('Unclosed quote', start);
            }
        }

        this.tokens.push(['string', content, start, this.getSource()]);
    }

    comment() {
        var ended   = false;
        var start   = this.getSource();
        var content = this.letter + this.next;

        this.move();
        while ( this.move() ) {
            content += this.letter;
            if ( this.letter == '*' && this.next == '/' ) {
                this.move();
                content += this.letter;

                ended = true;
                break;
            }
        }

        if ( !ended ) {
            if ( this.opts.safe ) {
                content += '*/';
            } else {
                this.error('Unclosed comment', start);
            }
        }

        this.tokens.push(['comment', content, start, this.getSource()]);
    }

    brackets() {
        var start   = this.getSource();
        var content = '(';
        while ( true ) {
            if ( !this.move() ) this.error('Unclosed bracket', start);
            content += this.letter;
            if ( this.letter == ')' ) break;
        }

        this.tokens.push(['brackets', content, start, this.getSource()]);
    }

    atWord() {
        var start   = this.getSource();
        var content = '';

        while ( true ) {
            content += this.letter;
            if ( spaces[this.next] ) break;
            if ( this.next == '{' ) break;
            if ( this.next == '/' ) break;
            if ( this.next == '"' ) break;
            if ( this.next == "'" ) break;
            if ( !this.move() ) break;
        }

        this.tokens.push(['at-word', content, start]);
    }

    char() {
        this.tokens.push([this.letter, this.letter, this.getSource()]);
    }

    space() {
        var content = '';

        while ( true ) {
            content += this.letter;
            if ( !spaces[this.next] ) break;
            if ( !this.move() ) break;
        }

        this.tokens.push(['space', content]);
    }

    word() {
        var start  = this.getSource();
        var end    = start;
        var place  = this.tokens.length;
        var string = '';

        while ( true ) {
            string += this.letter;

            if ( this.next == '!' ) break;
            if ( !this.move() )     break;

            var finish;
            switch ( this.letter ) {
                case '"':
                case "'":
                    this.string();
                    finish = true;
                    break;

                case '/':
                    if ( this.next === "*" ) {
                        this.comment();
                        finish = true;
                    }
                    break;

                case '(':
                    this.brackets();
                    finish = true;
                    break;

                case '@':
                    this.atWord();
                    finish = true;
                    break;

                case '{':
                case '}':
                case ':':
                case ';':
                    this.char();
                    finish = true;
                    break;

                default:
                    if ( spaces[this.letter] ) {
                        this.space();
                        finish = true;
                    }
                    break;
            }

            if ( finish ) break;
            end = this.getSource();
        }

        this.tokens.splice(place, 0, ['word', string, start, end]);
    }

    move() {
        this.pos += 1;
        if ( this.pos >= this.source.length ) return false;

        this.column += 1;
        this.letter  = this.next;
        this.next    = this.source[this.pos + 1];

        if ( this.letter == "\n" ) {
            this.line  += 1;
            this.column = 0;
        }

        return true;
    }

    getSource() {
        return { line: this.line, column: this.column };
    }

    error(message, pos) {
        var from = this.prevMap || this.opts.from;
        throw new CssSyntaxError(message, this.source, pos, from);
    }
}

module.exports = function (source, opts) {
    var tokenizer = new Tokenizer(source, opts);
    tokenizer.loop();
    return tokenizer.tokens;
};
