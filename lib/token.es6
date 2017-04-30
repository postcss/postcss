/**
 * Port of csstree const
 * Defines basic structures for tokenizer
 */
const WHITESPACE = 1;
const IDENTIFIER = 2;
const NUMBER = 3;
const STRING = 4;
const COMMENT = 5;
const PUNCTUATION = 6;

const TAB = 9;
const N = 10;
const F = 12;
const R = 13;
const SPACE = 32;

/* List of all available token types */
const TokenType = {
    Whitespace:   WHITESPACE,
    Identifier:   IDENTIFIER,
    Number:           NUMBER,
    String:           STRING,
    Comment:         COMMENT,
    Punctuation: PUNCTUATION,

    ExclamationMark:    33,  // !
    QuotationMark:      34,  // "
    NumberSign:         35,  // #
    DollarSign:         36,  // $
    PercentSign:        37,  // %
    Ampersand:          38,  // &
    Apostrophe:         39,  // '
    LeftParenthesis:    40,  // (
    RightParenthesis:   41,  // )
    Asterisk:           42,  // *
    PlusSign:           43,  // +
    Comma:              44,  // ,
    HyphenMinus:        45,  // -
    FullStop:           46,  // .
    Solidus:            47,  // /
    Colon:              58,  // :
    Semicolon:          59,  // ;
    LessThanSign:       60,  // <
    EqualsSign:         61,  // =
    GreaterThanSign:    62,  // >
    QuestionMark:       63,  // ?
    CommercialAt:       64,  // @
    LeftSquareBracket:  91,  // [
    RightSquareBracket: 93,  // ]
    CircumflexAccent:   94,  // ^
    LowLine:            95,  // _
    LeftCurlyBracket:  123,  // {
    VerticalLine:      124,  // |
    RightCurlyBracket: 125,  // }
    Tilde:             126   // ~
};

/* Map token names to token keys */
const TokenName = Object.keys(TokenType).reduce((result, key) => {
    result[TokenType[key]] = key;
    return result;
}, {});

/* Punc tokens */
const punctuation = [
    TokenType.ExclamationMark,    // '!'
    TokenType.QuotationMark,      // '"'
    TokenType.NumberSign,         // '#'
    TokenType.DollarSign,         // '$'
    TokenType.PercentSign,        // '%'
    TokenType.Ampersand,          // '&'
    TokenType.Apostrophe,         // '\''
    TokenType.LeftParenthesis,    // '('
    TokenType.RightParenthesis,   // ')'
    TokenType.Asterisk,           // '*'
    TokenType.PlusSign,           // '+'
    TokenType.Comma,              // ','
    TokenType.HyphenMinus,        // '-'
    TokenType.FullStop,           // '.'
    TokenType.Solidus,            // '/'
    TokenType.Colon,              // ':'
    TokenType.Semicolon,          // ';'
    TokenType.LessThanSign,       // '<'
    TokenType.EqualsSign,         // '='
    TokenType.GreaterThanSign,    // '>'
    TokenType.QuestionMark,       // '?'
    TokenType.CommercialAt,       // '@'
    TokenType.LeftSquareBracket,  // '['
    TokenType.RightSquareBracket, // ']'
    TokenType.CircumflexAccent,   // '^'
    TokenType.LeftCurlyBracket,   // '{'
    TokenType.VerticalLine,       // '|'
    TokenType.RightCurlyBracket,  // '}'
    TokenType.Tilde               // '~'
];

const SYMBOL_CATEGORY_LENGTH = Math.max.apply(null, punctuation) + 1;
const SYMBOL_CATEGORY = new Uint32Array(SYMBOL_CATEGORY_LENGTH);
const IS_PUNCTUATION = new Uint32Array(SYMBOL_CATEGORY_LENGTH);

for (let i = 0; i < SYMBOL_CATEGORY.length; i++) {
    SYMBOL_CATEGORY[i] = IDENTIFIER;
}

// fill categories
punctuation.forEach((key) => {
    SYMBOL_CATEGORY[Number(key)] = PUNCTUATION;
    IS_PUNCTUATION[Number(key)] = PUNCTUATION;
}, SYMBOL_CATEGORY);

IS_PUNCTUATION[TokenType.HyphenMinus] = 0;
// whitespace is punctuator
IS_PUNCTUATION[SPACE] = PUNCTUATION;
IS_PUNCTUATION[TAB] = PUNCTUATION;
IS_PUNCTUATION[N] = PUNCTUATION;
IS_PUNCTUATION[R] = PUNCTUATION;
IS_PUNCTUATION[F] = PUNCTUATION;

for (let i = 48; i <= 57; i++) {
    SYMBOL_CATEGORY[i] = NUMBER;
}

SYMBOL_CATEGORY[SPACE] = WHITESPACE;
SYMBOL_CATEGORY[TAB] = WHITESPACE;
SYMBOL_CATEGORY[N] = WHITESPACE;
SYMBOL_CATEGORY[R] = WHITESPACE;
SYMBOL_CATEGORY[F] = WHITESPACE;

SYMBOL_CATEGORY[TokenType.Apostrophe] = STRING;
SYMBOL_CATEGORY[TokenType.QuotationMark] = STRING;

/* Base class for single token */
class Token {
    constructor(type, isPunctuator, value, startLoc, endLoc) {
        this.type = type;
        this.value = value;
        this.isPunctuator = isPunctuator;
        this.startLoc = startLoc;
        this.endLoc = endLoc;
    }

    /* Check if token is punctuation token */
    isPunctuator() {
        return this.isPunctuator;
    }

    /* Get position of the current token */
    getPosition() {
        return this.position;
    }
}

export {
    TokenType,
    TokenName,
    Token,
    SYMBOL_CATEGORY,
    IS_PUNCTUATION
};

