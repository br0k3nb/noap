import { createContext, Dispatch, SetStateAction } from 'react';

type ShowPinNoteInFolderCtxType = {
    showPinnedNotesInFolder: boolean;
    setShowPinnedNotesInFolder: Dispatch<SetStateAction<boolean>>;
};

type Props = {
    children: any,
    showPinnedNotesInFolder: boolean;
    setShowPinnedNotesInFolder: Dispatch<SetStateAction<boolean>>;
}

export const ShowPinNoteInFolderCtx = createContext<ShowPinNoteInFolderCtxType | null>(null);

export default function ShowPinNoteInFolderContext({ children, showPinnedNotesInFolder, setShowPinnedNotesInFolder }: Props) {

    return (
        <ShowPinNoteInFolderCtx.Provider value={{ showPinnedNotesInFolder, setShowPinnedNotesInFolder }}>
            {children}
        </ShowPinNoteInFolderCtx.Provider>
    )
}