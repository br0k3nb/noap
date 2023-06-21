import { SetStateAction, Dispatch, useState, useContext } from 'react';
import { LuLanguages } from "react-icons/lu";

import Modal from '../../../../components/Modal';
import { toastAlert } from '../../../../components/Alert/Alert';
import { ShowPinNoteInFolderCtx } from '../../../../context/ShowPinNotesInFolder';

import api from '../../../../services/api';

type Props = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function SettingsModal({ open, setOpen }: Props) {
    const token = JSON.parse(localStorage.getItem("user_token") || "{}");

    const { showPinnedNotesInFolder, setShowPinnedNotesInFolder } = useContext(ShowPinNoteInFolderCtx) as any;

    const [showLoader, setShowLoader] = useState(false);
    const [toogleShowInFolderCheckbox, setToggleShowInFolderCheckbox] = useState(showPinnedNotesInFolder);

    const handleShowPinnedNotesInFolder = async () => {
        setShowLoader(true);

        try {
            const { data: { message } } = await api.post(`/settings/pin-notes-folder/${token._id}`, {
                condition: toogleShowInFolderCheckbox
            });

            setShowPinnedNotesInFolder(!toogleShowInFolderCheckbox);
            
            localStorage.setItem("user_token", JSON.stringify({
                ...token,
                settings: {
                    showPinnedNotesInFolder: !toogleShowInFolderCheckbox
                }
            }));

            toastAlert({ icon: 'success', title: message, timer: 3000 });
        } catch (err: any) {
            console.log(err);
            toastAlert({ icon: 'error', title: err.message, timer: 3000 });
        } finally {
            setShowLoader(false);
        }
    };

    return (
        <Modal
            open={open}
            title='Settings'
            setOpen={setOpen}
            options={{
                modalWrapperClassName: "w-[25rem] xxs:w-[21rem] !px-0",
                titleWrapperClassName: "!px-6"
            }}
        >
            <div className="px-6 mt-5">
                <div className="form-control bg-gray-900 px-3 py-2 rounded-full">
                    <label className="label cursor-pointer px-2">
                        <span className="label-text uppercase text-[11px] text-gray-300 tracking-widest">
                            {showLoader ? "Loading..." : "Show pinned notes in a folder"}
                        </span> 
                        <input
                            type="checkbox"
                            disabled={showLoader ? true : false}
                            checked={toogleShowInFolderCheckbox}
                            className={`checkbox ${showLoader && "cursor-not-allowed"}`}
                            onChange={(e) => {
                                setToggleShowInFolderCheckbox(e.target.checked);
                                handleShowPinnedNotesInFolder()
                            }} 
                        />
                    </label>
                </div>
                <p className='text-gray-400 uppercase text-xs tracking-widest text-center mb-4 mt-6'>Coming soon</p>
                <button
                    className='px-3 py-[0.95rem] bg-gray-700/80 w-[21.8rem] xxs:w-[17.9rem] rounded-full cursor-not-allowed'
                    disabled={true}
                >
                    <div className="px-2 flex flex-row space-x-3 text-gray-400">
                        <p className='pt-[1.5px] uppercase text-xs tracking-widest'>Change app language</p>
                        <LuLanguages size={20}/>
                    </div>
                </button>
            </div>
        </Modal>
    )
}