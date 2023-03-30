import { useContext } from "react";
import { FieldArrayWithId, UseFieldArrayRemove } from "react-hook-form";
import { AiOutlineExpandAlt, AiOutlineDelete } from 'react-icons/ai';
import { BsJournalRichtext } from 'react-icons/bs';

import TextEditor from "./components/lexical/App";
import { NoteContext } from "../Home";
// import { NoteWasChanged } from "../Home";

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

type Props = {
  notes: FieldArrayWithId<Notes, "note", "id">[];
  deleteNote: (_id: string) => Promise<void>
  remove: UseFieldArrayRemove;
};

export default function NoteDetails({notes, deleteNote, remove}: Props) {
  const selectedNote = useContext(NoteContext);
  // const noteWasChangedContext = useContext(NoteWasChanged);

  const removeNote = () => {
    if((selectedNote?.selectedNote as number) > 0) selectedNote?.setSelectedNote(selectedNote?.selectedNote -1);
    else selectedNote?.setSelectedNote(null);

    deleteNote(notes[(selectedNote?.selectedNote as number)]._id);
    remove(selectedNote?.selectedNote);
  }

  return (
    <div className="h-screen w-screen bg-gray-700 xxs:hidden text-gray-200">
      <div className="flex flex-col text-gray-200 py-2">
        {selectedNote?.selectedNote !== null && (
          <div className="flex flex-row justify-between mt-2 py-[7.2px] px-4 mb-[4.8px]">
            <AiOutlineExpandAlt size={23} />
            <div className="tooltip text-gray-100" data-tip="Settings">
              <button 
                onClick={() => removeNote()}
              >
                <AiOutlineDelete size={23} />
              </button>
            </div>
          </div>
        )}
        {/* <div className="flex flex-row justify-start pb-[16px] pt-2">
          <p className="px-4 text-sm">Last edited in Mar 20, 2023  </p>
        </div> */}
        <div className="flex flex-col ">
          {selectedNote?.selectedNote !== null ? (
            <div className="flex flex-col h-screen pb-16 overflow-scroll">
              <TextEditor notes={notes} />
            </div>
          ) : (
            <div className="flex flex-col text-center items-center">
              <div className="mt-[24%]">
                <div className="flex mx-20 mb-5">
                  <BsJournalRichtext size={176} className="text-gray-500" />
                </div>
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