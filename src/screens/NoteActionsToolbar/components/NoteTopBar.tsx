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
    

  return (
    <>
      
    </>
  )
}