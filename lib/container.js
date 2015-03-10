import Declaration from './declaration';
import Comment     from './comment';
import Node        from './node';

export default class Container extends Node {

    stringifyContent(builder) {
        if ( !this.nodes ) return;

        let i, last = this.nodes.length - 1;
        while ( last > 0 ) {
            if ( this.nodes[last].type !== 'comment' ) break;
            last -= 1;
        }

        let semicolon = this.style('semicolon');
        for ( i = 0; i < this.nodes.length; i++ ) {
            this.nodes[i].stringify(builder, last !== i || semicolon);
        }
    }

    stringifyBlock(builder, start) {
        let before = this.style('before');
        if ( before ) builder(before);

        let between = this.style('between', 'beforeOpen');
        builder(start + between + '{', this, 'start');

        let after;
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
        let id = this.lastEach;
        this.indexes[id] = 0;

        if ( !this.nodes ) return undefined;

        let index, result;
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
            let result = callback(child, i);

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
                if ( child.type === 'decl' ) {
                    let result = callback(child, i);
                    if ( result === false ) return result;
                }
            });
        } else if ( prop instanceof RegExp ) {
            return this.eachInside( (child, i) => {
                if ( child.type === 'decl' && prop.test(child.prop) ) {
                    let result = callback(child, i);
                    if ( result === false ) return result;
                }
            });
        } else {
            return this.eachInside( (child, i) => {
                if ( child.type === 'decl' && child.prop === prop ) {
                    let result = callback(child, i);
                    if ( result === false ) return result;
                }
            });
        }
    }

    eachRule(callback) {
        return this.eachInside( (child, i) => {
            if ( child.type === 'rule' ) {
                let result = callback(child, i);
                if ( result === false ) return result;
            }
        });
    }

    eachAtRule(name, callback) {
        if ( !callback ) {
            callback = name;
            return this.eachInside( (child, i) => {
                if ( child.type === 'atrule' ) {
                    let result = callback(child, i);
                    if ( result === false ) return result;
                }
            });
        } else if ( name instanceof RegExp ) {
            return this.eachInside( (child, i) => {
                if ( child.type === 'atrule' && name.test(child.name) ) {
                    let result = callback(child, i);
                    if ( result === false ) return result;
                }
            });
        } else {
            return this.eachInside( (child, i) => {
                if ( child.type === 'atrule' && child.name === name ) {
                    let result = callback(child, i);
                    if ( result === false ) return result;
                }
            });
        }
    }

    eachComment(callback) {
        return this.eachInside( (child, i) => {
            if ( child.type === 'comment' ) {
                let result = callback(child, i);
                if ( result === false ) return result;
            }
        });
    }

    append(child) {
        let nodes = this.normalize(child, this.last);
        for ( let node of nodes ) this.nodes.push(node);
        return this;
    }

    prepend(child) {
        let nodes = this.normalize(child, this.first, 'prepend').reverse();
        for ( let node of nodes ) this.nodes.unshift(node);

        for ( let id in this.indexes ) {
            this.indexes[id] = this.indexes[id] + nodes.length;
        }

        return this;
    }

    insertBefore(exist, add) {
        exist = this.index(exist);

        let type  = exist === 0 ? 'prepend' : false;
        let nodes = this.normalize(add, this.nodes[exist], type).reverse();
        for ( let node of nodes ) this.nodes.splice(exist, 0, node);

        let index;
        for ( let id in this.indexes ) {
            index = this.indexes[id];
            if ( exist <= index ) {
                this.indexes[id] = index + nodes.length;
            }
        }

        return this;
    }

    insertAfter(exist, add) {
        exist = this.index(exist);

        let nodes = this.normalize(add, this.nodes[exist]).reverse();
        for ( let node of nodes ) this.nodes.splice(exist + 1, 0, node);

        let index;
        for ( let id in this.indexes ) {
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

        let index;
        for ( let id in this.indexes ) {
            index = this.indexes[id];
            if ( index >= child ) {
                this.indexes[id] = index - 1;
            }
        }

        return this;
    }

    removeAll() {
        for ( let node of this.nodes ) node.parent = undefined;
        this.nodes = [];
        return this;
    }

    replaceValues(regexp, opts, callback) {
        if ( !callback ) {
            callback = opts;
            opts = { };
        }

        this.eachDecl((decl) => {
            if ( opts.props && opts.props.indexOf(decl.prop) === -1 ) return;
            if ( opts.fast  && decl.value.indexOf(opts.fast) === -1 ) return;

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
        if ( typeof child === 'number' ) {
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
        if ( typeof nodes === 'string' ) {
            let parse = require('./parse');
            nodes = parse(nodes).nodes;
        } else if ( !Array.isArray(nodes) ) {
            if ( nodes.type === 'root' ) {
                nodes = nodes.nodes;
            } else if ( nodes.type ) {
                nodes = [nodes];
            } else if ( nodes.prop ) {
                nodes = [new Declaration(nodes)];
            } else if ( nodes.selector ) {
                let Rule = require('./rule');
                nodes = [new Rule(nodes)];
            } else if ( nodes.name ) {
                let AtRule = require('./at-rule');
                nodes = [new AtRule(nodes)];
            } else if ( nodes.text ) {
                nodes = [new Comment(nodes)];
            }
        }

        let processed = nodes.map( (child) => {
            if ( child.parent ) child = child.clone();
            if ( typeof child.before === 'undefined' ) {
                if ( sample && typeof sample.before !== 'undefined' ) {
                    child.before = sample.before.replace(/[^\s]/g, '');
                }
            }
            child.parent = this;
            return child;
        });

        return processed;
    }
}
