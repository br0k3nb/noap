import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { 
  useForm,
  FieldArrayWithId,
  UseFieldArrayRemove,
  UseFieldArrayAppend,
  FieldValues
} from "react-hook-form";

import { useNavigate } from 'react-router-dom';

import { AiFillInfoCircle } from "react-icons/ai";

import NoteTopBar from "././components/NoteTopBar";
import NoteInfoModal from "./components/NoteInfoModal";
import RenameNoteModal from "./components/RenameNoteModal";
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
  pinNotesState,
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
      fetchNotes();

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

  return (
    <div
      className={`
        !z-50 flex flex-col overflow-hidden w-screen h-screen bg-[#ffffff] dark:bg-[#0f1011] text-black dark:text-gray-300 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-900 
        ${!expanded && "hidden lg:flex"}
      `}
    >
      {((!noteDataIsFetching && getNoteIdInUrl) && (selectedNote && selectedNoteData)) && (
        <>
          <NoteTopBar
            append={append}
            appendPinNotes={appendPinNotes}
            dispatchPinNotes={dispatchPinNotes}
            handleExpand={handleExpand}
            handleToggleBottomBar={handleToggleBottomBar}
            handleToggleReadMode={handleToggleReadMode}
            labels={labels}
            noteDataIsFetching={noteDataIsFetching}
            notes={notes}
            pinNotes={pinNotes}
            pinNotesState={pinNotesState}
            readMode={readMode}
            remove={remove}
            removePinNotes={removePinNotes}
            renameNote={renameNote}
            reset={reset}
            selectedNoteData={selectedNoteData}
            setOpen={setOpen}
            setOpenChangeNoteBackgroundModal={setOpenChangeNoteBackgroundModal}
            setOpenlabelModal={setOpenlabelModal}
            setRenameNote={setRenameNote}
            setSelectedNoteData={setSelectedNoteData}
            showBottomBar={showBottomBar}
          />
          <ConfirmationModal
            open={open}
            setOpen={setOpen}
            actionButtonFn={removeNote}
            mainText="Are you sure you want to delete this note?"
            options={{
              alertComponentIcon: "warning",
              alertComponentText: "Be aware that this action can not be undone!",
              alertComponentTextClassName: "text-start",
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
          <RenameNoteModal
            handleRenameNote={handleRenameNote}
            handleSubmitNoteName={handleSubmitNoteName}
            registerNoteName={registerNoteName}
            renameNote={renameNote}
            setRenameNote={setRenameNote}
            showLoader={showLoader}
          />
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
            <div className="px-6 mt-5 max-h-96 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-900 dark:scrollbar-thumb-gray-300">            
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
          <NoteInfoModal
            readMode={readMode}
            note={selectedNoteData}
            openNoteInfoModal={openNoteInfoModal}
            setOpenNoteInfoModal={setOpenNoteInfoModal}
          />

          {innerWidth > 1350 ? (
            <div className="flex flex-row justify-start mr-3 py-2 absolute right-0 top-2">
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
            <div className="flex flex-row justify-start mr-[14px] py-2 absolute right-0 top-2">
              <AiFillInfoCircle size={22} onClick={() => setOpenNoteInfoModal(true)}/>
            </div>
          )}
        </>
      )}

      {(!noteDataIsFetching && getNoteIdInUrl) && (selectedNote && selectedNoteData) ? (
        <div className="!overflow-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-900">
            <TextEditor noteData={selectedNoteData} />
        </div>
      ) : (noteDataIsFetching && getNoteIdInUrl) && (
        <div 
          className="h-screen flex flex-col items-center absolute top-[40%] mx-auto"
          style={{ width: (innerWidth > 640 && !expanded) ? innerWidth - 440 : innerWidth }}
        >
          <Loader 
            width={25}
            height={25}
          />
          <p className="mt-1 text-[22px] animate-pulse">Loading note...</p>
        </div>
    )}
    </div>
  );
};