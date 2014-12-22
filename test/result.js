var Result = require('../lib/result');
var parse  = require('../lib/parse');

var mozilla = require('source-map');
var expect  = require('chai').expect;

describe('Result', () => {
    beforeEach( () => {
        this.root = parse('a {}');
    });

    describe('root', () => {

        it('contains AST', () => {
            var result = new Result(this.root);
            expect(result.root).to.eql(this.root);
        });

    });

    describe('css', () => {

        it('will be stringified', () => {
            var result = new Result(this.root);
            expect(result.css).to.eql('a {}');
        });

        it('stringifies', () => {
            var result = new Result(this.root, 'a {}');
            expect('' + result).to.eql(result.css);
        });

    });

    describe('map', () => {

        it('exists only if necessary', () => {
            var result = new Result(this.root);
            expect(result.map).to.not.exist();

            result = new Result(this.root, { map: true });
            expect(result.map).to.not.exist();

            result = new Result(this.root, { map: { inline: false } });
            expect(result.map).to.be.a.instanceOf(mozilla.SourceMapGenerator);
        });

    });

});
