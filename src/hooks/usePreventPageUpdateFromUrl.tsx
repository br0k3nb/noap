import { useContext } from "react";
import { PreventPageUpdateCtx } from "../context/PreventPageUpdateCtx";

export default function usePreventPageUpdateFromUrl() {
    return useContext(PreventPageUpdateCtx);
}