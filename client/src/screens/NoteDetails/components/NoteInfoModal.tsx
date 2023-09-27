import { Dispatch, SetStateAction } from "react";
import { FieldArrayWithId } from "react-hook-form";

import Modal from "../../../components/Modal";

type NoteInfoModalType = {
    openNoteInfoModal: boolean;
    setOpenNoteInfoModal: Dispatch<SetStateAction<boolean>>;
    note: FieldArrayWithId<NoteMetadata, "noteMetadata", "id">;
    pinNote: FieldArrayWithId<NoteMetadata, "noteMetadata", "id">;
    readMode: boolean;
};

export default function NoteInfoModal({
    openNoteInfoModal,
    setOpenNoteInfoModal,
    note,
    pinNote,
    readMode
}: NoteInfoModalType) {
    return (
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
    )
}