import Declaration from './declaration';
import Comment     from './comment';
import Node        from './node';

export default class Container extends Node {

    stringifyContent(builder) {
        if ( !this.nodes ) return;

        var i, last = this.nodes.length - 1;
        while ( last > 0 ) {
            if ( this.nodes[last].type != 'comment' ) break;
            last -= 1;
        }

        var semicolon = this.style('semicolon');
        for ( i = 0; i < this.nodes.length; i++ ) {
            this.nodes[i].stringify(builder, last != i || semicolon);
        }
    }

    stringifyBlock(builder, start) {
        var before = this.style('before');
        if ( before ) builder(before);

        var between = this.style('between', 'beforeOpen');
        builder(start + between + '{', this, 'start');

        var after;
        if ( this.nodes && this.nodes.length ) {
            this.stringifyContent(builder);
            after = this.style('after');
        } else {
            after = this.style('after', 'emptyBody');
        }

        if ( after ) builder(after);
        builder('}', this, 'end');
    }

    push(child) {
        child.parent = this;
        this.nodes.push(child);
        return this;
    }

    each(callback) {
        if ( !this.lastEach ) this.lastEach = 0;
        if ( !this.indexes )  this.indexes = { };

        this.lastEach += 1;
        var id = this.lastEach;
        this.indexes[id] = 0;

        if ( !this.nodes ) return;

        var index, result;
        while ( this.indexes[id] < this.nodes.length ) {
            index  = this.indexes[id];
            result = callback(this.nodes[index], index);
            if ( result === false ) break;

            this.indexes[id] += 1;
        }

        delete this.indexes[id];

        if ( result === false ) return false;
    }

    eachInside(callback) {
        return this.each( (child, i) => {
            var result = callback(child, i);

            if ( result !== false && child.eachInside ) {
                result = child.eachInside(callback);
            }

            if ( result === false ) return result;
        });
    }

    eachDecl(prop, callback) {
        if ( !callback ) {
            callback = prop;
            return this.eachInside( (child, i) => {
                if ( child.type == 'decl' ) {
                    var result = callback(child, i);
                    if ( result === false ) return result;
                }
            });
        } else if ( prop instanceof RegExp ) {
            return this.eachInside( (child, i) => {
                if ( child.type == 'decl' && prop.test(child.prop) ) {
                    var result = callback(child, i);
                    if ( result === false ) return result;
                }
            });
        } else {
            return this.eachInside( (child, i) => {
                if ( child.type == 'decl' && child.prop == prop ) {
                    var result = callback(child, i);
                    if ( result === false ) return result;
                }
            });
        }
    }

    eachRule(callback) {
        return this.eachInside( (child, i) => {
            if ( child.type == 'rule' ) {
                var result = callback(child, i);
                if ( result === false ) return result;
            }
        });
    }

    eachAtRule(name, callback) {
        if ( !callback ) {
            callback = name;
            return this.eachInside( (child, i) => {
                if ( child.type == 'atrule' ) {
                    var result = callback(child, i);
                    if ( result === false ) return result;
                }
            });
        } else if ( name instanceof RegExp ) {
            return this.eachInside( (child, i) => {
                if ( child.type == 'atrule' && name.test(child.name) ) {
                    var result = callback(child, i);
                    if ( result === false ) return result;
                }
            });
        } else {
            return this.eachInside( (child, i) => {
                if ( child.type == 'atrule' && child.name == name ) {
                    var result = callback(child, i);
                    if ( result === false ) return result;
                }
            });
        }
    }

    eachComment(callback) {
        return this.eachInside( (child, i) => {
            if ( child.type == 'comment' ) {
                var result = callback(child, i);
                if ( result === false ) return result;
            }
        });
    }

    append(child) {
        var nodes = this.normalize(child, this.last);
        for ( var node of nodes ) this.nodes.push(node);
        return this;
    }

    prepend(child) {
        var nodes = this.normalize(child, this.first, 'prepend').reverse();
        for ( var node of nodes ) this.nodes.unshift(node);

        for ( var id in this.indexes ) {
            this.indexes[id] = this.indexes[id] + nodes.length;
        }

        return this;
    }

    insertBefore(exist, add) {
        exist = this.index(exist);

        var type  = exist === 0 ? 'prepend' : false;
        var nodes = this.normalize(add, this.nodes[exist], type).reverse();
        for ( var node of nodes ) this.nodes.splice(exist, 0, node);

        var index;
        for ( var id in this.indexes ) {
            index = this.indexes[id];
            if ( exist <= index ) {
                this.indexes[id] = index + nodes.length;
            }
        }

        return this;
    }

    insertAfter(exist, add) {
        exist = this.index(exist);

        var nodes = this.normalize(add, this.nodes[exist]).reverse();
        for ( var node of nodes ) this.nodes.splice(exist + 1, 0, node);

        var index;
        for ( var id in this.indexes ) {
            index = this.indexes[id];
            if ( exist < index ) {
                this.indexes[id] = index + nodes.length;
            }
        }

        return this;
    }

    remove(child) {
        child = this.index(child);
        this.nodes[child].parent = undefined;
        this.nodes.splice(child, 1);

        var index;
        for ( var id in this.indexes ) {
            index = this.indexes[id];
            if ( index >= child ) {
                this.indexes[id] = index - 1;
            }
        }

        return this;
    }

    removeAll() {
        for ( var node of this.nodes ) node.parent = undefined;
        this.nodes = [];
        return this;
    }

    replaceValues(regexp, opts, callback) {
        if ( !callback ) {
            callback = opts;
            opts = { };
        }

        this.eachDecl((decl) => {
            if ( opts.props && opts.props.indexOf(decl.prop) == -1 ) return;
            if ( opts.fast  && decl.value.indexOf(opts.fast) == -1 ) return;

            decl.value = decl.value.replace(regexp, callback);
        });

        return this;
    }

    every(condition) {
        return this.nodes.every(condition);
    }

    some(condition) {
        return this.nodes.some(condition);
    }

    index(child) {
        if ( typeof(child) == 'number' ) {
            return child;
        } else {
            return this.nodes.indexOf(child);
        }
    }

    get first() {
        if ( !this.nodes ) return undefined;
        return this.nodes[0];
    }

    get last() {
        if ( !this.nodes ) return undefined;
        return this.nodes[this.nodes.length - 1];
    }

    normalize(nodes, sample) {
        if ( typeof(nodes) == 'string' ) {
            import parse from './parse';
            nodes = parse(nodes).nodes;
        } else if ( !Array.isArray(nodes) ) {
            if ( nodes.type == 'root' ) {
                nodes = nodes.nodes;
            } else if ( nodes.type ) {
                nodes = [nodes];
            } else if ( nodes.prop ) {
                nodes = [new Declaration(nodes)];
            } else if ( nodes.selector ) {
                import Rule from './rule';
                nodes = [new Rule(nodes)];
            } else if ( nodes.name ) {
                import AtRule from './at-rule';
                nodes = [new AtRule(nodes)];
            } else if ( nodes.text ) {
                nodes = [new Comment(nodes)];
            }
        }

        var processed = nodes.map( (child) => {
            if ( child.parent ) child = child.clone();
            if ( typeof(child.before) == 'undefined' ) {
                if ( sample && typeof(sample.before) != 'undefined' ) {
                    child.before = sample.before.replace(/[^\s]/g, '');
                }
            }
            child.parent = this;
            return child;
        });

        return processed;
    }
}
