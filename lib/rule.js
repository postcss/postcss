import Container from './container';
import warnOnce  from './warn-once';
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

    get _selector() {
        warnOnce('Rule#_selector was deprecated. Use Rule#raw.selector');
        return this.raw.selector;
    }

    set _selector(val) {
        warnOnce('Rule#_selector was deprecated. Use Rule#raw.selector');
        this.raw.selector = val;
    }

}
