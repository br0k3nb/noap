import { createContext, Dispatch, SetStateAction } from 'react';

type ExpandedContextProps = {
    expanded: boolean;
    setExpanded: Dispatch<SetStateAction<boolean>>;
};  

type Props = {
    children: any,
    expanded: boolean;
    setExpanded: Dispatch<SetStateAction<boolean>>;
}

export const ExpandedCtx = createContext<ExpandedContextProps | null>(null);

export default function NoteExpandedCtx({ children, expanded, setExpanded }: Props) {

    return (
        <ExpandedCtx.Provider value={{ expanded, setExpanded }}>
            {children}
        </ExpandedCtx.Provider>
    )
}