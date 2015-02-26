import LazyResult from '../lib/lazy-result';
import Processor  from '../lib/processor';
import parse      from '../lib/parse';

import   mozilla  from 'source-map';
import { expect } from 'chai';

var processor = new Processor();

describe('LazyResult', () => {

    describe('root', () => {

        it('contains AST', () => {
            var result = new LazyResult(processor, 'a {}', { });
            expect(result.root.type).to.eql('root');
        });

    });

    describe('css', () => {

        it('will be stringified', () => {
            var result = new LazyResult(processor, 'a {}', { });
            expect(result.css).to.eql('a {}');
        });

        it('stringifies', () => {
            var result = new LazyResult(processor, 'a {}', { });
            expect('' + result).to.eql(result.css);
        });

    });

    describe('map', () => {

        it('exists only if necessary', () => {
            var result = new LazyResult(processor, '', { });
            expect(result.map).to.not.exist;

            result = new LazyResult(processor, '', { });
            expect(result.map).to.not.exist;

            result = new LazyResult(processor, '', { map: { inline: false } });
            expect(result.map).to.be.a.instanceOf(mozilla.SourceMapGenerator);
        });

    });

});
