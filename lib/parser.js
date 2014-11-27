var Declaration = require('./declaration');
var tokenize    = require('./tokenize');
var Comment     = require('./comment');
var AtRule      = require('./at-rule');
var Root        = require('./root');
var Rule        = require('./rule');

// CSS parser
class Parser {
    constructor(input) {
        this.input = input;

        this.root      = new Root();
        this.current   = this.root;
        this.spaces    = '';
        this.semicolon = false;

        if ( this.input.map ) this.root.prevMap = this.input.map;
    }

    tokenize() {
        this.tokens = tokenize(this.input);
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
        this.init(node, token[2], token[3]);
        node.source.end = { line: token[4], column: token[5] };

        var text  = token[1].slice(2, -2);
        if ( text.match(/^\s*$/) ) {
            node.left  = text;
            node.text  = '';
            node.right = '';
        } else {
            var match = text.match(/^(\s*)([^]*[^\s])(\s*)$/);
            node.left  = match[1];
            node.text  = match[2];
            node.right = match[3];
        }
        return true;
    }

    emptyRule(token) {
        if ( token[0] != '{' ) return;

        var node = new Rule();
        this.init(node, token[2], token[3]);
        node.between  = '';
        node.selector = '';
        this.current = node;
        return true;
    }

    word(start) {
        if ( start[0] != 'word' && start[0] != ':' ) return;

        var token;
        var end      = false;
        var colon    = false;
        var buffer   = [start];
        var brackets = [];
        while ( true ) {
            token = this.tokens.shift();

            if ( !token ) {
                end = true;
                break;

            } else if ( token[0] == '(' ) {
                buffer.push(token);
                brackets.push(token);

            } else if ( token[0] == ')' ) {
                buffer.push(token);
                brackets.pop();

            } else if ( brackets.length ) {
                buffer.push(token);

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

        if ( brackets.length > 0 && !this.input.safe ) {
            token = brackets[0];
            this.input.error('Unclosed bracket', token[2], token[3]);
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

        if ( this.input.safe ) {
            this.spaces += this.map(buffer, i => i[1]).join('');
            return true;
        } else {
            this.input.error('Unknown word', start[2], start[3]);
        }
    }

    rule(tokens) {
        var node = new Rule();
        this.init(node, tokens[0][2], tokens[0][3]);

        node.between = this.spacesFromEnd(tokens);
        this.raw(node, 'selector', tokens);
        this.current = node;
    }

    decl(tokens) {
        var node = new Declaration();
        this.init(node);

        var last = tokens[ tokens.length - 1 ];
        if ( last[0] == ';' ) {
            this.semicolon  = true;
            tokens.pop();
        }
        if ( last[4] ) {
            node.source.end = { line: last[4], column: last[5] };
        } else {
            node.source.end = { line: last[2], column: last[3] };
        }

        while ( tokens[0][0] != 'word' ) {
            node.before += tokens.shift()[1];
        }
        node.source.start = { line: tokens[0][2], column: tokens[0][3] };

        node.prop    = tokens.shift()[1];
        node.between = '';

        var token;
        while ( tokens.length ) {
            token = tokens.shift();

            if ( token[0] == ':' ) {
                node.between += token[1];
                break;
            } else if ( token[0] != 'space' && token[0] != 'comment' ) {
                this.unknownWord(node, token, tokens);
            } else {
                node.between += token[1];
            }
        }

        if ( node.prop[0] == '_' || node.prop[0] == '*' ) {
            node.before += node.prop[0];
            node.prop    = node.prop.slice(1);
        }
        node.between += this.spacesFromStart(tokens);

        var i;
        var brackets = 0;
        for ( i = 0; i < tokens.length; i++ ) {
            if ( tokens[i][0] == '(' ) {
                brackets += 1;
            } else if ( tokens[i][0] == ')' ) {
                brackets -= 0;
            } else if ( i > 1 && brackets === 0 && tokens[i][0] == ':' ) {
                this.missedSemicolon(tokens, i);
            }
        }

        for ( i = tokens.length - 1; i > 0; i-- ) {
            token = tokens[i];
            if ( token[1] == '!important' ) {
                node.important = true;
                var string = this.stringFrom(tokens, i);
                string = this.spacesFromEnd(tokens) + string;
                if ( string != ' !important' ) node._important = string;
                break;
            } else if ( token[0] != 'space' && token[0] != 'comment' ) {
                break;
            }
        }

        this.raw(node, 'value', tokens);
    }

    atrule(token) {
        if ( token[0] != 'at-word' ) return;

        var node  = new AtRule();
        node.name = token[1].slice(1);
        if ( node.name === '' ) {
            if ( this.input.safe ) {
                node.name = '';
            } else {
                this.input.error('At-rule without name', token[2], token[3]);
            }
        }
        this.init(node, token[2], token[3]);

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
                node.source.end = { line: token[2], column: token[3] };
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
                token = params[ params.length - 1 ];
                node.source.end = { line: token[4], column: token[5] };
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
            this.current.source.end = { line: token[2], column: token[3] };
            this.current = this.current.parent;
        } else if ( !this.input.safe ) {
            this.input.error('Unexpected }', token[2], token[3]);
        } else {
            this.current.after += '}';
        }

        return true;
    }

    endFile() {
        if ( this.current.parent && !this.input.safe ) {
            var pos = this.current.source.start;
            this.input.error('Unclosed block', pos.line, pos.column);
        }

        if ( this.semicolon ) this.current.semicolon = true;
        this.current.after = (this.current.after || '') + this.spaces;

        while ( this.current.parent ) {
            this.current = this.current.parent;
            this.current.after = '';
        }
    }

    unknownWord(node, token) {
        if ( this.input.safe ) {
            node.source.start = { line: token[2], column: token[3] };
            node.before += node.prop + node.between;
            node.prop    = token[1];
            node.between = '';
        } else {
            this.input.error('Unknown word', token[2], token[3]);
        }
    }

    missedSemicolon(tokens, colon) {
        if ( this.input.safe ) {
            var split;
            for ( split = colon - 1; split >= 0; split-- ) {
                if ( tokens[split][0] == 'word' ) break;
            }
            for ( split -= 1; split >= 0; split-- ) {
                if ( tokens[split][0] != 'space' ) {
                    split += 1;
                    break;
                }
            }
            var other = tokens.splice(split, tokens.length - split);
            this.decl(other);
        } else {
            var token;
            var founded = 0;
            for ( var j = colon - 1; j >= 0; j-- ) {
                token = tokens[j];
                if ( token[0] != 'space' ) {
                    founded += 1;
                    if ( founded == 2 ) break;
                }
            }
            this.input.error('Missed semicolon', token[4], token[5]);
        }
    }

    // Helpers

    init(node, line, column) {
        this.current.push(node);

        node.source = { start: { line, column }, content: this.input.css };
        if ( this.input.map ) node.source.map = this.input.map;
        if ( this.input.file ) {
            node.source.file = this.input.file;
        } else {
            node.source.id = this.input.id;
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

    stringFrom(tokens, i) {
        var part = tokens.splice(i, tokens.length - i);
        return this.map(part, i => i[1] ).join('');
    }

    map(array, callback) {
        var mapped = [];
        for ( var i = 0; i < array.length; i++ ) {
            mapped.push(callback(array[i], i));
        }
        return mapped;
    }
}

module.exports = Parser;
