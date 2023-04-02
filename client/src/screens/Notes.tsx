import { useContext, SetStateAction, Dispatch } from "react";

import { FieldArrayWithId } from "react-hook-form";

import {
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
  isFetching: boolean;
  setNavbar: Dispatch<SetStateAction<boolean>>;
  expanded: boolean;
  navbar: boolean;
};

export default function Notes({ notes, isFetching, navbar, setNavbar, expanded }: Props) {
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
      <div 
        className="bg-gray-800 text-gray-100 overflow-scroll h-full scrollbar-thin scrollbar-thumb-gray-900"
      >
        {isFetching ? (
          <div className="flex flex-col items-center mt-14">
            <svg aria-hidden="true" role="status" className="inline w-10 h-12 mx-1 text-white animate-spin xxs:my-[1.5px]  my-[1.5px]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
            </svg>
            <p className="mt-2 text-lg animate-pulse">Loading notes...</p>
          </div>
        ) : (
          <div className="flex flex-row flex-wrap px-2 my-5 gap-y-6 gap-x-3 ">
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
                      <div className="h-[56px] mt-4 w-[165px] xxs:w-[161px] rounded-b-lg">{parsedImage}</div>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
