export default function warn(message) {
    if ( typeof console !== 'undefined' && console.warn ) console.warn(message);
}
