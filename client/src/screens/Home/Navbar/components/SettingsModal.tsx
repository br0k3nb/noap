import { SetStateAction, Dispatch, useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";

import { BsDoorOpenFill, BsDoorClosedFill, BsShieldLockFill } from "react-icons/bs";
import { AiFillFolderOpen } from 'react-icons/ai';
import { FiAlignJustify } from 'react-icons/fi';
import { RiTextSpacing } from 'react-icons/ri';
import { BiLock } from "react-icons/bi";

import Modal from '../../../../components/Modal';
import TwoFactAuthModal from './TwoFactAuthModal';
import { toastAlert } from '../../../../components/Alert/Alert';
import { UserDataCtx } from '../../../../context/UserDataContext';
import AccountSettingsModal from "../components/AccountSettingsModal";
import ConfirmationModal from '../../../../components/ConfirmationModal';

import api from '../../../../services/api';

type Props = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function SettingsModal({ open, setOpen }: Props) {
    const { userData, setUserData } = useContext(UserDataCtx) as any;
    const { _id, googleAccount, settings: { showPinnedNotesInFolder, noteTextExpanded } } = userData;

    const [userIsAuth, setUserIsAuth] = useState(false);
    const [openTFAModal, setOpenTFAModal] = useState(false);
    const [openAuthModal, setOpenAuthModal] = useState(false);
    const [showNTCLoader, setShowNTCLoader] = useState(false);
    const [showSPNIFLoader, setShowSPNIFLoader] = useState(false);
    const [showThemeLoader, setShowThemeLoader] = useState(false);
    const [showOpenDoorIcon, setShowOpenDoorIcon] = useState(false);
    const [openAccSettingsModal, setOpenAccSettingsModal] = useState(false);
    const [openSignOutConfirmationModal, setOpenSignOutConfirmationModal] = useState(false);

    const navigate = useNavigate();

    const handleShowPinnedNotesInFolder = async (state: boolean) => {
        setShowSPNIFLoader(true);

        try {
            const { data: { message } } = await api.post(`/settings/pin-notes-folder/${_id}`, {
                condition: !state
            });

            setUserData((prevUserData: any) => {
                return {
                    ...prevUserData,
                    settings: {
                        ...prevUserData.settings,
                        showPinnedNotesInFolder: !state
                    }
                }
            });

            toastAlert({ icon: 'success', title: message, timer: 3000 });
        } catch (err: any) {
            console.log(err);
            toastAlert({ icon: 'error', title: err.message, timer: 3000 });
        } finally {
            setShowSPNIFLoader(false);
        }
    };

    const handleNoteTextCondition = async () => {
        setShowNTCLoader(true);

        try {
            const { data: { message } } = await api.post(`/settings/note-text/${_id}`, {
                condition: !noteTextExpanded
            });

            setUserData((prevUserData: any) => {
                return {
                    ...prevUserData,
                    settings: {
                        ...prevUserData.settings,
                        noteTextExpanded: noteTextExpanded ? false : true
                    }
                }
            });

            toastAlert({ icon: 'success', title: message, timer: 3000 });
        } catch (err: any) {
            console.log(err);
            toastAlert({ icon: 'error', title: err.message, timer: 3000 });
        } finally {
            setShowNTCLoader(false);
        }
    };

    const handleChangeTheme = async (value: string) => {
        setShowThemeLoader(true);

        try {
            const htmlElementHasDarkClass = document.documentElement.classList.contains("dark");

            const { data: { message } } = await api.patch(`/settings/change-theme/${_id}`, {
                theme: value.startsWith("Dark") ? 'dark' : 'light'
            });

            if(!value.startsWith("Dark") && htmlElementHasDarkClass) document.documentElement.classList.remove("dark");
            else document.documentElement.classList.add("dark");

            setUserData((prevUserData: any) => {
                return {
                    ...prevUserData,
                    settings: {
                        ...prevUserData.settings,
                        theme: value.startsWith("Dark") ? 'dark' : 'light'
                    }
                }
            });

            toastAlert({ icon: 'success', title: message, timer: 3000 });
        } catch (err: any) {
            console.log(err);
            toastAlert({ icon: 'error', title: err.message, timer: 3000 });
        } finally {
            setShowThemeLoader(false);
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
    
    const handleOpenAccountSettingsModal = () => {
        setOpen(false);

        if (!userIsAuth && !googleAccount) setOpenAuthModal(true)
        else setOpenAccSettingsModal(true);
    };

    const handleCloseAccountSettingsModal = () => {
        setOpen(true);

        if (!userIsAuth && !googleAccount) setOpenAuthModal(false)
        else setOpenAccSettingsModal(false);
    };

    const signOutUser = () => {
        localStorage.removeItem("@NOAP:SYSTEM");
        navigate("/");
    };

    const accSettingsModalProps = {
        setUserIsAuth,
        open: openAuthModal,
        openAccSettingsModal,
        setOpenAccSettingsModal,
        setOpen: setOpenAuthModal,
        customOnCloseFunction: handleCloseAccountSettingsModal
    };

    return (
        <>
            <AccountSettingsModal {...accSettingsModalProps} />
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
                    modalWrapperClassName: "w-[25rem] xxs:!w-[21rem] !px-0 !max-h-[50rem]",
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
                <div className="px-6 mt-5 mb-2 h-[16.9rem] overflow-y-scroll">
                    <div className="flex flex-col space-y-4">
                        <div className="bg-gray-700/80 hover:bg-gray-700 border border-transparent transition-all duration-500 hover:!border-gray-500 px-3 rounded-full">
                            <div
                                className='text-center text-xs text-gray-300 uppercase tracking-wide py-[16.5px] hover:!tracking-widest duration-300 ease-in-out cursor-pointer'
                                onClick={() => handleOpenAccountSettingsModal()}
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
                        <div className="form-control bg-gray-700/80 hover:bg-gray-700 border border-transparent transition-all duration-500 hover:border-gray-500 px-3 rounded-full">
                            <label className="label cursor-pointer px-2 transition-all hover:!tracking-widest duration-300 ease-in-out tracking-wide">
                                <div className="flex flex-row space-x-2">
                                    <span className="label-text uppercase text-xs xxs:!text-[10px] text-gray-300 py-[10px]">
                                        {showSPNIFLoader ? "Loading..." : "pinned notes in folder"}
                                    </span> 
                                    {!showSPNIFLoader && (<AiFillFolderOpen size={22} className='mt-[6px]'/>)}
                                </div>
                                <input 
                                    type="checkbox" 
                                    disabled={showSPNIFLoader ? true : false}
                                    checked={showPinnedNotesInFolder ? showPinnedNotesInFolder : false}
                                    className={`toggle ${showSPNIFLoader && "cursor-not-allowed"}`}
                                    onChange={(e) => handleShowPinnedNotesInFolder(!e.target.checked)}
                                />
                            </label>
                        </div>   
                        <div className="bg-gray-700/80 hover:bg-gray-700 border border-transparent transition-all duration-500 hover:!border-gray-500 px-3 rounded-full">
                            <label className="label cursor-pointer px-2 transition-all hover:!tracking-widest duration-300 ease-in-out tracking-wide">
                                <div className="flex flex-row space-x-2">
                                    <span className="label-text uppercase text-xs xxs:!text-[10px] text-gray-300 py-[10px]">
                                        {showNTCLoader ? "Loading..." : "Note text centred"}
                                    </span> 
                                    {!showNTCLoader && ( <FiAlignJustify size={22} className='mt-[6px]'/> )}
                                </div>
                                <input 
                                    type="checkbox" 
                                    disabled={showNTCLoader ? true : false}
                                    checked={noteTextExpanded ? noteTextExpanded : false}
                                    className={`toggle ${showNTCLoader && "cursor-not-allowed"}`}
                                    onChange={() => handleNoteTextCondition()}
                                />
                            </label>
                        </div>     
                        <div>
                            <select 
                                id='theme-selector'
                                className="select select-ghost border border-transparent focus:outline-0 w-full transition-all duration-500 hover:!border-gray-500 px-5 !h-[52px] rounded-full text-gray-300 text-xs uppercase tracking-wide hover:tracking-widest bg-gray-700/80 hover:!bg-gray-700"
                                onChange={(e) => handleChangeTheme(e.target.value)}
                                defaultValue={'theme'}
                            >
                                <option disabled value={'theme'}>Theme selector</option>
                                <option>Dark - (Default)</option>
                                <option>Light</option>
                            </select>
                        </div>
                        <div 
                            className="bg-gray-700/80 hover:bg-gray-700 border border-transparent transition-all duration-500 hover:!border-gray-500 px-3 rounded-full"
                            onMouseEnter={() => setTimeout(() => setShowOpenDoorIcon(true), 200)}
                            onMouseLeave={() => setTimeout(() => setShowOpenDoorIcon(false), 200)}
                        >
                            <div 
                                className='text-xs text-gray-300 uppercase tracking-wide py-[16.5px] hover:!tracking-widest duration-300 ease-in-out cursor-pointer'
                                onClick={() => setOpenSignOutConfirmationModal(true)}
                            >
                                <div className="flex flex-row justify-center">
                                    <p className=''>Log out</p>
                                    {!showOpenDoorIcon 
                                        ? (<BsDoorClosedFill size={18} className='ml-2 '/>) 
                                        : (<BsDoorOpenFill size={18} className='ml-2 ease-out transition-all duration-300'/>)
                                    }
                                </div>
                            </div>
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