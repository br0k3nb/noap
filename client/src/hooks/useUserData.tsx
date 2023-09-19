import { useContext } from "react";
import { UserDataCtx } from "../context/UserDataContext";

export default function useUserData() {
    return useContext(UserDataCtx);
}