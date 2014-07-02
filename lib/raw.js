// Property with raw value (with comments)
class Raw {
    constructor(value, raw) {
        this.value = value;
        this.raw   = raw;
    }

    // Stringify to CSS raw value if trimmed wasn’t changed
    toString() {
        if ( this.changed ) {
            return this.value || '';
        } else {
            return this.raw || this.value || '';
        }
    }
}

// Return Raw only if it necessary
Raw.load = function (value, raw) {
    if ( typeof(raw) != 'undefined' && value != raw ) {
        return new Raw(value, raw);
    } else {
        return value;
    }
};

module.exports = Raw;
