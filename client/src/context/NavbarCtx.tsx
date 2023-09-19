import { createContext, Dispatch, SetStateAction, ReactNode, useState } from 'react';

type NavContextType = {
    navbar: boolean;
    setNavbar: Dispatch<SetStateAction<boolean>>;
};

type NavContextProps = {
    children: ReactNode;
}

const defaultValue = {
    navbar: true,
    setNavbar: () => {}
};

export const NavbarCtx = createContext<NavContextType>(defaultValue);

export default function NavbarContext({ children }: NavContextProps) {
    const [navbar, setNavbar] = useState(false);

    return (
        <NavbarCtx.Provider value={{ navbar, setNavbar }}>
            {children}
        </NavbarCtx.Provider>
    )
}
