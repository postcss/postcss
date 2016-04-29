import ts from 'typescript';
import { runInNewContext } from 'vm';
import { join as joinPath, relative } from 'path';
import { readFileSync } from 'fs';
import test from 'ava';

import postcss from '../lib/postcss';

const compilerOptions = {
    module:           ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    target:           ts.ScriptTarget.ES5
};

function run(code) {
    const context = {
        require(path) {
            if (path === 'postcss')
                return postcss;

            throw new Error('Could not find module:' + path);
        }
    };

    runInNewContext(code, context);
}

// based on http://blog.scottlogic.com/2015/01/20/typescript-compiler-api.html
class MockLanguageServiceHost {
    constructor(compilationSettings, files) {
        this.files = Object.assign({}, files);
        this.getCompilationSettings = () => compilationSettings;

        for (const key in this.files) {
            if (!this.files.hasOwnProperty(key)) continue;
            this.files[key] = ts.ScriptSnapshot.fromString(this.files[key]);
        }
    }

    log() {}
    trace() {}
    error() {}

    getScriptIsOpen() {
        return true;
    }

    getCurrentDirectory() {
        return '';
    }

    getDefaultLibFileName() {
        return 'lib';
    }

    getScriptVersion() {
        return '0';
    }

    getScriptSnapshot(fileName) {
        if (fileName.indexOf('/node_modules/postcss/') === 0) {
            try {
                const relPath = relative('/node_modules/postcss/', fileName);
                const newPath = joinPath(__dirname, '..', relPath);
                const file = readFileSync(newPath, 'utf8');
                return ts.ScriptSnapshot.fromString(file);
            } catch (err) {
                return null;
            }
        }


        return this.files[fileName];
    }

    getScriptFileNames() {
        return Object.keys(this.files);
    }
}

function createLanguageService(files) {
    const host = new MockLanguageServiceHost(compilerOptions, files);
    return ts.createLanguageService(host, ts.createDocumentRegistry());
}

const src = `
    import * as postcss from 'postcss';
    postcss.plugin('foobar', () => () => null);
`;

test('TypeScript Typings', t => {
    const path = '/script.ts';
    const langSvc = createLanguageService({ [path]: src });

    const result = ts.transpileModule(src, {
        reportDiagnostics: true,
        compilerOptions
    });

    let compileOutput = result.outputText;

    let diagnostics = langSvc.getSemanticDiagnostics(path)
        .concat(langSvc.getSyntacticDiagnostics(path))
        .concat(result.diagnostics);

    t.deepEqual(diagnostics.map(d => d.messageText), [], 'compiles correctly');

    t.notThrows(() => run(compileOutput), Error, 'links correctly');
});
