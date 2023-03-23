import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { $getNodeByKey, $getSelection, $isNodeSelection, COMMAND_PRIORITY_HIGH, KEY_ESCAPE_COMMAND, SELECTION_CHANGE_COMMAND, } from 'lexical';
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import EquationEditor from '../ui/EquationEditor';
import KatexRenderer from '../ui/KatexRenderer';
import { $isEquationNode } from './EquationNode';
export default function EquationComponent({ equation, inline, nodeKey, }) {
    const [editor] = useLexicalComposerContext();
    const [equationValue, setEquationValue] = useState(equation);
    const [showEquationEditor, setShowEquationEditor] = useState(false);
    const inputRef = useRef(null);
    const onHide = useCallback((restoreSelection) => {
        setShowEquationEditor(false);
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isEquationNode(node)) {
                node.setEquation(equationValue);
                if (restoreSelection) {
                    node.selectNext(0, 0);
                }
            }
        });
    }, [editor, equationValue, nodeKey]);
    useEffect(() => {
        if (!showEquationEditor && equationValue !== equation) {
            setEquationValue(equation);
        }
    }, [showEquationEditor, equation, equationValue]);
    useEffect(() => {
        if (showEquationEditor) {
            return mergeRegister(editor.registerCommand(SELECTION_CHANGE_COMMAND, (payload) => {
                const activeElement = document.activeElement;
                const inputElem = inputRef.current;
                if (inputElem !== activeElement) {
                    onHide();
                }
                return false;
            }, COMMAND_PRIORITY_HIGH), editor.registerCommand(KEY_ESCAPE_COMMAND, (payload) => {
                const activeElement = document.activeElement;
                const inputElem = inputRef.current;
                if (inputElem === activeElement) {
                    onHide(true);
                    return true;
                }
                return false;
            }, COMMAND_PRIORITY_HIGH));
        }
        else {
            return editor.registerUpdateListener(({ editorState }) => {
                const isSelected = editorState.read(() => {
                    const selection = $getSelection();
                    return ($isNodeSelection(selection) &&
                        selection.has(nodeKey) &&
                        selection.getNodes().length === 1);
                });
                if (isSelected) {
                    setShowEquationEditor(true);
                }
            });
        }
    }, [editor, nodeKey, onHide, showEquationEditor]);
    return (<>
      {showEquationEditor ? (<EquationEditor equation={equationValue} setEquation={setEquationValue} inline={inline} inputRef={inputRef}/>) : (<KatexRenderer equation={equationValue} inline={inline} onClick={() => {
                setShowEquationEditor(true);
            }}/>)}
    </>);
}
