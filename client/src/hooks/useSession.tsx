import { useContext } from "react";
import { SessionsCtx } from "../context/SessionCtx";

export default function useSession() {
    return useContext(SessionsCtx);
}