/* Single chacracter structure */
export class Character {
    constructor(type, value, start, end, position) {
        this.type = type;
        this.value = value;
        this.start = start;
        this.end = end;
        this.position = position;
    }

    /* Get character position */
    getPosition() {
        return {
            line: this.position.line,
            column: this.position.column
        };
    }
}
