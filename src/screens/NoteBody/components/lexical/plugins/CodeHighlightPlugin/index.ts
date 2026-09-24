import { registerCodeHighlighting } from '@lexical/code-prism';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

export default function CodeHighlightPlugin(): JSX.Element | null {
    const [ editor ] = useLexicalComposerContext();

    useEffect(() => {
        return registerCodeHighlighting(editor);
    }, [editor]);

    return null;
}
