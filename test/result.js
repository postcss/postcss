import Warning from '../lib/warning';
import postcss from '../lib/postcss';
import Result  from '../lib/result';

import test from 'ava';

test('stringifies', t => {
    let result = new Result();
    result.css = 'a{}';
    t.deepEqual('' + result, result.css);
});

test('adds warning', t => {
    let warning;
    let plugin = postcss.plugin('test-plugin', () => {
        return (css, res) => {
            warning = res.warn('test', { node: css.first });
        };
    });
    let result = postcss([plugin]).process('a{}').sync();

    t.deepEqual(warning, new Warning('test', {
        plugin: 'test-plugin',
        node:   result.root.first
    }));

    t.deepEqual(result.messages, [warning]);
});

test('allows to override plugin', t => {
    let plugin = postcss.plugin('test-plugin', () => {
        return (css, res) => {
            res.warn('test', { plugin: 'test-plugin#one' });
        };
    });
    let result = postcss([plugin]).process('a{}').sync();

    t.deepEqual(result.messages[0].plugin, 'test-plugin#one');
});

test('allows Root', t => {
    let result = new Result();
    let root   = postcss.parse('a{}');
    result.warn('TT', { node: root });

    t.deepEqual(result.messages[0].toString(), '<css input>:1:1: TT');
});

test('returns only warnings', t => {
    let result = new Result();
    result.messages = [{ type: 'warning', text: 'a' },
                       { type: 'custom' },
                       { type: 'warning', text: 'b' }];
    t.deepEqual(result.warnings(), [{ type: 'warning', text: 'a' },
                                    { type: 'warning', text: 'b' }]);
});
