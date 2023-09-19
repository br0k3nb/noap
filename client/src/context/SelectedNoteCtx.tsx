import { createContext, Dispatch, SetStateAction, ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
    
    const location = useLocation();
    const { setNoteSettings } = useNoteSettings();

    const findNoteIdInURL = new RegExp(`note\/(.*)`);
    const getNoteIdInURL = findNoteIdInURL.exec(location.pathname);
    
    useEffect(() => {
      if(getNoteIdInURL && !selectedNote) {
        setSelectedNote(getNoteIdInURL[1]);
        setNoteSettings((prevNoteSettings) => {
            return {
                ...prevNoteSettings,
                expanded: innerWidth < 1030 ? true : false
            }
        });
      }
      else if(!getNoteIdInURL && selectedNote) {
        setNoteSettings((prevNoteSettings) => {
            return {
                ...prevNoteSettings,
                expanded: false
            }
        });
        setSelectedNote("");
      }
    }, [getNoteIdInURL]);

    return (
        <SelectedNoteCtx.Provider value={{ selectedNote, setSelectedNote }}>
            {children}
        </SelectedNoteCtx.Provider>
    )
}
