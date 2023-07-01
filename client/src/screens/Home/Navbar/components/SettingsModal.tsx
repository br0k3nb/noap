import { SetStateAction, Dispatch, useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";

import { BsDoorOpenFill, BsShieldLockFill } from "react-icons/bs";
import { BiLock } from "react-icons/bi";

import Modal from '../../../../components/Modal';
import TwoFactAuthModal from './TwoFactAuthModal';
import { toastAlert } from '../../../../components/Alert/Alert';
import AccountSettingsModal from "../components/AccountSettingsModal";
import ConfirmationModal from '../../../../components/ConfirmationModal';
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
    const [userIsAuth, setUserIsAuth] = useState(false);
    const [openTFAModal, setOpenTFAModal] = useState(false);
    const [openAuthModal, setOpenAuthModal] = useState(false);
    const [openAccSettingsModal, setOpenAccSettingsModal] = useState(false);
    const [openSignOutConfirmationModal, setOpenSignOutConfirmationModal] = useState(false);
    const [toogleShowInFolderCheckbox, setToggleShowInFolderCheckbox] = useState(showPinnedNotesInFolder);

    const navigate = useNavigate();

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

    const handleTFAClick = () => {
        setOpen(false);
        setOpenTFAModal(true);
    };

    const handleCloseTFAModal = () => {
        setOpen(true);
        setOpenTFAModal(false);
    };

    const signOutUser = () => {
        localStorage.removeItem("user_token");
        navigate("/");
    };

    const accSettingsModalProps = {
        setUserIsAuth,
        openAccSettingsModal,
        open: openAuthModal,
        setOpenAccSettingsModal,
        setOpen: setOpenAuthModal
    };

    return (
        <>
            <TwoFactAuthModal 
                open={openTFAModal}
                setOpen={setOpenTFAModal}
                customCloseFn={handleCloseTFAModal}
            />
            <Modal
                open={open}
                title='Settings'
                setOpen={setOpen}
                options={{
                    modalWrapperClassName: "w-[25rem] xxs:w-[21rem] !px-0 !max-h-[50rem]",
                    titleWrapperClassName: "!px-6"
                }}
            >
                <ConfirmationModal
                    open={openSignOutConfirmationModal}
                    setOpen={setOpenSignOutConfirmationModal}
                    deleteButtonAction={signOutUser}
                    mainText='Are you sure you want to sign out ?'
                    options={{ 
                        customDeleteButtonText: "Sign out",
                        modalWrapperClassName: "!w-96",
                        mainTextCustomClassName: "text-center text-[14px] xxs:text-[12px] font-light",
                        customCancelButtonText: "Go back"
                    }}
                />
                <AccountSettingsModal {...accSettingsModalProps} />
                <div className="px-6 mt-5 mb-2">
                    <div className="flex flex-col space-y-4">
                        <div className="bg-gray-700/80 hover:bg-gray-700 border border-transparent transition-all duration-500 hover:!border-gray-500 px-3 rounded-full">
                            <div
                                className='text-center text-xs text-gray-300 uppercase tracking-wide py-[16.5px] hover:!tracking-widest duration-300 ease-in-out cursor-pointer'
                                onClick={() => !userIsAuth && !token.googleAccount ? setOpenAuthModal(true) : setOpenAccSettingsModal(true)}
                            >
                                <div className="flex flex-row justify-center">
                                    <p className='pt-[3px]'>Account settings</p>
                                    <BiLock size={21} className='ml-2'/>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-700/80 hover:bg-gray-700 border border-transparent transition-all duration-500 hover:!border-gray-500 px-3 rounded-full">
                            <div 
                                className='text-xs text-gray-300 uppercase tracking-wide py-[16.5px] hover:!tracking-widest duration-300 ease-in-out cursor-pointer'
                                onClick={() => handleTFAClick()}
                            >                                
                                <div className="flex flex-row justify-center">
                                    Two factor authentication
                                    <BsShieldLockFill size={18} className='ml-2'/>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-700/80 hover:bg-gray-700 border border-transparent transition-all duration-500 hover:!border-gray-500 px-3 rounded-full">
                            <div 
                                className='text-xs text-gray-300 uppercase tracking-wide py-[16.5px] hover:!tracking-widest duration-300 ease-in-out cursor-pointer'
                                onClick={() => setOpenSignOutConfirmationModal(true)}
                            >
                                <div className="flex flex-row justify-center">
                                    <p className=''>Log out</p>
                                    <BsDoorOpenFill size={18} className='ml-2'/>
                                </div>
                            </div>
                        </div>
                        <div className="form-control bg-gray-700/80 hover:bg-gray-700 border border-transparent transition-all duration-500 hover:border-gray-500 px-3 rounded-full">
                            <label className="label cursor-pointer px-2 transition-all duration-500 tracking-widest">
                                <span className="label-text uppercase text-[11px] xxs:!text-[10px] text-gray-300 py-[9px]">
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
                    </div>
                    {/* <p className='text-gray-400 uppercase text-xs tracking-widest text-center mb-4 mt-5'>Coming soon</p>
                    <button
                        className='px-3 py-[0.95rem] bg-gray-700/80 w-[21.8rem] xxs:w-[17.9rem] rounded-full cursor-not-allowed'
                        disabled={true}
                    >
                        <div className="px-2 flex flex-row space-x-3 text-gray-400">
                            <p className='pt-[1.5px] uppercase text-xs tracking-widest'>Change app language</p>
                            <LuLanguages size={20}/>
                        </div>
                    </button> */}
                </div>
            </Modal>
        </>
    )
}