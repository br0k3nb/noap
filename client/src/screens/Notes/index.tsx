import { SetStateAction, Dispatch, useState } from "react";
import { FieldArrayWithId } from "react-hook-form";

import NoteTopBar from "./NoteTopBar";
import CardNotes from "./CardNotes";

import "moment/locale/pt-br";

type Props = {
  page: number;
  search: string;
  navbar: boolean;
  expanded: boolean;
  totalDocs: number;
  isFetching: boolean;
  hasNextPage: boolean;
  totalPinnedDocs: number;
  pinnedNotesPage: number;
  pinnedNotesHasNextPage: boolean;
  addNewNote: () => Promise<void>;
  setPage: Dispatch<SetStateAction<number>>;
  setSearch: Dispatch<SetStateAction<string>>;
  setNavbar: Dispatch<SetStateAction<boolean>>;
  setExpanded: Dispatch<SetStateAction<boolean>>;
  notesMetadata: FieldArrayWithId<NoteMetadata, "noteMetadata", "id">[];
  pinnedNotes: FieldArrayWithId<NoteMetadata, "noteMetadata", "id">[];
  setPinnedNotesPage: Dispatch<SetStateAction<number>>;
};

export default function Notes({ 
    page, 
    notesMetadata, 
    navbar, 
    search, 
    setPage, 
    expanded, 
    setNavbar,
    setSearch, 
    totalDocs,
    addNewNote, 
    isFetching, 
    pinnedNotes,
    setExpanded, 
    hasNextPage, 
    totalPinnedDocs,
    pinnedNotesPage,
    setPinnedNotesPage,
    pinnedNotesHasNextPage
}: Props) {
    const [showSearch, setShowSearch] = useState(false);    

    const navTopBarProps = { 
        hasNextPage, 
        navbar, 
        page, 
        search, 
        setNavbar, 
        setPage, 
        setSearch, 
        setShowSearch, 
        showSearch, 
        totalDocs: 
            totalDocs && totalPinnedDocs ? totalDocs + totalPinnedDocs 
            : !totalDocs && totalPinnedDocs ? totalPinnedDocs : totalDocs
        ,
        pinnedNotes,
    };

    const cardNotesProps = { 
        page, 
        notesMetadata, 
        search, 
        isFetching, 
        pinnedNotes,
        setExpanded, 
        addNewNote, 
        pinnedNotesPage, 
        setPinnedNotesPage,
        pinnedNotesHasNextPage
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