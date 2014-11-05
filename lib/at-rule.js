var Container = require('./container');

// CSS at-rule like “this.keyframes name { }”.
//
// Can contain declarations (like this.font-face or this.page) ot another rules.
class AtRule extends Container {
    constructor(defaults) {
        this.type = 'atrule';
        super(defaults);
    }

    // Stringify at-rule
    stringify(builder, semicolon) {
        var name   = '@' + this.name;
        var params = this.params ? this.stringifyRaw('params') : '';

        if ( typeof(this.afterName) != 'undefined' ) {
            name += this.afterName;
        } else if ( params ) {
            name += ' ';
        }

        if ( this.childs ) {
            this.stringifyBlock(builder, name + params);

        } else {
            var before = this.style('beforeRule');
            if ( before ) builder(before);
            var end = (this.between || '') + (semicolon ? ';' : '');
            builder(name + params + end, this);
        }
    }

    // Hack to mark, that at-rule contains childs
    append(child) {
        if ( !this.childs ) this.childs = [];
        return super(child);
    }

    // Hack to mark, that at-rule contains childs
    prepend(child) {
        if ( !this.childs ) this.childs = [];
        return super(child);
    }

    // Hack to mark, that at-rule contains childs
    insertBefore(exist, add) {
        if ( !this.childs ) this.childs = [];
        return super(exist, add);
    }

    // Hack to mark, that at-rule contains childs
    insertAfter(exist, add) {
        if ( !this.childs ) this.childs = [];
        return super(exist, add);
    }
}

module.exports = AtRule;
