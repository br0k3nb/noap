import { useState, useContext, SetStateAction, Dispatch } from "react";
import { Link, useLocation } from "react-router-dom";
import { FieldArrayWithId } from "react-hook-form";

import moment from "moment";
import "moment/locale/pt-br";

import { NoteCtx } from "../../context/SelectedNoteCtx";
import ghost from '../../assets/ghost.png';
import Loader from "../../components/Loader";

import { BsFillPinAngleFill } from "react-icons/bs";
import { MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowUp } from 'react-icons/md';

type Props = {
    page: number;
    search: string;
    isFetching: boolean;
    addNewNote: () => Promise<void>;
    setExpanded: Dispatch<SetStateAction<boolean>>;
    notes: FieldArrayWithId<Notes, "note", "id">[];
};

export default function CardNotes({ notes, addNewNote, isFetching, setExpanded, page, search }: Props) {
    const noteContext = useContext(NoteCtx);
    const location = useLocation();

    const [pinWasClicked, setPinWasClicked] = useState(false);

    const baseURL = location.pathname.slice(0, (location.pathname.length - String(page).length));

    const hours = (date: string) => moment(date).format("LT");
    const days = (date: string) => moment(date).format("ll");

    const handleNoteClick = (_id: string) => {
        noteContext?.setSelectedNote(_id);
        setExpanded(window.outerWidth <= 1030 ? true : false);
    };

    // const handlePinnedNotesClick = () => {
    //     setPinWasClicked(true);
    // }

    const unpinnedNotes = notes.filter(note => !note?.settings?.pinned);
    const pinnedNotes = notes.filter(note => note?.settings && note?.settings.pinned);

    return (
        <div className="bg-gray-800 text-gray-100 overflow-scroll h-screen scrollbar-thin scrollbar-thumb-gray-900">
            {isFetching ? (
                    <div className="flex flex-col items-center mt-14">
                        <Loader />
                        <p className="mt-2 text-xl animate-pulse">Loading notes...</p>
                    </div>
                ) : (
                    <>
                        {notes.length > 0 ? (
                            <div className="flex flex-row flex-wrap px-2 my-5 gap-y-6 gap-x-3 mb-48">  
                                {pinnedNotes.length > 0 && (
                                    <>
                                        <div className="mb-3 mt-2">
                                            <div className="collapse border border-base-300 bg-gray-900 rounded-lg !w-[360px]">
                                                <input 
                                                    readOnly
                                                    type="checkbox"
                                                    onClick={() => setPinWasClicked(!pinWasClicked)}
                                                />
                                                <div className="collapse-title">
                                                    <div className="mt-2 mb-2 flex flex-row space-x-2 justify-center items-center text-gray-300">
                                                        <p className="uppercase text-xs tracking-widest">Pinned notes</p>
                                                        <BsFillPinAngleFill />
                                                        <div className="absolute right-2">
                                                            {pinWasClicked ? (
                                                                <MdOutlineKeyboardArrowDown 
                                                                    size={26} 
                                                                    className="my-auto"
                                                                />
                                                            ) : (
                                                                <MdOutlineKeyboardArrowUp 
                                                                    size={26} 
                                                                    className="my-auto"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="collapse-content">
                                                    <div className="flex flex-row flex-wrap px-2 my-5 gap-y-6 gap-x-3">
                                                        {pinnedNotes.map((pinnedNotes, idx) => {
                                                            return (
                                                                <Cards  
                                                                    key={pinnedNotes._id}
                                                                    idx={idx}
                                                                    notes={pinnedNotes}
                                                                    noteContext={noteContext}
                                                                    customWidth={"!w-[150.5px]"}
                                                                    handleNoteClick={handleNoteClick}
                                                                    days={days}
                                                                    hours={hours}
                                                                />
                                                            )
                                                        })} 
                                                        <div className="flex flex-row items-center justify-center w-full mt-5">
                                                            <p className="text-gray-300 uppercase text-xs tracking-wide cursor-pointer hover:tracking-widest duration-300 border border-gray-600 py-2 px-3 rounded-full hover:bg-gray-800">
                                                                Show more items
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-[330px] border border-transparent border-t-gray-600 mb-3 mx-auto"/>
                                    </>
                                )}
                                {unpinnedNotes.map((unpinnedNotes, idx) => {
                                    return (
                                        <Cards  
                                            key={unpinnedNotes._id}
                                            notes={unpinnedNotes}
                                            idx={idx}
                                            noteContext={noteContext}
                                            handleNoteClick={handleNoteClick}
                                            days={days}
                                            hours={hours}
                                        />
                                    )  
                                })}
                            </div>
                            ) : (
                                <div className="flex flex-col space-y-3 justify-center items-center mt-6 mx-auto">
                                    <img src={ghost} className="w-56 opacity-30 md:w-80 lg:w-56"/>
                                    <p className="!text-gray-400 text-[13px] uppercase tracking-wide">
                                        {search !== "" ? "No notes were found!" : "Ouhh, it's quite empty here..."}
                                    </p>  
                                    {page > 1 ? (
                                        <Link 
                                            className="!pt-2 text-gray-200 text-sm font-light tracking-widest uppercase px-3 mr-5 h-10 rounded-full hover:!bg-stone-900 border border-gray-500 transition-all duration-500 ease-in-out w-full mx-auto text-center"
                                            to={baseURL + 1}
                                        > 
                                            Go back
                                        </Link>

                                    ) : (
                                        <button 
                                            className="!mt-4 text-gray-200 text-xs font-light tracking-widest uppercase px-3 mr-5 h-10 rounded-full hover:!bg-stone-900 border border-gray-500 transition-all duration-500 ease-in-out w-full mx-auto"
                                            onClick={() => addNewNote()}
                                        > 
                                            add a new note
                                        </button>
                                    )}              
                                </div>  
                            )
                        }
                    </>
                )
            }
        </div>
    );
}

type CardsProps = {
    notes: any;
    idx: number;
    noteContext: any;
    customWidth?: number | string;
    days: (date: string) => string;
    hours: (date: string) => string;
    handleNoteClick:  (_id: string) => void;

};

export function Cards ({ notes, idx, noteContext, handleNoteClick, days, hours, customWidth}: CardsProps) {
    const { image, labels, _id, body, createdAt, updatedAt, title } = notes;
    const { color, type, fontColor, name } = labels[0] || {};

    return (
        <a 
            className={`mx-auto flex flex-wrap ${idx === notes.length - 1 && "mb-48"}`} 
            onClick={() => handleNoteClick(_id)} 
            key={_id}
        >
            <div 
                className={`
                    rounded-lg h-[18.4rem] w-[165px] xxs:w-[161px] border border-stone-900 bg-gray-700 pt-3 shadow-lg shadow-gray-900 hover:border transition duration-300 hover:border-gray-500
                    ${noteContext?.selectedNote === _id && "!border-gray-300"}
                    ${customWidth && customWidth}
                `}
            >
                <p className="text-lg px-4 mb-3 truncate">{title}</p>
                <div className={`h-[196px] text-gray-300 flex flex-col px-4 ${image !== '' && "!h-[148px]"}`}>
                    <div 
                        className={`
                            !w-[135px] overflow-ellipsis overflow-hidden !mb-1
                            ${customWidth && "!w-[119.5px]"}
                        `}
                    >
                        {/* using this conditions because for some reason the string truncation isn't working properly */}
                        {
                            labels.length && image === '' ? (body.length >= 135 ? body.slice(0,114).concat('...') : body) :
                            !labels.length && image === '' ? (body.length >= 135 ? body.slice(0,131).concat('...') : body) :
                            labels.length && image !== '' ? (body.length >= 135 ? body.slice(0, 73).concat('...') : body) : 
                            !labels.length && image !== '' ? (body.length >= 135 ? body.slice(0, 73).concat('...') : body) : body
                        }
                    </div>
                    {labels && labels.length > 0 && (
                        <div className="mt-1">
                            {type === "default" ? (
                                    <div className="flex space-x-1">
                                        <p 
                                            className="badge !text-[11px] badge-outline !py-1 uppercase text-xs tracking-wide"
                                            style={{ backgroundColor: color, borderColor: color, color: fontColor }}
                                        >
                                            {name && name.length > 16 ? name.slice(0, 11) + '...' : name}
                                        </p>
                                        {labels.length > 1 && (
                                        <div className="rounded-full w-[22px] h-[21px] bg-gray-900 text-gray-300">
                                            <p className="text-[9px] ml-[4.5px] mt-[4px]">{'+ ' + (labels.length - 1)}</p>
                                        </div>
                                        )}
                                    </div> 
                                ) : (
                                    <div className="flex space-x-1">
                                        <p 
                                            className="badge badge-outline !py-1 uppercase !text-[11px] tracking-wide"
                                            style={{ backgroundColor: 'transparent !important', borderColor: color, color }}
                                        >
                                            {name && name.length > 14 ? name.slice(0, 14) + '...' : name}
                                        </p>
                                        {labels.length > 1 && (
                                        <div className="rounded-full w-[22px] h-[21px] bg-gray-900 text-gray-300">
                                            <p className="text-[9px] ml-[4.5px] mt-[4px]">{'+ ' + (labels.length - 1)}</p>
                                        </div>
                                        )}
                                    </div>
                                )
                            }
                        </div>
                    )}
                </div>
                <p 
                    className={`
                        text-xs tracking-tighter mt-2 px-4 pb-[0.04rem]
                        ${customWidth && "!text-[11px]"}
                    `}
                >
                    {!updatedAt ? days(createdAt) + " at " + hours(createdAt) : days(updatedAt) + " at " + hours(updatedAt)}
                </p>
                {image !== '' && (
                    <div 
                        className={`
                            h-[56px] mt-3 w-[165px] xxs:w-[161px] rounded-b-lg
                            ${customWidth && customWidth}
                        `}
                    >
                        <img 
                            src={image}
                            className="rounded-b-[6.5px] object-cover !h-[3.50rem] min-w-[98.9%]"
                        />
                    </div>
                )}
            </div>
        </a>
    );
}