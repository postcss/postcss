export default {

    prefix(prop) {
        if ( prop[0] == '-' ) {
            var sep = prop.indexOf('-', 1);
            return prop.substr(0, sep + 1);
        } else {
            return '';
        }
    },

    unprefixed(prop) {
        if ( prop[0] == '-' ) {
            var sep = prop.indexOf('-', 1);
            return prop.substr(sep + 1);
        } else {
            return prop;
        }
    }

};
