import { useState, useEffect, useContext, Dispatch, SetStateAction } from "react";
import { useForm, FieldArrayWithId, UseFieldArrayRemove, UseFieldArrayAppend, FieldValues } from "react-hook-form";

import {
  AiOutlineFullscreen,
  AiOutlineFullscreenExit,
  AiFillDelete,
  AiOutlineEllipsis,
  AiFillRead,
  AiFillEdit
} from "react-icons/ai";
import {
  BsTagsFill,
  BsPeopleFill,
  BsArrowDown,
  BsArrowUp,
  BsFillPinAngleFill
} from "react-icons/bs";

import { BiRename } from 'react-icons/bi';

import ConfirmationModal from "../../components/ConfirmationModal";
import SelectLabelModal from "./components/SelectLabelModal";
import TextEditor from "./components/lexical";

import api from "../../services/api";
import { RefetchCtx } from "../../context/RefetchCtx";
import { NoteCtx } from "../../context/SelectedNoteCtx";
import { toastAlert } from "../../components/Alert/Alert";
import NoteSettingsContext from "../../context/NoteSettingsCtx";

import Modal from "../../components/Modal";

import noNoteSelected from "../../assets/select-note.svg";

import moment from "moment";
import "moment/locale/pt-br";

type Props = {
  setPinnedNotesPage: Dispatch<SetStateAction<number>>;
  labels: FieldArrayWithId<Labels, "labels", "id">[];
  appendPinNotes: UseFieldArrayAppend<Notes, "note">;
  pinNotes: FieldArrayWithId<Notes, "note", "id">[];
  notes: FieldArrayWithId<Notes, "note", "id">[];
  setExpanded: Dispatch<SetStateAction<boolean>>;
  append: UseFieldArrayAppend<Notes, "note">;
  deleteNote: (_id: string) => Promise<void>;
  removePinNotes: UseFieldArrayRemove;
  remove: UseFieldArrayRemove;
  labelIsFetching: boolean;
  expanded: boolean;
};

const default_note_settings = {
  showBottomBar: true,
  expanded: false,
  readMode: false,
  shared: false
};

export default function NoteDetails({
  notes,
  deleteNote,
  append,
  remove,
  pinNotes,
  expanded,
  setExpanded,
  labels,
  appendPinNotes,
  removePinNotes,
  labelIsFetching,
  setPinnedNotesPage
}: Props) {
  const { selectedNote, setSelectedNote } = useContext(NoteCtx) || {};
  const { fetchNotes } = useContext(RefetchCtx) as any;

  const [open, setOpen] = useState(false);
  const [readMode, setReadMode] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [renameNote, setRenameNote] = useState(false);
  const [showBottomBar, setShowBottomBar] = useState(true);
  const [openLabelModal, setOpenlabelModal] = useState(false);
  const [noteSettings, setNoteSettings] = useState(default_note_settings);

  const { register, reset, handleSubmit } = useForm();
  const { register: registerNoteName, reset: resetNoteName, handleSubmit: handleSubmitNoteName } = useForm();

  const note = notes.find(({ _id }) => _id === selectedNote);
  const pinNote = pinNotes.find(({ _id }) => _id === selectedNote);

  useEffect(() => { resetNoteName({ name: note ? (note?.name) : (pinNote?.name) }) }, [note, pinNote]);

  const controlRKeyPressListener = (e: any) => {
    if ((e.keyCode == 70 && e.ctrlKey) && selectedNote) {
      e.preventDefault();
      handleToggleReadMode();
    }
  };

  document.onkeydown = controlRKeyPressListener;
  
  const removeNote = () => {
    if(setSelectedNote) setSelectedNote(null);
    setExpanded(false);
    setOpen(false);

    deleteNote(selectedNote as string);
    remove(notes.indexOf(note as FieldArrayWithId<Notes, "note", "id">));
    setTimeout(() => fetchNotes(), 500);
  };

  const handleExpand = () => {
    if (window.outerWidth <= 1030 && selectedNote !== null) {
      if(readMode) {
        document.exitFullscreen();
        handleToggleBottomBar();
        
        setReadMode(!readMode);
        setNoteSettings((prevNoteSettings) => {
          return {
            ...prevNoteSettings,
            readMode: !readMode
          }
        });
      }
      if(setSelectedNote) setSelectedNote(null);

      setExpanded(false);
      setNoteSettings((prevNoteSettings) => {
        return {
          ...prevNoteSettings,
          expanded: false
        }
      });
    } else { 
      if(readMode) {
        document.exitFullscreen();
        handleToggleBottomBar();
        
        setReadMode(!readMode);
        setNoteSettings((prevNoteSettings) => {
          return {
            ...prevNoteSettings,
            readMode: !readMode
          }
        });
      }

      setExpanded(!expanded);
      setNoteSettings((prevNoteSettings) => {
        return {
          ...prevNoteSettings,
          expanded: !expanded
        }
      });
    };
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

  const handleToggleReadMode = () => {
    setReadMode(!readMode);
    setNoteSettings((prevNoteSettings) => {
      return {
        ...prevNoteSettings,
        readMode: !readMode
      }
    });

    if(!readMode) {      
      document.getElementById("root")?.requestFullscreen();
      if(!expanded) handleExpand();
      if(showBottomBar) handleToggleBottomBar();

    } else {
      document.exitFullscreen();
      if(expanded && window.outerWidth > 1030) handleExpand();
      if(!showBottomBar) handleToggleBottomBar();
    }
  };

  const handleOpenLabelModal = () => {
    let fieldsToReset = {};

    labels.forEach(label => {
      fieldsToReset = {
        ...fieldsToReset,
        [label._id]: false
      }
    });

    if(note?.labels && note.labels.length > 0) {
      note.labels.forEach(label => {
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
      const getNoteId = () => {
        if(note) return note?._id;
        return pinNote?._id;
      };

      const { data: { message } } = await api.post(`/note/pin-note/${getNoteId()}`, {
        condition: note ? !note?.settings.pinned : !pinNote?.settings.pinned
      });

      toastAlert({ icon: "success", title: message, timer: 2000 });

      if(pinNote?.settings.pinned) {
        append(pinNote);

        if(pinNotes.length === 1) {
          setPinnedNotesPage((prevPage) => prevPage - 1);
          removePinNotes(pinNotes.indexOf(pinNote as FieldArrayWithId<Notes, "note", "id">));
        }
        else removePinNotes(pinNotes.indexOf(pinNote as FieldArrayWithId<Notes, "note", "id">));
      }
      else {
        appendPinNotes(note as FieldArrayWithId<Notes, "note", "id">);
        remove(notes.indexOf(note as FieldArrayWithId<Notes, "note", "id">));
      }

      fetchNotes();
    } catch (err: any) {
      console.log(err);
      toastAlert({ icon: "error", title: err.message, timer: 2000 });
    }
  };

  // const hours = (date: string) => moment(date).format("LT");
  const days = (date: string) => moment(date).format("ll");

  const lastUpdated = () => {
    if (!note?.updatedAt) return note?.createdAt;
    return note?.updatedAt;
  };

  const handleRenameNote = async (data: FieldValues) => {
    const noteId = note ? note._id : pinNote?._id;
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

  return (
    <div
      className={`
        flex flex-col overflow-hidden w-screen h-screen bg-gray-700 text-gray-200 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-900 
        ${!expanded && "hidden lg:flex"}
      `}
    >
      {selectedNote !== null && (
        <div className="flex flex-row justify-between mt-0 py-[7.5px] px-4 mb-[4.8px]">
          <div className="flex flex-row mb-1 mt-1"> 
            <div
              className="mr-2 tooltip tooltip-right !text-gray-200"
              data-tip={`${!expanded ? "Expand note" : "Minimize note"}`}
            >
              <button className="hover:bg-stone-600 px-1 py-1 rounded" onClick={() => handleExpand()}>
                {expanded ? (
                  <AiOutlineFullscreenExit size={22} />
                ) : (
                  <AiOutlineFullscreen size={22} />
                )}
              </button>
            </div>
            <div className="dropdown hover:bg-stone-600 rounded h-[1.92rem] px-[3.5px]">
              <label tabIndex={0}>
                <div
                  className="tooltip tooltip-right !text-gray-200"
                  data-tip="Actions"
                >
                  <AiOutlineEllipsis size={24} className="mt-[3px]" />
                </div>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow  rounded-box w-52 bg-gray-800 border border-gray-500"
              >
                <li>
                  <a
                    className="active:!bg-gray-600 hover:!bg-gray-700"
                    onClick={() => handlePinNote()}
                  >
                    <label
                      htmlFor="my-modal-4"
                      className="text-gray-300 cursor-pointer"
                    >
                      <div className="flex flex-row space-x-2">
                        {note?.settings.pinned || pinNote?.settings.pinned ? (
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
                  <div className="mx-2 border border-transparent !border-b-gray-700 !h-[1px] p-0 !rounded-none"/>
                  <a
                    className="active:!bg-gray-600 hover:!bg-gray-700"
                    onClick={() => handleOpenLabelModal()}
                  >
                    <label
                      htmlFor="my-modal-4"
                      className="text-gray-300 cursor-pointer"
                    >
                      <div className="flex flex-row space-x-2">
                        <p className="py-1 text-xs uppercase tracking-widest">
                          Attach labels
                        </p>
                        <BsTagsFill size={20} className="pt-[3px]" />
                      </div>
                    </label>
                  </a>
                  <div className="mx-2 border border-transparent !border-b-gray-700 !h-[1px] p-0 !rounded-none"/>
                  <button
                    className="active:!bg-gray-600 hover:!bg-gray-700"
                    onClick={() => handleToggleReadMode()}
                  >
                    <label
                      htmlFor="my-modal-4"
                      className="text-gray-300 cursor-pointer"
                    >
                      <div className="flex flex-row space-x-2">
                        <p className="py-1 text-xs uppercase tracking-widest">
                          {readMode ? "Edit mode" : "Read mode"}
                        </p>
                        {!readMode ? <AiFillRead size={22} className="pt-[3px]" /> : <AiFillEdit size={22} className="pt-[3px]" />}
                      </div>
                    </label>
                  </button>
                  <div className="mx-2 border border-transparent !border-b-gray-700 !h-[1px] p-0 !rounded-none"/>
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
                  <div className="mx-2 border border-transparent !border-b-gray-700 !h-[1px] p-0 !rounded-none"/>
                  <button
                    className="active:!bg-gray-600 hover:!bg-gray-700"
                    onClick={() => handleToggleBottomBar()}
                  >
                    <label
                      htmlFor="my-modal-4"
                      className="text-gray-300 cursor-pointer"
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
                  <div className="mx-2 border border-transparent !border-b-gray-700 !h-[1px] p-0 !rounded-none"/>
                  <button
                    className="active:!bg-gray-600 hover:!bg-gray-700"
                    onClick={() => setRenameNote(!renameNote)}
                  >
                    <label
                      htmlFor="my-modal-4"
                      className="text-gray-300 cursor-pointer"
                    >
                      <div className="flex flex-row space-x-2">
                        <p className="py-1 text-xs uppercase tracking-widest">
                          Rename note
                        </p>
                        <BiRename size={22} className="pt-[2px]" />
                      </div>
                    </label>
                  </button>
                  <div className="mx-2 border border-transparent !border-b-gray-700 !h-[1px] p-0 !rounded-none"/>
                  <a
                    className="active:!bg-gray-600 hover:!bg-gray-700"
                    onClick={() => setOpen(true)}
                  >
                    <label
                      htmlFor="my-modal-4"
                      className="text-red-500/90 cursor-pointer"
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
            deleteButtonAction={removeNote}
            mainText="Are you sure you want to delete this note?"
            options={{
              alertComponentIcon: "warning",
              alertComponentText:
                "Be aware that this action can not be undone!",
              subTextCustomClassName: "px-6",
              mainTextCustomClassName: "mb-5 text-xs",
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
              modalWrapperClassName: "px-0 w-[25rem]",
              showCloseTooltip: true
            }}
          >
            <div className="px-6">
              <form onSubmit={handleSubmitNoteName(handleRenameNote)} className="mt-5">
                <label 
                  htmlFor="notename"
                  className="text-[15px] tracking-widest uppercase ml-1"
                >
                  Note name
                </label>
                <input 
                  id="notename"
                  className="sign-text-inputs bg-stone-900 text-gray-300 placeholder:text-gray-300 mt-2 mb-3"
                  type="text"
                  {...registerNoteName("name")}
                />
                <button className="my-3 text-gray-300 rounded-full bg-green-700 hover:bg-green-600 transition-all duration-300 ease-in-out px-2 py-2 text-[15px] uppercase tracking-wide w-full">
                  {showLoader ? (<p className="animate-pulse text-gray-300">Loading...</p>) : "Save name"}
                </button>
              </form>
            </div>
          </Modal>
          <div className="flex flex-row justify-start mr-3 py-2 absolute right-0">
            <div className="flex flex-row">
              <p className="px-2 text-sm xxs:text-[10px] xxs:px-0 text-gray-300">
                {!readMode ? "Editing" : "Reading"} - {note ? note?.name?.slice(0, 24) : pinNote?.name?.slice(0, 24)}
              </p>
            </div>
            <div className="mx-1 h-[21px] xxs:!h-[13.5px] xxs:mt-[3px] xxs:mx-2 w-[1px] border border-transparent border-r-gray-500" />
            <p className="px-2 text-sm xxs:text-[10px] xxs:px-0">
              Last updated on {days(lastUpdated() as string)}
            </p>
          </div>
        </div>
      )}

      {selectedNote !== null ? (
        <div className="!overflow-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-900">
            <NoteSettingsContext
              noteSettings={noteSettings}
              setNoteSettings={setNoteSettings}
            >
              <TextEditor notes={notes} pinNotes={pinNotes} />
            </NoteSettingsContext>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center my-auto">
            <img
              src={noNoteSelected}
              className="w-screen max-w-xl opacity-90"
              draggable={false}
            />
            <p className="text-xl font-light text-gray-300 text-center">
              The selected note will appear here...
            </p>
        </div>
      )}
    </div>
  );
};