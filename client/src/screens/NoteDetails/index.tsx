import { useContext } from "react";
import { FieldArrayWithId } from "react-hook-form";
import { OpenInFull, MoreHoriz, Notes } from "@mui/icons-material";

import TextEditor from "./components/lexical/App";
import { NoteContext } from "../Home";

type Notes = {
  note: {
    _id: string;
    userId: string;
    title?: string;
    body: string;
    state: string;
    updatedAt?: string;
    createdAt: string;
  }[];
};

type NotesArray = {
  notes: FieldArrayWithId<Notes, "note", "id">[];
};

export default function NoteDetails({notes}: NotesArray) {
  const selectedNote = useContext(NoteContext);

  return (
    <div className="h-screen w-screen bg-gray-700 xxs:hidden text-gray-200">
      <div className="flex flex-col text-gray-200 py-2">
        <div className="flex flex-row justify-between mt-2 py-[7.2px] px-4 mb-[4.8px]">
          <OpenInFull sx={{ fontSize: 22 }} className="rotate-90 " />
          <div className="tooltip text-gray-100" data-tip="Settings">
            <button>
              <MoreHoriz sx={{ fontSize: 25 }} />
            </button>
          </div>
        </div>
        {/* <div className="flex flex-row justify-start pb-[16px] pt-2">
          <p className="px-4 text-sm">Last edited in Mar 20, 2023  </p>
        </div> */}
        <div className="flex flex-col ">
          {selectedNote?.selectedNote !== null ? (
            <div className="flex flex-col h-screen pb-16 overflow-scroll">
              <TextEditor 
                index={selectedNote?.selectedNote as number}
                notes={notes} 
              />
            </div>
          ) : (
            <div className="flex flex-col text-center">
              <div className="mt-[20%]">
                <Notes sx={{ fontSize: 207 }} className="text-gray-500" />
                <p className="text-xl text-gray-500">
                  The selected note will appear here...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}