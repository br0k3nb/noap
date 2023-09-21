import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { 
  useForm,
  FieldArrayWithId,
  UseFieldArrayRemove,
  UseFieldArrayAppend,
  FieldValues
} from "react-hook-form";

import { Link, useNavigate } from 'react-router-dom';

import {
  AiOutlineFullscreen,
  AiOutlineFullscreenExit,
  AiFillDelete,
  AiOutlineEllipsis,
  AiFillRead,
  AiFillEdit,
  AiFillInfoCircle
} from "react-icons/ai";
import {
  BsTagsFill,
  BsPeopleFill,
  BsArrowDown,
  BsArrowUp,
  BsFillPinAngleFill
} from "react-icons/bs";

import { IoMdColorPalette } from 'react-icons/io';

import { BiRename } from 'react-icons/bi';

import ConfirmationModal from "../../components/ConfirmationModal";
import SelectLabelModal from "./components/SelectLabelModal";
import TextEditor from "./components/lexical";

import useNoteSettings from "../../hooks/useNoteSettings";
import useSelectedNote from "../../hooks/useSelectedNote";
import useUserData from "../../hooks/useUserData";
import useRefetch from "../../hooks/useRefetch";
import useGetUrl from "../../hooks/useGetUrl";

import api from "../../services/api";
import { toastAlert } from "../../components/Alert";

import ColorPicker from "./components/lexical/ui/ColorPicker";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";

import moment from "moment";
import "moment/locale/pt-br";

import type { pinnedNotesActions, pinnedNotesState } from "../../reducers/pinNoteReducer";

type Props = {
  labels: FieldArrayWithId<Labels, "labels", "id">[];
  appendPinNotes: UseFieldArrayAppend<NoteMetadata, "noteMetadata">;
  pinNotes: FieldArrayWithId<NoteMetadata, "noteMetadata", "id">[];
  notes: FieldArrayWithId<NoteMetadata, "noteMetadata", "id">[];
  append: UseFieldArrayAppend<NoteMetadata, "noteMetadata">;
  deleteNote: (_id: string) => Promise<void>;
  setSelectedNoteData: Dispatch<SetStateAction<NoteData | null>>,
  removePinNotes: UseFieldArrayRemove;
  remove: UseFieldArrayRemove;
  selectedNoteData: NoteData | null;
  labelIsFetching: boolean;
  noteDataIsFetching: boolean;
  dispatchPinNotes: Dispatch<pinnedNotesActions>;
  pinNotesState: pinnedNotesState;
};

export default function NoteDetails({
  notes,
  deleteNote,
  append,
  remove,
  pinNotes,
  labels,
  appendPinNotes,
  removePinNotes,
  labelIsFetching,
  selectedNoteData,
  setSelectedNoteData,
  noteDataIsFetching,
  dispatchPinNotes,
  pinNotesState
}: Props) {
  const { fetchNotes } = useRefetch();
  
  const [open, setOpen] = useState(false);
  const [readMode, setReadMode] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [renameNote, setRenameNote] = useState(false);
  const [showBottomBar, setShowBottomBar] = useState(true);
  const [openLabelModal, setOpenlabelModal] = useState(false);
  const [openNoteInfoModal, setOpenNoteInfoModal] = useState(false);
  const [openChangeNoteBackgroundModal, setOpenChangeNoteBackgroundModal] = useState(false);
  
  const { register, reset, handleSubmit } = useForm();
  const { 
    register: registerNoteName, 
    reset: resetNoteName, 
    handleSubmit: handleSubmitNoteName 
  } = useForm();
  
  const navigate = useNavigate();
  const { noteSettings: { expanded }, setNoteSettings } = useNoteSettings();
  const { userData, setUserData } = useUserData();
  const { selectedNote, setSelectedNote } = useSelectedNote();

  const note = notes.find(({ _id }) => _id === selectedNote) as FieldArrayWithId<NoteMetadata, "noteMetadata", "id">;
  const pinNote = pinNotes.find(({ _id }) => _id === selectedNote) as FieldArrayWithId<NoteMetadata, "noteMetadata", "id">;

  const fullscreenChangeCallbackWasCalled = useRef(false);

  useEffect(() => { 
    resetNoteName({ name: selectedNoteData?.name });
    setNoteSettings((prevNoteSettings) => {
      return {
        ...prevNoteSettings,
        noteBackgroundColor: selectedNoteData?.settings.noteBackgroundColor,
      }
    });
  }, [selectedNoteData]);

  const controlRKeyPressListener = (e: KeyboardEvent) => {  
    if ((e.keyCode == 70 && e.ctrlKey) && selectedNote) {
      e.preventDefault();
      handleToggleReadMode(readMode ? "edit" : "full");
    }
  };
  
  onkeydown = controlRKeyPressListener;

  addEventListener('fullscreenchange', () => {
    if ((!document.fullscreenElement && readMode) && !fullscreenChangeCallbackWasCalled.current) {
      fullscreenChangeCallbackWasCalled.current = true;
      handleToggleReadMode("edit");
    }
  });

  const handleReverseReadMode = (condition?: boolean) => {
    setReadMode(condition !== undefined ? condition : !readMode);
    setNoteSettings((prevNoteSettings) => {
      return {
        ...prevNoteSettings,
        readMode: condition !== undefined ? condition : !readMode
      }
    });
  };

  const removeNote = () => {
    if(setSelectedNote) setSelectedNote("");

    setOpen(false);
    setNoteSettings((prevNoteSettings) => {
      return {
        ...prevNoteSettings,
        expanded: false,
      }
    });
    
    deleteNote(selectedNote as string);
    remove(notes.indexOf(note));
    navigate('/');
  };

  const handleExpand = () => {
    if (window.outerWidth <= 1030 && selectedNote) {
      if(setSelectedNote) setSelectedNote("");
      if(readMode) document.exitFullscreen();
    }

    setNoteSettings((prevNoteSettings) => {
      return {
        ...prevNoteSettings,
        expanded: !expanded
      }
    });
  };

  const handleToggleBottomBar = () => {
    setShowBottomBar(!showBottomBar);
    setNoteSettings((prevNoteSettings) => {
      return {
        ...prevNoteSettings,
        showBottomBar: !showBottomBar
      }
    });
  };

  const handleToggleReadMode = (state?: string) => {
    if(state && state === "edit") {
      if(fullscreenChangeCallbackWasCalled.current) {
        fullscreenChangeCallbackWasCalled.current = false;
      } else document.exitFullscreen();

      if(outerWidth > 1030) handleExpand();
      if(!showBottomBar) handleToggleBottomBar();

      handleReverseReadMode(false);
      return;
    } 

    document.getElementById("root")?.requestFullscreen();
    if(!expanded) handleExpand();
    if(showBottomBar) handleToggleBottomBar();
    handleReverseReadMode();
  };

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

  const days = (date: string) => moment(date).format("ll");

  const lastUpdated = () => {
    if (selectedNoteData?.createdAt) return selectedNoteData?.createdAt;
    return selectedNoteData?.updatedAt;
  };

  const handleRenameNote = async (data: FieldValues) => {
    const noteId = selectedNoteData?._id;
    setShowLoader(true);

    try {
      await api.post(`/note/rename/${noteId}`, { name: data.name });
      await fetchNotes();

      toastAlert({ icon: "success", title: "Updated!", timer: 2000 });
    } catch (err: any) {
      toastAlert({ icon: "error", title: err.message, timer: 2000 });
    } finally {
      setShowLoader(false);
    }
  };
  
  const handleChangeNoteBackground = async (bgNoteColor: string) => {
    const noteId = selectedNoteData?._id;
  
    try {
      await api.patch(`/settings/note-background-color/${noteId}`, {
        noteBackgroundColor: bgNoteColor
      });

      setNoteSettings((prevNoteSettings) => {
        return {
          ...prevNoteSettings,
          noteBackgroundColor: bgNoteColor,
        }
      });

      toastAlert({ icon: "success", title: "Updated!", timer: 2000 });
    } catch (err: any) {
      console.log(err);
      toastAlert({ icon: "error", title: err.message, timer: 2000 });
    }
  };

  const handleApplyGlobalNoteBackground = async (bgNoteColor: string) => {
    try {
      await api.patch(`/settings/global-note-background-color/${userData._id}`, {
        globalNoteBackgroundColor: bgNoteColor
      });

      setUserData((prevUserData) => {
        return {
          ...prevUserData,
          settings: {
            ...prevUserData.settings,
            globalNoteBackgroundColor: bgNoteColor
          }
        }
      });

      toastAlert({ icon: "success", title: "Updated!", timer: 2000 });
    } catch (err: any) {
      console.log(err);
      toastAlert({ icon: "error", title: err.message, timer: 2000 });
    }
  };

  const getNoteIdInUrl = useGetUrl({
    options: { 
      usePage: false, 
      getNoteIdInUrl: true 
    }
  });

  const getUrlWithoutNoteId = useGetUrl({
    options: { 
      usePage: false, 
      removeNoteId: true, 
      absolutePath: true
    }
  });

  return (
    <div
      className={`
        !z-50 flex flex-col overflow-hidden w-screen h-screen bg-[#ffffff] dark:bg-[#0f1011] text-black dark:text-gray-300 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-900 
        ${!expanded && "hidden lg:flex"}
      `}
    >
      {(!noteDataIsFetching && getNoteIdInUrl) && (selectedNote && selectedNoteData) ? (
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
                className="dropdown-content menu p-2 shadow rounded-box !w-52 !h-64 bg-[#f8f8f8] dark:bg-[#1c1d1e] border border-gray-500 overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-900"
              >
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
                              <p className="py-1 text-xs uppercase tracking-widest">
                                Unpin note
                              </p>
                              <BsFillPinAngleFill size={20} className="pt-[3px]" />
                            </>
                          ) : (
                            <>  
                              <p className="py-1 text-xs uppercase tracking-widest">
                                Pin note
                              </p>
                              <BsFillPinAngleFill size={20} className="pt-[3px]" />
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
                          <p className="py-1 text-xs uppercase tracking-widest">
                            Attach labels
                          </p>
                          <BsTagsFill size={20} className="pt-[3px]" />
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
                          <p className="py-1 text-xs uppercase tracking-widest">
                            {readMode ? "Edit mode" : "Read mode"}
                          </p>
                          {!readMode ? <AiFillRead size={22} className="pt-[3px]" /> : <AiFillEdit size={22} className="pt-[3px]" />}
                        </div>
                      </label>
                    </button>
                    <div className="mx-2 border border-transparent !border-b-gray-700 dark:!border-b-[#404040] !h-[1px] p-0 !rounded-none"/>
                    <a className="cursor-not-allowed active:!bg-transparent">
                      <label htmlFor="my-modal-4" className="text-gray-600">
                        <div className="flex flex-row space-x-2 cursor-not-allowed">
                          <p className="py-1 text-xs uppercase tracking-widest">
                            Share Note
                          </p>
                          <BsPeopleFill size={20} className="pt-[3px]" />
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
                          <p className="py-1 text-[11px] uppercase tracking-widest">
                            {showBottomBar ? "Hide bottom bar" : "Show bottom bar"}
                          </p>
                          {showBottomBar ? (
                            <BsArrowDown size={20} className="pt-[3px]" />
                          ) : (
                            <BsArrowUp size={20} className="pt-[3px]" />
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
                          <p className="py-1 text-xs uppercase tracking-widest">
                            Rename note
                          </p>
                          <BiRename size={22} className="pt-[2px]" />
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
                    <div className="mx-2 border border-transparent !border-b-gray-700 dark:!border-b-[#404040] !h-[1px] p-0 !rounded-none"/>
                    <a
                      className="active:!bg-[#c1c1c1] hover:!bg-[#e2e2e2] dark:hover:!bg-[#323232] dark:active:!bg-[#404040]"
                      onClick={() => setOpen(true)}
                    >
                      <label
                        htmlFor="my-modal-4"
                        className="text-red-600 cursor-pointer"
                      >
                        <div className="flex flex-row space-x-2 ">
                          <p className="py-1 text-xs uppercase tracking-widest">
                            Delete note
                          </p>
                          <AiFillDelete size={20} className="pt-1" />
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
            actionButtonFn={removeNote}
            mainText="Are you sure you want to delete this note?"
            options={{
              alertComponentIcon: "warning",
              alertComponentText:
                "Be aware that this action can not be undone!",
              subTextClassName: "px-6",
              mainTextClassName: "mb-5 text-xs",
              modalWrapperClassName: "!w-96 xxs:!w-80 border border-gray-600",
            }}
          />
          <SelectLabelModal
            checked={openLabelModal}
            setChecked={setOpenlabelModal}
            isFetching={labelIsFetching}
            labels={labels}
            selectedNote={selectedNote}
            register={register}
            handleSubmit={handleSubmit}
          />
          <Modal
            open={renameNote}
            setOpen={setRenameNote}
            title="Rename note"
            options={{
              titleWrapperClassName: "!px-6",
              modalWrapperClassName: "px-0 w-[23rem] xxs:!w-[20rem]"
            }}
          >
            <div className="px-6">
              <form 
                onSubmit={handleSubmitNoteName(handleRenameNote)} 
                className="mt-5"
              >
                <label 
                  htmlFor="notename"
                  className="text-[15px] tracking-widest uppercase ml-1"
                >
                  Note name
                </label>
                <input 
                  id="notename"
                  className="sign-text-inputs border border-gray-600 text-gray-900 dark:bg-stone-900 dark:text-gray-300 placeholder:text-gray-300 mt-2 mb-3 shadow-none"
                  type="text"
                  {...registerNoteName("name")}
                />
                <button 
                  className="my-3 text-white rounded-full bg-green-600 hover:bg-green-700 transition-all duration-300 ease-in-out px-2 py-2 text-[15px] uppercase tracking-wide w-full"
                >
                  {showLoader ? (
                    <p className="animate-pulse text-gray-300">Loading...</p>
                  ) : "Save name"}
                </button>
              </form>
            </div>
          </Modal>
          <Modal
            open={openChangeNoteBackgroundModal}
            setOpen={setOpenChangeNoteBackgroundModal}
            title="Change note background"
            options={{
              titleWrapperClassName: "!px-6",
              titleCustomClassName: "xxs:!text-[20px]",
              modalWrapperClassName: "px-0 w-[23rem] xxs:!w-[20rem]",
            }}
          >
            <div className="px-6 mt-5">            
                <ColorPicker
                  disabled={false}
                  color={'#000000'}
                  alwaysOpened={true}
                  buttonIconClassName="icon font-color"
                  buttonAriaLabel="Formatting text color"
                  buttonClassName="toolbar-item color-picker"
                  applyNoteBackgroundFn={handleChangeNoteBackground}
                  applyGlobalNoteBackgroundFn={handleApplyGlobalNoteBackground}
                />
            </div>
          </Modal>
          <Modal
            open={openNoteInfoModal}
            setOpen={setOpenNoteInfoModal}
            title="Note info"
            options={{
              titleWrapperClassName: "!px-6",
              modalWrapperClassName: "px-0 w-[27rem] xxs:!w-[19rem]"
            }}
          >
            <div className="px-8 mt-5">
                <div className="flex flex-row justify-between">
                  <p className="text-[13px] uppercase tracking-wider">Note name: </p>
                  <p className="text-[13px] uppercase tracking-wider">
                    {
                      note ? 
                        innerWidth <= 640 ? note?.name?.slice(0, 16) : note?.name?.slice(0, 31) 
                      : innerWidth <= 640 ? pinNote?.name?.slice(0, 16) : pinNote?.name?.slice(0, 31)
                    }
                  </p>
                </div>
                <div className="flex flex-row justify-between mt-3">
                  <p className=" text-[13px] uppercase tracking-wider">Mode: </p>
                  <p className=" text-[13px] uppercase tracking-wider">{readMode ? "Read mode" : "Edit mode"}</p>
                </div>
                <div className="flex flex-row justify-between mt-3">
                  <p className=" text-[13px] uppercase tracking-wider">Shared: </p>
                  <p className=" text-[13px] uppercase tracking-wider">false</p>
                </div>
                <div className="flex flex-row justify-between mt-3">
                  <p className=" text-[13px] uppercase tracking-wider">Contributors: </p>
                  <p className=" text-[13px] uppercase tracking-wider">You</p>
                </div>
            </div>
          </Modal>
          {innerWidth > 1350 ? (
            <div className="flex flex-row justify-start mr-3 py-2 absolute right-0">
              <div className="flex flex-row">
                <p className="px-2 text-sm xxs:text-[10px] xxs:px-0">
                  {!readMode ? "Editing" : "Reading"} - {note ? note?.name?.slice(0, 48) : pinNote?.name?.slice(0, 48)}
                </p>
              </div>
              <div className="mx-1 h-[21px] xxs:!h-[13.5px] xxs:mt-[3px] xxs:mx-2 w-[1px] border border-transparent border-r-gray-500" />
              <p className="px-2 text-sm xxs:text-[10px] xxs:px-0">
                Last updated on {days(lastUpdated() as string)}
              </p>
            </div>
          ) : (
            <div className="flex flex-row justify-start mr-[14px] py-2 absolute right-0">
              <AiFillInfoCircle size={22} onClick={() => setOpenNoteInfoModal(true)}/>
            </div>
          )}
        </div>
      ) : (noteDataIsFetching && getNoteIdInUrl) && (
          <div className="w-screen h-screen flex flex-col items-center absolute top-[24rem] xxs:top-[40%] left-[14rem] xxs:!left-0">
            <Loader 
              width={25}
              height={25}
            />
            <p className="mt-1 text-[22px] animate-pulse">Loading note...</p>
          </div>
      // ) : (
      //   <div className="flex flex-col justify-center items-center my-auto">
      //       {/* <img
      //         src={noNoteSelected}
      //         className="w-screen max-w-xl opacity-90"
      //         draggable={false}
      //       />
      //       <p className="text-xl font-light text-center">
      //         The selected note will appear here...
      //       </p> */}
      //   </div>
      )}

      {(!noteDataIsFetching && getNoteIdInUrl) && (selectedNote && selectedNoteData) && (
        <div className="!overflow-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-900">
            <TextEditor noteData={selectedNoteData} />
        </div>
      )}
    </div>
  );
};