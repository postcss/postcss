import Container from './container';

export default class AtRule extends Container {
    constructor(defaults) {
        super(defaults);
        this.type = 'atrule';
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
