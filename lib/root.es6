import Container from './container';

export default class Root extends Container {

    constructor(defaults) {
        super(defaults);
        if ( !this.nodes ) this.nodes = [];
        this.type = 'root';
    }

    remove(child) {
        child = this.index(child);

        if ( child === 0 && this.nodes.length > 1 ) {
            this.nodes[1].raw.before = this.nodes[child].raw.before;
        }

        return super.remove(child);
    }

    normalize(child, sample, type) {
        let nodes = super.normalize(child);

        if ( sample ) {
            if ( type === 'prepend' ) {
                if ( this.nodes.length > 1 ) {
                    sample.raw.before = this.nodes[1].raw.before;
                } else {
                    delete sample.raw.before;
                }
            } else {
                for ( let node of nodes ) {
                    if ( this.first !== sample ) {
                        node.raw.before = sample.raw.before;
                    }
                }
            }
        }

        return nodes;
    }

    toResult(opts = { }) {
        let LazyResult = require('./lazy-result');
        let Processor  = require('./processor');

        let lazy = new LazyResult(new Processor(), this, opts);
        return lazy.stringify();
    }

}
