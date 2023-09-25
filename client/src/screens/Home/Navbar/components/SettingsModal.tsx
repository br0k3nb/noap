import { SetStateAction, Dispatch, useState } from 'react';

import { BsDoorOpenFill, BsDoorClosedFill, BsShieldLockFill } from "react-icons/bs";
import { MdAccountCircle, MdDarkMode, MdCable } from 'react-icons/md';
import { LuSettings2 } from 'react-icons/lu';
import { BiLock } from "react-icons/bi";

import useUserData from '../../../../hooks/useUserData';
import useAuth from '../../../../hooks/useAuth';

import Modal from '../../../../components/Modal';
import SessionModal from '../../../../components/SessionModal';
import TwoFactAuthModal from '../../../../components/TwoFactAuthModal';
import { toastAlert } from '../../../../components/Alert';
import AccountSettingsModal from "../../../../components/AccountSettingsModal";
import ConfirmationModal from '../../../../components/ConfirmationModal';

import api from '../../../../services/api';

type Props = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function SettingsModal({ open, setOpen }: Props) {
    const { 
        userData: {
            _id,
            googleAccount,
            settings: {
                showPinnedNotesInFolder,
                noteTextExpanded,
                theme
            }
        }, 
        setUserData 
    } = useUserData();

    const [userIsAuth, setUserIsAuth] = useState(false);
    const [openTFAModal, setOpenTFAModal] = useState(false);
    const [openAuthModal, setOpenAuthModal] = useState(false);
    const [showNTCLoader, setShowNTCLoader] = useState(false);
    const [showSPNIFLoader, setShowSPNIFLoader] = useState(false);
    const [showThemeLoader, setShowThemeLoader] = useState(false);
    const [showOpenDoorIcon, setShowOpenDoorIcon] = useState(false);
    const [openAccSettingsModal, setOpenAccSettingsModal] = useState(false);
    const [openSignOutConfirmationModal, setOpenSignOutConfirmationModal] = useState(false);
    const [openSessionModal, setOpenSessionModal] = useState(false);
    
    const auth = useAuth();

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
        if(value !== theme) {
            setShowThemeLoader(true);
            try {
                const htmlElementHasDarkClass = document.documentElement.classList.contains("dark");
    
                await api.patch(`/settings/change-theme/${_id}`, {
                    theme: value.startsWith("dark") ? 'dark' : 'light'
                });
    
                if(!value.startsWith("dark") && htmlElementHasDarkClass) document.documentElement.classList.remove("dark");
                else document.documentElement.classList.add("dark");
    
                setUserData((prevUserData: any) => {
                    return {
                        ...prevUserData,
                        settings: {
                            ...prevUserData.settings,
                            theme: value.startsWith("dark") ? 'dark' : 'light'
                        }
                    }
                });

            } catch (err: any) {
                console.log(err);
                toastAlert({ icon: 'error', title: err.message, timer: 3000 });
            } finally {
                setShowThemeLoader(false);
            }
        }
    };

    const handleTFAClick = () => {
        setOpen(false);
        setOpenTFAModal(true);
    };

    const handleSessionClick = () => {
        setOpen(false);
        setOpenSessionModal(true);
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

    const handleCloseSessionModal = () => {
        setOpen(true);
        setOpenSessionModal(false);
    }

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
            <SessionModal
                open={openSessionModal}
                setOpen={setOpenSessionModal}
                closeFn={handleCloseSessionModal}
            />
            <Modal
                open={open}
                title='Settings'
                setOpen={setOpen}
                options={{
                    modalWrapperClassName: "w-[25rem] xxs:!w-[21rem] !px-0 overflow-y-hidden",
                    titleWrapperClassName: "!px-6"
                }}
            >
                <ConfirmationModal
                    open={openSignOutConfirmationModal}
                    setOpen={setOpenSignOutConfirmationModal}
                    actionButtonFn={() => auth.signOut()}
                    mainText='Are you sure you want to sign out ?'
                    options={{ 
                        actionButtonText: "Sign out",
                        modalWrapperClassName: "!w-96 xxs:!w-80",
                        mainTextClassName: "text-center text-[14px] xxs:text-[12px]",
                        cancelButtonText: "Go back"
                    }}
                />
                <div 
                    className="px-6 mt-5 mb-2 overflow-y-scroll"
                    style={{ height: innerWidth <= 640 ? innerHeight - 200 : innerHeight - 300 }}
                >
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-row space-x-2">
                            <MdAccountCircle size={21}/>
                            <p className="uppercase tracking-widest text-[14px]">Account</p>
                        </div>
                        <div className="bg-[#dbdbdb] dark:bg-[#32353b] dark:hover:!bg-[#222222] hover:bg-[#cacaca] border border-transparent transition-all duration-500 hover:!border-gray-500 px-3 rounded-full">
                            <div
                                className='text-center text-xs  text-gray-900 dark:text-gray-300 uppercase tracking-wide py-[14px] hover:!tracking-widest duration-300 ease-in-out cursor-pointer'
                                onClick={() => handleOpenAccountSettingsModal()}
                            >
                                <div className="flex flex-row justify-center">
                                    <p className='my-auto'>Account settings</p>
                                    <BiLock size={21} className='ml-2'/>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#dbdbdb] dark:bg-[#32353b] dark:hover:!bg-[#222222] hover:bg-[#cacaca] border border-transparent transition-all duration-500 hover:!border-gray-500 px-3 rounded-full">
                            <div 
                                className='text-xs uppercase text-gray-900 dark:text-gray-300 tracking-wide py-[14px] hover:!tracking-widest duration-300 ease-in-out cursor-pointer'
                                onClick={() => handleTFAClick()}
                            >                                
                                <div className="flex flex-row justify-center">
                                    <p className='my-auto'>Two factor authentication</p>
                                    <BsShieldLockFill size={18} className='ml-2'/>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#dbdbdb] dark:bg-[#32353b] dark:hover:!bg-[#222222] hover:bg-[#cacaca] border border-transparent transition-all duration-500 hover:!border-gray-500 px-3 rounded-full">
                            <div 
                                className='text-xs uppercase text-gray-900 dark:text-gray-300 tracking-wide py-[14px] hover:!tracking-widest duration-300 ease-in-out cursor-pointer'
                                onClick={() => handleSessionClick()}
                            >                                
                                <div className="flex flex-row justify-center">
                                    <p className='my-auto'>Sessions</p>
                                    <MdCable size={18} className='ml-2'/>
                                </div>
                            </div>
                        </div>
                        <div 
                            className="bg-[#dbdbdb] dark:bg-[#32353b] dark:hover:!bg-[#222222] hover:bg-[#cacaca] border border-transparent transition-all duration-500 hover:!border-gray-500 px-3 rounded-full"
                            onMouseEnter={() => setTimeout(() => setShowOpenDoorIcon(true), 200)}
                            onMouseLeave={() => setTimeout(() => setShowOpenDoorIcon(false), 200)}
                        >
                            <div 
                                className='text-xs  text-gray-900 dark:text-gray-300 uppercase tracking-wide py-[14px] hover:!tracking-widest duration-300 ease-in-out cursor-pointer'
                                onClick={() => setOpenSignOutConfirmationModal(true)}
                            >
                                <div className="flex flex-row justify-center">
                                    <p className='my-auto'>Log out</p>
                                    {
                                        !showOpenDoorIcon ? ( 
                                            <BsDoorClosedFill size={18} className='ml-2 '/> 
                                        ) : ( 
                                            <BsDoorOpenFill size={18} className='ml-2 ease-out transition-all duration-300'/>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-row space-x-2 !mt-8">
                            <LuSettings2 size={21}/>
                            <p className="uppercase tracking-widest text-[14px]">Preferences</p>
                        </div>
                        <label className="label tracking-widest !mb-0 !py-0">
                            <div className="flex flex-row space-x-2">
                                <span className="label-text uppercase text-xs xxs:!text-[11px] text-gray-900 dark:text-gray-300">
                                    {showSPNIFLoader ? "Loading..." : "pinned notes in folder"}
                                </span>
                            </div>
                            <input 
                                type="checkbox" 
                                disabled={showSPNIFLoader ? true : false}
                                checked={showPinnedNotesInFolder ? showPinnedNotesInFolder : false}
                                className={`toggle ${showSPNIFLoader && "cursor-not-allowed"}`}
                                onChange={(e) => handleShowPinnedNotesInFolder(!e.target.checked)}
                            />
                        </label>
                        <label className="label tracking-widest !py-0">
                            <div className="flex flex-row space-x-2">
                                <span className="label-text uppercase text-xs xxs:!text-[11px] text-gray-900 dark:text-gray-300">
                                    {showNTCLoader ? "Loading..." : "Note text centred"}
                                </span>
                            </div>
                            <input 
                                type="checkbox" 
                                disabled={showNTCLoader ? true : false}
                                checked={noteTextExpanded ? noteTextExpanded : false}
                                className={`toggle ${showNTCLoader && "cursor-not-allowed"}`}
                                onChange={() => handleNoteTextCondition()}
                            />
                        </label>
                        <div className="flex flex-row space-x-2 !mt-8">
                            <MdDarkMode size={21} />
                            <p className="uppercase tracking-widest text-[14px]">Theme</p>
                        </div>  
                        <select
                            id='theme-selector'
                            className="select select-ghost border border-transparent focus:outline-0 w-full transition-all duration-500 hover:!border-gray-500 px-5 !h-[40px] rounded-full !text-gray-900 dark:!text-gray-300 text-xs uppercase tracking-widest bg-[#dbdbdb] hover:bg-[#cacaca] dark:bg-[#32353b] dark:hover:!bg-[#222222]"
                            onChange={(e) => handleChangeTheme(e.target.value)}
                            value={showThemeLoader ? 'loader' : theme}
                        >
                            <option value={'dark'}>Dark - (Default)</option>
                            <option value={'light'}>Light</option>
                            {showThemeLoader && ( <option value={'loader'}>Loading...</option> )}
                        </select>
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