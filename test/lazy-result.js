import LazyResult from '../lib/lazy-result';
import Processor  from '../lib/processor';

import mozilla from 'source-map';
import test    from 'ava';

let processor = new Processor();

test('contains AST', t => {
    let result = new LazyResult(processor, 'a {}', { });
    t.deepEqual(result.root.type, 'root');
});

test('will stringify css', t => {
    let result = new LazyResult(processor, 'a {}', { });
    t.deepEqual(result.css, 'a {}');
});

test('stringifies css', t => {
    let result = new LazyResult(processor, 'a {}', { });
    t.deepEqual('' + result, result.css);
});

test('has content alias for css', t => {
    let result = new LazyResult(processor, 'a {}', { });
    t.deepEqual(result.content, 'a {}');
});

test('has map only if necessary', t => {
    let result = new LazyResult(processor, '', { });
    t.deepEqual(typeof result.map, 'undefined');

    result = new LazyResult(processor, '', { });
    t.deepEqual(typeof result.map, 'undefined');

    result = new LazyResult(processor, '', { map: { inline: false } });
    t.truthy(result.map instanceof mozilla.SourceMapGenerator);
});

test('contains options', t => {
    let result = new LazyResult(processor, 'a {}', { to: 'a.css' });
    t.deepEqual(result.opts, { to: 'a.css' });
});

test('contains warnings', t => {
    let result = new LazyResult(processor, 'a {}', { });
    t.deepEqual(result.warnings(), []);
});

test('contains messages', t => {
    let result = new LazyResult(processor, 'a {}', { });
    t.deepEqual(result.messages, []);
});
