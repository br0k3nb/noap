import { useEffect } from 'react';

import { $getSelection, $isRangeSelection, $setSelection, FOCUS_COMMAND } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

const COMMAND_PRIORITY_LOW = 1;
const TAB_TO_FOCUS_INTERVAL = 100;

let lastTabKeyDownTimestamp = 0;
let hasRegisteredKeyDownListener = false;

function registerKeyTimeStampTracker() {
    window.addEventListener('keydown', (event) => {
        // Tab
        if (event.keyCode === 9) lastTabKeyDownTimestamp = event.timeStamp;
    }, true);
}

export default function TabFocusPlugin() {
    const [ editor ] = useLexicalComposerContext();

    useEffect(() => {
        if (!hasRegisteredKeyDownListener) {
            registerKeyTimeStampTracker();
            hasRegisteredKeyDownListener = true;
        }

        return editor.registerCommand(FOCUS_COMMAND, (event) => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                if (lastTabKeyDownTimestamp + TAB_TO_FOCUS_INTERVAL >
                    event.timeStamp) {
                    $setSelection(selection.clone());
                }
            }

            return false;
        }, COMMAND_PRIORITY_LOW);

    }, [editor]);

    return null;
}