const SINGLE_QUOTE_CHAR      =  39; // `''
const DOUBLE_QUOTE_CHAR      =  34; // `"'
const BACKSLASH_CHAR         =  92; // `\'
const SLASH_CHAR             =  47; // `/'
const NEWLINE_CHAR           =  10; // `\n'
const SPACE_CHAR             =  32; // ` '
const FEED_CHAR              =  12; // `\f'
const TAB_CHAR               =   9; // `\t'
const CR_CHAR                =  13; // `\r'
const OPEN_PARENTHESES_CHAR  =  40; // `('
const CLOSE_PARENTHESES_CHAR =  41; // `)'
const OPEN_CURLY_CHAR        = 123; // `{'
const CLOSE_CURLY_CHAR       = 125; // `}'
const SEMICOLON_CHAR         =  59; // `;'
const ASTERICK_CHAR          =  42; // `*'
const COLON_CHAR             =  58; // `:'
const AT_CHAR                =  64; // `@'
const RE_AT_END              = /[ \n\t\r\{\(\)'"\\;/]/g;
const RE_WORD_END            = /[ \n\t\r\(\)\{\}:;@!'"\\]|\/(?=\*)/g;
const RE_BAD_BRACKET         = /.[\\\/\("'\n]/;

export default function tokenize(input) {
    let tokens = [];
    let css    = input.css.valueOf();

    let code, next, quote, lines, last, content, escape,
        nextLine, nextOffset, escaped, escapePos;

    let length = css.length;
    let offset = -1;
    let line   =  1;
    let pos    =  0;

    let unclosed = function (what, end) {
        if ( input.safe ) {
            css += end;
            next = css.length - 1;
        } else {
            throw input.error('Unclosed ' + what, line, pos  - offset);
        }
    };

    while ( pos < length ) {
        code = css.charCodeAt(pos);

        if ( code === NEWLINE_CHAR ) {
            offset = pos;
            line  += 1;
        }

        switch ( code ) {
            case NEWLINE_CHAR:
            case SPACE_CHAR:
            case TAB_CHAR:
            case CR_CHAR:
            case FEED_CHAR:
                next = pos;
                do {
                    next += 1;
                    code = css.charCodeAt(next);
                    if ( code === NEWLINE_CHAR ) {
                        offset = next;
                        line  += 1;
                    }
                } while ( code === SPACE_CHAR   ||
                          code === NEWLINE_CHAR ||
                          code === TAB_CHAR     ||
                          code === CR_CHAR      ||
                          code === FEED_CHAR );

                tokens.push(['space', css.slice(pos, next)]);
                pos = next - 1;
                break;

            case OPEN_CURLY_CHAR:
                tokens.push(['{', '{', line, pos - offset]);
                break;

            case CLOSE_CURLY_CHAR:
                tokens.push(['}', '}', line, pos - offset]);
                break;

            case COLON_CHAR:
                tokens.push([':', ':', line, pos - offset]);
                break;

            case SEMICOLON_CHAR:
                tokens.push([';', ';', line, pos - offset]);
                break;

            case OPEN_PARENTHESES_CHAR:
                next    = css.indexOf(')', pos + 1);
                content = css.slice(pos, next + 1);

                if ( next === -1 || RE_BAD_BRACKET.test(content) ) {
                    tokens.push(['(', '(', line, pos - offset]);
                } else {
                    tokens.push(['brackets', content,
                        line, pos  - offset,
                        line, next - offset
                    ]);
                    pos = next;
                }

                break;

            case CLOSE_PARENTHESES_CHAR:
                tokens.push([')', ')', line, pos - offset]);
                break;

            case SINGLE_QUOTE_CHAR:
            case DOUBLE_QUOTE_CHAR:
                quote = code === SINGLE_QUOTE_CHAR ? "'" : '"';
                next  = pos;
                do {
                    escaped = false;
                    next    = css.indexOf(quote, next + 1);
                    if ( next === -1 ) unclosed('quote', quote);
                    escapePos = next;
                    while ( css.charCodeAt(escapePos - 1) === BACKSLASH_CHAR ) {
                        escapePos -= 1;
                        escaped = !escaped;
                    }
                } while ( escaped );

                tokens.push(['string', css.slice(pos, next + 1),
                    line, pos  - offset,
                    line, next - offset
                ]);
                pos = next;
                break;

            case AT_CHAR:
                RE_AT_END.lastIndex = pos + 1;
                RE_AT_END.test(css);
                if ( RE_AT_END.lastIndex === 0 ) {
                    next = css.length - 1;
                } else {
                    next = RE_AT_END.lastIndex - 2;
                }
                tokens.push(['at-word', css.slice(pos, next + 1),
                    line, pos  - offset,
                    line, next - offset
                ]);
                pos = next;
                break;

            case BACKSLASH_CHAR:
                next   = pos;
                escape = true;
                while ( css.charCodeAt(next + 1) === BACKSLASH_CHAR ) {
                    next  += 1;
                    escape = !escape;
                }
                code = css.charCodeAt(next + 1);
                if ( escape && (code !== SLASH_CHAR   &&
                                code !== SPACE_CHAR   &&
                                code !== NEWLINE_CHAR &&
                                code !== TAB_CHAR     &&
                                code !== CR_CHAR      &&
                                code !== FEED_CHAR ) ) {
                    next += 1;
                }
                tokens.push(['word', css.slice(pos, next + 1),
                    line, pos  - offset,
                    line, next - offset
                ]);
                pos = next;
                break;

            default:
                if ( code === SLASH_CHAR &&
                     css.charCodeAt(pos + 1) === ASTERICK_CHAR ) {
                    next = css.indexOf('*/', pos + 2) + 1;
                    if ( next === 0 ) unclosed('comment', '*/');

                    content = css.slice(pos, next + 1);
                    lines   = content.split('\n');
                    last    = lines.length - 1;

                    if ( last > 0 ) {
                        nextLine   = line + last;
                        nextOffset = next - lines[last].length;
                    } else {
                        nextLine   = line;
                        nextOffset = offset;
                    }

                    tokens.push(['comment', content,
                        line,     pos  - offset,
                        nextLine, next - nextOffset
                    ]);

                    offset = nextOffset;
                    line   = nextLine;
                    pos    = next;

                } else {
                    RE_WORD_END.lastIndex = pos + 1;
                    RE_WORD_END.test(css);
                    if ( RE_WORD_END.lastIndex === 0 ) {
                        next = css.length - 1;
                    } else {
                        next = RE_WORD_END.lastIndex - 2;
                    }

                    tokens.push(['word', css.slice(pos, next + 1),
                        line, pos  - offset,
                        line, next - offset
                    ]);
                    pos = next;
                }

                break;
        }

        pos++;
    }

    return tokens;
}
