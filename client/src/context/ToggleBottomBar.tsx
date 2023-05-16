import { createContext, Dispatch, SetStateAction } from 'react';

type ToggleBottomBarCtx = {
    showBottomBar: boolean;
    setShowBottomBar: Dispatch<SetStateAction<boolean>>;
};

type Props = {
    children: any,
    showBottomBar: boolean;
    setShowBottomBar: Dispatch<SetStateAction<boolean>>;
}

export const ToggleBottomBarCtx = createContext<ToggleBottomBarCtx | null>(null);

export default function ToggleBottomBarContext({ children, showBottomBar, setShowBottomBar }: Props) {

    return (
        <ToggleBottomBarCtx.Provider value={{ showBottomBar, setShowBottomBar }}>
            {children}
        </ToggleBottomBarCtx.Provider>
    )
}