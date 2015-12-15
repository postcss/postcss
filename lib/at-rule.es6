import Container from './container';
import warnOnce  from './warn-once';

export default class AtRule extends Container {

    type = 'atrule'

    constructor(defaults) {
        super(defaults);
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

    /* istanbul ignore next */
    get afterName() {
        warnOnce('AtRule#afterName was deprecated. Use AtRule#raws.afterName');
        return this.raws.afterName;
    }

    /* istanbul ignore next */
    set afterName(val) {
        warnOnce('AtRule#afterName was deprecated. Use AtRule#raws.afterName');
        this.raws.afterName = val;
    }

    /* istanbul ignore next */
    get _params() {
        warnOnce('AtRule#_params was deprecated. Use AtRule#raws.params');
        return this.raws.params;
    }

    /* istanbul ignore next */
    set _params(val) {
        warnOnce('AtRule#_params was deprecated. Use AtRule#raws.params');
        this.raws.params = val;
    }

}
