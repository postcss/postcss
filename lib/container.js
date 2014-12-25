var Node        = require('./node');
var Comment     = require('./comment');
var Declaration = require('./declaration');

// CSS node, that contain another nodes (like at-rules or rules with selectors)
class Container extends Node {

    // Stringify container children
    stringifyContent(builder) {
        if ( !this.nodes ) return;

        var i, last = this.nodes.length - 1;
        while ( last > 0 ) {
            if ( this.nodes[last].type != 'comment' ) break;
            last -= 1;
        }

        for ( i = 0; i < this.nodes.length; i++ ) {
            this.nodes[i].stringify(builder, last != i || this.semicolon);
        }
    }

    // Stringify node with start (for example, selector) and brackets block
    // with child inside
    stringifyBlock(builder, start) {
        var before = this.style('before', 'before');
        if ( before ) builder(before);

        var between = this.style('between', 'beforeOpen');
        builder(start + between + '{', this, 'start');

        var after;
        if ( this.nodes && this.nodes.length ) {
            this.stringifyContent(builder);
            after = this.style('after', 'after');
        } else {
            after = this.style('after', 'emptyBody');
        }

        if ( after ) builder(after);
        builder('}', this, 'end');
    }

    // Add child to end of list without any checks.
    // Please, use `append()` method, `push()` is mostly for parser.
    push(child) {
        child.parent = this;
        this.nodes.push(child);
        return this;
    }

    // Execute `callback` on every child element. First arguments will be child
    // node, second will be index.
    //
    //   css.each( (rule, i) => {
    //       console.log(rule.type + ' at ' + i);
    //   });
    //
    // It is safe for add and remove elements to list while iterating:
    //
    //  css.each( (rule) => {
    //      css.insertBefore( rule, addPrefix(rule) );
    //      # On next iteration will be next rule, regardless of that
    //      # list size was increased
    //  });
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

    // Execute callback on every child in all rules inside.
    //
    // First argument will be child node, second will be index inside parent.
    //
    //   css.eachInside( (node, i) => {
    //       console.log(node.type + ' at ' + i);
    //   });
    //
    // Also as `each` it is safe of insert/remove nodes inside iterating.
    eachInside(callback) {
        return this.each( (child, i) => {
            var result = callback(child, i);

            if ( result !== false && child.eachInside ) {
                result = child.eachInside(callback);
            }

            if ( result === false ) return result;
        });
    }

    // Execute callback on every declaration in all rules inside.
    // It will goes inside at-rules recursivelly.
    //
    // First argument will be declaration node, second will be index inside
    // parent rule.
    //
    //   css.eachDecl( (decl, i) => {
    //       console.log(decl.prop + ' in ' + decl.parent.selector + ':' + i);
    //   });
    //
    // Also as `each` it is safe of insert/remove nodes inside iterating.
    eachDecl(callback) {
        return this.eachInside( (child, i) => {
            if ( child.type == 'decl' ) {
                var result = callback(child, i);
                if ( result === false ) return result;
            }
        });
    }

    // Execute `callback` on every rule in conatiner and inside child at-rules.
    //
    // First argument will be rule node, second will be index inside parent.
    //
    //   css.eachRule( (rule, i) => {
    //       if ( parent.type == 'atrule' ) {
    //           console.log(rule.selector + ' in ' + rule.parent.name);
    //       } else {
    //           console.log(rule.selector + ' at ' + i);
    //       }
    //   });
    eachRule(callback) {
        return this.eachInside( (child, i) => {
            if ( child.type == 'rule' ) {
                var result = callback(child, i);
                if ( result === false ) return result;
            }
        });
    }

    // Execute `callback` on every at-rule in conatiner and inside at-rules.
    //
    // First argument will be at-rule node, second will be index inside parent.
    //
    //   css.eachAtRule( (atrule, parent, i) => {
    //       if ( parent.type == 'atrule' ) {
    //           console.log(atrule.name + ' in ' + atrule.parent.name);
    //       } else {
    //           console.log(atrule.name + ' at ' + i);
    //       }
    //   });
    eachAtRule(callback) {
        return this.eachInside( (child, i) => {
            if ( child.type == 'atrule' ) {
                var result = callback(child, i);
                if ( result === false ) return result;
            }
        });
    }

    // Execute callback on every block comment (only between rules
    // and declarations, not inside selectors and values) in all rules inside.
    //
    // First argument will be comment node, second will be index inside
    // parent rule.
    //
    //   css.eachComment( (comment, i) => {
    //       console.log(comment.content + ' at ' + i);
    //   });
    //
    // Also as `each` it is safe of insert/remove nodes inside iterating.
    eachComment(callback) {
        return this.eachInside( (child, i) => {
            if ( child.type == 'comment' ) {
                var result = callback(child, i);
                if ( result === false ) return result;
            }
        });
    }

    // Add child to container.
    //
    //   css.append(rule);
    //
    // You can add declaration by hash:
    //
    //   rule.append({ prop: 'color', value: 'black' });
    append(child) {
        var nodes = this.normalize(child, this.last);
        for ( var i = 0; i < nodes.length; i++ ) {
            this.nodes.push(nodes[i]);
        }
        return this;
    }

    // Add child to beginning of container
    //
    //   css.prepend(rule);
    //
    // You can add declaration by hash:
    //
    //   rule.prepend({ prop: 'color', value: 'black' });
    prepend(child) {
        var nodes = this.normalize(child, this.first, 'prepend').reverse();
        for ( var i = 0; i < nodes.length; i++ ) {
            this.nodes.unshift(nodes[i]);
        }

        for ( var id in this.indexes ) {
            this.indexes[id] = this.indexes[id] + nodes.length;
        }

        return this;
    }

    // Insert new `added` child before `exist`.
    // You can set node object or node index (it will be faster) in `exist`.
    //
    //   css.insertAfter(1, rule);
    //
    // You can add declaration by hash:
    //
    //   rule.insertBefore(1, { prop: 'color', value: 'black' });
    insertBefore(exist, add) {
        exist = this.index(exist);

        var type   = exist === 0 ? 'prepend' : false;
        var nodes = this.normalize(add, this.nodes[exist], type).reverse();
        for ( var i = 0; i < nodes.length; i++ ) {
            this.nodes.splice(exist, 0, nodes[i]);
        }

        var index;
        for ( var id in this.indexes ) {
            index = this.indexes[id];
            if ( exist <= index ) {
                this.indexes[id] = index + nodes.length;
            }
        }

        return this;
    }

    // Insert new `added` child after `exist`.
    // You can set node object or node index (it will be faster) in `exist`.
    //
    //   css.insertAfter(1, rule);
    //
    // You can add declaration by hash:
    //
    //   rule.insertAfter(1, { prop: 'color', value: 'black' });
    insertAfter(exist, add) {
        exist = this.index(exist);

        var nodes = this.normalize(add, this.nodes[exist]).reverse();
        for ( var i = 0; i < nodes.length; i++ ) {
            this.nodes.splice(exist + 1, 0, nodes[i]);
        }

        var index;
        for ( var id in this.indexes ) {
            index = this.indexes[id];
            if ( exist < index ) {
                this.indexes[id] = index + nodes.length;
            }
        }

        return this;
    }

    // Remove `child` by index or node.
    //
    //   css.remove(2);
    remove(child) {
        child = this.index(child);
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

    // Return true if all nodes return true in `condition`.
    // Just shorcut for `nodes.every`.
    every(condition) {
        return this.nodes.every(condition);
    }

    // Return true if one or more nodes return true in `condition`.
    // Just shorcut for `nodes.some`.
    some(condition) {
        return this.nodes.some(condition);
    }

    // Return index of child
    index(child) {
        if ( typeof(child) == 'number' ) {
            return child;
        } else {
            return this.nodes.indexOf(child);
        }
    }

    // Shortcut to get first child
    get first() {
        if ( !this.nodes ) return undefined;
        return this.nodes[0];
    }

    // Shortcut to get first child
    get last() {
        if ( !this.nodes ) return undefined;
        return this.nodes[this.nodes.length - 1];
    }

    // Normalize child before insert. Copy before from `sample`.
    normalize(nodes, sample) {
        if ( !Array.isArray(nodes) ) {
            if ( nodes.type == 'root' ) {
                nodes = nodes.nodes;
            } else if ( nodes.type ) {
                nodes = [nodes];
            } else if ( nodes.prop ) {
                nodes = [new Declaration(nodes)];
            } else if ( nodes.selector ) {
                var Rule = require('./rule');
                nodes = [new Rule(nodes)];
            } else if ( nodes.name ) {
                var AtRule = require('./at-rule');
                nodes = [new AtRule(nodes)];
            } else if ( nodes.text ) {
                nodes = [new Comment(nodes)];
            }
        }

        var processed = nodes.map( (child) => {
            if ( child.parent ) child = child.clone();
            if ( typeof(child.before) == 'undefined' && sample ) {
                child.before = sample.before;
            }
            child.parent = this;
            return child;
        });

        return processed;
    }
}

module.exports = Container;
