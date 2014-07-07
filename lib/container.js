var Node        = require('./node');
var Declaration = require('./declaration');

// CSS node, that contain another nodes (like at-rules or rules with selectors)
class Container extends Node {
    // Stringify container childs
    stringifyContent(builder) {
        if ( !this.rules && !this.decls ) return;

        if ( this.rules ) {
            var last = this.rules.length - 1;
            for ( var i = 0; i < this.rules.length; i++ ) {
                this.rules[i].stringify(builder, last == i);
            }

        } else if ( this.decls ) {
            var last = this.decls.length - 1;
            for ( var i = 0; i < this.decls.length; i++ ) {
                this.decls[i].stringify(builder, last != i || this.semicolon);
            }
        }
    }

    // Generate default spaces before }
    defaultAfter() {
        if ( this.list.length == 0 ) {
            return '';
        } else {
            var last = this.list[0].before;
            if ( typeof(last) != 'undefined' && last.indexOf("\n") == -1 ) {
                return this.list[0].before;
            } else {
                return "\n";
            }
        }
    }

    // Stringify node with start (for example, selector) and brackets block
    // with child inside
    stringifyBlock(builder, start) {
        var style = this.style();

        if ( this.before ) builder(this.before);
        builder(start, this, 'start');

        this.stringifyContent(builder);

        if ( style.after ) builder(style.after);
        builder('}', this, 'end');
    }

    // Add child to end of list without any checks.
    // Please, use `append()` method, `push()` is mostly for parser.
    push(child) {
        child.parent = this;
        this.list.push(child);
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

        var list = this.list;
        if ( !list ) return;

        var index, result;
        while ( this.indexes[id] < list.length ) {

          var index  = this.indexes[id];
          result = callback(list[index], index);
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
        // Different realization will be inside subclasses
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
        var childs = this.normalize(child, this.list[this.list.length - 1]);
        for ( child of childs ) {
            this.list.push(child);
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
        var childs = this.normalize(child, this.list[0], 'prepend').reverse();
        for ( child of childs ) {
            this.list.unshift(child);
        }

        for ( var id in this.indexes ) {
            this.indexes[id] = this.indexes[id] + childs.length;
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
        var exist  = this.index(exist);
        var type   = exist == 0 ? 'prepend' : false;
        var childs = this.normalize(add, this.list[exist], type).reverse();
        for ( var child of childs ) {
            this.list.splice(exist, 0, child);
        }

        for ( var id in this.indexes ) {
            this.indexes[id] = this.indexes[id] + childs.length;
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
        var exist  = this.index(exist);
        var childs = this.normalize(add, this.list[exist]).reverse();
        for ( var child of childs ) {
            this.list.splice(exist + 1, 0, child);
        }

        for ( var id in this.indexes ) {
            this.indexes[id] = this.indexes[id] + childs.length;
        }

        return this;
    }

    // Remove `child` by index or node.
    //
    //   css.remove(2);
    remove(child) {
        var child = this.index(child);
        this.list.splice(child, 1);

        for ( var id in this.indexes ) {
            var index = this.indexes[id];
            if ( index >= child ) {
                this.indexes[id] = index - 1
            }
        }

        return this;
    }

    // Return true if all childs return true in `condition`.
    // Just shorcut for `list.every`.
    every(condition) {
        return this.list.every(condition);
    }

    // Return true if one or more childs return true in `condition`.
    // Just shorcut for `list.some`.
    some(condition) {
        return this.list.some(condition);
    }

    // Return index of child
    index(child) {
        if ( typeof(child) == 'number' ) {
            return child;
        } else {
            return this.list.indexOf(child);
        }
    }

    // Shortcut to get first child
    get first() {
        if ( !this.list ) return undefined;
        return this.list[0];
    }

    // Shortcut to get first child
    get last() {
        if ( !this.list ) return undefined;
        return this.list[this.list.length - 1];
    }

    // Shortcut to get current list
    get list() {
        return this.rules || this.decls;
    }

    // Normalize child before insert. Copy before from `sample`.
    normalize(child, sample) {
        if ( child.type == 'root' ) {
            return this.normalize(child.rules, sample)

        } else {
            var childs;
            if ( Array.isArray(child) ) {
                childs = child.map( i => i.clone() );
            } else {
                childs = [child];
            }

            for ( child of childs ) {
                child.parent = this;
                if ( typeof(child.before) == 'undefined' && sample ) {
                    child.before = sample.before;
                }
            }

            return childs;
        }
    }
}

// Container with another rules, like this.media at-rule
 Container.WithRules = class extends Container {
    constructor(defaults) {
        this.rules = [];
        super(defaults);
    }

    // Execute `callback` on every declaration in all rules inside.
    // It will goes inside at-rules recursivelly.
    //
    // See documentation in `Container#eachDecl`.
    eachDecl(callback) {
        return this.each( (child) => {
            if ( child.eachDecl ) {
                var result = child.eachDecl(callback);
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
        return this.each( (child, i) => {
            var result;
            if ( child.type == 'rule' ) {
                result = callback(child, i);
            } else if ( child.eachRule ) {
                var result = child.eachRule(callback);
            }
            if ( result === false ) return result;
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
}

// Container with another rules, like this.media at-rule
 Container.WithDecls = class extends Container {
    constructor(defaults) {
        this.decls = [];
        super(defaults);
    }

    // Allow to define new declaration as hash
    normalize(child, sample, type) {
        if ( !child.type && !Array.isArray(child) ) {
            child = new Declaration(child);
        }
        return super(child, sample, type);
    }

    // Execute callback on every declaration.
    //
    // See documentation in `Container#eachDecl`.
    eachDecl(callback) {
        return this.each( (child, i) => {
            if ( child.type == 'decl' ) {
                var result = callback(child, i);
                if ( result === false ) return result;
            }
        });
    }
}

module.exports = Container;
