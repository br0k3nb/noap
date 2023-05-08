import { createContext, Dispatch, SetStateAction } from 'react';

type SelectedNoteContext = {
    selectedNote: number | null;
    setSelectedNote: Dispatch<SetStateAction<number | null>>;
};

type Props = {
    children: any,
    selectedNote: number | null,
    setSelectedNote: Dispatch<SetStateAction<number | null>>;
}

export const NoteCtx = createContext<SelectedNoteContext | null>(null);

export default function SelectedNoteContext({ children, selectedNote, setSelectedNote }: Props) {

    return (
        <NoteCtx.Provider value={{ selectedNote, setSelectedNote }}>
            {children}
        </NoteCtx.Provider>
    )
}