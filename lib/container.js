import Declaration from './declaration';
import warnOnce    from './warn-once';
import Comment     from './comment';
import Node        from './node';

let lastEach = 0;

export default class Container extends Node {

    push(child) {
        child.parent = this;
        this.nodes.push(child);
        return this;
    }

    each(callback) {
        if ( !this.indexes ) this.indexes = { };

        lastEach += 1;
        let id = lastEach;
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
        if ( Object.keys(this.indexes).length === 0 ) delete this.indexes;

        if ( result === false ) return false;
    }

    walk(callback) {
        return this.each( (child, i) => {
            let result = callback(child, i);

            if ( result !== false && child.walk ) {
                result = child.walk(callback);
            }

            if ( result === false ) return result;
        });
    }

    walkDecls(prop, callback) {
        if ( !callback ) {
            callback = prop;
            return this.walk( (child, i) => {
                if ( child.type === 'decl' ) {
                    let result = callback(child, i);
                    if ( result === false ) return result;
                }
            });
        } else if ( prop instanceof RegExp ) {
            return this.walk( (child, i) => {
                if ( child.type === 'decl' && prop.test(child.prop) ) {
                    let result = callback(child, i);
                    if ( result === false ) return result;
                }
            });
        } else {
            return this.walk( (child, i) => {
                if ( child.type === 'decl' && child.prop === prop ) {
                    let result = callback(child, i);
                    if ( result === false ) return result;
                }
            });
        }
    }

    walkRules(selector, callback) {
        if ( !callback ) {
            callback = selector;

            return this.walk( (child, i) => {
                if ( child.type === 'rule' ) {
                    let result = callback(child, i);
                    if ( result === false ) return result;
                }
            });
        } else if ( selector instanceof RegExp ) {
            return this.walk( (child, i) => {
                if ( child.type === 'rule' && selector.test(child.selector) ) {
                    let result = callback(child, i);
                    if ( result === false ) return result;
                }
            });
        } else {
            return this.walk( (child, i) => {
                if ( child.type === 'rule' && child.selector === selector ) {
                    let result = callback(child, i);
                    if ( result === false ) return result;
                }
            });
        }
    }

    walkAtRules(name, callback) {
        if ( !callback ) {
            callback = name;
            return this.walk( (child, i) => {
                if ( child.type === 'atrule' ) {
                    let result = callback(child, i);
                    if ( result === false ) return result;
                }
            });
        } else if ( name instanceof RegExp ) {
            return this.walk( (child, i) => {
                if ( child.type === 'atrule' && name.test(child.name) ) {
                    let result = callback(child, i);
                    if ( result === false ) return result;
                }
            });
        } else {
            return this.walk( (child, i) => {
                if ( child.type === 'atrule' && child.name === name ) {
                    let result = callback(child, i);
                    if ( result === false ) return result;
                }
            });
        }
    }

    walkComments(callback) {
        return this.walk( (child, i) => {
            if ( child.type === 'comment' ) {
                let result = callback(child, i);
                if ( result === false ) return result;
            }
        });
    }

    append(...children) {
        for ( let child of children ) {
            let nodes = this.normalize(child, this.last);
            for ( let node of nodes ) this.nodes.push(node);
        }
        return this;
    }

    prepend(...children) {
        children = children.reverse();
        for ( let child of children ) {
            let nodes = this.normalize(child, this.first, 'prepend').reverse();
            for ( let node of nodes ) this.nodes.unshift(node);
            for ( let id in this.indexes ) {
                this.indexes[id] = this.indexes[id] + nodes.length;
            }
        }
        return this;
    }

    cleanRaws(keepBetween) {
        super(keepBetween);
        if ( this.nodes ) {
            for ( let node of this.nodes ) node.cleanRaws(keepBetween);
        }
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
        if ( typeof child !== 'undefined' ) {
            warnOnce('Container#remove is deprecated. ' +
                     'Use Container#removeChild');
            this.removeChild(child);
        } else {
            super.remove();
        }
        return this;
    }

    removeChild(child) {
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

        this.walkDecls((decl) => {
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
                if ( typeof nodes.value === 'undefined' ) {
                    throw new Error('Value field is missed in node creation');
                }
                nodes = [new Declaration(nodes)];
            } else if ( nodes.selector ) {
                let Rule = require('./rule');
                nodes = [new Rule(nodes)];
            } else if ( nodes.name ) {
                let AtRule = require('./at-rule');
                nodes = [new AtRule(nodes)];
            } else if ( nodes.text ) {
                nodes = [new Comment(nodes)];
            } else {
                throw new Error('Unknown node type in node creation');
            }
        }

        let processed = nodes.map( (i) => {
            if ( typeof i.raws === 'undefined' ) i = this.rebuild(i);
            if ( i.parent ) i = i.clone();
            if ( typeof i.raws.before === 'undefined' ) {
                if ( sample && typeof sample.raws.before !== 'undefined' ) {
                    i.raws.before = sample.raws.before.replace(/[^\s]/g, '');
                }
            }
            i.parent = this;
            return i;
        });

        return processed;
    }

    rebuild(node, parent) {
        let fix;
        if ( node.type === 'root' ) {
            let Root = require('./root');
            fix = new Root();
        } else if ( node.type === 'atrule' ) {
            let AtRule = require('./at-rule');
            fix = new AtRule();
        } else if ( node.type === 'rule' ) {
            let Rule = require('./rule');
            fix = new Rule();
        } else if ( node.type === 'decl' ) {
            fix = new Declaration();
        } else if ( node.type === 'comment' ) {
            fix = new Comment();
        }

        for ( let i in node ) {
            if ( i === 'nodes' ) {
                fix.nodes = node.nodes.map( j => this.rebuild(j, fix) );
            } else if ( i === 'parent' && parent ) {
                fix.parent = parent;
            } else if ( node.hasOwnProperty(i) ) {
                fix[i] = node[i];
            }
        }

        return fix;
    }

    eachInside(callback) {
        warnOnce('Container#eachInside is deprecated. ' +
                 'Use Container#walk instead.');
        return this.walk(callback);
    }

    eachDecl(prop, callback) {
        warnOnce('Container#eachDecl is deprecated. ' +
                 'Use Container#walkDecls instead.');
        return this.walkDecls(prop, callback);
    }

    eachRule(selector, callback) {
        warnOnce('Container#eachRule is deprecated. ' +
                 'Use Container#walkRules instead.');
        return this.walkRules(selector, callback);
    }

    eachAtRule(name, callback) {
        warnOnce('Container#eachAtRule is deprecated. ' +
                 'Use Container#walkAtRules instead.');
        return this.walkAtRules(name, callback);
    }

    eachComment(callback) {
        warnOnce('Container#eachComment is deprecated. ' +
                 'Use Container#walkComments instead.');
        return this.walkComments(callback);
    }

    get semicolon() {
        warnOnce('Node#semicolon is deprecated. Use Node#raws.semicolon');
        return this.raws.semicolon;
    }

    set semicolon(val) {
        warnOnce('Node#semicolon is deprecated. Use Node#raws.semicolon');
        this.raws.semicolon = val;
    }

    get after() {
        warnOnce('Node#after is deprecated. Use Node#raws.after');
        return this.raws.after;
    }

    set after(val) {
        warnOnce('Node#after is deprecated. Use Node#raws.after');
        this.raws.after = val;
    }

}
