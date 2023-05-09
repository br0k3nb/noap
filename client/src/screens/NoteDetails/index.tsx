import { useState, useContext, Dispatch, SetStateAction } from "react";
import { FieldArrayWithId, UseFieldArrayRemove } from "react-hook-form";

import { AiOutlineFullscreen, AiOutlineFullscreenExit, AiFillDelete, AiOutlineEllipsis } from 'react-icons/ai';
import { BsJournalRichtext, BsTagsFill, BsPeopleFill, BsArrowDown, BsArrowUp } from 'react-icons/bs';

import ConfirmationModal from "../../components/ConfirmationModal";
import SelectLabelModal from "./components/SelectLabelModal";
import TextEditor from "./components/lexical/App";

import { NoteCtx } from "../../context/SelectedNoteCtx";
import NoteExpandedCtx from "../../context/NoteExpandedCtx";

import moment from "moment";
import "moment/locale/pt-br";

type Notes = {
  note: {
    _id: string;
    userId: string;
    title?: string;
    body: string;
    image?: string;
    state: {
      _id: string;
      state: string;
    };
    updatedAt?: string;
    createdAt: string;
  }[];
};

type Labels = {
  labels: {
    _id: string;
    userId: string;
    name: string;
    color: string;
    fontColor?: string;
    type: string;
    updatedAt?: string;
    createdAt: string;
  }[];
};

type Props = {
  notes: FieldArrayWithId<Notes, "note", "id">[];
  setExpanded: Dispatch<SetStateAction<boolean>>;
  deleteNote: (_id: string) => Promise<void>;
  remove: UseFieldArrayRemove;
  labels: FieldArrayWithId<Labels, "labels", "id">[];
  labelIsFetching: boolean;
  expanded: boolean;
};

export default function NoteDetails({ notes, deleteNote, remove, expanded, setExpanded, labelIsFetching, labels }: Props) {
  const selectedNote = useContext(NoteCtx);
  const [ open, setOpen ] = useState(false);
  const [ openLabelModal, setOpenlabelModal ] = useState(false);

  const removeNote = () => {
    selectedNote?.setSelectedNote(null);
    setExpanded(false);
    setOpen(false);

    deleteNote(notes[(selectedNote?.selectedNote as number)]._id);
    remove(selectedNote?.selectedNote as number);
  }

  const handleExpand = () => {
    if(window.outerWidth <= 1030 && selectedNote?.selectedNote !== null) {
      selectedNote?.setSelectedNote(null);
      setExpanded(false);
    }
    else setExpanded(!expanded);
  }

  const hours = (date: string) => moment(date).format("LT");
  const days = (date: string) => moment(date).format("ll");

  const lastUpdated = () => { 
    if(!notes[selectedNote?.selectedNote as number]?.updatedAt) return notes[selectedNote?.selectedNote as number]?.createdAt;
    else return notes[selectedNote?.selectedNote as number]?.updatedAt;
  }

  const getSeletedNoteId = selectedNote?.selectedNote !== null && notes[selectedNote?.selectedNote as number]?._id;

  return (
    <div className={`overflow-hidden w-screen h-screen bg-gray-700 text-gray-200 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-900 ${!expanded && "hidden lg:flex"}`}>
      <div className="flex flex-col text-gray-200 pt-1">
        {selectedNote?.selectedNote !== null && (
          <div className="flex flex-row justify-between mt-0 py-[7.5px] px-4 mb-[4.8px]">
            <div>
              <div className="mr-2 tooltip tooltip-right !text-gray-200" data-tip={`${!expanded ? 'Expand note' : 'Minimize note'}`}>
                <button
                  className="hover:bg-stone-600 px-1 py-1 rounded"
                  onClick={() => handleExpand()}
                >
                  {expanded ? (
                    <AiOutlineFullscreenExit size={22} />
                  ): (
                    <AiOutlineFullscreen size={22} />
                  )}
                </button>
              </div>

              <div 
                className="dropdown hover:bg-stone-600 rounded !inline !pt-[11px] pb-[1.28px] px-1"
              >
                <label tabIndex={0}>
                  <div className="tooltip tooltip-right !text-gray-200" data-tip="Actions">      
                    <AiOutlineEllipsis size={23} />
                  </div>
                </label> 
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow  rounded-box w-52 bg-gray-800">
                  <li className="">
                    <a 
                      className="active:!bg-gray-600 hover:!bg-gray-700" 
                      onClick={() => setOpen(true)}
                    >
                      <label 
                        htmlFor="my-modal-4"
                        className="text-red-600"
                      >
                        <div className="flex flex-row space-x-2 ">
                          <p className="py-1 text-xs uppercase tracking-widest">
                            Delete note 
                          </p>
                          <AiFillDelete size={20} className="pt-1"/>
                        </div>
                      </label>
                    </a>
                    <a 
                      className="active:!bg-gray-600 hover:!bg-gray-700" 
                      onClick={() => setOpenlabelModal(true)}
                    >
                      <label 
                        htmlFor="my-modal-4"
                        className="text-gray-300"
                      >
                        <div className="flex flex-row space-x-2">
                          <p className="py-1 text-xs uppercase tracking-widest">
                            Attach labels
                          </p>
                          <BsTagsFill size={20} className="pt-[3px]"/>
                        </div>
                      </label>
                    </a>
                    <a 
                      className="cursor-not-allowed active:!bg-transparent" 
                      // onClick={() => setChecked(!checked)}
                    > 
                      <label 
                        htmlFor="my-modal-4"
                        className="text-gray-600"
                      >
                        <div className="flex flex-row space-x-2 cursor-not-allowed">
                          <p className="py-1 text-xs uppercase tracking-widest">
                            Hide bottom bar
                          </p>
                          <BsArrowDown size={20} className="pt-[3px]"/>
                        </div>
                      </label>
                    </a>
                    <a 
                      className="cursor-not-allowed active:!bg-transparent" 
                      // onClick={() => setChecked(!checked)}
                    > 
                      <label 
                        htmlFor="my-modal-4"
                        className="text-gray-600"
                      >
                        <div className="flex flex-row space-x-2 cursor-not-allowed">
                          <p className="py-1 text-xs uppercase tracking-widest">
                            Share Note
                          </p>
                          <BsPeopleFill size={20} className="pt-[3px]"/>
                        </div>
                      </label>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <ConfirmationModal
              open={open}
              setOpen={setOpen}
              deleteButtonAction={removeNote}
              mainText="Are you sure you want to delete this note?"
              mainTextCustomClassName="xxs:text-xs mb-5"
              modalWrapperClassName={`!w-96`}
            />
            <SelectLabelModal
              checked={openLabelModal}
              setChecked={setOpenlabelModal}
              isFetching={labelIsFetching}
              labels={labels}
              selectedNote={getSeletedNoteId}
            />

            <div className="flex flex-row justify-start mr-3 py-2 absolute right-0">
              <p 
                className="px-2 text-sm xxs:text-[10px] xxs:px-0"
              >
                Last updated on {days(lastUpdated() as string)} at {hours(lastUpdated() as string)}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex flex-col w-screen">
          {selectedNote?.selectedNote !== null ? (
            <div 
              className="!overflow-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-900"
            >
              <NoteExpandedCtx 
                expanded={expanded} 
                setExpanded={setExpanded}
              >
                <TextEditor notes={notes} />
              </NoteExpandedCtx >
            </div>
          ) : (
            <div className="flex flex-col justify-self-center mr-[28rem]">
              <div className="mt-[24%] mx-auto">
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