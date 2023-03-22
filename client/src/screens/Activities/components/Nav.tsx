import { Dispatch, SetStateAction, useState } from "react";
import {
  AppBar,
  Box,
  Typography,
  Button,
  MenuItem,
  Menu,
  Tooltip,
  Avatar,
  IconButton,
  Divider,
} from "@mui/material";

import {
  Edit,
  ExitToApp,
  DarkMode,
  Event,
  LightMode,
  Label,
  Menu as MenuIcon,
  Close,
  OpenInFull,
  Settings,
  Add,
  Home,
  KeyboardDoubleArrowLeft,
} from "@mui/icons-material";

import { motion } from "framer-motion";

type Theme = {
  setTheme: Dispatch<SetStateAction<string>>;
  theme: string;
};

type parsedUserTokenType = {
  _id: string;
  userName: string;
  token: string;
};

type NavProps = {
  theme: Theme | null;
  handleCreate: () => unknown;
  setAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>;
  setOpenMenu: Dispatch<SetStateAction<boolean>>;
  // handleSignout: () => void;
  // parsedUserToken: parsedUserTokenType;
  anchorEl: Element | ((element: Element) => Element) | null;
  openMenu: boolean;
  setOpenSettings: Dispatch<SetStateAction<boolean>>;
  setNavbar: Dispatch<SetStateAction<boolean>>;
  navbar: boolean | string;
};

export default function Nav({
  theme,
  handleCreate,
  setAnchorEl,
  setOpenMenu,
  anchorEl,
  openMenu,
  setOpenSettings,
  navbar,
  setNavbar,
}: NavProps) {
  return (
    <div>
      <div className={`fixed ${!navbar ? "flex xxs:hidden" : "hidden xxs:flex"}`}>
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
              href="#"
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