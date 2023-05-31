import { useContext } from "react";
import { AuthCtx } from "../context/authCtx";

export default function useAuth () {
    return useContext(AuthCtx);
};