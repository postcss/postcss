var singleQuote = "'".charCodeAt(0),
    doubleQuote = '"'.charCodeAt(0),
    openParen   = '('.charCodeAt(0),
    asterics    = '*'.charCodeAt(0),
    slash       = '/'.charCodeAt(0),
    space       = ' '.charCodeAt(0),
    tab         = '\t'.charCodeAt(0),
    cr          = '\r'.charCodeAt(0),
    newline     = '\n'.charCodeAt(0),
    openCurly   = '{'.charCodeAt(0),
    closeCurly  = '}'.charCodeAt(0),
    colon       = ':'.charCodeAt(0),
    semicolon   = ';'.charCodeAt(0),
    at          = '@'.charCodeAt(0),
    atEnd       = /[ \n\t\r\{'"/]/g,
    wordEnd     = /[ \n\t\r\(\{\}:;@!'"]|\/\*/g;

module.exports = function (input) {
    var tokens = [];
    var css    = input.css.valueOf();

    var offset  = 0;
    var line    = 1;
    var pos     = 0;

    var code, next, nextCode, quote, lines, extra,
        content, token, escaped, escapePos;

    while ( !Number.isNaN(code = css.charCodeAt(pos)) ) {

        if ( code == newline ) {
            offset = pos;
            line  += 1;
        }

        switch (code) {
            case newline:
            case space:
            case tab:
            case cr:
                next = pos;
                do {
                    next += 1;
                    nextCode = css.charCodeAt(next);
                } while ( nextCode == space   ||
                          nextCode == newline ||
                          nextCode == tab     ||
                          nextCode == cr );

                tokens.push(['space', css.slice(pos, next)]);
                pos = next - 1;
                break;

            case openCurly:
                tokens.push(['{', '{', line, pos - offset]);
                break;

            case closeCurly:
                tokens.push(['}', '}', line, pos - offset]);
                break;

            case colon:
                tokens.push([':', ':', line, pos - offset]);
                break;

            case semicolon:
                tokens.push([';', ';', line, pos - offset]);
                break;

            case singleQuote:
            case doubleQuote:
                next = pos;

                if ( code == singleQuote ) {
                    quote = "'";
                } else {
                    quote = '"';
                }

                do {
                        escaped = false;
                        next = css.indexOf(quote, next + 1);
                        if ( next == -1 ) throw 'bad quote';
                        escapePos = next;
                        while ( css.charAt(escapePos - 1) == '\\' ) {
                            escapePos -= 1;
                            escaped = !escaped;
                        }
                } while ( escaped );

                tokens.push([
                    'string',
                    css.slice(pos, next + 1),
                    line,
                    pos  - offset,
                    next - offset
                ]);
                pos = next;
                break;

            case openParen:
                next = pos;

                do {
                        escaped = false;
                        next = css.indexOf(')', next + 1);
                        if ( next == -1 ) throw 'bad parens';
                        escapePos = next;
                        while ( css.charAt(escapePos - 1) == '\\' ) {
                            escapePos -= 1;
                            escaped = !escaped;
                        }
                } while (escaped);

                content = css.slice(pos, next + 1);
                lines   = content.split('\n');
                extra   = lines.length - 1;
                token   = ['brackets', content, line, pos - offset];

                if ( extra > 0 ) {
                    line  += extra;
                    offset = lines[extra].length;
                }
                token.push(line, next - offset);
                tokens.push(token);
                pos = next;
                break;

            case at:
                atEnd.lastIndex = pos + 1;
                atEnd.test(css);
                if ( atEnd.lastIndex === 0 ) {
                    throw 'bad at-word';
                } else {
                    next = atEnd.lastIndex - 2;
                }
                tokens.push([
                    'at-word',
                    css.slice(pos, next + 1),
                    line,
                    pos  - offset,
                    next - offset
                ]);
                pos = next;
                break;

            default:
                if ( code == slash && css.charCodeAt(pos + 1) == asterics ) {
                    next = css.indexOf('*/', pos+2) + 1;
                    if ( next === 0 ) throw 'bad comment';

                    content = css.slice(pos, next + 1);
                    lines   = content.split('\n');
                    extra   = lines.length - 1;
                    token   = ['comment', content, line, pos - offset];

                    if ( extra > 0 ) {
                        line  += extra;
                        offset = lines[extra].length;
                    }

                    token.push(line, next - offset);
                    tokens.push(token);
                    pos = next;
                    break;
                }

                wordEnd.lastIndex = pos + 1;
                wordEnd.test(css);
                if ( wordEnd.lastIndex === 0 ) {
                    next = css.length - 1;
                } else {
                    next = wordEnd.lastIndex - 2;
                }

                tokens.push([
                    'word',
                    css.slice(pos, next + 1),
                    line,
                    pos  - offset,
                    next - offset
                ]);
                pos = next;
                break;
        }

        pos++;
    }

    return tokens;
};
