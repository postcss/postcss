import Root from './root';
export default class MapGenerator {
    private root;
    private opts;
    private mapOpts;
    private previousMaps;
    private map;
    private css;
    constructor(root: Root, opts: any);
    isMap(): boolean;
    previous(): any;
    isInline(): any;
    isSourcesContent(): any;
    clearAnnotation(): void;
    setSourcesContent(): void;
    applyPrevMaps(): void;
    isAnnotation(): any;
    addAnnotation(): void;
    outputFile(): any;
    generateMap(): any[];
    relative(file: any): any;
    sourcePath(node: any): any;
    stringify(): void;
    generate(): any[];
}
