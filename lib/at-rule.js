import Container from './container';

export default class AtRule extends Container {
    constructor(defaults) {
        super(defaults);
        this.type = 'atrule';
    }

    stringify(builder, semicolon) {
        let name   = '@' + this.name;
        let params = this.params ? this.stringifyRaw('params') : '';

        if ( typeof this.afterName !== 'undefined' ) {
            name += this.afterName;
        } else if ( params ) {
            name += ' ';
        }

        if ( this.nodes ) {
            this.stringifyBlock(builder, name + params);

        } else {
            let before = this.style('before');
            if ( before ) builder(before);
            let end = (this.between || '') + (semicolon ? ';' : '');
            builder(name + params + end, this);
        }
    }

    append(...children) {
        if ( !this.nodes ) this.nodes = [];
        return super.append(...children);
    }

    prepend(...children) {
        if ( !this.nodes ) this.nodes = [];
        return super.prepend(...children);
    }

    insertBefore(exist, add) {
        if ( !this.nodes ) this.nodes = [];
        return super.insertBefore(exist, add);
    }

    insertAfter(exist, add) {
        if ( !this.nodes ) this.nodes = [];
        return super.insertAfter(exist, add);
    }
}
