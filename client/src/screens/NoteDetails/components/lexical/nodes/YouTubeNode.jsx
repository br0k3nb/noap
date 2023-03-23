/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents';
import { DecoratorBlockNode, } from '@lexical/react/LexicalDecoratorBlockNode';
import * as React from 'react';
function YouTubeComponent({ className, format, nodeKey, videoID, }) {
    return (<BlockWithAlignableContents className={className} format={format} nodeKey={nodeKey}>
      <iframe width="560" height="315" src={`https://www.youtube.com/embed/${videoID}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen={true} title="YouTube video"/>
    </BlockWithAlignableContents>);
}
export class YouTubeNode extends DecoratorBlockNode {
    static getType() {
        return 'youtube';
    }
    static clone(node) {
        return new YouTubeNode(node.__id, node.__format, node.__key);
    }
    static importJSON(serializedNode) {
        const node = $createYouTubeNode(serializedNode.videoID);
        node.setFormat(serializedNode.format);
        return node;
    }
    exportJSON() {
        return {
            ...super.exportJSON(),
            type: 'youtube',
            version: 1,
            videoID: this.__id,
        };
    }
    constructor(id, format, key) {
        super(format, key);
        this.__id = id;
    }
    updateDOM() {
        return false;
    }
    getId() {
        return this.__id;
    }
    getTextContent(_includeInert, _includeDirectionless) {
        return `https://www.youtube.com/watch?v=${this.__id}`;
    }
    decorate(_editor, config) {
        const embedBlockTheme = config.theme.embedBlock || {};
        const className = {
            base: embedBlockTheme.base || '',
            focus: embedBlockTheme.focus || '',
        };
        return (<YouTubeComponent className={className} format={this.__format} nodeKey={this.getKey()} videoID={this.__id}/>);
    }
    isInline() {
        return false;
    }
}
export function $createYouTubeNode(videoID) {
    return new YouTubeNode(videoID);
}
export function $isYouTubeNode(node) {
    return node instanceof YouTubeNode;
}
