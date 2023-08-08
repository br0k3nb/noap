import { useEffect } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement } from '@lexical/utils';
import {
    $createParagraphNode,
    $insertNodes,
    $isRootOrShadowRoot,
    COMMAND_PRIORITY_EDITOR,
    createCommand,
    LexicalCommand,
} from 'lexical';

import { $createExcalidrawNode, ExcalidrawNode } from '../../nodes/ExcalidrawNode';

export const INSERT_EXCALIDRAW_COMMAND: LexicalCommand<void> = createCommand(
    'INSERT_EXCALIDRAW_COMMAND',
);

export default function ExcalidrawPlugin(): null {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        if (!editor.hasNodes([ExcalidrawNode])) {
            throw new Error('ExcalidrawPlugin: ExcalidrawNode not registered on editor');
        }

        return editor.registerCommand(
            INSERT_EXCALIDRAW_COMMAND,
            () => {
                const excalidrawNode = $createExcalidrawNode();
                $insertNodes([excalidrawNode]);

                if ($isRootOrShadowRoot(excalidrawNode.getParentOrThrow())) {
                    $wrapNodeInElement(excalidrawNode, $createParagraphNode).selectEnd();
                }

                return true;
            },
            COMMAND_PRIORITY_EDITOR,
        );
    }, [editor]);

    return null;
}