export default class PreviousMap {
    private inline;
    private annotation;
    private root;
    private consumerCache;
    text: string;
    file: string;
    constructor(css: any, opts: any);
    consumer(): any;
    withContent(): boolean;
    startWith(string: any, start: any): boolean;
    loadAnnotation(css: any): void;
    decodeInline(text: any): any;
    loadMap(file: any, prev: any): any;
}
