import { useContext } from "react";
import { SelectedNoteCtx } from "../context/SelectedNoteCtx";

export default function useSelectedNote() {
    return useContext(SelectedNoteCtx);
}