/* Port of csstree error for tokenizer */
const MAX_LINE_LENGTH = 100;
const OFFSET_CORRECTION = 60;

/* Get detailed source fragment */
function getSourceFragment(error, extraLines) {
    let lines = error.source.split(/\n|\r\n?|\f/),
        column = error.column,
        line = error.line,
        startLine = Math.max(1, line - extraLines) - 1,
        endLine = Math.min(line + extraLines, lines.length + 1),
        maxNumLength = Math.max(4, String(endLine).length) + 1,
        cutLeft = 0;

    function processLines(start, end) {
        return lines.slice(start, end).map((currLine, idx) => {
            let num = String(start + idx + 1);

            while (num.length < maxNumLength) {
                num = ' ' + num;
            }

            return num + ' |' + currLine;
        }).join('\n');
    }

    if (column > MAX_LINE_LENGTH) {
        cutLeft = column - OFFSET_CORRECTION + 3;
        column = OFFSET_CORRECTION - 2;
    }

    for (let i = startLine; i <= endLine; i++) {
        if (i >= 0 && i < lines.length) {
            let len = line[i].length;
            lines[i] =
                (cutLeft > 0 && len > cutLeft ? '\u2026' : '') +
                lines[i].substr(cutLeft, MAX_LINE_LENGTH - 2) +
                (len > cutLeft + MAX_LINE_LENGTH - 1 ? '\u2026' : '');
        }
    }

    return [
        processLines(startLine, line),
        new Array(column + maxNumLength + 2).join('-') + '^',
        processLines(line, endLine)
    ].join('\n');
}

/* Error class for invalid css syntax */
export class CssSyntaxError extends SyntaxError {
    constructor(message, source, offset, line, column) {
        super(message);
        this.name = 'CssSyntaxError';
        this.source = source;
        this.offset = offset;
        this.line = line;
        this.column = column;
    }

    /* Getter for formatted parsing error */
    getFormattedError() {
        const sourcePart = getSourceFragment(this, 2);
        return `Parse error: ${this.message}\n${sourcePart}`;
    }
}
