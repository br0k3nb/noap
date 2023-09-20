import { useState, Dispatch } from "react";
import { FieldArrayWithId } from "react-hook-form";

import NoteTopBar from "./NoteTopBar";
import CardNotes from "./CardNotes";

import useNoteSettings from "../../hooks/useNoteSettings";

import "moment/locale/pt-br";

import type { pinnedNotesState, notesState, notesActions, pinnedNotesActions } from '../Home/reducers';

type Props = {
    pinNotesState: pinnedNotesState;
    notesState: notesState;
    isFetching: boolean;
    addNewNote: () => Promise<void>;
    notesMetadata: FieldArrayWithId<NoteMetadata, "noteMetadata", "id">[];
    pinnedNotes: FieldArrayWithId<NoteMetadata, "noteMetadata", "id">[];
    dispatchPinNotes: Dispatch<pinnedNotesActions>;
    dispatchNotes: Dispatch<notesActions>;
};

export default function Notes({
    pinNotesState,
    notesState,
    notesMetadata,
    addNewNote, 
    isFetching,
    pinnedNotes,
    dispatchPinNotes,
    dispatchNotes
}: Props) {
    const [showSearch, setShowSearch] = useState(false);    

    const { noteSettings: { expanded } } = useNoteSettings();

    const navTopBarProps = { 
        setShowSearch,
        showSearch,
        pinnedNotes,
        pinNotesState,
        notesState,
        dispatchNotes
    };

    const cardNotesProps = { 
        notesMetadata, 
        isFetching, 
        pinnedNotes,
        addNewNote,
        pinNotesState,
        notesState,
        dispatchPinNotes,
        dispatchNotes
    };

    return (
        <div 
            className={`
                overflow-hidden h-screen w-screen lg:max-w-[380px] border-r border-stone-300 dark:border-[#404040] bg-[#f8f8f8] dark:!bg-[#0f1011]
                ${expanded && "hidden"}
            `}
        >
            <NoteTopBar {...navTopBarProps} />
            <CardNotes {...cardNotesProps} />
        </div>
    );
}