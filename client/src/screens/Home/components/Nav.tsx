import { Dispatch, SetStateAction } from "react";

import {
  BsFillHouseDoorFill,
  BsJournalPlus,
  BsTagFill,
  BsFillCalendarEventFill,
  BsFillGearFill,
  BsXLg,
  BsList,
  BsDoorOpenFill
} from "react-icons/bs";

// import { motion } from "framer-motion";

type NavProps = {
  setNavbar: Dispatch<SetStateAction<boolean>>;
  addNewNote: () => Promise<void>;
  expanded: boolean;
  navbar: boolean;
  handleSignout: () => void
};

export default function Nav({
  navbar,
  setNavbar,
  addNewNote,
  expanded,
  handleSignout
}: NavProps) {
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
          <a
            className="flex items-center justify-center w-12 h-12 mt-auto hover:text-gray-300 absolute top-6 rounded-full hover:bg-gray-600 trasition-all duration-300 ease-in-out"
            href="#"
          >
            <div className="tooltip tooltip-right text-gray-100 before:text-[15px]" data-tip="Account">
              <div className="rounded-full">
                <img
                  src="https://yt3.ggpht.com/yti/AHXOFjV0J15e7kweVnEy8NWSssTdBJL8Tb_RMOWsm76ZT4M=s88-c-k-c0x00ffffff-no-rj-mo"
                  alt=""
                  className="rounded-full h-10 w-10"
                />
              </div>
            </div>
          </a>

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
              data-tip="New note"
            >
              <a
                className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300"
                onClick={() => addNewNote()}
              >
                <BsJournalPlus className="text-gray-300" size={23} />
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
