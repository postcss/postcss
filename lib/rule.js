import Container from './container';
import list      from './list';

export default class Rule extends Container {
    constructor(defaults) {
        super(defaults);
        if ( !this.nodes ) this.nodes = [];
        this.type = 'rule';
    }

    get selectors() {
        return list.comma(this.selector);
    }

    set selectors(values) {
        this.selector = values.join(', ');
    }

}
