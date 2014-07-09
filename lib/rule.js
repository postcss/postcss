var Container   = require('./container');
var Declaration = require('./declaration');
var list        = require('./list');

// CSS rule like “a { }”
class Rule extends Container.WithDecls {
    constructor(defaults) {
        this.type = 'rule';
        super(defaults);
    }

    // Different style for empty and non-empty rules
    styleType() {
        return this.type + (this.decls.length ? '-body' : '-empty');
    }

    defaultStyle(type) {
        if ( type == 'rule-body' ) {
            return { between: ' ', after: this.defaultAfter() };
        } else {
            return { between: ' ', after: '' };
        }
    }

    // Shortcut to get selectors as array

    get selectors() {
        return list.comma(this.selector);
    }

    set selectors(values) {
        this.selector = values.join(', ');
    }

    // Stringify rule
    stringify(builder) {
        this.stringifyBlock(builder,
            this.stringifyRaw('selector') + this.style().between + '{');
    }
}

module.exports = Rule;
