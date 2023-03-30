import { Dispatch, SetStateAction } from "react";

import {
  BsFillHouseDoorFill,
  BsJournalPlus,
  BsTagFill,
  BsFillCalendarEventFill,
  BsFillGearFill,
  BsXLg,
  BsList,
  BsChatLeftQuoteFill
} from "react-icons/bs";

// import { motion } from "framer-motion";

type Notes = {
  note: {
    _id: string;
    userId: string;
    title?: string;
    body: string;
    state: string;
    updatedAt?: string;
    createdAt: string;
  }[];
};

type NavProps = {
  setNavbar: Dispatch<SetStateAction<boolean>>;
  navbar: boolean | string;
  addNewNote: () => Promise<void>;
};

export default function Nav({ navbar, setNavbar, addNewNote }: NavProps) {
  return (
    <div>
      <div
        className={`fixed z-50 ${
          !navbar ? "flex xxs:hidden" : "hidden xxs:flex"
        }`}
      >
        <div className="flex flex-col items-center w-[60px] h-screen overflow-hidden text-gray-400 bg-stone-900">
          <div className="flex items-center justify-center mt-3 rounded-full border border-gray-600 px-2 h-10 w-10 xxs:mt-5 sm:mt-3">
            <p className="text-2xl py-1 px-1">N</p>
          </div>

          <div className="pt-0 sm:pt-3">
            <button onClick={() => setNavbar(!navbar)}>
              {!navbar ? (
                <BsList className="text-gray-300 mt-1" size={30} />
              ) : (
                <BsXLg
                  className="text-gray-300 mt-1 hidden md:flex"
                  size={23}
                />
              )}
            </button>
          </div>
          <div className="flex flex-col items-center mt-0 md:mt-3 border-t border-stone-900">
            <div className="tooltip text-gray-300" data-tip="Home">
              <a
                className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300"
                href="#"
              >
                <BsFillHouseDoorFill className="text-gray-300" size={23} />
              </a>
            </div>
            <div className="tooltip text-gray-100 !px-36" data-tip="New note">
              <a
                className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300"
                onClick={() => addNewNote()}
              >
                <BsJournalPlus className="text-gray-300" size={23} />
              </a>
            </div>
            <div className="tooltip text-gray-300" data-tip="Labels">
              <a
                className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300"
                href="#"
              >
                <BsTagFill className="text-gray-300" size={23} />
              </a>
            </div>
            <div className="tooltip text-gray-300" data-tip="Events">
              <a
                className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300"
                href="#"
              >
                <BsFillCalendarEventFill className="text-gray-300" size={22} />
              </a>
            </div>
            <div className="tooltip text-gray-300" data-tip="Settings">
              <a
                className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300"
                href="#"
              >
                <BsFillGearFill className="text-gray-300" size={23} />
              </a>
            </div>
          </div>
          <a
            className="flex items-center justify-center w-16 h-16 mt-auto bg-gray-700 hover:bg-gray-600 hover:text-gray-300"
            href="#"
          >
            <div className="rounded-full">
              <img
                src="https://yt3.ggpht.com/yti/AHXOFjV0J15e7kweVnEy8NWSssTdBJL8Tb_RMOWsm76ZT4M=s88-c-k-c0x00ffffff-no-rj-mo"
                alt=""
                className="rounded-full h-10 w-10"
              />
            </div>
          </a>
        </div>
      </div>

      <div
        // initial={{ x: -80 }}
        // whileInView={{ x: 0 }}
        // transition={{ duration: 0.4 }}
        className={`fixed ${navbar ? "flex xxs:hidden" : "hidden"}`}
      >
        <div className="flex flex-col items-center w-40 h-screen overflow-hidden text-gray-400 bg-stone-900 rounded">
          <a
            className="flex flex-row justify-between items-center w-full px-3 mt-3"
            href="#"
          >
            <div className="flex flex-row">
              <span className="text-xl">Noap</span>
              <span className="pt-2 pl-2" ><BsChatLeftQuoteFill/></span>
            </div>
            <BsXLg
              className="text-gray-300 mt-1"
              onClick={() => setNavbar(!navbar)}
              size={22}
            />
          </a>
          <div className="w-full ">
            <div className="flex flex-col items-center w-full mt-3 border-t border-gray-700 space-y-1">
              <button className="flex items-center w-full h-12 px-3 mt-2 hover:bg-gray-700">
                <BsFillHouseDoorFill className="text-gray-300" size={23} />
                <span className="ml-2 text-sm font-medium">Home</span>
              </button>
              <button className="flex items-center w-full h-12 px-3 hover:bg-gray-700">
                <BsJournalPlus className="text-gray-300" size={23} />
                <span className="ml-2 text-sm font-medium">New note</span>
              </button>
              <button className="flex items-center w-full h-12 px-3 hover:bg-gray-700">
                <BsTagFill className="text-gray-300" size={23} />
                <span className="ml-2 text-sm font-medium">Labels</span>
              </button>
              <button className="flex items-center w-full h-12 px-3 hover:bg-gray-700 ">
                <BsFillCalendarEventFill className="text-gray-300" size={23} />
                <span className="ml-2 text-sm font-medium">Reminders</span>
              </button>
              <button className="flex items-center w-full h-12 px-3 hover:bg-gray-700">
                <BsFillGearFill className="text-gray-300" size={23} />
                <span className="ml-2 text-sm font-medium">Settings</span>
              </button>
            </div>
          </div>
          <a
            className="flex flex-row items-center justify-center w-full h-16 mt-auto bg-gray-700 hover:bg-gray-600 hover:text-gray-300"
            href="#"
          >
            <div className="rounded-full">
              <img
                src="https://yt3.ggpht.com/yti/AHXOFjV0J15e7kweVnEy8NWSssTdBJL8Tb_RMOWsm76ZT4M=s88-c-k-c0x00ffffff-no-rj-mo"
                alt=""
                className="rounded-full h-12 w-12"
              />
            </div>
            <span className="pl-4 text-sm font-medium">Account</span>
          </a>
        </div>
      </div>
    </div>
  );
}
