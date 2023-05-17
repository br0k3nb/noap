import { useState, useEffect } from 'react';
import { BiLock } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { BsJournalPlus, BsTagFill, BsFillCalendarEventFill, BsDoorOpenFill, BsGearWide, BsFillTrashFill } from "react-icons/bs";

import { motion } from 'framer-motion';

import AccountSettingsModal from './components/AccountSettingsModal';
import LabelModal from './components/LabelModal';
import ConfirmationModal from '../../../../components/ConfirmationModal';
import SvgLoader from '../../../../components/SvgLoader';
import logo from '../../../../assets/logo/logo-white-no-bg.png'

type NavProps = {
  addNewNote: () => Promise<void>;
  showSvgLoader: boolean;
  expanded: boolean;
  navbar: boolean;
};

export default function Nav({ navbar, showSvgLoader, addNewNote, expanded }: NavProps) {
  const [ openLabelModal, setOpenLabelModal ] = useState(false);
  const [ openAuthModal, setOpenAuthModal ] = useState(false);
  const [ userIsAuth, setUserIsAuth ] = useState(false);
  const [ openSettingsModal, setOpenSettingsModal ] = useState(false);
  const [ openSignOutConfirmationModal, setOpenSignOutConfirmationModal ] = useState(false);
  const [ deviceScreenSize, setDeviceScreenSize] = useState({width: window.innerWidth, height: window.innerHeight});

  const navigate = useNavigate();

  const parsedUserToken = JSON.parse(window.localStorage.getItem("user_token") || "{}");
  const { googleAccount, name } = parsedUserToken;

  const accSettingsModalProps = {
    setUserIsAuth,
    openSettingsModal,
    open: openAuthModal,
    setOpenSettingsModal,
    setOpen: setOpenAuthModal
  }

  const signOutUser = () => {
    window.localStorage.removeItem("user_token");
    navigate("/");
  };

  useEffect(() => {
    const updateViewPortWidth = () => setDeviceScreenSize({width: window.innerWidth, height: window.innerHeight});

    window.addEventListener("resize", updateViewPortWidth);
    return () => window.removeEventListener("resize", updateViewPortWidth);
  }, []);

  return (
    <div className={`${expanded && "hidden"}`}>
      <AccountSettingsModal {...accSettingsModalProps} />
      <LabelModal open={openLabelModal} token={parsedUserToken} setOpen={setOpenLabelModal} />
      <ConfirmationModal
        open={openSignOutConfirmationModal}
        setOpen={setOpenSignOutConfirmationModal}
        deleteButtonAction={signOutUser}
        mainText='Are you sure you want to sign out ?'
        options={{ 
          customDeleteButtonText: "Sign out", 
          modalWrapperClassName: "!w-96",
          mainTextCustomClassName: "text-center",
          customCancelButtonText: "Go back"
        }}
      />
      {deviceScreenSize.width > 640  ? ( 
          <div className={`fixed ${!navbar && "flex xxs:hidden"}`}>
            <div className="flex flex-col items-center w-[60px] h-screen overflow-hidden text-gray-400 bg-stone-900 justify-end">
              <div className="flex items-center justify-center w-11 h-11 pb-1 mt-auto hover:text-gray-300 absolute top-6">
                <div className="dropdown dropdown-right pt-[6.2px]">
                  <label tabIndex={0}>
                    <div className="tooltip tooltip-right text-gray-100 before:text-[15px]" data-tip="Account">
                      <div className="rounded-full border !border-gray-500 bg-stone-700 hover:bg-stone-800 text-lg w-[2.75rem] h-[2.75rem] transition-all duration-500 ease-in-out">
                        <p className='mt-[7px]'> {name && name[0].toUpperCase()} </p>
                      </div>
                    </div>
                  </label>
                  <ul tabIndex={0} className="dropdown-content menu shadow w-64 rounded-xl bg-stone-800">
                    <li>
                      <a
                        className="active:!bg-gray-600 rounded-xl text-gray-300"
                        onClick={() => !userIsAuth && !googleAccount ? setOpenAuthModal(true) : setOpenSettingsModal(true)}
                      >
                        <label htmlFor="my-modal-4">
                          <div className="flex flex-row space-x-2">
                            <span>Change login information</span>  
                            <BiLock size={22} className="pt-1"/>
                          </div>
                        </label>
                      </a>
                      <div className="mx-2 border border-transparent !border-b-stone-900 !h-[1px] p-0 !rounded-none"/>
                      <a
                        className="active:!bg-gray-600 rounded-xl text-gray-300"
                        onClick={() => setOpenSignOutConfirmationModal(true)}
                      >
                        <label htmlFor="my-modal-4">
                          <div className="flex flex-row space-x-2">
                            <p>Log out</p>
                            <BsDoorOpenFill size={19} className="pt-1"/>
                          </div>
                        </label>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="!bg-gray-600 h-1 w-1 rounded-full absolute top-[98px]"/>
              <div className="flex flex-col items-center absolute top-28">
                <div
                  className={`tooltip tooltip-right text-gray-100 ${showSvgLoader && 'tooltip-open'}`}
                  data-tip={`${showSvgLoader ? "Adding note..." : "Add new note"}`}
                >
                  <a
                    className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300"
                    onClick={() => addNewNote()}
                  >
                    {showSvgLoader ? ( <SvgLoader options={{ showLoadingText: false }} /> ) : ( <BsJournalPlus className="text-gray-300" size={23}/> )}
                  </a>
                </div>
                <div className="tooltip tooltip-right text-gray-300" data-tip="Labels">
                  <a
                    className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300"
                    onClick={() => setOpenLabelModal(true)}
                  >
                    <BsTagFill className="text-gray-300" size={23} />
                  </a>
                </div>
                <button
                  className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300 disabled:!bg-transparent disabled:cursor-not-allowed"
                  disabled={true}
                >
                  <BsFillCalendarEventFill className="text-gray-300/60" size={22} />
                </button>
                <button
                  className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300 disabled:!bg-transparent disabled:cursor-not-allowed"
                  disabled={true}
                >
                  <BsFillTrashFill className="text-gray-300/60" size={22} />
                </button>
              
                <button
                  className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300 disabled:!bg-transparent disabled:cursor-not-allowed"
                  disabled={true}
                >
                  <BsGearWide className="text-gray-300/60" size={22} />
                </button>
              </div>
            </div>
          </div>
        ) : ( 
          <motion.div 
            initial={{ x: -100 }}
            whileInView={{ x: 0 }}
            transition={{ duration: 0.4 }}
            className={`fixed ${!navbar && "flex xxs:hidden"}  bg-stone-900`}
            style={{height: deviceScreenSize.height}}
          >
            <div className="flex flex-col items-center w-[140px] overflow-hidden text-gray-400">
              <div className="flex items-center justify-center w-11 h-11 pb-1 mt-auto hover:text-gray-300 absolute top-6">
                <div className="dropdown dropdown-right pt-[6.2px]">
                  <label tabIndex={0}>
                    <div className="tooltip tooltip-right text-gray-100 before:text-[15px]" data-tip="Account">
                      <div className="flex flex-row">
                        <div className="rounded-full border !border-gray-500 bg-stone-700 hover:bg-stone-800 text-lg w-[2.75rem] h-[2.75rem] transition-all duration-500 ease-in-out">
                          <p className='mt-[7px]'> {name && name[0].toUpperCase()} </p>
                        </div>
                        <p className='ml-2 my-auto uppercase text-xs tracking-widest'>{name && name}</p>
                      </div>
                    </div>
                  </label>
                  <ul tabIndex={0} className="dropdown-content menu shadow w-40 rounded-xl bg-stone-800">
                    <li>
                      <a
                        className="active:!bg-gray-600 rounded-xl text-gray-300"
                        onClick={() => !userIsAuth && !googleAccount ? setOpenAuthModal(true) : setOpenSettingsModal(true)}
                      >
                        <label htmlFor="my-modal-4">
                          <div className="flex flex-row space-x-2">
                            <span>Change login information</span>  
                            <BiLock size={37} className="my-auto"/>
                          </div>
                        </label>
                      </a>
                      <div className="mx-2 border border-transparent !border-b-stone-900 !h-[1px] p-0 !rounded-none"/>
                      <a
                        className="active:!bg-gray-600 rounded-xl text-gray-300"
                        onClick={() => setOpenSignOutConfirmationModal(true)}
                      >
                        <label htmlFor="my-modal-4">
                          <div className="flex flex-row space-x-2">
                            <p>Log out</p>
                            <BsDoorOpenFill size={20} className="pt-1 my-auto"/>
                          </div>
                        </label>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="!bg-gray-600 h-1 w-1 rounded-full absolute top-[92px]"/>
              <div className="flex flex-col items-center absolute top-28">
                <a className="flex items-center justify-center  hover:bg-gray-900 px-[1.29rem] py-3 rounded" onClick={() => addNewNote()}>
                  {showSvgLoader ? ( <SvgLoader options={{ showLoadingText: true }} /> ) : ( 
                    <div className="flex flex-row text-gray-300">
                      <BsJournalPlus size={20} /> 
                      <p className='ml-2 my-auto text-xs uppercase tracking-widest'>New note</p>
                    </div>
                  )}
                </a>
                <div className="!bg-gray-600 h-[1px] w-[20%] rounded-full my-2"/>
                <a className="flex items-center justify-center  hover:bg-gray-900 px-[1.9rem] py-3 rounded" onClick={() => setOpenLabelModal(true)}>
                  <div className="flex flex-row space-x-2 text-gray-300">
                    <BsTagFill className="text-gray-300" size={20} />
                    <p className='my-auto text-xs uppercase tracking-widest'>Labels</p>
                  </div>
                </a>
                <div className="!bg-gray-600 h-[1px] w-[20%] rounded-full my-2"/>
                <button
                  className="flex items-center justify-center w-16 h-12 hover:bg-gray-700 disabled:!bg-transparent disabled:cursor-not-allowed"
                  disabled={true}
                >
                  <div className="flex flex-row text-gray-400">
                    <BsFillCalendarEventFill className="text-gray-300/60" size={22} />
                    <p className='ml-2 my-auto text-xs uppercase tracking-widest'>Events</p>
                  </div>
                </button>
                <div className="!bg-gray-600 h-[1px] w-[20%] rounded-full my-2"/>
                <button
                  className="flex items-center justify-center w-16 h-12 hover:bg-gray-700 disabled:!bg-transparent disabled:cursor-not-allowed"
                  disabled={true}
                >
                  <div className="flex flex-row text-gray-400">
                    <BsFillTrashFill className="text-gray-300/60" size={22} />
                    <p className='ml-2 my-auto text-xs uppercase tracking-widest'>Trash</p>
                  </div>
                </button>
                <div className="!bg-gray-600 h-[1px] w-[20%] rounded-full my-2"/>
                <button
                  className="flex items-center justify-center w-16 h-12 hover:bg-gray-700 disabled:!bg-transparent disabled:cursor-not-allowed"
                  disabled={true}
                >
                  <div className="flex flex-row text-gray-400">
                    <BsGearWide className="text-gray-300/60" size={22} />
                    <p className='ml-2 my-auto text-xs uppercase tracking-widest'>Settings</p>
                  </div>
                </button>
              </div>
            </div>
            <div className="absolute bottom-3 left-9">
              <img src={logo} className='w-16 h-6' />
            </div>
          </motion.div>
        )
      }
    </div>
  );
}