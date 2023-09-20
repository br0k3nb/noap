import { useContext } from "react";
import { RefetchCtx } from "../context/RefetchCtx";

export default function useRefetch() {
    return useContext(RefetchCtx);
}