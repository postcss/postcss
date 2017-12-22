'use strict';

const LazyResult = require('../lib/lazy-result');
const Processor  = require('../lib/processor');

const mozilla = require('source-map');

let processor = new Processor();

it('contains AST', () => {
    let result = new LazyResult(processor, 'a {}', { });
    expect(result.root.type).toEqual('root');
});

it('will stringify css', () => {
    let result = new LazyResult(processor, 'a {}', { });
    expect(result.css).toEqual('a {}');
});

it('stringifies css', () => {
    let result = new LazyResult(processor, 'a {}', { });
    expect('' + result).toEqual(result.css);
});

it('has content alias for css', () => {
    let result = new LazyResult(processor, 'a {}', { });
    expect(result.content).toEqual('a {}');
});

it('has map only if necessary', () => {
    let result = new LazyResult(processor, '', { });
    expect(result.map).not.toBeDefined();

    result = new LazyResult(processor, '', { });
    expect(result.map).not.toBeDefined();

    result = new LazyResult(processor, '', { map: { inline: false } });
    expect(result.map instanceof mozilla.SourceMapGenerator).toBeTruthy();
});

it('contains options', () => {
    let result = new LazyResult(processor, 'a {}', { to: 'a.css' });
    expect(result.opts).toEqual({ to: 'a.css' });
});

it('contains warnings', () => {
    let result = new LazyResult(processor, 'a {}', { });
    expect(result.warnings()).toEqual([]);
});

it('contains messages', () => {
    let result = new LazyResult(processor, 'a {}', { });
    expect(result.messages).toEqual([]);
});
