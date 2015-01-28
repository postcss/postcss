var Result = require('../lib/result');
var parse  = require('../lib/parse');

var mozilla = require('source-map');
var expect  = require('chai').expect;

var root;

describe('Result', () => {
    beforeEach( () => {
        root = parse('a {}');
    });

    describe('root', () => {

        it('contains AST', () => {
            var result = new Result(root);
            expect(result.root).to.eql(root);
        });

    });

    describe('css', () => {

        it('will be stringified', () => {
            var result = new Result(root);
            expect(result.css).to.eql('a {}');
        });

        it('stringifies', () => {
            var result = new Result(root, 'a {}');
            expect('' + result).to.eql(result.css);
        });

    });

    describe('map', () => {

        it('exists only if necessary', () => {
            var result = new Result(root);
            expect(result.map).to.not.exist();

            result = new Result(root, { map: true });
            expect(result.map).to.not.exist();

            result = new Result(root, { map: { inline: false } });
            expect(result.map).to.be.a.instanceOf(mozilla.SourceMapGenerator);
        });

    });

});
