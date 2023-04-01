import { useContext, SetStateAction, Dispatch } from "react";

import { FieldArrayWithId } from "react-hook-form";

import {
  BsChatLeftText,
  BsChatLeftQuoteFill,
  BsJournalText,
  BsSearch,
  BsFilter,
  BsXLg,
  BsList,
} from "react-icons/bs";

import parse from "html-react-parser";

import moment from "moment";
import "moment/locale/pt-br";

import { NoteContext } from "./Home";

type Notes = {
  note: {
    _id: string;
    userId: string;
    title?: string;
    body: string;
    image?: string;
    state: string;
    updatedAt?: string;
    createdAt: string;
  }[];
};

type Props = {
  notes: FieldArrayWithId<Notes, "note", "id">[];
  setNavbar: Dispatch<SetStateAction<boolean>>;
  expanded: boolean;
  navbar: boolean;
};

export default function Notes({ notes, navbar, setNavbar, expanded }: Props) {
  const hours = (date: string) => moment(date).format("LT");
  const days = (date: string) => moment(date).format("ll");

  const noteContext = useContext(NoteContext);

  return (
    <div
      className={`w-screen lg:max-w-[380px] border-r border-gray-600 ${
        expanded && "hidden"
      }`}
    >
      <div className="flex flex-col pt-2 bg-gray-800 h-[100px] border-b border-gray-600">
        <div className="flex flex-col mb-[4.2px]">
          <div className="flex flex-row justify-between px-3 py-2 text-gray-200">
            <div className="text-center flex flex-row space-x-1 px-2">
              <span>
                <BsJournalText size={23} className="pt-1" />
              </span>
              <p className="text-xl">Notes</p>
            </div>
            <button className="sm:hidden" onClick={() => setNavbar(!navbar)}>
              {!navbar ? <BsList size={29} /> : <BsXLg size={24} />}
            </button>
          </div>

          <div className="flex flex-row flex-wrap gap-x-1 justify-between px-3 py-2 max-w-screen text-gray-200">
            <p className="pl-3">{notes.length} notes</p>

            <div className="flex flex-row space-x-2">
              <div className="hover:bg-stone-700 px-1 py-1 rounded">
                <BsFilter size={25} />
              </div>
              <div className="hover:bg-stone-700 px-1 py-1 rounded">
                <BsSearch size={25} className="py-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 text-gray-100 overflow-scroll h-screen">
        <div className="flex flex-row flex-wrap px-2 my-5 gap-y-6 gap-x-3">
          {notes.map((val, idx) => {
            const parserdHtml = parse(val.body);

            const parsedImage =
              val.image !== "no image attached"
                ? parse(val.image as string)
                : false;
                
            return (
              <a
                key={idx}
                className={`mx-auto flex flex-wrap ${idx === notes.length - 1 && "mb-32"}`}
                onClick={() => noteContext?.setSelectedNote(idx)}
              >
                <div
                  className={`rounded-lg h-72 w-[165px] xxs:w-[161px] border border-transparent bg-gray-700 py-3 shadow-lg shadow-gray-900 hover:border transition duration-300 hover:border-gray-500 ${
                    noteContext?.selectedNote === idx && "!border-gray-300"
                  }`}
                >
                  <p className="text-lg px-4 mb-3 truncate">{val.title}</p>

                  <div className={`h-[164px] text-gray-300 flex px-4 ${parsedImage && "!h-[126px]"}`}>
                    <div className="overflow-ellipsis overflow-hidden">
                      {parserdHtml}
                    </div>
                  </div>

                  <div className="mt-5 px-4">
                    <p className="text-xs tracking-tighter">
                      {!val?.updatedAt
                        ? days(val.createdAt) + " at " + hours(val.createdAt)
                        : days(val.updatedAt) + " at " + hours(val.updatedAt)}
                    </p>
                  </div>
                  {parsedImage && (
                    <div className="h-[56px] mt-4 w-full ">{parsedImage}</div>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
