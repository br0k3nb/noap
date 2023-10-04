import { createContext, Dispatch, SetStateAction, useState, ReactNode } from 'react';

type NoteSettingsObjType = {
    contributors?: string[];
    showBottomBar: boolean;
    readMode: boolean;
    expanded: boolean;
    shared: boolean;
    pinned: boolean;
    permissions?: string[];
    noteBackgroundColor?: string;
};

type NoteSettingsContextProps = {
    children: ReactNode;
}

type NoteSettingsContextType = {
    noteSettings: NoteSettingsObjType;
    setNoteSettings: Dispatch<SetStateAction<NoteSettingsObjType>>;
}

const defaultValue = {
    noteSettings: {
        showBottomBar: true,
        readMode: false,
        shared: false,
        pinned: false, 
        expanded: false,
        noteBackgroundColor: ''
    } as NoteSettingsObjType,
    setNoteSettings: () => {}
};

export const NoteSettingsCtx = createContext<NoteSettingsContextType>(defaultValue);

export default function NoteSettingsContext({ children }: NoteSettingsContextProps) { 
    const [noteSettings, setNoteSettings] = useState(defaultValue.noteSettings);

    return (
        <NoteSettingsCtx.Provider value={{ noteSettings, setNoteSettings }}>
            {children}
        </NoteSettingsCtx.Provider>
    )
}
