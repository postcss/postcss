var Container = require('./container');

// CSS at-rule like “this.keyframes name { }”.
//
// Can contain declarations (like this.font-face or this.page) ot another rules.
class AtRule extends Container {
    constructor(defaults) {
        this.type = 'atrule';
        super(defaults);
    }

    // Different style for this.encoding and this.page at-rules.
    styleType() {
        return this.type + (this.childs ? '-body' : '-bodiless');
    }

    defaultStyle(type) {
        if ( type == 'atrule-body' ) {
            return { between: ' ', after: this.defaultAfter() };
        } else {
            return { between: '' };
        }
    }

    // Stringify at-rule
    stringify(builder, semicolon) {
        var style = this.style();

        var name   = '@' + this.name;
        var params = this.params ? this.stringifyRaw('params') : '';

        if ( typeof(this.afterName) != 'undefined' ) {
            name += this.afterName;
        } else if ( params ) {
            name += ' ';
        }

        if ( this.childs ) {
            this.stringifyBlock(builder, name + params + style.between + '{');

        } else {
            if ( this.before ) builder(this.before);
            var end = semicolon ? ';' : '';
            builder(name + params + style.between + end, this);
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
