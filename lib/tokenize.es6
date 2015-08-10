const SINGLE_QUOTE      =  39; // `''
const DOUBLE_QUOTE      =  34; // `"'
const BACKSLASH         =  92; // `\'
const SLASH             =  47; // `/'
const NEWLINE           =  10; // `\n'
const SPACE             =  32; // ` '
const FEED              =  12; // `\f'
const TAB               =   9; // `\t'
const CR                =  13; // `\r'
const OPEN_PARENTHESES  =  40; // `('
const CLOSE_PARENTHESES =  41; // `)'
const OPEN_CURLY        = 123; // `{'
const CLOSE_CURLY       = 125; // `}'
const SEMICOLON         =  59; // `;'
const ASTERICK          =  42; // `*'
const COLON             =  58; // `:'
const AT                =  64; // `@'
const RE_AT_END         = /[ \n\t\r\{\(\)'"\\;/]/g;
const RE_WORD_END       = /[ \n\t\r\(\)\{\}:;@!'"\\]|\/(?=\*)/g;
const RE_BAD_BRACKET    = /.[\\\/\("'\n]/;

export default function tokenize(input) {
    let tokens = [];
    let css    = input.css.valueOf();

    let code, next, quote, lines, last, content, escape,
        nextLine, nextOffset, escaped, escapePos, prev, n;

    let length = css.length;
    let offset = -1;
    let line   =  1;
    let pos    =  0;

    function unclosed(what) {
        throw input.error('Unclosed ' + what, line, pos - offset);
    }

    while ( pos < length ) {
        code = css.charCodeAt(pos);

        if ( code === NEWLINE ) {
            offset = pos;
            line  += 1;
        }

        switch ( code ) {
        case NEWLINE:
        case SPACE:
        case TAB:
        case CR:
        case FEED:
            next = pos;
            do {
                next += 1;
                code = css.charCodeAt(next);
                if ( code === NEWLINE ) {
                    offset = next;
                    line  += 1;
                }
            } while ( code === SPACE   ||
                      code === NEWLINE ||
                      code === TAB     ||
                      code === CR      ||
                      code === FEED );

            tokens.push(['space', css.slice(pos, next)]);
            pos = next - 1;
            break;

        case OPEN_CURLY:
            tokens.push(['{', '{', line, pos - offset]);
            break;

        case CLOSE_CURLY:
            tokens.push(['}', '}', line, pos - offset]);
            break;

        case COLON:
            tokens.push([':', ':', line, pos - offset]);
            break;

        case SEMICOLON:
            tokens.push([';', ';', line, pos - offset]);
            break;

        case OPEN_PARENTHESES:
            prev = tokens.length ? tokens[tokens.length - 1][1] : '';
            n    = css.charCodeAt(pos + 1);
            if ( prev === 'url' && n !== SINGLE_QUOTE && n !== DOUBLE_QUOTE ) {
                next = pos;
                do {
                    escaped = false;
                    next    = css.indexOf(')', next + 1);
                    if ( next === -1 ) unclosed('bracket');
                    escapePos = next;
                    while ( css.charCodeAt(escapePos - 1) === BACKSLASH ) {
                        escapePos -= 1;
                        escaped = !escaped;
                    }
                } while ( escaped );

                tokens.push(['brackets', css.slice(pos, next + 1),
                    line, pos  - offset,
                    line, next - offset
                ]);
                pos = next;

            } else {
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
            }

            break;

        case CLOSE_PARENTHESES:
            tokens.push([')', ')', line, pos - offset]);
            break;

        case SINGLE_QUOTE:
        case DOUBLE_QUOTE:
            quote = code === SINGLE_QUOTE ? '\'' : '"';
            next  = pos;
            do {
                escaped = false;
                next    = css.indexOf(quote, next + 1);
                if ( next === -1 ) unclosed('quote');
                escapePos = next;
                while ( css.charCodeAt(escapePos - 1) === BACKSLASH ) {
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

        case AT:
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

        case BACKSLASH:
            next   = pos;
            escape = true;
            while ( css.charCodeAt(next + 1) === BACKSLASH ) {
                next  += 1;
                escape = !escape;
            }
            code = css.charCodeAt(next + 1);
            if ( escape && (code !== SLASH   &&
                            code !== SPACE   &&
                            code !== NEWLINE &&
                            code !== TAB     &&
                            code !== CR      &&
                            code !== FEED ) ) {
                next += 1;
            }
            tokens.push(['word', css.slice(pos, next + 1),
                line, pos  - offset,
                line, next - offset
            ]);
            pos = next;
            break;

        default:
            if ( code === SLASH && css.charCodeAt(pos + 1) === ASTERICK ) {
                next = css.indexOf('*/', pos + 2) + 1;
                if ( next === 0 ) unclosed('comment');

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
