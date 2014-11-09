var singleQuoteCode = "'".charCodeAt(0),
    doubleQuoteCode = '"'.charCodeAt(0),
    openParenCode   = '('.charCodeAt(0),
    slashCode       = '/'.charCodeAt(0),
    spaceCode       = ' '.charCodeAt(0),
    tabCode         = '\t'.charCodeAt(0),
    crCode          = '\r'.charCodeAt(0),
    lfCode          = '\n'.charCodeAt(0),
    openCurlyCode   = '{'.charCodeAt(0),
    closeCurlyCode  = '}'.charCodeAt(0),
    colonCode       = ':'.charCodeAt(0),
    semicolonCode   = ';'.charCodeAt(0),
    atCode          = '@'.charCodeAt(0),
    atEndRegexp     = /[ \n\t\r\{'"/]/g,
    wordEndRegexp   = /[ \n\t\r\(\{\}:;@!'"]|\/\*/g;


class Tokenizer {
    constructor(input) {
        this.input  = input;
        this.tokens = [];
    }

    loop() {
        var tokens      = [],
            css         = this.input.css.valueOf(),
            lineOffset  = 0,
            line        = 1,
            nextPos;

        for (var code, pos=0; (code = css.charCodeAt(pos)); pos++) {

            switch(code) {
                case lfCode:
                    lineOffset = pos;
                    line += 1;
                case spaceCode:
                case tabCode:
                case crCode:
                    var nextCode;
                    nextPos = pos;
                    do {
                        nextPos += 1;
                        nextCode = css.charCodeAt(nextPos);
                    } while ((nextCode == spaceCode) ||
                             (nextCode == lfCode) ||
                             (nextCode == tabCode) ||
                             (nextCode == crCode))

                    tokens.push(['space', css.slice(pos, nextPos)]);
                    pos = nextPos - 1;
                    break;

                case openCurlyCode:
                    tokens.push(['{', '{', line, pos - lineOffset]);
                    break;

                case closeCurlyCode:
                    tokens.push(['}', '}', line, pos - lineOffset]);
                    break;

                case colonCode:
                    tokens.push([':', ':', line, pos - lineOffset]);
                    break;

                case semicolonCode:
                    tokens.push([';', ';', line, pos - lineOffset]);
                    break;

                case singleQuoteCode:
                    var escapePos=0, escaped=false;
                    nextPos = pos;

                    do {
                            escaped = false;
                            nextPos = css.indexOf("'", nextPos+1);
                            if (nextPos == -1) { throw 'bad quote' };
                            escapePos = nextPos;
                            while (css.charAt(escapePos - 1) == '\\') {
                                escapePos -= 1;
                                escaped = !escaped;
                            }
                    } while (escaped)

                    tokens.push(['string', css.slice(pos, nextPos+1), line, pos-lineOffset, nextPos-lineOffset]);
                    pos = nextPos;
                    break;

                case doubleQuoteCode:
                    var escapePos=0, escaped=false;
                    nextPos = pos;

                    do {
                            escaped = false;
                            nextPos = css.indexOf('"', nextPos+1);
                            if (nextPos == -1) { throw 'bad quote' };
                            escapePos = nextPos;
                            while (css.charAt(escapePos - 1) == '\\') {
                                escapePos -= 1;
                                escaped = !escaped;
                            }
                    } while (escaped)

                    tokens.push(['string', css.slice(pos, nextPos+1), line, pos-lineOffset, nextPos-lineOffset]);
                    pos = nextPos;
                    break;

                case openParenCode:
                    var escapePos=0, escaped=false;
                    nextPos = pos;

                    do {
                            escaped = false;
                            nextPos = css.indexOf(')', nextPos+1);
                            if (nextPos == -1) { throw 'bad parens' };
                            escapePos = nextPos;
                            while (css.charAt(escapePos - 1) == '\\') {
                                escapePos -= 1;
                                escaped = !escaped;
                            }
                    } while (escaped)

                    var content = css.slice(pos, nextPos+1),
                        lines = content.split('\n'),
                        extraLines = lines.length - 1,
                        token = ['brackets', content, line, pos-lineOffset];

                    if (extraLines > 0) {
                        line += extraLines;
                        lineOffset = lines[extraLines].length;
                    };
                    token.push(line, nextPos - lineOffset);
                    tokens.push(token);
                    pos = nextPos;
                    break;

                case atCode:
                    atEndRegexp.lastIndex = pos + 1;
                    atEndRegexp.test(css);
                    if (atEndRegexp.lastIndex == 0) {
                        throw 'bad at-word';
                    } else {
                        nextPos = atEndRegexp.lastIndex - 2;
                    };
                    tokens.push([
                        'at-word',
                        css.slice(pos, nextPos+1),
                        line,
                        pos-lineOffset,
                        nextPos-lineOffset
                    ]);
                    pos = nextPos;
                    break;

                case slashCode:
                    if (css.charAt(pos+1) === '*') {
                        nextPos = css.indexOf('*/', pos+2) + 1;
                        if (nextPos === 0) { throw 'bad comment' };
                        var content = css.slice(pos, nextPos+1),
                            lines = content.split('\n'),
                            extraLines = lines.length - 1,
                            token = ['comment', content, line, pos-lineOffset];

                        if (extraLines > 0) {
                            line += extraLines;
                            lineOffset = lines[extraLines].length;
                        };
                        token.push(line, nextPos - lineOffset);
                        tokens.push(token);
                        pos = nextPos;
                        break;
                    }

                default:
                    wordEndRegexp.lastIndex = pos + 1;
                    wordEndRegexp.test(css);
                    if (wordEndRegexp.lastIndex == 0) {
                        nextPos = css.length - 1;
                    } else {
                        nextPos = wordEndRegexp.lastIndex - 2;
                    };

                    tokens.push([
                        'word',
                        css.slice(pos, nextPos+1),
                        line,
                        pos-lineOffset,
                        nextPos-lineOffset
                    ])
                    pos = nextPos;
                    break;
            }
        }

        this.tokens = tokens;
    }
}

module.exports = function (input) {
    var tokenizer = new Tokenizer(input);

    tokenizer.loop();
    return tokenizer.tokens;
};

