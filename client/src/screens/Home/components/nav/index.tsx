import { useState } from 'react';
import { useNavigate } from "react-router-dom";

import {
  BsFillHouseDoorFill,
  BsJournalPlus,
  BsTagFill,
  BsFillCalendarEventFill,
  BsDoorOpenFill,
  BsPeopleFill,
  BsGlobe2, 
  BsGearWide,
  BsFillTrashFill,
  BsGlobeAmericas
} from "react-icons/bs";

import { BiLock } from "react-icons/bi";

import AccountSettingsModal from './components/AccountSettingsModal';
import LabelModal from './components/LabelModal';
import ConfirmationModal from '../../../../components/ConfirmationModal';
import SvgLoader from '../../../../components/SvgLoader';

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

  return (
    <div className={`${expanded && "hidden"}`}>
      <AccountSettingsModal {...accSettingsModalProps}/>
      <LabelModal
        open={openLabelModal}
        token={parsedUserToken}
        setOpen={setOpenLabelModal}
      />
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
      <div className={`fixed ${!navbar && "flex xxs:hidden"}`}>
        <div className="flex flex-col items-center w-[60px] h-screen overflow-hidden text-gray-400 bg-stone-900 justify-end">
          <div className="flex items-center justify-center w-11 h-11 pb-1 mt-auto hover:text-gray-300 absolute top-6">
            <div className="dropdown dropdown-right pt-[6.2px]">
              <label tabIndex={0}>
                <div className="tooltip tooltip-right text-gray-100 before:text-[15px]" data-tip="Account">
                  <div className="rounded-full border !border-gray-500 bg-stone-700 hover:bg-stone-800 text-lg w-[2.75rem] h-[2.75rem] transition-all duration-500 ease-in-out">
                    <p className='mt-[7px]'>
                      {name && name[0].toUpperCase()}
                    </p>
                  </div>
                </div>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu shadow w-64 rounded-xl bg-stone-800"
              >
                <li>
                  <a
                    className="active:!bg-gray-600 rounded-xl"
                    onClick={() => !userIsAuth && !googleAccount ? setOpenAuthModal(true) : setOpenSettingsModal(true)}
                  >
                    <label htmlFor="my-modal-4" className="text-gray-300">
                      <div className="flex flex-row space-x-2">
                        <span>Change login information</span>  
                        <BiLock size={22} className="pt-1"/>
                      </div>
                    </label>
                  </a>
                  <div className="mx-2 border border-transparent !border-b-stone-900 !h-[1px] p-0 !rounded-none"/>
                  <a
                    className="active:!bg-gray-600 rounded-xl"
                    onClick={() => setOpenSignOutConfirmationModal(true)}
                  >
                    <label htmlFor="my-modal-4" className="text-gray-300">
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
                {showSvgLoader ? ( <SvgLoader /> ) : ( <BsJournalPlus className="text-gray-300" size={23}/> )}
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
    </div>
  );
}