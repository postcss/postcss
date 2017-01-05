/* eslint no-unused-vars: 0, no-undef: 0 */ // turning off only for now

import { Scanner } from './scanner';
import { Character } from './character';

const SINGLE_QUOTE      = '\''.charCodeAt(0);
const DOUBLE_QUOTE      =  '"'.charCodeAt(0);
const BACKSLASH         = '\\'.charCodeAt(0);
const SLASH             =  '/'.charCodeAt(0);
const NEWLINE           = '\n'.charCodeAt(0);
const SPACE             =  ' '.charCodeAt(0);
const FEED              = '\f'.charCodeAt(0);
const TAB               = '\t'.charCodeAt(0);
const CR                = '\r'.charCodeAt(0);
const OPEN_SQUARE       =  '['.charCodeAt(0);
const CLOSE_SQUARE      =  ']'.charCodeAt(0);
const OPEN_PARENTHESES  =  '('.charCodeAt(0);
const CLOSE_PARENTHESES =  ')'.charCodeAt(0);
const OPEN_CURLY        =  '{'.charCodeAt(0);
const CLOSE_CURLY       =  '}'.charCodeAt(0);
const SEMICOLON         =  ';'.charCodeAt(0);
const ASTERISK          =  '*'.charCodeAt(0);
const COLON             =  ':'.charCodeAt(0);
const AT                =  '@'.charCodeAt(0);

const RE_AT_END      = /[ \n\t\r\f\{\(\)'"\\;/\[\]#]/g;
const RE_WORD_END    = /[ \n\t\r\f\(\)\{\}:;@!'"\\\]\[#]|\/(?=\*)/g;
const RE_BAD_BRACKET = /.[\\\/\("'\n]/;


/* Base tokenizer class */
export class Tokenizer {
    constructor(input, options = {}) {
        this.scanner = new Scanner(input.css.valueOf(), options);
        this.currentChar = {};
        this.currentToken = null;
        this.buffer = [];
    }

    /* Helper for reading character */
    getCharacter() {
        this.scanner.getNext();
        let position = this.scanner.getLocation(this.scanner.tokenStart);

        const char = new Character(
            this.scanner.tokenType,
            this.scanner.tokenStart,
            this.scanner.tokenEnd,
            position
        );

        return char;
    }

    /* Read next value */
    setNextCharacter() {
        let buf = this.buffer;
        this.currentChar = buf.length ? buf.shift() : this.getCharacter();
    }

    /* lookup next character */
    lookAhead() {
        const nextChar = this.getCharacter();
        this.buffer.push(nextChar);
        return nextChar;
    }

    readNextToken() {
        this.setNextCharacter();
        const code = this.currentChar.type;

        // if ( code === NEWLINE || code === FEED ||
        //      code === CR && css.charCodeAt(pos + 1) !== NEWLINE ) {
        //     offset = pos;
        //     line  += 1;
        // }

        switch ( code ) {
        case NEWLINE:
        case SPACE:
        case TAB:
        case CR:
        case FEED:
            do {
                const lookup = this.lookAhead();
                if ( lookup === NEWLINE ) {
                    offset = next;
                    line  += 1;
                }
            } while ( code === SPACE   ||
                        code === NEWLINE ||
                        code === TAB     ||
                        code === CR      ||
                        code === FEED );

                // this.currentToken = ['space', css.slice(pos, next)];
                // pos = next - 1;
            break;

        case OPEN_SQUARE:
            this.currentToken = [
                '[',
                '[',
                this.currentChar.position.line,
                this.currentChar.position.column
            ];
            break;

        case CLOSE_SQUARE:
            this.currentToken = [
                ']',
                ']',
                this.currentChar.position.line,
                this.currentChar.position.column
            ];
            break;

        case OPEN_CURLY:
            this.currentToken = [
                '{',
                '{',
                this.currentChar.position.line,
                this.currentChar.position.column
            ];
            break;

        case CLOSE_CURLY:
            this.currentToken = [
                '}',
                '}',
                this.currentChar.position.line,
                this.currentChar.position.column
            ];
            break;

        case COLON:
            this.currentToken = [
                ':',
                ':',
                this.currentChar.position.line,
                this.currentChar.position.column
            ];
            break;

        case SEMICOLON:
            this.currentToken = [
                ';',
                ';',
                this.currentChar.position.line,
                this.currentChar.position.column
            ];

            break;

        default:
            break;
        }
    }
}
