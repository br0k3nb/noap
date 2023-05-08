import { createContext, Dispatch, SetStateAction } from 'react';

type NavContext = {
    navbar: boolean;
    setNavbar: Dispatch<SetStateAction<boolean>>;
};

type Props = {
    children: any,
    navbar: boolean;
    setNavbar: Dispatch<SetStateAction<boolean>>;
}

export const NavbarCtx = createContext<NavContext | null>(null);

export default function NavbarContext({ children, navbar, setNavbar }: Props) {

    return (
        <NavbarCtx.Provider value={{ navbar, setNavbar }}>
            {children}
        </NavbarCtx.Provider>
    )
}


