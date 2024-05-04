import { Dispatch } from "react";
import { FieldArrayWithId } from "react-hook-form";

import NoteTopBar from "./TopBar";
import CardNotes from "./CardNotes";
import Lists from "./Lists";

import useNoteSettings from "../../hooks/useNoteSettings";

import "moment/locale/pt-br";

import type { notesState, notesActions } from '../../reducers/noteReducer';
import type { pinnedNotesActions,  pinnedNotesState } from "../../reducers/pinNoteReducer";
import useUserData from "../../hooks/useUserData";

type Props = {
    pinNotesState: pinnedNotesState;
    notesState: notesState;
    isFetching: boolean;
    addNewNote: () => Promise<void>;
    notesMetadata: FieldArrayWithId<NoteMetadata, "noteMetadata", "id">[];
    pinnedNotes: FieldArrayWithId<NoteMetadata, "noteMetadata", "id">[];
    dispatchPinNotes: Dispatch<pinnedNotesActions>;
    dispatchNotes: Dispatch<notesActions>;
    delayedSearch: string;
};

export default function Notes({
    pinNotesState,
    notesState,
    notesMetadata,
    addNewNote, 
    isFetching,
    pinnedNotes,
    dispatchPinNotes,
    dispatchNotes,
    delayedSearch
}: Props) {
    const { noteSettings: { expanded } } = useNoteSettings();

    const navTopBarProps = {
        pinnedNotes,
        pinNotesState,
        notesState,
        dispatchNotes,
        addNewNote,
        isFetching
    };

    const cardNotesProps = { 
        notesMetadata, 
        isFetching, 
        pinnedNotes,
        addNewNote,
        pinNotesState,
        notesState,
        dispatchPinNotes,
        dispatchNotes,
        delayedSearch
    };

    const { userData: { settings: { noteVisualization } } } = useUserData();

    return (
        <div 
            className={`
                overflow-hidden w-screen h-screen lg:max-w-[380px] border-r border-stone-300 dark:border-[#404040] bg-[#f8f8f8] dark:!bg-[#0f1011]
                ${expanded && "hidden"}
            `}
        >
            <NoteTopBar {...navTopBarProps} />
            
            {!noteVisualization || noteVisualization === "cards" ? (
                <CardNotes {...cardNotesProps} />
            ): (
                <Lists {...cardNotesProps} />
            )}
        </div>
    );
}