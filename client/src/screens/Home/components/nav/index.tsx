import { useState } from 'react';

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

type NavProps = {
  addNewNote: () => Promise<void>;
  handleSignout: () => void
  expanded: boolean;
  newNote: boolean;
  navbar: boolean;
};

export default function Nav({ navbar, newNote, addNewNote, expanded, handleSignout }: NavProps) {
  const [ openLabelModal, setOpenLabelModal ] = useState(false);
  const [ openAuthModal, setOpenAuthModal ] = useState(false);
  const [ userIsAuth, setUserIsAuth ] = useState(false);
  const [ openSettingsModal, setOpenSettingsModal ] = useState(false);

  const parsedUserToken = JSON.parse(window.localStorage.getItem("user_token") || "{}");
  const { googleAccount, name } = parsedUserToken;

  const accSettingsModalProps = {
    setUserIsAuth,
    openSettingsModal,
    open: openAuthModal,
    setOpenSettingsModal,
    setOpen: setOpenAuthModal
  }

  return (
    <div className={`${expanded && "hidden"}`}>
      <AccountSettingsModal {...accSettingsModalProps}/>

      <LabelModal
        open={openLabelModal}
        token={parsedUserToken}
        setOpen={setOpenLabelModal}
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
                    onClick={() => handleSignout()}
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
              className={`tooltip tooltip-right text-gray-100 ${newNote && 'tooltip-open'}`}
              data-tip={`${newNote ? "Adding note..." : "Add new note"}`}
            >
              <a
                className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300"
                onClick={() => addNewNote()}
              >
                {newNote ? (
                  <svg aria-hidden="true" role="status" className="inline w-5 h-5 text-white animate-spin xxs:my-1 my-[1.5px]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                  </svg>
                ) : (
                  <BsJournalPlus className="text-gray-300" size={23} />
                )}
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