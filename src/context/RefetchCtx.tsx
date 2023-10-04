import { createContext, ReactNode } from "react";

interface RefetchType {
    isFetching: boolean;
    fetchNotes: () => void;
    fetchSelectedNote?: () => void;
}

interface Props extends RefetchType {
    children: ReactNode,
    isFetching: boolean;
    fetchNotes: () => Promise<void>;
    fetchSelectedNote?: () => Promise<void>;
}

const defaultValue = {
    isFetching: false,
    fetchNotes: () => {},
};

export const RefetchCtx = createContext<RefetchType>(defaultValue);

export default function RefetchContext({ children, fetchNotes, isFetching, fetchSelectedNote }: Props) {
    return (
        <RefetchCtx.Provider value={{ fetchNotes, fetchSelectedNote, isFetching }}>
            {children}
        </RefetchCtx.Provider>
    )
}