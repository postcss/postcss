/* eslint no-bitwise: 0 */

/* Port of csstree utils */

/* Check if value is a hex value */
export function isHex(code) {
    return code >= 48 && code <= 57 || // 0 .. 9
           code >= 65 && code <= 70 || // A .. F
           code >= 97 && code <= 102;  // a .. f
}

/* Compare two char values */
export function cmpChar(testStr, offset, referenceCode) {
    let code = testStr.charCodeAt(offset);

    // code.toLowerCase()
    if (code >= 65 && code <= 90) {
        code |= 32;
    }

    return code === referenceCode;
}

/* Deeply compare two strings */
export function cmpStr(testStr, start, end, referenceStr) {
    if (end - start !== referenceStr.length) {
        return false;
    }

    if (start < 0 || end > testStr.length) {
        return false;
    }

    for (let i = start; i < end; i++) {
        let testCode = testStr.charCodeAt(i);
        const refCode = referenceStr.charCodeAt(i - start);

        // testStr[i].toLowerCase()
        if (testCode >= 65 && testCode <= 90) {
            testCode |= 32;
        }

        if (testCode !== refCode) {
            return false;
        }
    }

    return true;
}

/* Check if string ends with specific substring */
export function endsWith(testStr, referenceStr) {
    return cmpStr(
        testStr,
        testStr.length - referenceStr.length,
        testStr.length,
        referenceStr
    );
}
