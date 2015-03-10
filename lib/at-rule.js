import Container from './container';

export default class AtRule extends Container {
    constructor(defaults) {
        this.type = 'atrule';
        super(defaults);
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

    append(child) {
        if ( !this.nodes ) this.nodes = [];
        return super.append(child);
    }

    prepend(child) {
        if ( !this.nodes ) this.nodes = [];
        return super.prepend(child);
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
