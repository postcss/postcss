import Declaration from './declaration';
import tokenizer   from './tokenize';
import Comment     from './comment';
import AtRule      from './at-rule';
import Root        from './root';
import Rule        from './rule';

export default class Parser {
    constructor(input) {
        this.input = input;

        this.pos       = 0;
        this.root      = new Root();
        this.current   = this.root;
        this.spaces    = '';
        this.semicolon = false;

        this.root.source = { input: input };
        if ( input.map ) this.root.prevMap = input.map;
    }

    tokenize() {
        this.tokens = tokenizer(this.input);
    }

    loop() {
        var token;
        while ( this.pos < this.tokens.length ) {
            token = this.tokens[this.pos];

            switch ( token[0] ) {
                case 'word':
                case ':':
                    this.word(token);
                    break;

                case '}':
                    this.end(token);
                    break;

                case 'comment':
                    this.comment(token);
                    break;

                case 'at-word':
                    this.atrule(token);
                    break;

                case '{':
                    this.emptyRule(token);
                    break;

                default:
                    this.spaces += token[1];
                    break;
            }

            this.pos += 1;
        }
        this.endFile();
    }

    comment(token) {
        var node = new Comment();
        this.init(node, token[2], token[3]);
        node.source.end = { line: token[4], column: token[5] };

        var text = token[1].slice(2, -2);
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
    }

    emptyRule(token) {
        var node = new Rule();
        this.init(node, token[2], token[3]);
        node.between  = '';
        node.selector = '';
        this.current = node;
    }

    word() {
        var token;
        var end      = false;
        var type     = null;
        var colon    = false;
        var bracket  = null;
        var brackets = 0;

        var start = this.pos;
        this.pos += 1;
        while ( true ) {
            token = this.tokens[this.pos];
            if ( !token ) {
                this.pos -= 1;
                end = true;
                break;
            }

            type = token[0];
            if ( type == '(' ) {
                if ( !bracket ) bracket = token;
                brackets += 1;

            } else if ( type == ')' ) {
                brackets -= 1;
                if ( brackets === 0 ) bracket = null;

            } else if ( brackets === 0 ) {
                if ( type == ';' ) {
                    if ( colon ) {
                        this.decl(this.tokens.slice(start, this.pos + 1));
                        return;
                    } else {
                        break;
                    }

                } else if ( type == '{' ) {
                    this.rule(this.tokens.slice(start, this.pos + 1));
                    return;

                } else if ( type == '}' ) {
                    this.pos -= 1;
                    end = true;
                    break;

                } else if ( type == 'at-word' ) {
                    this.pos -= 1;
                    break;

                } else {
                    if ( type == ':' ) colon = true;
                }
            }

            this.pos += 1;
        }

        if ( brackets > 0 && !this.input.safe ) {
            throw this.input.error('Unclosed bracket', bracket[2], bracket[3]);
        }

        if ( end && colon ) {
            while ( this.pos > start ) {
                token = this.tokens[this.pos][0];
                if ( token != 'space' && token != 'comment' ) break;
                this.pos -= 1;
            }
            this.decl(this.tokens.slice(start, this.pos + 1));
            return;
        }

        if ( this.input.safe ) {
            var buffer   = this.tokens.slice(start, this.pos + 1);
            this.spaces += buffer.map(i => i[1]).join('');
        } else {
            token = this.tokens[start];
            throw this.input.error('Unknown word', token[2], token[3]);
        }
    }

    rule(tokens) {
        tokens.pop();

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
            this.semicolon = true;
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

        if ( this.input.safe ) this.checkMissedSemicolon(tokens);

        for ( var i = tokens.length - 1; i > 0; i-- ) {
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

        if ( node.value.indexOf(':') != -1 && !this.input.safe ) {
            this.checkMissedSemicolon(tokens);
        }
    }

    atrule(token) {
        var node  = new AtRule();
        node.name = token[1].slice(1);
        if ( node.name === '' ) {
            if ( this.input.safe ) {
                node.name = '';
            } else {
                throw this.input.error(
                    'At-rule without name', token[2], token[3]);
            }
        }
        this.init(node, token[2], token[3]);

        var next;
        var last   = false;
        var open   = false;
        var params = [];
        while ( true ) {
            this.pos += 1;
            token = this.tokens[this.pos];

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
            node.nodes  = [];
            this.current = node;
        }
    }

    end(token) {
        if ( this.current.nodes && this.current.nodes.length ) {
            this.current.semicolon = this.semicolon;
        }
        this.semicolon = false;

        this.current.after = (this.current.after || '') + this.spaces;
        this.spaces = '';

        if ( this.current.parent ) {
            this.current.source.end = { line: token[2], column: token[3] };
            this.current = this.current.parent;
        } else if ( !this.input.safe ) {
            throw this.input.error('Unexpected }', token[2], token[3]);
        } else {
            this.current.after += '}';
        }
    }

    endFile() {
        if ( this.current.parent && !this.input.safe ) {
            var pos = this.current.source.start;
            throw this.input.error('Unclosed block', pos.line, pos.column);
        }

        if ( this.current.nodes && this.current.nodes.length ) {
            this.current.semicolon = this.semicolon;
        }
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
            throw this.input.error('Unknown word', token[2], token[3]);
        }
    }

    checkMissedSemicolon(tokens) {
        var prev     = null;
        var colon    = false;
        var brackets = 0;
        var type, token;
        for ( var i = 0; i < tokens.length; i++ ) {
            token = tokens[i];
            type  = token[0];

            if ( type == '(' ) {
                brackets += 1;
            } else if ( type == ')' ) {
                brackets -= 0;
            } else if ( brackets === 0 && type == ':' ) {
                if ( !prev && this.input.safe ) {
                    continue;
                } else if ( !prev ) {
                    throw this.input.error('Double colon', token[2], token[3]);
                } else if ( prev[0] == 'word' && prev[1] == 'progid' ) {
                    continue;
                } else {
                    colon = i;
                    break;
                }
            }

            prev = token;
        }

        if ( colon === false ) return;

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
            var founded = 0;
            for ( var j = colon - 1; j >= 0; j-- ) {
                token = tokens[j];
                if ( token[0] != 'space' ) {
                    founded += 1;
                    if ( founded == 2 ) break;
                }
            }
            throw this.input.error('Missed semicolon', token[4], token[5]);
        }
    }

    // Helpers

    init(node, line, column) {
        this.current.push(node);

        node.source = { start: { line, column }, input: this.input };
        node.before = this.spaces;
        this.spaces = '';
        if ( node.type != 'comment' ) this.semicolon = false;
    }

    raw(node, prop, tokens) {
        var token;
        var value = '';
        var clean = true;
        for ( token of tokens ) {
            if ( token[0] == 'comment' ) {
                clean = false;
            } else {
                value += token[1];
            }
        }
        if ( !clean ) {
            var origin = '';
            for ( token of tokens ) origin += token[1];
            node['_' + prop] = { value: value, raw: origin };
        }
        node[prop] = value;
    }

    spacesFromEnd(tokens) {
        var next;
        var spaces = '';
        while ( tokens.length ) {
            next = tokens[ tokens.length - 1 ][0];
            if ( next != 'space' && next != 'comment' ) break;
            spaces += tokens.pop()[1];
        }
        return spaces;
    }

    spacesFromStart(tokens) {
        var next;
        var spaces = '';
        while ( tokens.length ) {
            next = tokens[0][0];
            if ( next != 'space' && next != 'comment' ) break;
            spaces += tokens.shift()[1];
        }
        return spaces;
    }

    stringFrom(tokens, from) {
        var result = '';
        for ( var i = from; i < tokens.length; i++ ) {
            result += tokens[i][1];
        }
        tokens.splice(from, tokens.length - from);
        return result;
    }
}
