import { createContext, Dispatch, SetStateAction } from 'react';

type NoteSettingsObjType = {
    contributors?: string[];
    showBottomBar: boolean;
    expanded: boolean;
    readMode: boolean;
    shared: boolean;
};

type NoteSettingsContextType = {
    noteSettings: NoteSettingsObjType;
    setNoteSettings: Dispatch<SetStateAction<NoteSettingsObjType>>;
}

type Props = {
    children: any,
    noteSettings: NoteSettingsObjType;
    setNoteSettings: Dispatch<SetStateAction<NoteSettingsObjType>>;
}

export const NoteSettingsCtx = createContext<NoteSettingsContextType | null>(null);

export default function NoteSettingsContext({ children, noteSettings, setNoteSettings }: Props) {

    return (
        <NoteSettingsCtx.Provider value={{ noteSettings, setNoteSettings }}>
            {children}
        </NoteSettingsCtx.Provider>
    )
}

