import postcss from '../lib/postcss';
import Result  from '../lib/result';

import { expect } from 'chai';

describe('Result', () => {

    describe('toString()', () => {

        it('stringifies', () => {
            var result = new Result();
            result.css = 'a{}';
            expect('' + result).to.eql(result.css);
        });

    });

    describe('warn()', () => {

        it('adds warning', () => {
            var plugin = postcss.plugin('test-plugin', () => {
                return (css, result) => {
                    result.warn('test', { node: css.first });
                };
            });
            var result = postcss([plugin]).process('a{}').sync();

            expect(result.messages).to.eql([{
                plugin: 'test-plugin',
                type:   'warning',
                text:   'test',
                node:   result.root.first
            }]);
        });

        it('allows to override plugin', () => {
            var plugin = postcss.plugin('test-plugin', () => {
                return (css, result) => {
                    result.warn('test', { plugin: 'test-plugin#one' });
                };
            });
            var result = postcss([plugin]).process('a{}').sync();

            expect(result.messages[0].plugin).to.eql('test-plugin#one');
        });

    });

    describe('warnings()', () => {

        it('returns only warnings', () => {
            var result = new Result();
            result.messages = [{ type: 'warning', text: 'a' },
                               { type: 'custom' },
                               { type: 'warning', text: 'b' }];
            expect(result.warnings()).to.eql([{ type: 'warning', text: 'a' },
                                              { type: 'warning', text: 'b' }]);
        });

    });

});
