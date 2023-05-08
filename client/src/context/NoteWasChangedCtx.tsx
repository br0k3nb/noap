import { createContext, Dispatch, SetStateAction } from 'react';

type NoteWasChangedContext = {
    wasChanged: boolean;
    setWasChanged: Dispatch<SetStateAction<boolean>>;
};

type Props = {
    children: any,
    wasChanged: boolean,
    setWasChanged: Dispatch<SetStateAction<boolean>>;
}

export const NoteWasChangedCtx = createContext<NoteWasChangedContext | null>(null);

export default function NoteWasChangedContext({ children, wasChanged, setWasChanged }: Props) {

    return (
        <NoteWasChangedCtx.Provider value={{ wasChanged, setWasChanged }}>
            {children}
        </NoteWasChangedCtx.Provider>
    )
}