import { useState } from 'react';

import {
  BsFillHouseDoorFill,
  BsJournalPlus,
  BsTagFill,
  BsFillCalendarEventFill,
  BsFillGearFill,
  BsDoorOpenFill,
  BsFillPersonLinesFill
} from "react-icons/bs";

import { BiLogIn, BiUserCircle , BiLock } from "react-icons/bi";

// import { motion } from "framer-motion";

type NavProps = {
  newNote: boolean;
  addNewNote: () => Promise<void>;
  expanded: boolean;
  navbar: boolean;
  handleSignout: () => void
};

export default function Nav({
  navbar,
  newNote,
  addNewNote,
  expanded,
  handleSignout
}: NavProps) {
  const [checked, setChecked] = useState(false);

  return (
    <div className={`${expanded && "hidden"}`}>
      <div
        className={`fixed ${
          !navbar && "flex xxs:hidden"
        }`}
      >
        <div 
          className="flex flex-col items-center w-[60px] h-screen overflow-hidden text-gray-400 bg-stone-900 justify-end"
        >
          <div
            className="flex items-center justify-center w-12 h-12 mt-auto hover:text-gray-300 absolute top-6 rounded-full hover:bg-gray-600 trasition-all duration-300 ease-in-out"
          >
            <div className="dropdown dropdown-right pt-[6.2px]">
              <label tabIndex={0} className="">
                <div className="tooltip tooltip-right text-gray-100 before:text-[15px]" data-tip="Account">
                  <div className="rounded-full">
                    <img
                      src="https://yt3.ggpht.com/yti/AHXOFjV0J15e7kweVnEy8NWSssTdBJL8Tb_RMOWsm76ZT4M=s88-c-k-c0x00ffffff-no-rj-mo"
                      alt=""
                      className="rounded-full h-10 w-10"
                    />
                  </div>
                </div>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu shadow bg-base-100 w-52 rounded-xl"
              >
                <li className="">
                  <a
                    className="active:!bg-gray-600 rounded-xl"
                    onClick={() => setChecked(!checked)}
                  >
                    <label htmlFor="my-modal-4" className="text-gray-300">
                      <div className="flex flex-row space-x-2">
                        <p>Account infomation</p>
                        <BsFillPersonLinesFill size={19} className="pt-1"/>
                      </div>
                    </label>
                  </a>
                  {/* <a
                    className="active:!bg-gray-600 rounded-xl"
                    onClick={() => handleSignout()}
                  >
                    <label htmlFor="my-modal-4" className="text-gray-300">
                      <div className="flex flex-row space-x-2">
                        <p>Log out</p>
                        <BsDoorOpenFill size={19} className="pt-1"/>
                      </div>
                    </label>
                  </a> */}

                  <div className="mx-2 border border-transparent border-b-gray-700 !h-[1px] p-0 !rounded-none"/>
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

            <input
              checked={checked}
              readOnly
              type="checkbox"
              className="modal-toggle"
            />
            <label htmlFor="my-modal-4" className="modal cursor-pointer">
              <label 
                className="modal-box !px-0 !text-gray-100 relative lg:!w-[420px] max-w-none !w-80 sm:!w-96 max-h-none !h-[19rem] !bg-gray-800 !font-light" 
              >
                <div className="flex flex-row justify-between pb-2 px-8">
                  <h3 className="text-[21.5px] tracking-tighter">Account settings</h3>
                  <label 
                    htmlFor="my-modal-4" 
                    className="btn btn-sm btn-circle"
                    onClick={() => setChecked(false)}
                  >
                    ✕
                  </label>
                </div>
                <div className='bg-gray-600 !h-[1px] mt-3' />
                <div className="flex flex-col text-[17px] xxs:text-[14px] space-y-3 mt-5">
                  <button className='w-full'>
                    <div className="py-3 hover:bg-gray-500">
                      <div className="flex-flex-row space-x-2 lg:mr-[9.5rem] xxs:mr-[5.5rem] sm:mr-[8rem]">
                        <BiUserCircle className='inline' size={30}/>
                        <span>Change profile picture</span>  
                      </div>
                    </div>
                  </button>
                  <button className='py-3 w-full  hover:bg-gray-500'>
                    <div className="flex-flex-row space-x-2 lg:mr-[8.2rem] xxs:mr-[4.5rem] sm:mr-[6.8rem]">
                      <BiLock className='inline' size={30}/>
                      <span>Change login information</span>  
                    </div>
                  </button>
                  <button 
                    className='pt-3 pb-2 w-full  hover:bg-gray-500'
                    onClick={() => handleSignout()}
                  >
                    <div className="flex-flex-row space-x-2 lg:mr-[16.7rem] xxs:mr-[11.5rem] sm:mr-[15.5rem]">
                      <BiLogIn className='inline' size={30}/>
                      <span>Sign out</span>  
                    </div>
                  </button>
                </div>
                {/* <div className="mt-3 flex flex-row justify-evenly">
                    <button
                      className="bg-gray-800 hover:bg-gray-900 text-gray-100 px-8 py-3 rounded-lg"
                      onClick={() => setChecked(!checked)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="bg-red-600 hover:bg-red-700 text-gray-100 px-7 py-3 rounded-lg"
                      // onClick={() => removeNote()}
                    >
                      Delete
                    </button>
                </div> */}
              </label>
            </label>
          </div>

          <div className="!bg-gray-600 h-1 w-1 rounded-full absolute top-[98px]"/>

          <div className="flex flex-col items-center absolute top-28">
            <div className="tooltip tooltip-right text-gray-300" data-tip="Home">
              <a
                className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300"
                href="#"
              >
                <BsFillHouseDoorFill className="text-gray-300" size={23} />
              </a>
            </div>
            <div
              className="tooltip tooltip-right text-gray-100 "
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
                href="#"
              >
                <BsTagFill className="text-gray-300" size={23} />
              </a>
            </div>
            <div className="tooltip tooltip-right text-gray-300" data-tip="Events">
              <a
                className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300"
                href="#"
              >
                <BsFillCalendarEventFill className="text-gray-300 " size={22} />
              </a>
            </div>
            <div className="flex items-center justify-center h-12 pt-1 hover:bg-gray-700 hover:text-gray-300 mt-2">
              <div className="dropdown">
                <label tabIndex={0} className="px-5 py-4">
                  <div className="tooltip tooltip-right text-gray-300" data-tip="Settings">
                    <BsFillGearFill className="text-gray-300" size={23} />
                  </div>
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                >
                  <li>
                    <a
                      className="active:!bg-gray-600"
                      onClick={() => handleSignout()}
                    >
                      <label htmlFor="my-modal-4" className="text-gray-200">
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
          </div>
        </div>
      </div>
    </div>
  );
}
