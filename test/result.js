var Result = require('../lib/result');
var parse  = require('../lib/parse');

var mozilla = require('source-map');
var should  = require('should');

describe('Result', () => {
    beforeEach( () => {
        this.root = parse('a {}');
    });

    describe('root', () => {

        it('contains AST', () => {
            var result = new Result(this.root);
            result.root.should.eql(this.root);
        });

    });

    describe('css', () => {

        it('will be stringified', () => {
            var result = new Result(this.root);
            result.css.should.eql('a {}');
        });

        it('stringifies', () => {
            var result = new Result(this.root, 'a {}');
            ('' + result).should.eql(result.css);
        });

    });

    describe('map', () => {

        it('exists only if necessary', () => {
            var result = new Result(this.root);
            should.not.exists(result.map);

            result = new Result(this.root, { map: true });
            result.map.should.be.a.instanceOf(mozilla.SourceMapGenerator);
        });

    });

});
