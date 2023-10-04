import { useContext } from "react";
import { NoteSettingsCtx } from "../context/NoteSettingsCtx";

export default function useNoteSettings() {
    return useContext(NoteSettingsCtx);
}