import Container from './container';

// CSS at-rule like “this.keyframes name { }”.
//
// Can contain declarations (like this.font-face or this.page) ot another rules.
export default class AtRule extends Container {
    constructor(defaults) {
        this.type = 'atrule';
        super(defaults);
    }

    // Stringify at-rule
    stringify(builder, semicolon) {
        var name   = '@' + this.name;
        var params = this.params ? this.stringifyRaw('params') : '';

        if ( this.afterName ) {
            name += this.afterName;
        } else if ( params ) {
            name += ' ';
        }

        if ( this.nodes ) {
            this.stringifyBlock(builder, name + params);

        } else {
            var before = this.style('before');
            if ( before ) builder(before);
            var end = (this.between || '') + (semicolon ? ';' : '');
            builder(name + params + end, this);
        }
    }

    // Hack to mark, that at-rule contains children
    append(child) {
        if ( !this.nodes ) this.nodes = [];
        return super.append(child);
    }

    // Hack to mark, that at-rule contains children
    prepend(child) {
        if ( !this.nodes ) this.nodes = [];
        return super.prepend(child);
    }

    // Hack to mark, that at-rule contains children
    insertBefore(exist, add) {
        if ( !this.nodes ) this.nodes = [];
        return super.insertBefore(exist, add);
    }

    // Hack to mark, that at-rule contains children
    insertAfter(exist, add) {
        if ( !this.nodes ) this.nodes = [];
        return super.insertAfter(exist, add);
    }
}
