import { useEffect, createContext, useContext, Dispatch, SetStateAction } from "react";
import { FieldArrayWithId, UseFieldArrayRemove } from "react-hook-form";
import { AiOutlineFullscreen, AiOutlineFullscreenExit, AiFillSetting, AiOutlineEllipsis } from 'react-icons/ai';
import { BsJournalRichtext } from 'react-icons/bs';

import TextEditor from "./components/lexical/App";
import { NoteContext } from "../Home";

import moment from "moment";
import "moment/locale/pt-br";

type Notes = {
  note: {
    _id: string;
    userId: string;
    title?: string;
    body: string;
    image?: string;
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

  useEffect(() => {
    if(window.innerWidth <= 640 && selectedNote?.selectedNote !== null) {
      setExpanded(!expanded); 
    }
  }, [selectedNote?.selectedNote]);

  const removeNote = () => {
    if((selectedNote?.selectedNote as number) > 0) selectedNote?.setSelectedNote(selectedNote?.selectedNote -1);
    else selectedNote?.setSelectedNote(null);

    deleteNote(notes[(selectedNote?.selectedNote as number)]._id);
    remove(selectedNote?.selectedNote);
  }

  const handleExpanded = () => {
    if(window.innerWidth <= 640) {
      selectedNote?.setSelectedNote(null);
      setExpanded(!expanded);
    }
    else setExpanded(!expanded);
  }

  const hours = (date: string) => moment(date).format("LT");
  const days = (date: string) => moment(date).format("ll");

  const lastUpdated = () => { 
    if(!notes[selectedNote?.selectedNote as number].updatedAt) return notes[selectedNote?.selectedNote as number].createdAt;
    else return notes[selectedNote?.selectedNote as number].updatedAt;
  }


  return (
    <div className={`h-screen w-screen bg-gray-700 text-gray-200 ${expanded ? "!xxs:flex" : "xxs:hidden"}`}>
      <div className="flex flex-col text-gray-200 pt-1">
        {selectedNote?.selectedNote !== null && (
          <div className="flex flex-row justify-between mt-1 py-[7.2px] px-4 mb-[4.8px]">
            <div>
              <div className="mr-2 tooltip tooltip-right !text-gray-200" data-tip={`${!expanded ? 'Expand note' : 'Minimize note'}`}>
                <button
                  className="hover:bg-stone-600 px-1 py-1 rounded"
                  onClick={() => handleExpanded()}
                >
                  {expanded ? (
                    <AiOutlineFullscreenExit size={22} />
                  ): (
                    <AiOutlineFullscreen size={22} />
                  )}
                </button>
              </div>
              <div className="tooltip tooltip-right !text-gray-200" data-tip="More settings">
                <button 
                  className="hover:bg-stone-600 px-1 py-1 rounded transition duration-200 ease-in-out"
                  // onClick={() => removeNote()}
                >
                  <AiOutlineEllipsis size={23} />
                </button>
              </div>
            </div>
                
            <div className="flex flex-row justify-start mr-2 py-2">
              <p className="px-2 text-sm xxs:text-[12px] xxs:px-0">Last updated on {days(lastUpdated() as string)} at {hours(lastUpdated() as string)}</p>
            </div>
          </div>
        )}
        
        <div className="flex flex-col">
          {selectedNote?.selectedNote !== null ? (
            <div 
              className="flex flex-col h-screen overflow-hidden pb-16 xxs:ml-0 overflow scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-900"
            >
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