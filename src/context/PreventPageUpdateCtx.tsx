import { createContext, Dispatch, SetStateAction, ReactNode, useState } from 'react';

type PreventUpdatePageType = {
    preventPageUpdateFromUrl: boolean;
    setPreventPageUpdateFromUrl: Dispatch<SetStateAction<boolean>>;
};

type PreventUpdatePageProps = {
    children: ReactNode;
}

const defaultValue = {
    preventPageUpdateFromUrl: false,
    setPreventPageUpdateFromUrl: () => {}
};

export const PreventPageUpdateCtx = createContext<PreventUpdatePageType>(defaultValue);

export default function PreventUpdatePageFromUrlContext({ children }: PreventUpdatePageProps) {
    const [preventPageUpdateFromUrl, setPreventPageUpdateFromUrl] = useState(false);

    return (
        <PreventPageUpdateCtx.Provider 
            value={{ preventPageUpdateFromUrl, setPreventPageUpdateFromUrl }}
        >
            {children}
        </PreventPageUpdateCtx.Provider>
    )
}
