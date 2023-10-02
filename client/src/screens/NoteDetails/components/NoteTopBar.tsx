import { Dispatch, SetStateAction, useState } from "react";
import { UseFormReset, FieldValues, FieldArrayWithId, UseFieldArrayRemove, UseFieldArrayAppend } from 'react-hook-form';
import { Link } from "react-router-dom";

import {
  AiFillDelete,
  AiOutlineEllipsis,
  AiFillRead,
  AiFillEdit,
  AiOutlineFullscreen,
  AiOutlineFullscreenExit
} from "react-icons/ai";
import {
  BsTagsFill,
  BsPeopleFill,
  BsArrowDown,
  BsArrowUp,
  BsFillPinAngleFill,
  BsFillFileEarmarkImageFill
} from "react-icons/bs";

import { IoMdColorPalette } from 'react-icons/io';
import { BiRename } from 'react-icons/bi';

import useNoteSettings from "../../../hooks/useNoteSettings";
import useGetUrl from "../../../hooks/useGetUrl";

import NoteImageModal from './NoteImageModal';
import { toastAlert } from "../../../components/Alert";
import api from "../../../components/CustomHttpInterceptor";

import type { pinnedNotesActions, pinnedNotesState } from "../../../reducers/pinNoteReducer";
import useSelectedNote from "../../../hooks/useSelectedNote";
import useRefetch from "../../../hooks/useRefetch";

type NoteDropdownType = {
  readMode: boolean;
  renameNote: boolean;
  showBottomBar: boolean;
  selectedNoteData: NoteData | null
  handleToggleBottomBar: () => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
  handleToggleReadMode: (data: string) => void;
  setRenameNote: Dispatch<SetStateAction<boolean>>;
  setOpenlabelModal: Dispatch<SetStateAction<boolean>>;
  setOpenChangeNoteBackgroundModal: Dispatch<SetStateAction<boolean>>;
  reset: UseFormReset<FieldValues>;
  handleExpand: () => void;
  pinNotesState: pinnedNotesState;
  setSelectedNoteData: Dispatch<SetStateAction<NoteData | null>>;
  pinNotes: FieldArrayWithId<NoteMetadata, "noteMetadata", "id">[]
  labels: FieldArrayWithId<Labels, "labels", "id">[];
  appendPinNotes: UseFieldArrayAppend<NoteMetadata, "noteMetadata">;
  notes: FieldArrayWithId<NoteMetadata, "noteMetadata", "id">[];
  append: UseFieldArrayAppend<NoteMetadata, "noteMetadata">;
  removePinNotes: UseFieldArrayRemove;
  remove: UseFieldArrayRemove;
  noteDataIsFetching: boolean;
  dispatchPinNotes: Dispatch<pinnedNotesActions>;
};

export default function NoteTopBar({
  reset,
  notes,
  append,
  remove,
  setOpen,
  pinNotes,
  readMode,
  renameNote,
  handleExpand,
  setRenameNote,
  showBottomBar,
  pinNotesState,
  appendPinNotes,
  removePinNotes,
  dispatchPinNotes,
  selectedNoteData,
  setOpenlabelModal,
  setSelectedNoteData,
  handleToggleReadMode,
  handleToggleBottomBar,
  setOpenChangeNoteBackgroundModal,
}: NoteDropdownType) {
    const [openNoteImageModal, setOpenNoteImageModal] = useState(false);
    const { noteSettings: { expanded }, setNoteSettings } = useNoteSettings();

    const getUrlWithoutNoteId = useGetUrl({
      options: { 
        usePage: false, 
        removeNoteId: true, 
        absolutePath: true
      }
    });

    const { selectedNote } = useSelectedNote();
    const { fetchNotes } = useRefetch();

    const note = notes.find(({ _id }) => _id === selectedNote) as FieldArrayWithId<NoteMetadata, "noteMetadata", "id">;
    const pinNote = pinNotes.find(({ _id }) => _id === selectedNote) as FieldArrayWithId<NoteMetadata, "noteMetadata", "id">;

    const handleOpenLabelModal = () => {
        let fieldsToReset = {};
    
        if(selectedNoteData?.labels && selectedNoteData.labels.length > 0) {
          selectedNoteData.labels.forEach(label => {
            fieldsToReset = {
              ...fieldsToReset,
              [label._id]: true
            }        
          });
        }
        
        reset(fieldsToReset);
        setOpenlabelModal(true);
      };
    
    const handlePinNote = async () => {
        try {
          const { data: { message } } = await api.post(`/note/pin-note/${selectedNoteData?._id}`, {
            condition: !selectedNoteData?.settings.pinned
          });
    
          setNoteSettings((prevNoteSettings) => {
            return {
            ...prevNoteSettings,
              pinned: !selectedNoteData?.settings.pinned
            }
          });
    
          setSelectedNoteData((prevData: any) => {
            return {
              ...prevData,
              settings: {
                ...prevData?.settings,
                pinned: !selectedNoteData?.settings.pinned
              }
            }
          });
    
          if(pinNote?.settings.pinned) {
            append(pinNote);
            
            if(pinNotes.length === 1) {
              dispatchPinNotes({ type: "PAGE", payload: pinNotesState.page - 1 });
              removePinNotes(pinNotes.indexOf(pinNote));
            }
            else removePinNotes(pinNotes.indexOf(pinNote));
          }
          else {
            appendPinNotes(note);
            remove(notes.indexOf(note));
          }
          
          fetchNotes();
          toastAlert({ icon: "success", title: message, timer: 2000 });
        } catch (err: any) {
          console.log(err);
          toastAlert({ icon: "error", title: err.message, timer: 2000 });
        }
    };

  return (
    <>
      <NoteImageModal
        notes={notes}
        pinNotes={pinNotes}
        open={openNoteImageModal}
        setOpen={setOpenNoteImageModal}
      />
      <div className="flex flex-row justify-between mt-0 py-[7.5px] px-2 mb-[4.8px]">
          <div className="flex flex-row mb-1 mt-1"> 
            <div
              className="tooltip tooltip-right tooltip-right-color-controller"
              data-tip={`${!expanded ? "Expand note" : "Minimize note"}`}
            >
              <Link
                onClick={() => handleExpand()}
                to={`${innerWidth < 1030 ? getUrlWithoutNoteId : ''}`}
              >
                {expanded ? (
                  <div className="hover:!bg-[#dadada] dark:hover:!bg-stone-600 px-1 py-1 rounded">
                    <AiOutlineFullscreenExit size={22} />
                  </div>
                  
                ) : (
                  <div className="hover:!bg-[#dadada] dark:hover:!bg-stone-600 px-1 py-1 rounded">
                    <AiOutlineFullscreen size={22} />
                  </div>
                )}
              </Link>
            </div>
            {innerWidth > 1030 && (
              <>
                <div className="mx-2 border border-transparent !border-r-gray-600 !h-[20px] mt-[5px] p-0 !rounded-none"/>
                <div
                  className="tooltip tooltip-right tooltip-right-color-controller"
                  data-tip={`${selectedNoteData?.settings.pinned ? "Unpin note" : "Pin note"}`}
                >
                  <button 
                    className="hover:bg-[#dadada] dark:hover:bg-stone-600 px-[5px] py-1 rounded" 
                    onClick={() => handlePinNote()}
                  >
                    {selectedNoteData?.settings.pinned ? (
                      <BsFillPinAngleFill size={22} />
                    ) : ( 
                      <BsFillPinAngleFill size={22} /> 
                    )}
                  </button>
                </div>
                <div className="mx-2 border border-transparent !border-r-gray-600 !h-[20px] mt-[5px] p-0 !rounded-none"/>
                <div
                  className="tooltip tooltip-right tooltip-right-color-controller"
                  data-tip={`Attach labels`}
                >
                  <button 
                    className="hover:bg-[#dadada] dark:hover:bg-stone-600 px-[5px] py-1 rounded" 
                    onClick={() => handleOpenLabelModal()}
                  >                    
                    <BsTagsFill size={22} />
                  </button>
                </div>
                <div className="mx-2 border border-transparent !border-r-gray-600 !h-[20px] mt-[5px] p-0 !rounded-none"/>
                <div
                  className="tooltip tooltip-right tooltip-right-color-controller"
                  data-tip={readMode ? "Edit mode" : "Read mode"}
                >
                  <button 
                    className="hover:bg-[#dadada] dark:hover:bg-stone-600 px-[5px] py-1 rounded" 
                    onClick={() => handleToggleReadMode(readMode ? "edit" : "full")}
                  >                    
                    {!readMode ? <AiFillRead size={22} /> : <AiFillEdit size={22} />}
                  </button>
                </div>
              </>
            )}
            <div className="mx-2 border border-transparent !border-r-gray-600 !h-[20px] mt-[5px] p-0 !rounded-none"/>
            <div className="dropdown hover:bg-[#dadada] dark:hover:bg-stone-600 rounded h-[1.92rem] px-[3.5px] cursor-pointer">
              <label tabIndex={0} className="cursor-pointer">
                <div
                  className="tooltip tooltip-right tooltip-right-color-controller"
                  data-tip="Actions"
                >
                  <AiOutlineEllipsis size={24} className="mt-[3px]" />
                </div>
              </label>
              <ul 
                tabIndex={0}
                className="!pr-1 rounded-box !z-50 dropdown-content menu shadow bg-[#f8f8f8] dark:bg-[#1c1d1e] border border-gray-500"
              >
                <div className="pr-2 !w-[200px] xxs:!h-64 h-96 overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-900 dark:scrollbar-thumb-gray-500">
                  <li>
                    <a
                      className="active:!bg-[#c1c1c1] hover:!bg-[#e2e2e2] dark:hover:!bg-[#323232] dark:active:!bg-[#404040]"
                      onClick={() => handlePinNote()}
                    >
                      <label
                        htmlFor="my-modal-4"
                        className="text-gray-900 dark:text-gray-300 cursor-pointer"
                      >
                          <div className="flex flex-row space-x-2">
                            {selectedNoteData?.settings.pinned ? (
                              <>
                                <p className="py-2 text-xs uppercase tracking-widest">
                                  Unpin note
                                </p>
                                <BsFillPinAngleFill size={20} className="my-auto" />
                              </>
                            ) : (
                              <>  
                                <p className="py-2 text-xs uppercase tracking-widest">
                                  Pin note
                                </p>
                                <BsFillPinAngleFill size={20} className="my-auto" />
                              </>
                            )}
                            
                          </div>
                        </label>
                      </a>
                      <div className="mx-2 border border-transparent !border-b-gray-700 dark:!border-b-[#404040] !h-[1px] p-0 !rounded-none"/>
                      <a
                        className="active:!bg-[#c1c1c1] hover:!bg-[#e2e2e2] dark:hover:!bg-[#323232] dark:active:!bg-[#404040]"
                        onClick={() => handleOpenLabelModal()}
                      >
                        <label
                          htmlFor="my-modal-4"
                          className="text-gray-900 dark:text-gray-300 cursor-pointer"
                        >
                          <div className="flex flex-row space-x-2">
                            <p className="py-2 text-xs uppercase tracking-widest">
                              Attach labels
                            </p>
                            <BsTagsFill size={20} className="my-auto" />
                          </div>
                        </label>
                      </a>
                      <div className="mx-2 border border-transparent !border-b-gray-700 dark:!border-b-[#404040] !h-[1px] p-0 !rounded-none"/>
                      <button
                        className="active:!bg-[#c1c1c1] hover:!bg-[#e2e2e2] dark:hover:!bg-[#323232] dark:active:!bg-[#404040]"
                        onClick={() => handleToggleReadMode(readMode ? "edit" : "full")}
                      >
                        <label
                          htmlFor="my-modal-4"
                          className="text-gray-900 dark:text-gray-300 cursor-pointer"
                        >
                          <div className="flex flex-row space-x-2">
                            <p className="py-2 text-xs uppercase tracking-widest">
                              {readMode ? "Edit mode" : "Read mode"}
                            </p>
                            {!readMode ? (
                              <AiFillRead size={22} className="my-auto" />
                            ) : (
                              <AiFillEdit size={22} className="my-auto" />
                            )}
                          </div>
                        </label>
                      </button>
                      <div className="mx-2 border border-transparent !border-b-gray-700 dark:!border-b-[#404040] !h-[1px] p-0 !rounded-none"/>
                      <a className="cursor-not-allowed active:!bg-transparent">
                        <label htmlFor="my-modal-4" className="text-gray-600">
                          <div className="flex flex-row space-x-2 cursor-not-allowed">
                            <p className="py-2 text-xs uppercase tracking-widest">
                              Share Note
                            </p>
                            <BsPeopleFill size={20} className="my-auto" />
                          </div>
                        </label>
                      </a>
                      <div className="mx-2 border border-transparent !border-b-gray-700 dark:!border-b-[#404040] !h-[1px] p-0 !rounded-none"/>
                      <button
                        className="active:!bg-[#c1c1c1] hover:!bg-[#e2e2e2] dark:hover:!bg-[#323232] dark:active:!bg-[#404040]"
                        onClick={() => handleToggleBottomBar()}
                      >
                        <label
                          htmlFor="my-modal-4"
                          className="text-gray-900 dark:text-gray-300 cursor-pointer"
                        >
                          <div className="flex flex-row space-x-2">
                            <p className="py-2 text-[11px] uppercase tracking-widest">
                              {showBottomBar ? "Hide bottom bar" : "Show bottom bar"}
                            </p>
                            {showBottomBar ? (
                              <BsArrowDown size={20} className="my-auto" />
                            ) : (
                              <BsArrowUp size={20} className="my-auto" />
                            )}
                          </div>
                        </label>
                      </button>
                      <div className="mx-2 border border-transparent !border-b-gray-700 dark:!border-b-[#404040] !h-[1px] p-0 !rounded-none"/>
                      <button
                        className="active:!bg-[#c1c1c1] hover:!bg-[#e2e2e2] dark:hover:!bg-[#323232] dark:active:!bg-[#404040]"
                        onClick={() => setRenameNote(!renameNote)}
                      >
                        <label
                          htmlFor="my-modal-4"
                          className="text-gray-900 dark:text-gray-300 cursor-pointer"
                        >
                          <div className="flex flex-row space-x-2">
                            <p className="py-2 text-xs uppercase tracking-widest">
                              Rename note
                            </p>
                            <BiRename size={22} className="my-auto" />
                          </div>
                        </label>
                      </button>
                      <div className="mx-2 border border-transparent !border-b-gray-700 dark:!border-b-[#404040] !h-[1px] p-0 !rounded-none"/>
                      <a
                        className="active:!bg-[#c1c1c1] hover:!bg-[#e2e2e2] dark:hover:!bg-[#323232] dark:active:!bg-[#404040]"
                        onClick={() => setOpenChangeNoteBackgroundModal(true)}
                      >
                        <label
                          htmlFor="my-modal-4"
                          className="text-gray-900 dark:text-gray-300 cursor-pointer"
                        >
                          <div className="flex flex-row space-x-2">
                            <p className="py-1 text-xs uppercase tracking-widest">
                              Change note background
                            </p>
                            <IoMdColorPalette size={32} className="mt-[4px]" />
                          </div>
                        </label>
                      </a>
                      <div className="mx-2 border border-transparent !border-b-gray-700 dark:!border-b-[#404040] !h-[1px] p-0 !rounded-none" />
                      <a
                        className="active:!bg-[#c1c1c1] hover:!bg-[#e2e2e2] dark:hover:!bg-[#323232] dark:active:!bg-[#404040]"
                        onClick={() => setOpenNoteImageModal(true)}
                      >
                        <label
                          htmlFor="my-modal-4"
                          className="text-gray-900 dark:text-gray-300 cursor-pointer"
                        >
                          <div className="flex flex-row space-x-2">
                            <p className="py-2 text-xs uppercase tracking-widest">
                              Change note image
                            </p>
                            <BsFillFileEarmarkImageFill size={20} className="my-auto" />
                          </div>
                        </label>
                      </a>
                      <div className="mx-2 border border-transparent !border-b-gray-700 dark:!border-b-[#404040] !h-[1px] p-0 !rounded-none" />
                      <a
                        className="active:!bg-[#c1c1c1] hover:!bg-[#e2e2e2] dark:hover:!bg-[#323232] dark:active:!bg-[#404040]"
                        onClick={() => setOpen(true)}
                      >
                        <label
                          htmlFor="my-modal-4"
                          className="text-red-600 cursor-pointer"
                        >
                          <div className="flex flex-row space-x-2 ">
                            <p className="py-2 text-xs uppercase tracking-widest">
                              Delete note
                            </p>
                            <AiFillDelete size={20} className="my-auto" />
                          </div>
                        </label>
                      </a>
                  </li>
                </div>
              </ul>
            </div>
          </div>
        </div>
    </>
  )
}