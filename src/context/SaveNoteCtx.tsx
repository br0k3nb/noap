import { createContext, ReactNode } from 'react';
import { EditorState } from 'lexical';

type SaveNoteContextType = {
    saveNoteFn: (state: EditorState) => Promise<any>;
};

type SaveNoteContextProps = {
    children: ReactNode;
    saveNoteFn: (state: EditorState) => Promise<any>;
}

const defaultValue = {
    saveNoteFn: () => new Promise(() => { return })
};

export const SaveNoteCtx = createContext<SaveNoteContextType>(defaultValue);

export default function SaveNoteContext({ children, saveNoteFn }: SaveNoteContextProps) {
    return (
        <SaveNoteCtx.Provider value={{ saveNoteFn }}>
            {children}
        </SaveNoteCtx.Provider>
    )
}
