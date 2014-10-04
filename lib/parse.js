var CssSyntaxError = require('./css-syntax-error');
var PreviousMap    = require('./previous-map');
var Declaration    = require('./declaration');
var tokenize       = require('./tokenize');
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
        if ( this.opts.from ) this.from = path.resolve(this.opts.from);

        sequence += 1;
        this.id   = '<input css ' + sequence + '>';

        this.root      = new Root();
        this.current   = this.root;
        this.spaces    = '';
        this.semicolon = false;
    }

    tokenize() {
        this.tokens = tokenize(this.source, this.opts);
    }

    setMap() {
        var map = new PreviousMap(this.source, this.opts, this.id);
        if ( map.text ) {
            this.root.prevMap = map;
            if ( !this.from ) this.from = map.consumer().file;
        }
    }

    loop() {
        var token;
        while ( (token = this.tokens.shift()) !== undefined ) {
            if ( !this.nextToken(token) ) this.spaces += token[1];
        }
        this.endFile();
    }

    nextToken(token) {
        return this.word(token)    || this.end(token)    ||
               this.comment(token) || this.atrule(token) ||
               this.emptyRule(token);
    }

    comment(token) {
        if ( token[0] != 'comment' ) return false;

        var node = new Comment();
        this.init(node, token[2]);
        node.source.end = token[3];

        var text  = token[1].slice(2, -2);
        var match = text.match(/^(\s*)([^]*[^\s])(\s*)$/);
        node.left  = match[1];
        node.text  = match[2];
        node.right = match[3];
        return true;
    }

    emptyRule(token) {
        if ( token[0] != '{' ) return;

        var node = new Rule();
        this.init(node, token[2]);
        node.between  = '';
        node.selector = '';
        this.current = node;
        return true;
    }

    word(start) {
        if ( start[0] != 'word' ) return;

        var token;
        var colon  = false;
        var buffer = [start];
        var end    = false;
        while ( true ) {
            token = this.tokens.shift();

            if ( !token ) {
                end = true;
                break;

            } else if ( token[0] == ';' ) {
                buffer.push(token);
                if ( colon ) {
                    this.decl(buffer);
                    return true;
                } else {
                    break;
                }

            } else if ( token[0] == '{' ) {
                this.rule(buffer);
                return true;

            } else if ( token[0] == '}' ) {
                this.tokens.unshift(token);
                end = true;
                break;

            } else if ( token[0] == 'at-word' ) {
                this.tokens.unshift(token);
                break;

            } else {
                if ( token[0] == ':' ) colon = true;
                buffer.push(token);
            }
        }

        if ( end && colon ) {
            while ( buffer.length ) {
                token = buffer[ buffer.length - 1 ];
                if ( token[0] != 'space' && token[0] != 'comment' ) break;
                this.tokens.unshift( buffer.pop() );
            }
            this.decl(buffer);
            return true;
        }

        if ( this.opts.safe ) {
            this.spaces += this.map(buffer, i => i[1]).join('');
            return true;
        } else {
            this.error('Unknown word', start[2]);
        }
    }

    rule(tokens) {
        var node = new Rule();
        this.init(node, tokens[0][2]);

        node.between = this.spacesFromEnd(tokens);
        this.raw(node, 'selector', tokens);
        this.current = node;
    }

    decl(tokens) {
        var node = new Declaration();
        this.init(node);

        node.source.start = tokens[0][2];
        node.prop    = tokens.shift()[1];
        node.between = '';

        var token;
        while ( tokens.length ) {
            token = tokens.shift();
            node.between += token[1];

            if ( token[0] == ':' ) {
                break;
            } else if ( token[0] != 'space' && token[0] != 'comment' ) {
                if ( this.opts.safe ) {
                    node.source.start = token[2];
                    node.before += node.prop + node.between;
                    node.prop    = tokens.shift()[1];
                    node.between = '';
                } else {
                    this.error('Unknown word', token[2]);
                }
            }
        }

        if ( node.prop[0] == '_' || node.prop[0] == '*' ) {
            node.before += node.prop[0];
            node.prop    = node.prop.slice(1);
        }
        node.between += this.spacesFromStart(tokens);

        var last = tokens[ tokens.length - 1 ];
        if ( last[0] == ';' ) {
            node.source.end = last[2];
            this.semicolon = true;
            tokens.pop();
        } else {
            node.source.end = last[3];
        }

        for ( var i = tokens.length - 1; i > 0; i-- ) {
            token = tokens[i];
            if ( token[0] == 'word' && token[1] == '!important' ) {
                node.important = true;
                var string = this
                    .map(tokens.splice(i, tokens.length - i), i => i[1] )
                    .join('');
                string = this.spacesFromEnd(tokens) + string;
                if ( string != ' !important' ) node._important = string;
                break;
            }
            if ( token[0] != 'space' && token[0] != 'comment' ) break;
        }

        this.raw(node, 'value', tokens);
    }

    atrule(token) {
        if ( token[0] != 'at-word' ) return;

        var node  = new AtRule();
        node.name = token[1].slice(1);
        if ( node.name === '' ) this.error('At-rule without name', token[2]);
        this.init(node, token[2]);

        var next;
        var last   = false;
        var open   = false;
        var params = [];
        while ( true ) {
            token = this.tokens.shift();
            if ( !token ) {
                last = true;
                break;
            } else if ( token[0] == ';' ) {
                node.source.end = token[2];
                this.semicolon = true;
                break;
            } else if ( token[0] == '{' ) {
                open = true;
                break;
            } else {
                params.push(token);
            }
        }

        node.between = this.spacesFromEnd(params);
        if ( params.length ) {
            node.afterName = this.spacesFromStart(params);
            this.raw(node, 'params', params);
            if ( last ) {
                node.source.end = params[ params.length - 1 ][3];
                this.spaces     = node.between;
                node.between    = '';
            }
        } else {
            node.afterName = '';
            node.params    = '';
        }

        if ( open ) {
            node.childs  = [];
            this.current = node;
        }
        return true;
    }

    end(token) {
        if ( token[0] != '}' ) return;

        if ( this.semicolon ) {
            this.current.semicolon = true;
            this.semicolon = false;
        }
        this.current.after = (this.current.after || '') + this.spaces;
        this.spaces = '';

        if ( this.current.parent ) {
            this.current.source.end = token[2];
            this.current = this.current.parent;
        } else if ( !this.opts.safe ) {
            this.error('Unexpected }', token[2]);
        } else {
            this.current.after += '}';
        }

        return true;
    }

    endFile() {
        if ( this.current.parent && !this.opts.safe ) {
            this.error('Unclosed block', this.current.source.start);
        }

        if ( this.semicolon ) this.current.semicolon = true;
        this.current.after = (this.current.after || '') + this.spaces;

        while ( this.current.parent ) {
            this.current = this.current.parent;
            this.current.after = '';
        }
    }

    // Helpers

    error(message, pos) {
        throw new CssSyntaxError(message, this.source, pos, this.opts.from);
    }

    init(node, start) {
        this.current.push(node);

        node.source = { start: start, content: this.source };
        if ( this.root.prevMap ) node.source.map = this.root.prevMap;
        if ( this.from ) {
            node.source.file = this.from;
        } else {
            node.source.id = this.id;
        }

        node.before    = this.spaces;
        this.spaces    = '';
        this.semicolon = false;
    }

    raw(node, prop, tokens) {
        var clean = true;
        var value = this.map(tokens, (token) => {
            if ( token[0] == 'comment' ) {
                clean = false;
                return '';
            } else {
                return token[1];
            }
        }).join('');
        if ( !clean ) {
            var origin = tokens.map( i => i[1] ).join('');
            node['_' + prop] = { value: value, raw: origin };
        }
        node[prop] = value;
    }

    spacesFromEnd(tokens) {
        var next;
        var spaces = '';
        while ( tokens.length ) {
            next = tokens[ tokens.length - 1 ];
            if ( next[0] != 'space' && next[0] != 'comment' ) break;
            spaces += tokens.pop()[1];
        }
        return spaces;
    }

    spacesFromStart(tokens) {
        var next;
        var spaces = '';
        while ( tokens.length ) {
            next = tokens[0];
            if ( next[0] != 'space' && next[0] != 'comment' ) break;
            spaces += tokens.shift()[1];
        }
        return spaces;
    }

    map(array, callback) {
        var mapped = [];
        for ( var i = 0; i < array.length; i++ ) {
            mapped.push(callback(array[i], i));
        }
        return mapped;
    }
}

module.exports = function (source, opts = { }) {
    if ( opts.map == 'inline' ) opts.map = { inline: true };

    var parser = new Parser(source, opts);
    parser.tokenize();
    parser.setMap();
    parser.loop();

    return parser.root;
};

module.exports.Parser = Parser;
