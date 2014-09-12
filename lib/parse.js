var CssSyntaxError = require('./css-syntax-error');
var PreviousMap    = require('./previous-map');
var Declaration    = require('./declaration');
var Comment        = require('./comment');
var AtRule         = require('./at-rule');
var Root           = require('./root');
var Rule           = require('./rule');

var path = require('path');

var sequence = 0;

// CSS parser
class Parser {
    constructor(source, opts = { }) {
        this.source = source.toString();
        this.opts   = opts;

        sequence    += 1;
        this.id      = ((new Date()).valueOf() * 10  + sequence).toString();
        this.root    = new Root();
        this.current = this.root;
        this.parents = [this.current];
        this.type    = 'rules';
        this.types   = [this.type];

        this.pos    = -1;
        this.line   = 1;
        this.lines  = [];
        this.column = 0;
        this.buffer = '';
    }

    loop() {
        this.next  = this.source[0];
        var length = this.source.length - 1;
        while ( this.pos < length ) {
            this.move();
            this.nextLetter();
        }
        this.endFile();
    }

    setMap() {
        var map = new PreviousMap(this.root, this.opts, this.id);
        if ( map.text ) {
            this.root.prevMap = map;
            this.root.eachInside( i => i.source.map = map );
        }
    }

    nextLetter() {
        return this.inString()   ||
               this.inComment()  ||
               this.isComment()  ||
               this.isString()   ||

               this.isWrong()    ||

               this.inAtrule()   || this.isAtrule()   ||
               this.isBlockEnd() ||
               this.inSelector() || this.isSelector() ||
               this.inProperty() || this.isProperty() || this.inValue();
    }

    // Parsers

    inString(close) {
        if ( this.quote ) {
            if ( this.escape && !close ) {
                this.escape = false;
            } else if ( this.letter == '\\' ) {
                this.escape = true;
            } else if ( this.letter == this.quote || close ) {
                this.quote = undefined;
            }
            this.trimmed += this.letter;

            return true;
        }
    }

    isString() {
        if ( this.letter == '"' || this.letter == "'" ) {
            this.quote    = this.letter;
            this.quotePos = { line: this.line, column: this.column };
            this.trimmed += this.letter;

            return true;
        }
    }

    inComment(close) {
        if ( this.inside('comment') ) {
            if ( close || ( this.letter == '*' && this.next == '/' ) ) {
                var text, left, right;
                [text, left]   = this.startSpaces(this.prevBuffer());
                [text, right]  = this.endSpaces(text);
                this.current.text  = text;
                this.current.left  = left;
                this.current.right = right;
                this.move();
                this.pop();
            }
            return true;

        } else if ( this.inside('value-comment') ) {
            if ( close || ( this.letter == '*' && this.next == '/' ) ) {
                this.popType();
                this.move();
            }
            return true;
        }
    }

    isComment() {
        if ( this.letter == '/' && this.next == '*' ) {
            if ( this.inside('rules') || this.inside('decls') ) {
                this.init( new Comment() );
                this.addType('comment');
                this.move();
                this.buffer = '';
            } else {
                this.commentPos = { line: this.line, column: this.column };
                this.addType('value-comment');
                this.move();
                return true;
            }
        }
    }

    isWrong() {
        if ( this.letter == '{' ) {
            if ( this.inside('decls') || this.inside('value') ) {
                this.error("Unexpected {");
            }
        }

        if ( this.inside('prop') ) {
            if ( this.letter == '}' || this.letter == ';') {
                if ( this.opts.safe ) {
                    var string = this.current.before + this.buffer;
                    this.current.parent.decls.pop();
                    this.pop();
                    this.buffer    = string;
                    this.semicolon = this.prevSemicolon;
                } else {
                    this.error('Missing property value');
                }
            }
        }
    }

    isAtrule() {
        if ( this.letter == '@' && this.inside('rules') ) {
            this.init( new AtRule() );
            this.current.name = '';
            this.addType('atrule-name');

            return true;
        }
    }

    inAtrule(close) {
        if ( this.inside('atrule-name') ) {
            if ( this.space() ) {
                this.checkAtruleName();
                this.buffer  = this.buffer.substr(this.current.name.length);
                this.trimmed = '';
                this.setType('atrule-param');

            } else if ( this.letter == ';' || this.letter == '{' || close ) {
                this.current.between = '';
                this.checkAtruleName();
                this.endAtruleParams();

            } else {
                this.current.name += this.letter;
            }
            return true;

        } else if ( this.inside('atrule-param') ) {
            if ( this.letter == ';' || this.letter == '{' || close ) {
                var raw, left, right;
                [raw, left]  = this.startSpaces( this.prevBuffer() );
                [raw, right] = this.endSpaces(raw);
                this.raw('params', this.trimmed.trim(), raw);
                if ( this.current.params ) {
                    this.current.afterName = left;
                    this.current.between   = right;
                } else {
                    this.current.afterName = '';
                    this.current.between   = left + right;
                }
                this.endAtruleParams();

            } else {
                this.trimmed += this.letter;
            }
            return true;
        }
    }

    inSelector() {
        if ( this.inside('selector') ) {
            if ( this.letter == '{' ) {
                var raw, spaces;
                [raw, spaces] = this.endSpaces( this.prevBuffer() );
                this.raw('selector', this.trimmed.trim(), raw);
                this.current.between = spaces;
                this.semicolon = false;
                this.buffer    = '';
                this.setType('decls');
            } else {
                this.trimmed += this.letter;
            }

            return true;
        }
    }

    isSelector() {
        if ( !this.space() && this.inside('rules') ) {
            this.init( new Rule() );

            if ( this.letter == '{' ) {
                this.addType('decls');
                this.current.selector = '';
                this.current.between  = '';
                this.semicolon = false;
                this.buffer    = '';
            } else {
                this.addType('selector');
                this.buffer  = this.letter;
                this.trimmed = this.letter;
            }

            return true;
        }
    }

    isBlockEnd(close) {
        if ( this.letter == '}' || close ) {
            if ( this.parents.length == 1 ) {
                if ( !this.opts.safe ) {
                    this.error('Unexpected }');
                }
            } else {
                if ( this.inside('value') ) {
                    this.fixEnd( () => this.inValue('close') );
                } else if ( this.inside('prop') && this.opts.safe ) {
                    this.inProperty('close');
                } else {
                    if ( this.semicolon ) this.current.semicolon = true;
                    this.current.after = this.prevBuffer();
                }
                this.pop();
            }

            return true;
        }
    }

    inProperty(close) {
        if ( this.inside('prop') ) {
            if ( this.letter == ':' || close ) {
                if ( this.buffer[0] == '*' || this.buffer[0] == '_' ) {
                    this.current.before += this.buffer[0];
                    this.trimmed = this.trimmed.substr(1);
                    this.buffer  = this.buffer.substr(1);
                }

                this.current.prop = this.trimmed.trim();
                var length = this.current.prop.length;
                this.current.between = this.prevBuffer().substr(length);
                this.buffer = '';

                if ( close ) {
                    this.current.value = '';
                    this.pop();
                } else {
                    this.setType('value');
                }
                this.trimmed = '';
            } else if ( this.letter == '{' ) {
                this.error('Unexpected { in decls');
            } else {
                this.trimmed += this.letter;
            }

            return true;
        }
    }

    isProperty() {
        if ( this.inside('decls') && !this.space() && this.letter != ';' ) {
            this.init( new Declaration() );
            this.addType('prop');
            this.buffer        = this.letter;
            this.trimmed       = this.letter;
            this.prevSemicolon = this.semicolon;
            this.semicolon     = false;

            return true;
        }
    }

    inValue(close) {
        if ( this.inside('value') ) {
            if ( this.letter == '(' ) {
                this.inBrackets = true;
            } else if ( this.inBrackets && this.letter == ')' ) {
                this.inBrackets = false;
            }

            if ( (this.letter == ';' && !this.inBrackets) || close ) {
                if ( this.letter == ';' ) this.semicolon = true;

                var raw, spaces;
                [raw, spaces] = this.startSpaces(this.prevBuffer());
                var trim      = this.trimmed.trim();

                if ( raw.indexOf('!important') != -1 ) {
                    var match = raw.match(/\s+!important\s*$/);
                    if ( match ) {
                        this.current.important  = true;
                        this.current._important = match[0];
                        raw  = raw.slice(0, -match[0].length);
                        trim = trim.replace(/\s+!important$/, '');
                    }
                }

                this.raw('value', trim, raw);
                this.current.between += ':' + spaces;
                this.pop();
            } else {
                this.trimmed += this.letter;
            }

            return true;
        }
    }

    endFile() {
        if ( this.inside('atrule-param') || this.inside('atrule-name') ) {
            this.fixEnd( () => this.inAtrule('close') );
        }

        if ( this.inside('comment') || this.inside('value-comment') ) {
            if ( this.opts.safe ) {
                this.buffer += '/';
                this.inComment('close');
                this.closeBlocks();
            } else {
                if ( this.inside('comment') ) {
                    this.error('Unclosed comment', this.current.source.start);
                } else {
                    this.error('Unclosed comment', this.commentPos);
                }
            }

        } else if ( this.parents.length > 1 ) {
            if ( this.opts.safe ) {
                this.closeBlocks();
            } else {
                this.error('Unclosed block', this.current.source.start);
            }

        } else if ( this.quote ) {
            if ( this.opts.safe ) {
                this.inString('close');
                this.closeBlocks();
            } else {
                this.error('Unclosed quote', this.quotePos);
            }

        } else {
            this.root.after = this.buffer;
        }
    }

    // Helpers

    error(message, pos = { line: this.line, column: this.column }) {
        throw new CssSyntaxError(message, this.source, pos, this.opts.from);
    }

    move() {
        this.pos    += 1;
        this.column += 1;
        this.letter  = this.next;
        this.next    = this.source[this.pos + 1];
        this.buffer += this.letter;

        if ( this.letter == "\n" ) {
            this.lines[this.line] = this.column - 1;
            this.line  += 1;
            this.column = 0;
        }
    }

    prevBuffer() {
        return this.buffer.slice(0, -1);
    }

    inside(type) {
        return this.type == type;
    }

    space() {
        return this.letter.trim() === '';
    }

    init(node) {
        this.current.push(node);
        this.parents.push(node);
        this.current = node;

        this.current.source = {
            start: {
                line:   this.line,
                column: this.column
            },
            content: this.source
        };
        if ( this.opts.from ) {
            this.current.source.file = path.resolve(this.opts.from);
        } else {
            this.current.source.id = this.id;
        }
        this.current.before = this.buffer.slice(0, -1);
        this.buffer = '';
    }

    raw(prop, value, origin) {
        this.current[prop] = value;
        if ( value != origin ) {
            this.current['_' + prop] = { value: value, raw: origin };
        }
    }

    fixEnd(callback) {
        var start, after;
        if ( this.letter == '}' ) {
            start = this.buffer.search(/\s*\}$/);
            after = this.buffer.slice(start, -1);
        } else {
            start = this.buffer.search(/\s*$/);
            after = this.buffer.substr(start);
        }
        this.buffer = this.buffer.substr(0, start + 1);

        var el = this.current;
        callback.apply(this);

        var lines = after.match(/\n/g);
        if ( lines ) {
            el.source.end.line -= lines.length;
            var all  = this.lines[el.source.end.line];
            var last = after.indexOf("\n");
            if ( last == -1 ) last = after.length;
            el.source.end.column = all - last;
        } else {
            el.source.end.column -= after.length;
        }

        this.current.after = after;
        this.buffer = after;
    }

    pop() {
        this.current.source.end = {
            line:   this.line,
            column: this.column
        };

        this.popType();
        this.parents.pop();
        this.current = this.parents[this.parents.length - 1];
        this.buffer  = '';
    }

    addType(type) {
        this.types.push(type);
        this.type = type;
    }

    setType(type) {
        this.types[this.types.length - 1] = type;
        this.type = type;
    }

    popType() {
        this.types.pop();
        this.type = this.types[this.types.length - 1];
    }

    atruleType() {
        var name = this.current.name.toLowerCase();
        if ( name == 'page' || name == 'font-face' ) {
            return 'decls';
        } else if ( name.slice(-8) == 'viewport' ) {
            return 'decls';
        } else {
            return 'rules';
        }
    }

    endAtruleParams() {
        if ( this.letter == '{' ) {
            var type = this.atruleType();
            this.current.addMixin(type);
            this.setType(type);
            this.buffer = '';
        } else {
            if ( this.letter == ';' ) this.current.semicolon = true;
            this.pop();
        }
    }

    checkAtruleName() {
        if ( this.current.name === '' ) this.error('At-rule without name');
    }

    startSpaces(string) {
        var match = string.match(/^\s+/);
        if ( match ) {
            var pos = match[0].length;
            return [string.substr(pos), match[0]];
        } else {
            return [string, ''];
        }
    }

    endSpaces(string) {
        var match = string.match(/\s+$/);
        if ( match ) {
            var pos = match[0].length;
            return [string.slice(0, -pos), match[0]];
        } else {
            return [string, ''];
        }
    }

    closeBlocks() {
        for ( var i = 0; i < this.parents.length; i++ ) {
            this.buffer += '{';
            this.isBlockEnd('close');
        }
    }
}

module.exports = function (source, opts = { }) {
    if ( opts.map == 'inline' ) opts.map = { inline: true };

    var parser = new Parser(source, opts);
    parser.loop();
    parser.setMap();

    return parser.root;
};
