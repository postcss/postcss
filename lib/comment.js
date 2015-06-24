import Node from './node';

export default class Comment extends Node {
    constructor(defaults) {
        super(defaults);
        this.type = 'comment';
    }
}
