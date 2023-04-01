import { createContext, useContext, Dispatch, SetStateAction } from "react";
import { FieldArrayWithId, UseFieldArrayRemove } from "react-hook-form";
import { AiOutlineFullscreen, AiOutlineFullscreenExit, AiOutlineDelete } from 'react-icons/ai';
import { BsJournalRichtext } from 'react-icons/bs';

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

type Props = {
  notes: FieldArrayWithId<Notes, "note", "id">[];
  setExpanded: Dispatch<SetStateAction<boolean>>;
  deleteNote: (_id: string) => Promise<void>;
  remove: UseFieldArrayRemove;
  expanded: boolean;
};

type ExpandedContextProps = {
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
};

export default function NoteDetails({ notes, deleteNote, remove, expanded, setExpanded }: Props) {
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
      <div className="flex flex-col text-gray-200 pt-1">
        {selectedNote?.selectedNote !== null && (
          <div className="flex flex-row justify-between mt-1 py-[7.2px] px-4 mb-[4.8px]">
            <div className="tooltip tooltip-right !text-gray-200" data-tip={`${!expanded ? 'Expand note' : 'Minimize note'}`}>
              <button
                className="hover:bg-stone-600 px-1 py-1 rounded"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <AiOutlineFullscreenExit size={23} />
                ): (
                  <AiOutlineFullscreen size={23} />
                )}
              </button>
            </div>
            
            <div className="tooltip tooltip-left !text-gray-200" data-tip="Delete note">
              <button 
                className="hover:bg-stone-600 px-1 py-1 rounded transition duration-200 ease-in-out"
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
              <ExpandedContext.Provider value={{expanded, setExpanded}}>
                <TextEditor notes={notes} />
              </ExpandedContext.Provider>
            </div>
          ) : (
            <div className="flex flex-col text-center items-center">
              <div className="mt-[24%]">
                <div className="flex mx-20 mb-5">
                  <BsJournalRichtext size={166} className="text-gray-500" />
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

export const ExpandedContext = createContext<ExpandedContextProps | null>(null);