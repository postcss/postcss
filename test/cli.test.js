const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { expect } = require('chai');

describe('postcss-cli', () => {
  const inputDir = path.join(__dirname, 'input');
  const outputDir = path.join(__dirname, 'output');

  beforeEach(() => {
    fs.mkdirSync(inputDir, { recursive: true });
    fs.mkdirSync(outputDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmdirSync(inputDir, { recursive: true });
    fs.rmdirSync(outputDir, { recursive: true });
  });

  it('should maintain folder structure with --dir option', () => {
    const inputFile1 = path.join(inputDir, 'test1', '1.pcss');
    const inputFile2 = path.join(inputDir, 'test2', '2.pcss');
    const inputFile3 = path.join(inputDir, 'test3', '3.pcss');

    fs.mkdirSync(path.dirname(inputFile1), { recursive: true });
    fs.mkdirSync(path.dirname(inputFile2), { recursive: true });
    fs.mkdirSync(path.dirname(inputFile3), { recursive: true });

    fs.writeFileSync(inputFile1, 'a { color: red; }');
    fs.writeFileSync(inputFile2, 'b { color: green; }');
    fs.writeFileSync(inputFile3, 'c { color: blue; }');

    execSync(`node lib/cli.js --use postcss --dir ${outputDir} ${inputDir}/**/*.pcss`);

    expect(fs.existsSync(path.join(outputDir, 'test1', '1.css'))).to.be.true;
    expect(fs.existsSync(path.join(outputDir, 'test2', '2.css'))).to.be.true;
    expect(fs.existsSync(path.join(outputDir, 'test3', '3.css'))).to.be.true;
  });

  it('should change output file extension with --ext option', () => {
    const inputFile = path.join(inputDir, 'test.pcss');
    fs.writeFileSync(inputFile, 'a { color: red; }');

    execSync(`node lib/cli.js --use postcss --dir ${outputDir} --ext .custom ${inputFile}`);

    expect(fs.existsSync(path.join(outputDir, 'test.custom'))).to.be.true;
  });

  it('should handle both --dir and --ext options together', () => {
    const inputFile1 = path.join(inputDir, 'test1', '1.pcss');
    const inputFile2 = path.join(inputDir, 'test2', '2.pcss');
    const inputFile3 = path.join(inputDir, 'test3', '3.pcss');

    fs.mkdirSync(path.dirname(inputFile1), { recursive: true });
    fs.mkdirSync(path.dirname(inputFile2), { recursive: true });
    fs.mkdirSync(path.dirname(inputFile3), { recursive: true });

    fs.writeFileSync(inputFile1, 'a { color: red; }');
    fs.writeFileSync(inputFile2, 'b { color: green; }');
    fs.writeFileSync(inputFile3, 'c { color: blue; }');

    execSync(`node lib/cli.js --use postcss --dir ${outputDir} --ext .custom ${inputDir}/**/*.pcss`);

    expect(fs.existsSync(path.join(outputDir, 'test1', '1.custom'))).to.be.true;
    expect(fs.existsSync(path.join(outputDir, 'test2', '2.custom'))).to.be.true;
    expect(fs.existsSync(path.join(outputDir, 'test3', '3.custom'))).to.be.true;
  });
});
