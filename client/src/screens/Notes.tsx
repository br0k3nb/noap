import { Dispatch, SetStateAction } from "react";

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
  Search,
  Sort,
  FilterAlt,
  TextSnippet,
} from "@mui/icons-material";

import moment from "moment";
import "moment/locale/pt-br";

type Activity = {
  _id: string;
  title: string;
  body: string;
  bookmark: boolean;
  bookmarkColor: string;
  themeSwitch?: boolean;
  updatedAt?: string;
  createdAt: string;
};

type Props = {
  activities: Activity[];
  setNavbar: Dispatch<SetStateAction<boolean>>;
  navbar: boolean;
};

export default function Notes({ activities, navbar, setNavbar }: Props) {
  const days = (date: string) => moment(date).format("ll");
  const hours = (date: string) => moment(date).format("LT");

  return (
    <div className="w-screen lg:max-w-[380px] border-r border-gray-600">
      <div className="flex flex-col pt-2 bg-gray-800 h-[100px] border-b border-gray-600">
        <div className="flex flex-col mb-[4.2px]">
          <div className="flex flex-row justify-between px-3 py-2 text-gray-200">
            <div className="text-center flex flex-row space-x-1 px-2">
              <span>
                <TextSnippet
                  sx={{ fontSize: 27 }}
                  className="pb-[1.5px] "
                />
              </span>
              <p className="text-xl">Notes</p>
            </div>
            <button className="sm:hidden" onClick={() => setNavbar(!navbar)}>
              <MenuIcon sx={{fontSize: 26}}/>
            </button>
          </div>

          <div className="flex flex-row flex-wrap gap-x-1 justify-between px-3 py-2 max-w-screen text-gray-200">
            <p className="pl-3">{activities.length} notes</p>

            <div className="flex flex-row space-x-2">
              <div className="hover:bg-stone-700 rounded ">
                <Sort />
              </div>
              <div className="hover:bg-stone-700 rounded">
                <FilterAlt />
              </div>
              <div className="hover:bg-stone-700">
                <Search />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 text-gray-100 overflow-scroll h-screen">
        <div className="flex flex-row flex-wrap px-2 my-5 gap-y-6 gap-x-3 ">
          {activities.map((val, idx) => (
            <div
              key={idx}
              className={`rounded-lg h-72 w-[165px] xxs:w-[161px] mx-auto border border-transparent bg-gray-700 px-4 py-3 shadow-lg shadow-gray-900 hover:border transition duration-300 hover:border-gray-400 ${
                idx === activities.length - 1 && "mb-32 "
              }`}
            >
              <p className="font-semibold">{val.title}</p>

              <div className="h-[164px] mt-3 flex ">
                <p className="overflow-ellipsis overflow-hidden">{val.body}</p>
              </div>

              <div className="mt-10">
                <p className="text-xs tracking-tighter">
                  {!val?.updatedAt
                    ? days(val.createdAt) + " at " + hours(val.createdAt)
                    : days(val.updatedAt) + " at " + hours(val.updatedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
