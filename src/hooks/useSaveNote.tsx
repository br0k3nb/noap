import { useContext } from "react";
import { SaveNoteCtx } from "../context/SaveNoteCtx";

export default function useSaveNote() {
    return useContext(SaveNoteCtx);
}