import { useContext } from "react";
import { NavbarCtx } from "../context/NavbarCtx";

export default function useNavbar() {
    return useContext(NavbarCtx);
}