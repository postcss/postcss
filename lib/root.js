import Container from './container';
import warnOnce  from './warn-once';

export default class Root extends Container {

    type = 'root';

    constructor(defaults) {
        super(defaults);
        if ( !this.nodes ) this.nodes = [];
    }

    removeChild(child) {
        child = this.index(child);

        if ( child === 0 && this.nodes.length > 1 ) {
            this.nodes[1].raws.before = this.nodes[child].raws.before;
        }

        return super.removeChild(child);
    }

    normalize(child, sample, type) {
        let nodes = super.normalize(child);

        if ( sample ) {
            if ( type === 'prepend' ) {
                if ( this.nodes.length > 1 ) {
                    sample.raws.before = this.nodes[1].raws.before;
                } else {
                    delete sample.raws.before;
                }
            } else {
                for ( let node of nodes ) {
                    if ( this.first !== sample ) {
                        node.raws.before = sample.raws.before;
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

    remove(child) {
        warnOnce('Root#remove is deprecated. Use Root#removeChild');
        this.removeChild(child);
    }

    prevMap() {
        warnOnce('Root#prevMap is deprecated. Use Root#source.input.map');
        return this.source.input.map;
    }

}
