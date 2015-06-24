import Node from './node';

export default class Declaration extends Node {

    constructor(defaults) {
        super(defaults);
        this.type = 'decl';
    }

}
