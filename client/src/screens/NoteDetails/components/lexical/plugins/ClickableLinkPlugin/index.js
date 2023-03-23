/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { $isLinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNearestNodeFromDOMNode, $getSelection, $isRangeSelection, } from 'lexical';
import { useEffect } from 'react';
export default function ClickableLinkPlugin({ filter, newTab = true, }) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        function onClick(e) {
            const event = e;
            const linkDomNode = getLinkDomNode(event, editor);
            if (linkDomNode === null) {
                return;
            }
            const href = linkDomNode.getAttribute('href');
            if (linkDomNode.getAttribute('contenteditable') === 'false' ||
                href === undefined) {
                return;
            }
            // Allow user to select link text without following url
            const selection = editor.getEditorState().read($getSelection);
            if ($isRangeSelection(selection) && !selection.isCollapsed()) {
                return;
            }
            let linkNode = null;
            editor.update(() => {
                const maybeLinkNode = $getNearestNodeFromDOMNode(linkDomNode);
                if ($isLinkNode(maybeLinkNode)) {
                    linkNode = maybeLinkNode;
                }
            });
            if (linkNode === null ||
                (filter !== undefined && !filter(event, linkNode))) {
                return;
            }
            try {
                if (href !== null) {
                    window.open(href, newTab || event.metaKey || event.ctrlKey ? '_blank' : '_self');
                }
            }
            catch {
                // It didn't work, which is better than throwing an exception!
            }
        }
        return editor.registerRootListener((rootElement, prevRootElement) => {
            if (prevRootElement !== null) {
                prevRootElement.removeEventListener('click', onClick);
            }
            if (rootElement !== null) {
                rootElement.addEventListener('click', onClick);
            }
        });
    }, [editor, filter, newTab]);
    return null;
}
function isLinkDomNode(domNode) {
    return domNode.nodeName.toLowerCase() === 'a';
}
function getLinkDomNode(event, editor) {
    return editor.getEditorState().read(() => {
        const domNode = event.target;
        if (isLinkDomNode(domNode)) {
            return domNode;
        }
        if (domNode.parentNode && isLinkDomNode(domNode.parentNode)) {
            return domNode.parentNode;
        }
        return null;
    });
}
