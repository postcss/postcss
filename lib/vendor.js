// Methods to work with vendor prefixes
var vendor = {

    // Return vendor prefix from property name, if it exists
    //
    //   vendor.prefix('-moz-box-sizing') #=> '-moz-'
    //   vendor.prefix('box-sizing')      #=> ''
    prefix: function (prop) {
        if ( prop[0] == '-' ) {
            var sep = prop.indexOf('-', 1);
            return prop.substr(0, sep + 1);
        } else {
            return '';
        }
    },

    // Remove prefix from property name
    //
    //   vendor.prefix('-moz-box-sizing') #=> 'box-sizing'
    //   vendor.prefix('box-sizing')      #=> 'box-sizing'
    unprefixed: function (prop) {
        if ( prop[0] == '-' ) {
            var sep = prop.indexOf('-', 1);
            return prop.substr(sep + 1);
        } else {
            return prop;
        }
    }

};

module.exports = vendor;
