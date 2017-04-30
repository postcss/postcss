/* eslint no-bitwise: 0 */

import { CssSyntaxError } from './tokenizer-errors';
import {
    SYMBOL_CATEGORY,
    IS_PUNCTUATION,
    TokenType,
    TokenName
} from './token';

let SYMBOL_CATEGORY_LENGTH = SYMBOL_CATEGORY.length;
import { isHex, cmpStr } from './tokenizer-utils';

let NULL = 0;
let WHITESPACE = TokenType.Whitespace;
let IDENTIFIER = TokenType.Identifier;
let NUMBER = TokenType.Number;
let STRING = TokenType.String;
let COMMENT = TokenType.Comment;
let PUNCTUATION = TokenType.Punctuation;

let TAB = 9;
let N = 10;
let F = 12;
let R = 13;
let SPACE = 32;
let STAR = 42;
let SLASH = 47;
let BACK_SLASH = 92;
let FULLSTOP = TokenType.FullStop;
let PLUSSIGN = TokenType.PlusSign;
let HYPHENMINUS = TokenType.HyphenMinus;
let E = 101; // 'e'.charCodeAt(0)

let MIN_BUFFER_SIZE = 16 * 1024;
let OFFSET_MASK = 0x00FFFFFF;
let TYPE_OFFSET = 24;

// fallback on Array when TypedArray is not supported
const typedArrAvailable = typeof Uint32Array !== 'undefined';
let SafeUint32Array = typedArrAvailable ? Uint32Array : Array;

// some browser implementations have no TypedArray#lastIndexOf
let lastIndexOf = Array.prototype.lastIndexOf;

let offsetAndType = new SafeUint32Array(MIN_BUFFER_SIZE);
let lines = null;

function firstCharOffset(source) {
    return source.charCodeAt(0) === 0xFEFF ? 1 : 0;
}

function isNumber(code) {
    return code >= 48 && code <= 57;
}

function computeLines(scanner, source) {
    let sourceLength = source.length;
    let start = firstCharOffset(source);
    let line = scanner.initLine;

    if (lines === null || lines.length < sourceLength + 1) {
        lines = new SafeUint32Array(
            Math.max(sourceLength + 1024, MIN_BUFFER_SIZE)
        );
    }

    let i;
    for (i = start; i < sourceLength; i++) {
        let code = source.charCodeAt(i);

        lines[i] = line;

        if (code === N || code === R || code === F) {
            if (
                code === R && i + 1 < sourceLength &&
                source.charCodeAt(i + 1) === N
            ) {
                i++;
                lines[i] = line;
            }
            line++;
        }
    }

    lines[i] = line;

    return lines;
}

function findLastNonSpaceLocation(scanner) {
    let i;
    for (i = scanner.source.length - 1; i >= 0; i--) {
        let code = scanner.source.charCodeAt(i);

        if (
            code !== SPACE &&
            code !== TAB &&
            code !== R &&
            code !== N &&
            code !== F
        ) {
            break;
        }
    }

    return scanner.getLocation(i + 1);
}

function isNewline(source, offset, code) {
    if (code === N || code === F || code === R) {
        if (
            code === R && offset + 1 < source.length &&
            source.charCodeAt(offset + 1) === N
        ) {
            return 2;
        }

        return 1;
    }

    return 0;
}

function findWhitespaceEnd(source, offset) {
    for (; offset < source.length; offset++) {
        let code = source.charCodeAt(offset);

        if (
            code !== SPACE && code !== TAB &&
            code !== R && code !== N && code !== F
        ) {
            break;
        }
    }

    return offset;
}

function findCommentEnd(source, offset) {
    let commentEnd = source.indexOf('*/', offset);

    if (commentEnd === -1) {
        return source.length;
    }

    return commentEnd + 2;
}

function findStringEnd(source, offset, quote) {
    for (; offset < source.length; offset++) {
        let code = source.charCodeAt(offset);

        // bad string
        if (code === BACK_SLASH) {
            offset++;
        } else if (code === quote) {
            offset++;
            break;
        }
    }

    return offset;
}

function findDecimalNumberEnd(source, offset) {
    for (; offset < source.length; offset++) {
        let code = source.charCodeAt(offset);

        if (code < 48 || code > 57) {  // not a 0 .. 9
            break;
        }
    }

    return offset;
}

function findNumberEnd(source, offset, allowFraction) {
    let code;

    offset = findDecimalNumberEnd(source, offset);

    // fraction: .\d+
    if (
        allowFraction && offset + 1 < source.length &&
        source.charCodeAt(offset) === FULLSTOP
    ) {
        code = source.charCodeAt(offset + 1);

        if (isNumber(code)) {
            offset = findDecimalNumberEnd(source, offset + 1);
        }
    }

    // exponent: e[+-]\d+
    if (offset + 1 < source.length) {
        // case insensitive check for `e`
        if ((source.charCodeAt(offset) | 32) === E) {
            code = source.charCodeAt(offset + 1);

            if (code === PLUSSIGN || code === HYPHENMINUS) {
                if (offset + 2 < source.length) {
                    code = source.charCodeAt(offset + 2);
                }
            }

            if (isNumber(code)) {
                offset = findDecimalNumberEnd(source, offset + 2);
            }
        }
    }

    return offset;
}

// skip escaped unicode sequence that can ends with space
// [0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?
function findEscaseEnd(source, offset) {
    for (let i = 0; i < 7 && offset + i < source.length; i++) {
        let code = source.charCodeAt(offset + i);

        if (i !== 6 && isHex(code)) {
            continue;
        }

        if (i > 0) {
            offset += i - 1 + isNewline(source, offset + i, code);
            if (code === SPACE || code === TAB) {
                offset++;
            }
        }

        break;
    }

    return offset;
}

function findIdentifierEnd(source, offset) {
    for (; offset < source.length; offset++) {
        let code = source.charCodeAt(offset);

        if (code === BACK_SLASH) {
            offset = findEscaseEnd(source, offset + 1);
        } else if (
            code < SYMBOL_CATEGORY_LENGTH &&
            IS_PUNCTUATION[code] === PUNCTUATION
        ) {
            break;
        }
    }

    return offset;
}

function tokenLayout(scanner, source, startPos) {
    let sourceLength = source.length;
    let tokenCount = 0;
    let prevType = 0;
    let offset = startPos;

    if (offsetAndType.length < sourceLength + 1) {
        offsetAndType = new SafeUint32Array(sourceLength + 1024);
    }

    while (offset < sourceLength) {
        let code = source.charCodeAt(offset);
        let lessThanSC = code < SYMBOL_CATEGORY_LENGTH;
        let type = lessThanSC ? SYMBOL_CATEGORY[code] : IDENTIFIER;

        switch (type) {
        case WHITESPACE:
            offset = findWhitespaceEnd(source, offset + 1);
            break;

        case PUNCTUATION:
            if (code === STAR && prevType === SLASH) { // /*
                type = COMMENT;
                offset = findCommentEnd(source, offset + 1);
                tokenCount--; // rewrite prev token
            } else {
                    // edge case for -.123 and +.123
                if (
                    code === FULLSTOP &&
                    (prevType === PLUSSIGN || prevType === HYPHENMINUS)
                ) {
                    if (
                        offset + 1 < sourceLength &&
                        isNumber(source.charCodeAt(offset + 1))
                    ) {
                        type = NUMBER;
                        offset = findNumberEnd(source, offset + 2, false);
                        tokenCount--;
                        break;
                    }
                }

                type = code;
                offset += 1;
            }

            break;

        case NUMBER:
            offset = findNumberEnd(source, offset + 1, prevType !== FULLSTOP);
            if (prevType === FULLSTOP ||
                    prevType === HYPHENMINUS ||
                    prevType === PLUSSIGN) {
                tokenCount--; // rewrite prev token
            }
            break;

        case STRING:
            offset = findStringEnd(source, offset + 1, code);
            break;

        default:
            offset = findIdentifierEnd(source, offset);
        }

        offsetAndType[tokenCount++] = type << TYPE_OFFSET | offset;
        prevType = type;
    }

    offsetAndType[tokenCount] = offset;

    scanner.offsetAndType = offsetAndType;
    scanner.tokenCount = tokenCount;
}

export class Scanner {
    constructor(source, options = {}) {
        let start = firstCharOffset(source);

        this.ignore = options.ignoreErrors;

        this.source = source;
        this.initLine = options.initLine ? 1 : options.initLine;
        this.initColumn = (options.initColumn ? 1 : options.initColumn) - start;
        this.lastLocationLine = this.initLine;
        this.lastLocationLineOffset = 1 - this.initColumn;
        this.lines = null;

        this.eof = false;
        this.currentToken = -1;
        this.tokenType = 0;
        this.tokenStart = start;
        this.tokenEnd = start;

        tokenLayout(this, source, start);
    }

    lookupType(offset) {
        offset += this.currentToken;

        if (offset < this.tokenCount) {
            return this.offsetAndType[offset] >> TYPE_OFFSET;
        }

        return NULL;
    }


    lookupValue(offset, referenceStr) {
        offset += this.currentToken;

        if (offset < this.tokenCount) {
            return cmpStr(
                this.source,
                this.offsetAndType[offset - 1] & OFFSET_MASK,
                this.offsetAndType[offset] & OFFSET_MASK,
                referenceStr
            );
        }

        return false;
    }

    getTokenValue() {
        return this.source.substring(this.tokenStart, this.tokenEnd);
    }

    substrToCursor(start) {
        return this.source.substring(start, this.tokenStart);
    }

    skip(tokenCount) {
        let next = this.currentToken + tokenCount;

        if (next < this.tokenCount) {
            this.currentToken = next;
            this.tokenStart = this.offsetAndType[next - 1] & OFFSET_MASK;
            next = this.offsetAndType[next];
            this.tokenType = next >> TYPE_OFFSET;
            this.tokenEnd = next & OFFSET_MASK;
        } else {
            this.currentToken = this.tokenCount;
            this.readNextToken();
        }
    }

    getNext() {
        let next = this.currentToken + 1;

        if (next < this.tokenCount) {
            this.currentToken = next;
            this.tokenStart = this.tokenEnd;
            next = this.offsetAndType[next];
            this.tokenType = next >> TYPE_OFFSET;
            this.tokenEnd = next & OFFSET_MASK;
        } else {
            this.currentToken = this.tokenCount;
            this.eof = true;
            this.tokenType = NULL;
            this.tokenStart = this.tokenEnd = this.source.length;
        }
    }

    eat(tokenType) {
        if (this.tokenType !== tokenType) {
            this.error(TokenName[tokenType] + ' is expected');
        }

        this.readNextToken();
    }

    expectIdentifier(name) {
        if (
            this.tokenType !== IDENTIFIER ||
            cmpStr(this.source, this.tokenStart, this.tokenEnd, name) === false
        ) {
            this.error('Identifier `' + name + '` is expected');
        }

        this.readNextToken();
    }

    getLocation(offset, source) {
        if (this.lines === null) {
            this.lines = computeLines(this, this.source);
        }

        let line = this.lines[offset];
        let column = offset;
        let lineOffset;

        if (line === this.initLine) {
            column += this.initColumn;
        } else {
            // try get precomputed line offset
            if (line === this.lastLocationLine) {
                lineOffset = this.lastLocationLineOffset;
            } else {
                // try avoid to compute line offset
                // since it's expensive for long lines
                lineOffset = lastIndexOf.call(this.lines, line - 1, offset);
                this.lastLocationLine = line;
                this.lastLocationLineOffset = lineOffset;
            }

            column -= lineOffset;
        }

        return {
            source,
            offset,
            line,
            column
        };
    }

    error(message, offset) {
        let location;

        if (offset && offset < this.source.length) {
            location = this.getLocation(offset);
        } else if (this.eof) {
            location = findLastNonSpaceLocation(this);
        } else {
            location = this.getLocation(this.tokenStart);
        }

        throw new CssSyntaxError(
            message || 'Unexpected input',
            this.source,
            location.offset,
            location.line,
            location.column
        );
    }

    getTypes() {
        // eslint-disable-next-line max-len
        return Array.prototype.slice.call(this.offsetAndType, 0, this.tokenCount).map((item) => {
            return TokenName[item >> TYPE_OFFSET];
        });
    }
}

// warm up scanner to elimitate code branches that never execute
// fix soft deoptimizations (insufficient type feedback)

// eslint-disable-next-line no-new, max-len
new Scanner('\n\r\r\n\f//""\'\'/*\r\n\f*/1a;.\\31\t\+2{url(a);+1.2e3 -.4e-5 .6e+7}');
