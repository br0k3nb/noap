import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import {
  useForm,
  FieldArrayWithId,
  UseFieldArrayRemove,
  UseFieldArrayAppend,
  FieldValues,
} from "react-hook-form";

import { Link, useNavigate } from "react-router-dom";

import {
  AiFillRead,
  AiFillEdit,
  AiFillDelete,
  AiFillInfoCircle,
  AiOutlineEllipsis,
  AiOutlineFullscreen,
  AiOutlineFullscreenExit,
} from "react-icons/ai";
import {
  BsTagsFill,
  BsPeopleFill,
  BsArrowDown,
  BsArrowUp,
  BsFillPinAngleFill,
  BsFillFileEarmarkImageFill,
} from "react-icons/bs";

import { IoMdColorPalette } from "react-icons/io";
import { BiRename } from "react-icons/bi";

import NoteInfoModal from "./components/NoteInfoModal";
import RenameNoteModal from "./components/RenameNoteModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import SelectLabelModal from "./components/SelectLabelModal";
import NoteImageModal from "./components/NoteImageModal";

import useNoteSettings from "../../hooks/useNoteSettings";
import useSelectedNote from "../../hooks/useSelectedNote";
import useUserData from "../../hooks/useUserData";
import useRefetch from "../../hooks/useRefetch";
import useGetUrl from "../../hooks/useGetUrl";

import api from "../../services/api";
import { toastAlert } from "../../components/Alert";

import ColorPicker from "../NoteBody/components/lexical/ui/ColorPicker";
import Modal from "../../components/Modal";

import moment from "moment";
import "moment/locale/pt-br";

import type {
  pinnedNotesActions,
  pinnedNotesState,
} from "../../reducers/pinNoteReducer";

type Props = {
  selectedNoteData: NoteData | null;
  setSelectedNoteData: Dispatch<SetStateAction<NoteData | null>>;
  labels: FieldArrayWithId<Labels, "labels", "id">[];
  notes: {
    notesMetadata: FieldArrayWithId<NoteMetadata, "noteMetadata", "id">[];
    append: UseFieldArrayAppend<NoteMetadata, "noteMetadata">;
    remove: UseFieldArrayRemove;
    fetchNotesMetadata: () => void;
    deleteNote: (_id: string) => Promise<void>;
  };
  pinNotes: {
    appendPinNotes: UseFieldArrayAppend<NoteMetadata, "noteMetadata">;
    removePinNotes: UseFieldArrayRemove;
    dispatchPinNotes: Dispatch<pinnedNotesActions>;
    pinNotesState: pinnedNotesState;
    pinNotesMetadata: FieldArrayWithId<NoteMetadata, "noteMetadata", "id">[];
  };
  labelIsFetching: boolean;
  noteDataIsFetching: boolean;
};

export default function index({
  notes,
  pinNotes,
  selectedNoteData,
  setSelectedNoteData,
  labels,
  labelIsFetching,
  noteDataIsFetching,
}: Props) {
  const [open, setOpen] = useState(false);
  const [readMode, setReadMode] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [renameNote, setRenameNote] = useState(false);
  const [showBottomBar, setShowBottomBar] = useState(true);
  const [openLabelModal, setOpenlabelModal] = useState(false);
  const [openNoteInfoModal, setOpenNoteInfoModal] = useState(false);
  const [openNoteImageModal, setOpenNoteImageModal] = useState(false);
  const [openChangeNoteBackgroundModal, setOpenChangeNoteBackgroundModal] = useState(false);

  const { notesMetadata, append, remove, deleteNote, fetchNotesMetadata } = notes;
  const { appendPinNotes, dispatchPinNotes, pinNotesMetadata, pinNotesState, removePinNotes } = pinNotes;

  const { noteSettings: { expanded, status }, setNoteSettings } = useNoteSettings();

  const [pageInUrl, noteIdInUrl] = useGetUrl({ getPageInUrl: true, getNoteIdInUrl: true });
  const getUrlWithoutNoteId = useGetUrl({ removeNoteId: true, absolutePath: true });

  const navigate = useNavigate();
  const { fetchNotes } = useRefetch();
  const { selectedNote, setSelectedNote } = useSelectedNote();

  const note = notesMetadata.find(({ _id }) => _id === selectedNote)
    ? notesMetadata.find(({ _id }) => _id === selectedNote)
    : pinNotesMetadata.find(({ _id }) => _id === selectedNote);

  const { register, reset, handleSubmit } = useForm();
  const {
    register: registerNoteName,
    reset: resetNoteName,
    handleSubmit: handleSubmitNoteName,
  } = useForm();

  const { userData, setUserData } = useUserData();

  const fullscreenChangeCallbackWasCalled = useRef(false);

  useEffect(() => {
    resetNoteName({ name: selectedNoteData?.name });
    setNoteSettings((prevNoteSettings) => {
      return {
        ...prevNoteSettings,
        noteBackgroundColor: selectedNoteData?.settings.noteBackgroundColor,
      };
    });
  }, [selectedNoteData]);

  const handleToggleReadMode = (state?: string) => {
    if (state && state === "edit") {
      if (fullscreenChangeCallbackWasCalled.current) {
        fullscreenChangeCallbackWasCalled.current = false;
      } else document.exitFullscreen();

      if (outerWidth > 1030) handleExpand();
      if (!showBottomBar) handleToggleBottomBar();

      handleReverseReadMode(false);
      return;
    }

    document.getElementById("root")?.requestFullscreen();
    if (!expanded) handleExpand();
    if (showBottomBar) handleToggleBottomBar();
    handleReverseReadMode();
  };

  const controlRKeyPressListener = (e: KeyboardEvent) => {
    if (e.keyCode == 70 && e.ctrlKey && selectedNote) {
      e.preventDefault();
      handleToggleReadMode(readMode ? "edit" : "full");
    }
  };

  onkeydown = controlRKeyPressListener;

  addEventListener("fullscreenchange", () => {
    if (
      !document.fullscreenElement &&
      readMode &&
      !fullscreenChangeCallbackWasCalled.current
    ) {
      fullscreenChangeCallbackWasCalled.current = true;
      handleToggleReadMode("edit");
    }
  });

  const handleOpenLabelModal = () => {
    let fieldsToReset = {};

    if (selectedNoteData?.labels && selectedNoteData.labels.length > 0) {
      selectedNoteData.labels.forEach((label) => {
        fieldsToReset = {
          ...fieldsToReset,
          [label._id]: true,
        };
      });
    }

    reset(fieldsToReset);
    setOpenlabelModal(true);
  };

  const handleToggleBottomBar = () => {
    setShowBottomBar(!showBottomBar);
    setNoteSettings((prevNoteSettings) => {
      return {
        ...prevNoteSettings,
        showBottomBar: !showBottomBar,
      };
    });
  };

  const handlePinNote = async () => {
    try {
      const {
        data: { message },
      } = await api.post(`/note/pin-note/${selectedNoteData?._id}`, {
        condition: !selectedNoteData?.settings.pinned,
      });

      setNoteSettings((prevNoteSettings) => {
        return {
          ...prevNoteSettings,
          pinned: !selectedNoteData?.settings.pinned,
        };
      });

      setSelectedNoteData((prevData: any) => {
        return {
          ...prevData,
          settings: {
            ...prevData?.settings,
            pinned: !selectedNoteData?.settings.pinned,
          },
        };
      });

      if (note?.settings.pinned) {
        append(note);

        if (pinNotesMetadata.length === 1) {
          dispatchPinNotes({ type: "PAGE", payload: pinNotesState.page - 1 });
          removePinNotes(pinNotesMetadata.indexOf(note));
        } else removePinNotes(pinNotesMetadata.indexOf(note));
      } else {
        appendPinNotes(note as FieldArrayWithId<NoteMetadata, "noteMetadata", "id">);
        remove(notesMetadata.indexOf(note as FieldArrayWithId<NoteMetadata, "noteMetadata", "id">));
      }

      fetchNotes();
      toastAlert({ icon: "success", title: message, timer: 2000 });
    } catch (err: any) {
      console.log(err);
      toastAlert({ icon: "error", title: err.message, timer: 2000 });
    }
  };

  const handleExpand = () => {
    if (window.outerWidth <= 1030 && selectedNote) {
      if (setSelectedNote) setSelectedNote("");
      if (readMode) document.exitFullscreen();
    }

    setNoteSettings((prevNoteSettings) => {
      return {
        ...prevNoteSettings,
        expanded: !expanded,
      };
    });
  };

  const handleReverseReadMode = (condition?: boolean) => {
    setReadMode(condition !== undefined ? condition : !readMode);
    setNoteSettings((prevNoteSettings) => {
      return {
        ...prevNoteSettings,
        readMode: condition !== undefined ? condition : !readMode,
      };
    });
  };

  const removeNote = async () => {
    if (setSelectedNote) setSelectedNote("");

    setOpen(false);
    setNoteSettings((prevNoteSettings) => {
      return {
        ...prevNoteSettings,
        expanded: false,
      };
    });

    deleteNote(selectedNote as string);
    // remove(notes.indexOf(note));

    await fetchNotesMetadata();
    navigate(
      `/notes/page/${
        !(notesMetadata.length - 1)
          ? (Number(pageInUrl) - 1)
          : pageInUrl
      }`
    );
  };

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
        noteBackgroundColor: bgNoteColor,
      });

      setNoteSettings((prevNoteSettings) => {
        return {
          ...prevNoteSettings,
          noteBackgroundColor: bgNoteColor,
        };
      });

      toastAlert({ icon: "success", title: "Updated!", timer: 2000 });
    } catch (err: any) {
      console.log(err);
      toastAlert({ icon: "error", title: err.message, timer: 2000 });
    }
  };

  const handleApplyGlobalNoteBackground = async (bgNoteColor: string) => {
    try {
      await api.patch(
        `/settings/global-note-background-color/${userData._id}`,
        {
          globalNoteBackgroundColor: bgNoteColor,
        }
      );

      setUserData((prevUserData) => {
        return {
          ...prevUserData,
          settings: {
            ...prevUserData.settings,
            globalNoteBackgroundColor: bgNoteColor,
          },
        };
      });

      toastAlert({ icon: "success", title: "Updated!", timer: 2000 });
    } catch (err: any) {
      console.log(err);
      toastAlert({ icon: "error", title: err.message, timer: 2000 });
    }
  };

  const days = (date: string) => moment(date).format("ll");

  return (
    <>
      {!noteDataIsFetching &&
        noteIdInUrl &&
        selectedNote &&
        selectedNoteData && (
          <>
            <NoteImageModal
              notes={notesMetadata}
              pinNotes={pinNotesMetadata}
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
                    to={`${innerWidth < 1030 ? getUrlWithoutNoteId : ""}`}
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
                    <div className="mx-2 border border-transparent !border-r-gray-600 !h-[20px] mt-[5px] p-0 !rounded-none" />
                    <div
                      className="tooltip tooltip-right tooltip-right-color-controller"
                      data-tip={`${
                        selectedNoteData?.settings.pinned
                          ? "Unpin note"
                          : "Pin note"
                      }`}
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
                    <div className="mx-2 border border-transparent !border-r-gray-600 !h-[20px] mt-[5px] p-0 !rounded-none" />
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
                    <div className="mx-2 border border-transparent !border-r-gray-600 !h-[20px] mt-[5px] p-0 !rounded-none" />
                    <div
                      className="tooltip tooltip-right tooltip-right-color-controller"
                      data-tip={readMode ? "Edit mode" : "Read mode"}
                    >
                      <button
                        className="hover:bg-[#dadada] dark:hover:bg-stone-600 px-[5px] py-1 rounded"
                        onClick={() =>
                          handleToggleReadMode(readMode ? "edit" : "full")
                        }
                      >
                        {!readMode ? (
                          <AiFillRead size={22} />
                        ) : (
                          <AiFillEdit size={22} />
                        )}
                      </button>
                    </div>
                  </>
                )}
                <div className="mx-2 border border-transparent !border-r-gray-600 !h-[20px] mt-[5px] p-0 !rounded-none" />
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
                    <div className="pr-2 !w-[200px] xxs:!h-64 h-96 overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-900 dark:scrollbar-thumb-gray-300">
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
                                  <BsFillPinAngleFill
                                    size={20}
                                    className="my-auto"
                                  />
                                </>
                              ) : (
                                <>
                                  <p className="py-2 text-xs uppercase tracking-widest">
                                    Pin note
                                  </p>
                                  <BsFillPinAngleFill
                                    size={20}
                                    className="my-auto"
                                  />
                                </>
                              )}
                            </div>
                          </label>
                        </a>
                        <div className="mx-2 border border-transparent !border-b-gray-700 dark:!border-b-[#404040] !h-[1px] p-0 !rounded-none" />
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
                        <div className="mx-2 border border-transparent !border-b-gray-700 dark:!border-b-[#404040] !h-[1px] p-0 !rounded-none" />
                        <button
                          className="active:!bg-[#c1c1c1] hover:!bg-[#e2e2e2] dark:hover:!bg-[#323232] dark:active:!bg-[#404040]"
                          onClick={() =>
                            handleToggleReadMode(readMode ? "edit" : "full")
                          }
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
                        <div className="mx-2 border border-transparent !border-b-gray-700 dark:!border-b-[#404040] !h-[1px] p-0 !rounded-none" />
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
                        <div className="mx-2 border border-transparent !border-b-gray-700 dark:!border-b-[#404040] !h-[1px] p-0 !rounded-none" />
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
                                {showBottomBar
                                  ? "Hide bottom bar"
                                  : "Show bottom bar"}
                              </p>
                              {showBottomBar ? (
                                <BsArrowDown size={20} className="my-auto" />
                              ) : (
                                <BsArrowUp size={20} className="my-auto" />
                              )}
                            </div>
                          </label>
                        </button>
                        <div className="mx-2 border border-transparent !border-b-gray-700 dark:!border-b-[#404040] !h-[1px] p-0 !rounded-none" />
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
                        <div className="mx-2 border border-transparent !border-b-gray-700 dark:!border-b-[#404040] !h-[1px] p-0 !rounded-none" />
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
                              <IoMdColorPalette
                                size={32}
                                className="mt-[4px]"
                              />
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
                              <BsFillFileEarmarkImageFill
                                size={20}
                                className="my-auto"
                              />
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
            <ConfirmationModal
              open={open}
              setOpen={setOpen}
              actionButtonFn={removeNote}
              mainText="Are you sure you want to delete this note?"
              options={{
                alertComponentIcon: "warning",
                alertComponentText:
                  "Be aware that this action can not be undone!",
                alertComponentTextClassName: "text-start",
                subTextClassName: "px-6",
                mainTextClassName: "mb-5 text-xs",
                modalWrapperClassName: "!w-96 xxs:!w-80 border border-gray-600",
              }}
            />
            <SelectLabelModal
              labels={labels}
              register={register}
              checked={openLabelModal}
              selectedNote={selectedNote}
              handleSubmit={handleSubmit}
              isFetching={labelIsFetching}
              setChecked={setOpenlabelModal}
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
              <div className="px-6 mt-5 max-h-96 lg:max-h-[31rem] overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-900 dark:scrollbar-thumb-gray-300">
                <ColorPicker
                  disabled={false}
                  color={"#000000"}
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
              note={selectedNoteData as NoteData}
              openNoteInfoModal={openNoteInfoModal}
              setOpenNoteInfoModal={setOpenNoteInfoModal}
            />
            {innerWidth > 1350 ? (
              <div className="flex flex-row justify-start mr-3 py-2 absolute right-0 top-2">
                <div className="flex flex-row">
                  <div className="flex flex-row space-x-2">
                    <span className={`text-sm xxs:text-[10px] px-0 ${status && status === 'saving' && "animate-pulse font-bold text-white"}`}>
                      {!status ? "Editing" : (status[0].toUpperCase() + status.slice(1))}
                    </span>
                    {status && status === 'saving' && <span className="loading loading-spinner loading-sm"/>}
                  </div>
                  <span className="px-2">-</span>
                  <span className="text-sm xxs:text-[10px] xxs:px-0">
                    {selectedNoteData?.name?.slice(0, 48)}
                  </span>
                </div>
                <div className="mx-1 h-[21px] xxs:!h-[13.5px] xxs:mt-[3px] xxs:mx-2 w-[1px] border border-transparent border-r-gray-500" />
                <p className="px-2 text-sm xxs:text-[10px] xxs:px-0">
                  Last updated on {days(lastUpdated() as string)}
                </p>
              </div>
            ) : (
              <div className="flex flex-row justify-start mr-[14px] py-2 absolute right-0 top-2">
                <AiFillInfoCircle
                  size={22}
                  onClick={() => setOpenNoteInfoModal(true)}
                />
              </div>
            )}
          </>
        )}
    </>
  );
}
