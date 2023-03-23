/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { ElementNode, } from 'lexical';
export class CollapsibleContainerNode extends ElementNode {
    constructor(open, key) {
        super(key);
        this.__open = open;
    }
    static getType() {
        return 'collapsible-container';
    }
    static clone(node) {
        return new CollapsibleContainerNode(node.__open, node.__key);
    }
    createDOM(config) {
        const dom = document.createElement('details');
        dom.classList.add('Collapsible__container');
        dom.open = this.__open;
        return dom;
    }
    updateDOM(prevNode, dom) {
        if (prevNode.__open !== this.__open) {
            dom.open = this.__open;
        }
        return false;
    }
    static importDOM() {
        return {};
    }
    static importJSON(serializedNode) {
        const node = $createCollapsibleContainerNode();
        return node;
    }
    exportJSON() {
        return {
            ...super.exportJSON(),
            type: 'collapsible-container',
            version: 1,
        };
    }
    setOpen(open) {
        const writable = this.getWritable();
        writable.__open = open;
    }
    getOpen() {
        return this.__open;
    }
    toggleOpen() {
        this.setOpen(!this.getOpen());
    }
}
export function $createCollapsibleContainerNode() {
    return new CollapsibleContainerNode(true);
}
export function $isCollapsibleContainerNode(node) {
    return node instanceof CollapsibleContainerNode;
}
