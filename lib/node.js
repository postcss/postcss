import CssSyntaxError from './css-syntax-error';
import Stringifier    from './stringifier';
import warnOnce       from './warn-once';

let cloneNode = function (obj, parent) {
    let cloned = new obj.constructor();

    for ( let i in obj ) {
        if ( !obj.hasOwnProperty(i) ) continue;
        let value = obj[i];
        let type  = typeof value;

        if ( i === 'parent' && type === 'object' ) {
            if (parent) cloned[i] = parent;
        } else if ( i === 'source' ) {
            cloned[i] = value;
        } else if ( value instanceof Array ) {
            cloned[i] = value.map( j => cloneNode(j, cloned) );
        } else if ( i !== 'before'  && i !== 'after' &&
                    i !== 'between' && i !== 'semicolon' ) {
            if ( type === 'object' ) value = cloneNode(value);
            cloned[i] = value;
        }
    }

    return cloned;
};

export default class Node {

    constructor(defaults = { }) {
        this.raw = { };
        for ( let name in defaults ) {
            this[name] = defaults[name];
        }
    }

    error(message, opts = { }) {
        if ( this.source ) {
            let pos = this.source.start;
            return this.source.input.error(message, pos.line, pos.column, opts);
        } else {
            return new CssSyntaxError(message);
        }
    }

    removeSelf() {
        if ( this.parent ) {
            this.parent.remove(this);
        }
        this.parent = undefined;
        return this;
    }

    replace(nodes) {
        this.parent.insertBefore(this, nodes);
        this.parent.remove(this);
        return this;
    }

    toString() {
        let result  = '';
        let str = new Stringifier( i => result += i );
        str.stringify(this);
        return result;
    }

    clone(overrides = { }) {
        let cloned = cloneNode(this);
        for ( let name in overrides ) {
            cloned[name] = overrides[name];
        }
        return cloned;
    }

    cloneBefore(overrides = { }) {
        let cloned = this.clone(overrides);
        this.parent.insertBefore(this, cloned);
        return cloned;
    }

    cloneAfter(overrides = { }) {
        let cloned = this.clone(overrides);
        this.parent.insertAfter(this, cloned);
        return cloned;
    }

    replaceWith(node) {
        this.parent.insertBefore(this, node);
        this.removeSelf();
        return this;
    }

    moveTo(container) {
        this.cleanStyles(this.root() === container.root());
        this.removeSelf();
        container.append(this);
        return this;
    }

    moveBefore(node) {
        this.cleanStyles(this.root() === node.root());
        this.removeSelf();
        node.parent.insertBefore(node, this);
        return this;
    }

    moveAfter(node) {
        this.cleanStyles(this.root() === node.root());
        this.removeSelf();
        node.parent.insertAfter(node, this);
        return this;
    }

    next() {
        let index = this.parent.index(this);
        return this.parent.nodes[index + 1];
    }

    prev() {
        let index = this.parent.index(this);
        return this.parent.nodes[index - 1];
    }

    toJSON() {
        let fixed = { };

        for ( let name in this ) {
            if ( !this.hasOwnProperty(name) ) continue;
            if ( name === 'parent' ) continue;
            let value = this[name];

            if ( value instanceof Array ) {
                fixed[name] = value.map( (i) => {
                    if ( typeof i === 'object' && i.toJSON ) {
                        return i.toJSON();
                    } else {
                        return i;
                    }
                });
            } else if ( typeof value === 'object' && value.toJSON ) {
                fixed[name] = value.toJSON();
            } else {
                fixed[name] = value;
            }
        }

        return fixed;
    }

    style(own, detect) {
        let str = new Stringifier();
        return str.style(this, own, detect);
    }

    root() {
        let result = this;
        while ( result.parent ) result = result.parent;
        return result;
    }

    cleanStyles(keepBetween) {
        delete this.raw.before;
        delete this.raw.after;
        if ( !keepBetween ) delete this.raw.between;

        if ( this.nodes ) {
            for ( let node of this.nodes ) node.cleanStyles(keepBetween);
        }
    }

    get before() {
        warnOnce('Node#before was deprecated. Use Node#raw.before');
        return this.raw.before;
    }

    set before(val) {
        warnOnce('Node#before was deprecated. Use Node#raw.before');
        this.raw.before = val;
    }

    get between() {
        warnOnce('Node#between was deprecated. Use Node#raw.between');
        return this.raw.between;
    }

    set between(val) {
        warnOnce('Node#between was deprecated. Use Node#raw.between');
        this.raw.between = val;
    }

}
