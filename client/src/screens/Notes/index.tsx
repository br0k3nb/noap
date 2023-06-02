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
  addNewNote: () => Promise<void>;
  setPage: Dispatch<SetStateAction<number>>;
  setSearch: Dispatch<SetStateAction<string>>;
  setNavbar: Dispatch<SetStateAction<boolean>>;
  setExpanded: Dispatch<SetStateAction<boolean>>;
  notes: FieldArrayWithId<Notes, "note", "id">[];
};

export default function Notes({ 
    notes, 
    addNewNote, 
    isFetching, 
    navbar, 
    setNavbar, 
    expanded, 
    setExpanded, 
    setSearch, 
    search, 
    page, 
    setPage, 
    hasNextPage, 
    totalDocs 
}: Props) {
    const [ showSearch, setShowSearch ] = useState(false);
    
    const navTopBarProps = { hasNextPage, navbar, page, search, setNavbar, setPage, setSearch, setShowSearch, showSearch, totalDocs };
    const cardNotesProps = { addNewNote, isFetching, notes, setExpanded, page, search };  

    return (
        <div className={`overflow-hidden h-screen w-screen lg:max-w-[380px] border-r border-gray-600 !bg-gray-800 ${expanded && "hidden"}`}>
            <NoteTopBar {...navTopBarProps} />
            <CardNotes {...cardNotesProps} />
        </div>
    );
}