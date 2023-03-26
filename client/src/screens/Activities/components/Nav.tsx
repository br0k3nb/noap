import { Dispatch, SetStateAction } from "react";

import { UseFieldArrayAppend, FieldArrayWithId } from "react-hook-form";

import {
  Event,
  Label,
  Menu as MenuIcon,
  Close,
  Settings,
  Add,
  Home,
  KeyboardDoubleArrowLeft,
} from "@mui/icons-material";

import api from "../../../services/api";

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
  // handleSignout: () => void;
  // parsedUserToken: parsedUserTokenType;
  setNavbar: Dispatch<SetStateAction<boolean>>;
  navbar: boolean | string;
  append: UseFieldArrayAppend<Notes, "note">;
  notes: FieldArrayWithId<Notes, "note", "UseFieldArrayId">[];
};

export default function Nav({ navbar, setNavbar, append, notes }: NavProps) {
  const defaultState = '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}'

  const parsedUserToken = JSON.parse(
    window.localStorage.getItem("user_token") || ""
  );

  const addNewNote = async () => {
    try {
      await api.post(`https://noap-typescript-api.vercel.app/add/${parsedUserToken.token}`,
      {
        // title,
        body: '',
        state: defaultState,
        userId: parsedUserToken._id,
      });  

      append({
        // title,
        _id: String(notes.length), //setting a temporary _id for now. the real _id will be fetched from the db
        body: '',
        state: defaultState,
        userId: parsedUserToken._id as string,
        createdAt: new Date().toISOString(),
      });

    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div>
      <div
        className={`fixed ${!navbar ? "flex xxs:hidden" : "hidden xxs:flex"}`}
      >
        <div className="flex flex-col items-center w-[60px] h-screen overflow-hidden text-gray-400 bg-stone-900">
          <div className="flex items-center justify-center mt-3 rounded-full border border-gray-600 px-2 h-10 w-10">
            <p className="text-2xl py-1 px-1">N</p>
          </div>

          <div className="pt-3 pb-1">
            <button onClick={() => setNavbar(!navbar)}>
              {!navbar ? (
                <MenuIcon
                  className="text-gray-300 mt-1"
                  sx={{ fontSize: 30 }}
                />
              ) : navbar === "mobile-true" ? (
                <KeyboardDoubleArrowLeft
                  className="text-gray-300 mt-1"
                  sx={{ fontSize: 30 }}
                />
              ) : (
                <Close className="text-gray-300 mt-1" sx={{ fontSize: 30 }} />
              )}
            </button>
          </div>
          <div className="flex flex-col items-center mt-3 border-t border-stone-900">
            <a
              className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300"
              href="#"
            >
              <Home className="text-gray-300" sx={{ fontSize: 27 }} />
            </a>
            <a
              className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300"
              onClick={() => addNewNote()}
            >
              <Add className="text-gray-300" sx={{ fontSize: 27 }} />
            </a>
            <a
              className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300"
              href="#"
            >
              <Label className="text-gray-300" sx={{ fontSize: 27 }} />
            </a>
            <a
              className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300"
              href="#"
            >
              <Event className="text-gray-300" sx={{ fontSize: 27 }} />
            </a>
            <a
              className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300"
              href="#"
            >
              <Settings className="text-gray-300" sx={{ fontSize: 27 }} />
            </a>
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
            <span className="text-xl">Noap</span>
            <Close
              className="text-gray-300 mt-1"
              onClick={() => setNavbar(!navbar)}
              sx={{ fontSize: 30 }}
            />
          </a>
          <div className="w-full ">
            <div className="flex flex-col items-center w-full mt-3 border-t border-gray-700 space-y-1">
              <button className="flex items-center w-full h-12 px-3 mt-2 hover:bg-gray-700">
                <Home className="text-gray-300" sx={{ fontSize: 27 }} />
                <span className="ml-2 text-sm font-medium">Home</span>
              </button>
              <button className="flex items-center w-full h-12 px-3 hover:bg-gray-700">
                <Add className="text-gray-300" sx={{ fontSize: 27 }} />
                <span className="ml-2 text-sm font-medium">New note</span>
              </button>
              <button className="flex items-center w-full h-12 px-3 hover:bg-gray-700">
                <Label className="text-gray-300" sx={{ fontSize: 27 }} />
                <span className="ml-2 text-sm font-medium">Labels</span>
              </button>
              <button className="flex items-center w-full h-12 px-3 hover:bg-gray-700 ">
                <Event className="text-gray-300" sx={{ fontSize: 27 }} />
                <span className="ml-2 text-sm font-medium">Reminders</span>
              </button>
              <button className="flex items-center w-full h-12 px-3 hover:bg-gray-700">
                <Settings className="text-gray-300" sx={{ fontSize: 27 }} />
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
