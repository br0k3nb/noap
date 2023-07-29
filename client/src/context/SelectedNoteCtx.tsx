import { createContext, Dispatch, SetStateAction } from 'react';

type SelectedNoteContext = {
    selectedNote: string | null;
    setSelectedNote: Dispatch<SetStateAction<string | null>>;
};

type Props = {
    children: any,
    selectedNote: string | null,
    setSelectedNote: Dispatch<SetStateAction<string | null>>;
}

export const NoteCtx = createContext<SelectedNoteContext | null>(null);

export default function SelectedNoteContext({ children, selectedNote, setSelectedNote }: Props) {

    return (
        <NoteCtx.Provider value={{ selectedNote, setSelectedNote }}>
            {children}
        </NoteCtx.Provider>
    )
}