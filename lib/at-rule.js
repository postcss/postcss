import Container from './container';
import warnOnce  from './warn-once';

export default class AtRule extends Container {

    constructor(defaults) {
        super(defaults);
        this.type = 'atrule';
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

    get afterName() {
        warnOnce('AtRule#afterName was deprecated. Use AtRule#raw.afterName');
        return this.raw.afterName;
    }

    set afterName(val) {
        warnOnce('AtRule#afterName was deprecated. Use AtRule#raw.afterName');
        return this.raw.afterName = val;
    }

}
