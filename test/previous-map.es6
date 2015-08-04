import parse from '../lib/parse';

import   mozilla  from 'source-map';
import   fs       from 'fs-extra';
import   path     from 'path';
import { expect } from 'chai';

let dir = path.join(__dirname, 'fixtures');
let map = JSON.stringify({
    version:  3,
    file:     null,
    sources:  [],
    names:    [],
    mappings: []
});

describe('PreviousMap', () => {
    afterEach( () => {
        if ( fs.existsSync(dir) ) fs.removeSync(dir);
    });

    it('misses property if no map', () => {
        expect(parse('a{}').source.input).to.not.have.property('map');
    });

    it('creates property if map present', () => {
        let root = parse('a{}', { map: { prev: map } });
        expect(root.source.input.map.text).to.eql(map);
    });

    it('returns consumer', () => {
        expect(parse('a{}', { map: { prev: map } }).source.input.map.consumer())
            .to.be.a.instanceOf(mozilla.SourceMapConsumer);
    });

    it('sets annotation property', () => {
        let mapOpts = { map: { prev: map } };

        let root1 = parse('a{}', mapOpts);
        expect(root1.source.input.map).to.not.have.property('annotation');

        let root2 = parse('a{}/*# sourceMappingURL=a.css.map */', mapOpts);
        expect(root2.source.input.map.annotation).to.eql('a.css.map');
    });

    it('checks previous sources content', () => {
        let map2 = {
            version:  3,
            file:     'b',
            sources:  ['a'],
            names:    [],
            mappings: []
        };

        let opts = { map: { prev: map2 } };
        expect(parse('a{}', opts).source.input.map.withContent()).to.be.false;

        map2.sourcesContent = ['a{}'];
        expect(parse('a{}', opts).source.input.map.withContent()).to.be.true;
    });

    it('decodes base64 maps', () => {
        let b64 = new Buffer(map).toString('base64');
        let css = 'a{}\n' +
                  `/*# sourceMappingURL=data:application/json;base64,${b64} */`;

        expect(parse(css).source.input.map.text).to.eql(map);
    });

    it('decodes base64 UTF-8 maps', () => {
        let b64 = new Buffer(map).toString('base64');
        let css = 'a{}\n/*# sourceMappingURL=data:application/json;' +
                  'charset=utf-8;base64,' + b64 + ' */';

        expect(parse(css).source.input.map.text).to.eql(map);
    });

    it('decodes URI maps', () => {
        let uri = 'data:application/json,' + decodeURI(map);
        let css = `a{}\n/*# sourceMappingURL=${ uri } */`;

        expect(parse(css).source.input.map.text).to.eql(map);
    });

    it('removes map on request', () => {
        let uri = 'data:application/json,' + decodeURI(map);
        let css = `a{}\n/*# sourceMappingURL=${ uri } */`;

        expect(parse(css, { map: { prev: false } }).source.input)
            .to.not.have.property('map');
    });

    it('raises on unknown inline encoding', () => {
        let css = 'a { }\n/*# sourceMappingURL=data:application/json;' +
                  'md5,68b329da9893e34099c7d8ad5cb9c940*/';

        expect( () => parse(css) )
            .to.throw('Unsupported source map encoding md5');
    });

    it('raises on unknown map format', () => {
        expect( () => parse('a{}', { map: { prev: 1 } }) )
            .to.throw('Unsupported previous source map format: 1');
    });

    it('reads map from annotation', () => {
        let file = path.join(dir, 'a.map');
        fs.outputFileSync(file, map);
        let root = parse('a{}\n/*# sourceMappingURL=a.map */', { from: file });

        expect(root.source.input.map.text).to.eql(map);
        expect(root.source.input.map.root).to.eql(dir);
    });

    it('sets uniq name for inline map', () => {
        let map2 = {
            version:  3,
            sources:  ['a'],
            names:    [],
            mappings: []
        };

        let opts = { map: { prev: map2 } };
        let file1 = parse('a{}', opts).source.input.map.file;
        let file2 = parse('a{}', opts).source.input.map.file;

        expect(file1).to.match(/^<input css \d+>$/);
        expect(file1).to.not.eql(file2);
    });

});
