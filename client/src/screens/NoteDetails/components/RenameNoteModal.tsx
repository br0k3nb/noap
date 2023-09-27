import { Dispatch, SetStateAction } from "react";
import { UseFormHandleSubmit, FieldValues, UseFormRegister } from "react-hook-form";

import Modal from "../../../components/Modal";

type RenameNoteModalType = {
    renameNote: boolean;
    setRenameNote: Dispatch<SetStateAction<boolean>>;
    handleSubmitNoteName: UseFormHandleSubmit<FieldValues>;
    handleRenameNote: (k: any) => void;
    showLoader: boolean;
    registerNoteName: UseFormRegister<FieldValues>;
};

export default function RenameNoteModal({
    renameNote,
    setRenameNote,
    handleSubmitNoteName,
    handleRenameNote,
    registerNoteName,
    showLoader
}: RenameNoteModalType) {
    return (
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
    )
}