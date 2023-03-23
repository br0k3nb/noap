/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import * as React from 'react';
import { Suspense } from 'react';
const EquationComponent = React.lazy(
// @ts-ignore
() => import('./EquationComponent'));
export class EquationNode extends DecoratorNode {
    static getType() {
        return 'equation';
    }
    static clone(node) {
        return new EquationNode(node.__equation, node.__inline, node.__key);
    }
    constructor(equation, inline, key) {
        super(key);
        this.__equation = equation;
        this.__inline = inline ?? false;
    }
    static importJSON(serializedNode) {
        const node = $createEquationNode(serializedNode.equation, serializedNode.inline);
        return node;
    }
    exportJSON() {
        return {
            equation: this.getEquation(),
            inline: this.__inline,
            type: 'equation',
            version: 1,
        };
    }
    createDOM(_config) {
        return document.createElement(this.__inline ? 'span' : 'div');
    }
    updateDOM(prevNode) {
        // If the inline property changes, replace the element
        return this.__inline !== prevNode.__inline;
    }
    getEquation() {
        return this.__equation;
    }
    setEquation(equation) {
        const writable = this.getWritable();
        writable.__equation = equation;
    }
    decorate() {
        return (<Suspense fallback={null}>
        <EquationComponent equation={this.__equation} inline={this.__inline} nodeKey={this.__key}/>
      </Suspense>);
    }
}
export function $createEquationNode(equation = '', inline = false) {
    const equationNode = new EquationNode(equation, inline);
    return $applyNodeReplacement(equationNode);
}
export function $isEquationNode(node) {
    return node instanceof EquationNode;
}
