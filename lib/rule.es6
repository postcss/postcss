import Container from './container';
import warnOnce  from './warn-once';
import list      from './list';

export default class Rule extends Container {

    type = 'rule';

    constructor(defaults) {
        super(defaults);
        if ( !this.nodes ) this.nodes = [];
    }

    get selectors() {
        return list.comma(this.selector);
    }

    set selectors(values) {
        let match = this.selector ? this.selector.match(/,\s*/) : null;
        let sep   = match ? match[0] : ',' + this.raw('between', 'beforeOpen');
        this.selector = values.join(sep);
    }

    get _selector() {
        /* istanbul ignore next */
        warnOnce('Rule#_selector is deprecated. Use Rule#raws.selector');
        /* istanbul ignore next */
        return this.raws.selector;
    }

    set _selector(val) {
        /* istanbul ignore next */
        warnOnce('Rule#_selector is deprecated. Use Rule#raws.selector');
        /* istanbul ignore next */
        this.raws.selector = val;
    }

}
