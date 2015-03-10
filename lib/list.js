export default {

    split(string, separators, last) {
        let array   = [];
        let current = '';
        let split   = false;

        let func    = 0;
        let quote   = false;
        let escape  = false;

        for ( let i = 0; i < string.length; i++ ) {
            let letter = string[i];

            if ( quote ) {
                if ( escape ) {
                    escape = false;
                } else if ( letter === '\\' ) {
                    escape = true;
                } else if ( letter === quote ) {
                    quote = false;
                }
            } else if ( letter === '"' || letter === "'" ) {
                quote = letter;
            } else if ( letter === '(' ) {
                func += 1;
            } else if ( letter === ')' ) {
                if ( func > 0 ) func -= 1;
            } else if ( func === 0 ) {
                for ( let j = 0; j < separators.length; j++ ) {
                    if ( letter === separators[j] ) split = true;
                }
            }

            if ( split ) {
                if ( current !== '' ) array.push(current.trim());
                current = '';
                split   = false;
            } else {
                current += letter;
            }
        }

        if ( last || current !== '' ) array.push(current.trim());
        return array;
    },

    space(string) {
        let spaces = [' ', '\n', '\t'];
        return this.split(string, spaces);
    },

    comma(string) {
        let comma = ',';
        return this.split(string, [comma], true);
    }

};
