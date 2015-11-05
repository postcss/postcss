import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';

export default {
    entry: 'lib/postcss.js',
    dest:  'build/lib/postcss.js',

    format: 'cjs',

    plugins: [
        json(),
        babel()
    ]
};
