import { useContext } from "react";
import { AuthCtx } from "../context/AuthCtx";

export default function useAuth () {
    return useContext(AuthCtx);
};