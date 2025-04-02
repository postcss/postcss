const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const argv = require('yargs')
  .usage('Usage: $0 [options]')
  .option('use', {
    alias: 'u',
    describe: 'PostCSS plugin to use',
    type: 'array',
    demandOption: true
  })
  .option('dir', {
    alias: 'd',
    describe: 'Output directory',
    type: 'string',
    demandOption: true
  })
  .option('ext', {
    alias: 'e',
    describe: 'Output file extension',
    type: 'string',
    default: '.css'
  })
  .argv;

const plugins = argv.use.map(plugin => require(plugin));
const outputDir = argv.dir;
const outputExt = argv.ext;

function processFiles(inputFiles) {
  inputFiles.forEach(file => {
    const css = fs.readFileSync(file, 'utf8');
    postcss(plugins)
      .process(css, { from: file })
      .then(result => {
        const outputFilePath = getOutputFilePath(file);
        fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
        fs.writeFileSync(outputFilePath, result.css);
        if (result.map) {
          fs.writeFileSync(`${outputFilePath}.map`, result.map.toString());
        }
      })
      .catch(err => {
        console.error(`Error processing file ${file}:`, err);
      });
  });
}

function getOutputFilePath(inputFilePath) {
  const relativePath = path.relative(process.cwd(), inputFilePath);
  const outputFilePath = path.join(outputDir, relativePath);
  return outputFilePath.replace(path.extname(outputFilePath), outputExt);
}

const inputFiles = argv._;
processFiles(inputFiles);
