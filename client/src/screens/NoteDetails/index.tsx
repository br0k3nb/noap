import { useState, useContext, Dispatch, SetStateAction } from "react";
import { FieldArrayWithId, UseFieldArrayRemove } from "react-hook-form";

import { AiOutlineFullscreen, AiOutlineFullscreenExit, AiFillDelete, AiOutlineEllipsis } from 'react-icons/ai';
import { BsJournalRichtext, BsTagsFill, BsPeopleFill, BsArrowDown, BsArrowUp } from 'react-icons/bs';

import ConfirmationModal from "../../components/ConfirmationModal";
import SelectLabelModal from "./components/SelectLabelModal";
import TextEditor from "./components/lexical";

import { NoteCtx } from "../../context/SelectedNoteCtx";
import { RefetchCtx } from "../../context/RefetchCtx";

import NoteExpandedCtx from "../../context/NoteExpandedCtx";
import ToggleBottomBarContext from "../../context/ToggleBottomBar";

import moment from "moment";
import "moment/locale/pt-br";

type Props = {
  labels: FieldArrayWithId<Labels, "labels", "id">[];
  notes: FieldArrayWithId<Notes, "note", "id">[];
  setExpanded: Dispatch<SetStateAction<boolean>>;
  deleteNote: (_id: string) => Promise<void>;
  remove: UseFieldArrayRemove;
  labelIsFetching: boolean;
  expanded: boolean;
};

export default function NoteDetails({ notes, deleteNote, remove, expanded, setExpanded, labelIsFetching, labels }: Props) {
  const selectedNote = useContext(NoteCtx);
  const { fetchNotes } = useContext(RefetchCtx) as any;

  const [ open, setOpen ] = useState(false);
  const [ openLabelModal, setOpenlabelModal ] = useState(false);
  const [ showBottomBar, setShowBottomBar ] = useState(true);

  const note = notes.find(({_id}) => _id === selectedNote?.selectedNote);

  const removeNote = () => {
    selectedNote?.setSelectedNote(null);
    setExpanded(false);
    setOpen(false);

    deleteNote(selectedNote?.selectedNote as string);
    remove(notes.indexOf(note as FieldArrayWithId<Notes, "note", "id">));
    setTimeout(() => fetchNotes(), 500); 
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
    if(!note?.updatedAt) return note?.createdAt;
    else return note?.updatedAt;
  }

  return (
    <div className={`overflow-hidden w-screen h-screen bg-gray-700 text-gray-200 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-900 ${!expanded && "hidden lg:flex"}`}>
      <div className="flex flex-col text-gray-200 pt-1">
        {selectedNote?.selectedNote !== null && (
          <div className="flex flex-row justify-between mt-0 py-[7.5px] px-4 mb-[4.8px]">
            <div>
              <div className="mr-2 tooltip tooltip-right !text-gray-200" data-tip={`${!expanded ? 'Expand note' : 'Minimize note'}`}>
                <button className="hover:bg-stone-600 px-1 py-1 rounded" onClick={() => handleExpand()}>
                  {expanded ? <AiOutlineFullscreenExit size={22} /> : <AiOutlineFullscreen size={22} />}
                </button>
              </div>
              <div className="dropdown hover:bg-stone-600 rounded !inline !pt-[11px] pb-[1.28px] px-1">
                <label tabIndex={0}>
                  <div className="tooltip tooltip-right !text-gray-200" data-tip="Actions">      
                    <AiOutlineEllipsis size={23} />
                  </div>
                </label> 
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow  rounded-box w-52 bg-gray-800">
                  <li>
                    <a className="active:!bg-gray-600 hover:!bg-gray-700" onClick={() => setOpen(true)}>
                      <label htmlFor="my-modal-4" className="text-red-600 cursor-pointer">
                        <div className="flex flex-row space-x-2 ">
                          <p className="py-1 text-xs uppercase tracking-widest">Delete note</p>
                          <AiFillDelete size={20} className="pt-1"/>
                        </div>
                      </label>
                    </a>
                    <a className="active:!bg-gray-600 hover:!bg-gray-700" onClick={() => setOpenlabelModal(true)}>
                      <label htmlFor="my-modal-4" className="text-gray-300 cursor-pointer">
                        <div className="flex flex-row space-x-2">
                          <p className="py-1 text-xs uppercase tracking-widest">Attach labels</p>
                          <BsTagsFill size={20} className="pt-[3px]"/>
                        </div>
                      </label>
                    </a>
                    <button className="active:!bg-gray-600 hover:!bg-gray-700" onClick={() => setShowBottomBar(showBottomBar ? false : true)}> 
                      <label htmlFor="my-modal-4" className="text-gray-300 cursor-pointer">
                        <div className="flex flex-row space-x-2">
                          <p className="py-1 text-xs uppercase tracking-widest">{showBottomBar ? ("Hide bottom bar") : ("Show bottom bar")}</p>
                          {showBottomBar ? ( <BsArrowDown size={20} className="pt-[3px]"/> ) : ( <BsArrowUp size={20} className="pt-[3px]"/> )}
                        </div>
                      </label>
                    </button>
                    <a className="cursor-not-allowed active:!bg-transparent"> 
                      <label htmlFor="my-modal-4" className="text-gray-600">
                        <div className="flex flex-row space-x-2 cursor-not-allowed">
                          <p className="py-1 text-xs uppercase tracking-widest">Share Note</p>
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
              options={{
                alertComponentIcon: "warning",
                alertComponentText: "Be aware that this action can not be undone!",
                subTextCustomClassName: "px-6",
                mainTextCustomClassName: "mb-5 text-xs",
                modalWrapperClassName: "!w-96 xxs:!w-80 border border-gray-600"
              }}
            />
            <SelectLabelModal
              checked={openLabelModal}
              setChecked={setOpenlabelModal}
              isFetching={labelIsFetching}
              labels={labels}
              selectedNote={selectedNote?.selectedNote}
            />
            <div className="flex flex-row justify-start mr-3 py-2 absolute right-0">
              <p className="px-2 text-sm xxs:text-[10px] xxs:px-0">
                Last updated on {days(lastUpdated() as string)} at {hours(lastUpdated() as string)}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex flex-col w-screen">
          {selectedNote?.selectedNote !== null ? (
            <div className="!overflow-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-900">
              <NoteExpandedCtx expanded={expanded} setExpanded={setExpanded}>
                <ToggleBottomBarContext setShowBottomBar={setShowBottomBar} showBottomBar={showBottomBar}>
                  <TextEditor notes={notes} />
                </ToggleBottomBarContext>
              </NoteExpandedCtx >
            </div>
          ) : (
            <div className="flex flex-col justify-self-center mr-[28rem]">
              <div className="mt-[24%] mx-auto">                
                <BsJournalRichtext size={166} className="text-gray-500 mx-20 mb-5" />
                <p className="text-xl text-gray-500">The selected note will appear here...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}