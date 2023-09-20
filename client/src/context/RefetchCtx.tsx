import { createContext, ReactNode } from "react";

interface RefetchType {
    isFetching: boolean;
    fetchNotes: () => void;
}

interface Props extends RefetchType {
    children: ReactNode,
    isFetching: boolean;
    fetchNotes: () => Promise<void>;
}

const defaultValue = {
    isFetching: false,
    fetchNotes: () => {},
};

export const RefetchCtx = createContext<RefetchType>(defaultValue);

export default function RefetchContext({ children, fetchNotes, isFetching }: Props) {
    return (
        <RefetchCtx.Provider value={{ fetchNotes, isFetching }}>
            {children}
        </RefetchCtx.Provider>
    )
}