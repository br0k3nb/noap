import { Dispatch, SetStateAction } from "react";

import { BsShareFill } from 'react-icons/bs';
import { BiNotepad } from 'react-icons/bi';
import { GiSettingsKnobs } from 'react-icons/gi';
import { RiUserShared2Line } from 'react-icons/ri';

import Modal from "../../../components/Modal";

type NoteInfoModalType = {
    openNoteInfoModal: boolean;
    setOpenNoteInfoModal: Dispatch<SetStateAction<boolean>>;
    note: NoteData;
    readMode: boolean;
};

export default function NoteInfoModal({
    openNoteInfoModal,
    setOpenNoteInfoModal,
    readMode,
    note,
}: NoteInfoModalType) {
    return (
        <Modal
            open={openNoteInfoModal}
            setOpen={setOpenNoteInfoModal}
            title="Note info"
            options={{
              titleWrapperClassName: "!px-6",
              modalWrapperClassName: "max-h-[27rem] max-h-96 px-0 w-[27rem] xxs:!w-[21rem]"
            }}
          >
            <div className="px-8 mt-5">
                <div className="flex flex-col justify-between space-y-2">
                  <div className="flex flex-row space-x-2">
                    <p className="text-[15px] uppercase tracking-wider">Note name</p>
                    <BiNotepad size={20} className="my-auto" />
                  </div>
                  <p className="text-[13px] uppercase tracking-wider truncate">
                    {note.name}
                  </p>
                </div>
                <div className="border border-transparent border-t-gray-600 my-4"/>
                <div className="flex flex-col justify-between space-y-2">
                  <div className="flex flex-row space-x-2">
                    <p className=" text-[15px] uppercase tracking-wider">Mode</p>
                    <GiSettingsKnobs size={20} className="my-auto" />
                  </div>
                  <p className=" text-[13px] uppercase tracking-wider">{readMode ? "Read mode" : "Edit mode"}</p>
                </div>
                <div className="border border-transparent border-t-gray-600 my-4"/>
                <div className="flex flex-col space-y-2 justify-between">
                  <div className="flex flex-row space-x-2">
                    <p className="text-[15px] uppercase tracking-wider">Shared</p>
                    <BsShareFill size={20} className="my-auto" />
                  </div>
                  <p className=" text-[13px] uppercase tracking-wider">false</p>
                </div>
                <div className="border border-transparent border-t-gray-600 my-4"/>
                <div className="flex flex-col space-y-2 justify-between">
                  <div className="flex flex-row space-x-2">
                    <p className="text-[15px] uppercase tracking-wider">Contributors</p>
                    <RiUserShared2Line size={20} className="my-auto" />
                  </div>
                  <p className=" text-[13px] uppercase tracking-wider">You</p>
                </div>
            </div>
        </Modal>
    )
}