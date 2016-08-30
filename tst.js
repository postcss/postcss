const postcss = require('./');
const css = '.icon::before {\n  color: blue;\n  content: ";\n}\n' +
            '@media (--iphone) {\n  .icon {\n  }\n}\n';

postcss().process(css).then(result => {
    console.log(result.css);
}).catch(error => {
    if ( error.name === 'CssSyntaxError' ) {
        console.error(error.toString());
    } else {
        throw error;
    }
});
