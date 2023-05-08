import { createContext } from "react";

type RefetchType = {
  fetchNotes: () => Promise<void>;
}

type Props = {
    children: any,
    fetchNotes: () => Promise<void>;
}

export const RefetchCtx = createContext<RefetchType | null>(null);

export default function RefetchContext({ children, fetchNotes }: Props) {

    return (
        <RefetchCtx.Provider value={{ fetchNotes }}>
            {children}
        </RefetchCtx.Provider>
    )
}