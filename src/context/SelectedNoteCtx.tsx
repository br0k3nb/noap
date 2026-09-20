import { createContext, Dispatch, SetStateAction, ReactNode, useState, useEffect } from 'react';

import useGetUrl from '../hooks/useGetUrl';
import useNoteSettings from '../hooks/useNoteSettings';

type SelectedNoteContext = {
    selectedNote: string;
    setSelectedNote: Dispatch<SetStateAction<string>>;
};

type SelectedNoteContextProps = {
    children: ReactNode;
}

const defaultValue = {
    selectedNote: '',
    setSelectedNote: () => {}
};

export const SelectedNoteCtx = createContext<SelectedNoteContext>(defaultValue);

export default function SelectedNoteContext({ children }: SelectedNoteContextProps) {
    const [selectedNote, setSelectedNote] = useState('');
    
    const { setNoteSettings } = useNoteSettings();
    const [noteIdInUrl] = useGetUrl({ getNoteIdInUrl: true });

    useEffect(() => {
        // Sync selection from the URL. Compares against the current selection
        // (not just emptiness) so note-to-note navigation without remount
        // can't leave a stale note selected. Deps stay [noteIdInUrl] on
        // purpose: reacting to programmatic selection changes here would
        // revert click-driven selections back to the stale URL value.
        if(noteIdInUrl && noteIdInUrl !== selectedNote) {
            setSelectedNote(noteIdInUrl as string);
            setNoteSettings((prevNoteSettings) => {
                return {
                    ...prevNoteSettings,
                    expanded: innerWidth < 1030 ? true : false
                }
            });
        } else if(!noteIdInUrl && selectedNote) {
            setNoteSettings((prevNoteSettings) => {
                return {
                    ...prevNoteSettings,
                    expanded: false
                }
            });
            setSelectedNote("");
        }
    }, [noteIdInUrl]);

    return (
        <SelectedNoteCtx.Provider value={{ selectedNote, setSelectedNote }}>
            {children}
        </SelectedNoteCtx.Provider>
    )
}
