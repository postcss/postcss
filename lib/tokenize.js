var spaces = { };
' \t\n\r\f'.split('').forEach(i => spaces[i] = 1);

class Tokenizer {
    constructor(input) {
        this.input  = input;
        this.tokens = [];

        this.pos    = -1;
        this.line   = 1;
        this.column = 0;

        this.next   = this.input.css[0];
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
            if ( this.input.safe ) {
                content += quote;
            } else {
                this.input.error('Unclosed quote', start);
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
            if ( this.input.safe ) {
                content += '*/';
            } else {
                this.input.error('Unclosed comment', start);
            }
        }

        this.tokens.push(['comment', content, start, this.getSource()]);
    }

    brackets() {
        var start   = this.getSource();
        var content = '(';
        while ( true ) {
            if ( !this.move() ) this.input.error('Unclosed bracket', start);
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
        if ( this.pos >= this.input.css.length ) return false;

        this.letter = this.next;
        this.next   = this.input.css.charAt(this.pos + 1);

        if ( this.input.withSource ) {
            this.column += 1;
            if ( this.letter == "\n" ) {
                this.line  += 1;
                this.column = 0;
            }
        }

        return true;
    }

    getSource() {
        if ( this.input.withSource ) {
            return { line: this.line, column: this.column };
        }
    }
}

module.exports = function (input) {
    var tokenizer = new Tokenizer(input);

    tokenizer.loop();
    return tokenizer.tokens;
};
