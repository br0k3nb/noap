import { useContext, SetStateAction, Dispatch, useState } from "react";

import { FieldArrayWithId } from "react-hook-form";

import {
  BsJournalText,
  BsSearch,
  BsFilter,
  BsXLg,
  BsList,
  // BsInfoCircle
} from "react-icons/bs";

import { motion } from "framer-motion";

import parse from "html-react-parser";

import moment from "moment";
import "moment/locale/pt-br";

import { NoteContext } from "./Home";
import ghost from '../assets/ghost.png';
import Loader from "../components/Loader";

type Notes = {
  note: {
    _id: string;
    userId: string;
    title?: string;
    body: string;
    image?: string;
    state: {
      _id: string;
      state: string;
    };
    labels?: [{
      _id: string;
      name: string;
      type: string;
      color: string;
      fontColor: string;
    }];
    updatedAt?: string;
    createdAt: string;
  }[];
};

type Props = {
  page: number;
  search: string;
  navbar: boolean;
  expanded: boolean;
  totalDocs: number;
  isFetching: boolean;
  hasNextPage: boolean;
  addNewNote: () => Promise<void>;
  setPage: Dispatch<SetStateAction<number>>;
  setSearch: Dispatch<SetStateAction<string>>;
  setNavbar: Dispatch<SetStateAction<boolean>>;
  notes: FieldArrayWithId<Notes, "note", "id">[];
};

export default function Notes({ notes, addNewNote, isFetching, navbar, setNavbar, expanded, setSearch, search, page, setPage, hasNextPage, totalDocs }: Props) {
  const hours = (date: string) => moment(date).format("LT");
  const days = (date: string) => moment(date).format("ll");

  const [ showSearch, setShowSearch ] = useState(false);

  const noteContext = useContext(NoteContext);

  const handleSearchClick = () => {
    setShowSearch(showSearch ? false : true);
    setSearch('');
  }

  const onInputChange = (currentTarget: HTMLInputElement) => {
    noteContext?.selectedNote && noteContext?.setSelectedNote(null);
    setSearch(currentTarget.value)
  }

  return (
    <div
      className={`overflow-hidden h-screen w-screen lg:max-w-[380px] border-r border-gray-600 !bg-gray-800 ${
        expanded && "hidden"
      }`}
    >
      <div className=" overflow-hidden flex flex-col pt-2 bg-gray-800 h-[100px]">
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
            <p className="pl-3">{totalDocs} notes</p>
            <div className="flex flex-row space-x-2">
              <div className="px-1 py-1 rounded cursor-not-allowed text-gray-500">
                <BsFilter size={25} />
              </div>
              <div className="tooltip tooltip-left" data-tip="Search">
                <button 
                  type="button"
                  className="hover:bg-stone-700 px-1 py-1 rounded"
                  onClick={() => handleSearchClick()}
                >
                  <BsSearch size={25} className="py-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <motion.div
        initial={{ x: -100 }}
        whileInView={{ x: 0 }}
        transition={{ duration: 0.6 }}
        className={`bg-gray-800 px-6 pb-2 hidden ${showSearch && "!grid"}`}
      >
        <input
          type="text"
          className={`sign-text-inputs bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400 h-10`}
          placeholder="Search for labels and titles..."
          value={search}
          onChange={({currentTarget}) => onInputChange(currentTarget)}
        />
      </motion.div>
      <div className="!bg-gray-800 border border-transparent border-t-gray-600 border-b-gray-600 text-gray-300">
        <div className="btn-group !bg-gray-800 flex !justify-between px-6">
          <button 
            className="btn !bg-gray-800 !border-transparent disabled:text-gray-500"
            disabled={page === 1 ? true : false}
            onClick={() => setPage(page - 1)}
          > 
            «
          </button>
          <button className="!bg-gray-800 !border-transparent uppercase tracking-widest text-sm cursor-default">Page {page}</button>
          <button 
            className="btn !bg-gray-800 !border-transparent disabled:text-gray-500"
            disabled={hasNextPage ? false : true}
            onClick={() => setPage(page + 1)}
          >
            »
          </button>
        </div>
      </div>
      <div 
        className="bg-gray-800 text-gray-100 overflow-scroll h-screen scrollbar-thin scrollbar-thumb-gray-900"
      >
        {isFetching ? (
          <div className="flex flex-col items-center mt-14">
            <Loader />
            <p className="mt-2 text-xl animate-pulse">Loading notes...</p>
          </div>
        ) : (
          <div className="flex flex-row flex-wrap px-2 my-5 gap-y-6 gap-x-3 xxs:mb-20">
            {notes.length > 0 ? (
                <>
                  {notes.map((val, idx) => {

                    const parsedImage =
                      val.image !== "no image attached"
                        ? parse(val.image as string)
                        : false;
                        
                    return (
                      <a
                        key={val._id}
                        className={`mx-auto flex flex-wrap ${idx === notes.length - 1 && "mb-48"}`}
                        onClick={() => noteContext?.setSelectedNote(idx)}
                      >
                        <div
                          className={`rounded-lg h-[18.4rem] w-[165px] xxs:w-[161px] border border-transparent bg-gray-700 py-3 shadow-lg shadow-gray-900 hover:border transition duration-300 hover:border-gray-500 ${
                            noteContext?.selectedNote === idx && "!border-gray-300"
                          }`}
                        >
                          <p className="text-lg px-4 mb-3 truncate">{val.title}</p>
                          <div className={`h-[196px] text-gray-300 flex flex-col px-4 ${parsedImage && "!h-[148px]"}`}>
                            <div className="!w-[135px] overflow-ellipsis overflow-hidden !mb-1">
                              <p>
                                {(val?.labels && val?.labels.length) && !parsedImage ? (val.body.length >= 135 ? val.body.slice(0,134).concat('...') : val.body) : 
                                (val?.labels && val?.labels.length) && parsedImage ? val.body.slice(0, 73) + '...' : val.body}
                              </p>
                            </div>
                            <div className="mt-1">
                              {val?.labels && val?.labels.length > 0 && (
                                <>
                                  <div className="truncate">
                                    {val.labels[0].type === "default" ? (
                                      <div className="flex space-x-1">
                                        <p 
                                          className="badge !text-[11px] badge-outline !py-1 uppercase text-xs tracking-wide"
                                          style={{
                                            backgroundColor: val.labels[0].color,
                                            borderColor: val.labels[0].color,
                                            color: val.labels[0].fontColor
                                          }}
                                        >
                                           {val.labels[0].name.length > 14 ? val.labels[0].name.slice(0, 8) + '...' : val.labels[0].name}
                                        </p>
                                        {val.labels.length > 1 && (
                                          <div className="rounded-full w-[22px] h-[21px] bg-gray-900 text-gray-300">
                                            <p className="text-[9px] ml-[4.5px] mt-[4px]">
                                              {'+ ' + val.labels.length}
                                            </p>
                                          </div>
                                        )}
                                      </div> 
                                    ) : (
                                      <div className="flex space-x-1">
                                        <p 
                                          className="badge badge-outline !py-1 uppercase !text-[11px] tracking-wide"
                                          style={{
                                            backgroundColor: 'transparent !important',
                                            borderColor: val.labels[0].color,
                                            color: val.labels[0].color
                                          }}
                                        >
                                          {val.labels[0].name.length > 14 ? val.labels[0].name.slice(0, 14) + '...' : val.labels[0].name}
                                        </p>
                                        {val.labels.length > 1 && (
                                          <div className="rounded-full w-[22px] h-[21px] bg-gray-900 text-gray-300">
                                            <p className="text-[9px] ml-[4.5px] mt-[4px]">
                                              {'+ ' + val.labels.length}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 px-4">
                            <p className="text-xs tracking-tighter">
                              {!val?.updatedAt
                                ? days(val.createdAt) + " at " + hours(val.createdAt)
                                : days(val.updatedAt) + " at " + hours(val.updatedAt)}
                            </p>
                          </div>
                          {parsedImage && (
                            <>
                              <div className="h-[56px] mt-3 w-[165px] xxs:w-[161px] rounded-b-lg">{parsedImage}</div>
                            </>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </>
            ): (
             <div className="mx-auto">
                <div className="flex flex-col space-y-3 justify-center items-center mt-6">
                  <img src={ghost} className="w-56 opacity-30 md:w-80 lg:w-56" />
                  <p className="!text-gray-400 text-[13px] uppercase tracking-wide">Ouhh, it's quite empty here...</p>
                  <div className="mx-auto">
                    <button 
                      className="!mt-4 text-gray-200 text-xs font-light tracking-widest uppercase px-3 mr-5 h-10 rounded-full hover:!bg-stone-900 border border-gray-500 transition-all duration-500 ease-in-out w-full"
                      onClick={() => addNewNote()}
                    > 
                      add a new note
                    </button>
                  </div>
                </div>
             </div> 
            )}
          </div>
        )}
      </div>
    </div>
  );
}
