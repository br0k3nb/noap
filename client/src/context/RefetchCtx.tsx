import { createContext } from "react";

type RefetchType = {
    isFetching: boolean;
    fetchNotes: () => Promise<void>;
}

type Props = {
    children: any,
    isFetching: boolean;
    fetchNotes: () => Promise<void>;
}

export const RefetchCtx = createContext<RefetchType | null>(null);

export default function RefetchContext({ children, fetchNotes, isFetching }: Props) {

    return (
        <RefetchCtx.Provider value={{ fetchNotes, isFetching }}>
            {children}
        </RefetchCtx.Provider>
    )
}