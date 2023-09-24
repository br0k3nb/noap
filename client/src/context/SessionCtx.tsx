import { createContext, ReactNode } from 'react';
import { UseFieldArrayRemove, FieldArrayWithId } from "react-hook-form";

interface SessionContext {
    isFetching?: boolean;
    removeSession?: UseFieldArrayRemove;
    fetchSessions?: () => Promise<void>;
    sessions: FieldArrayWithId<Sessions, "sessions", "id">[];
}

interface SessionContextProps extends SessionContext {
    children: ReactNode,
}

const defaultValue = {
    sessions: []
};

export const SessionsCtx = createContext<SessionContext>(defaultValue);

export default function SessionsContext({
    children,
    isFetching,
    fetchSessions,
    sessions,
    removeSession,
}: SessionContextProps) {
    return (
        <SessionsCtx.Provider value={{ isFetching, fetchSessions, sessions, removeSession }}>
            {children}
        </SessionsCtx.Provider>
    )
}