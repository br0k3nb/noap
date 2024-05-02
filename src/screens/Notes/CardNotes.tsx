import { useState, Dispatch, memo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FieldArrayWithId } from "react-hook-form";

import { AiFillInfoCircle } from "react-icons/ai";
import { BsFillPinAngleFill } from "react-icons/bs";
import { MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowUp } from 'react-icons/md';

import useGetUrl from "../../hooks/useGetUrl";
import useUserData from "../../hooks/useUserData";
import useSelectedNote from "../../hooks/useSelectedNote";
import useNoteSettings from "../../hooks/useNoteSettings";
import useUpdateViewport from "../../hooks/useUpdateViewport";

import Modal from "../../components/Modal";
import Loader from "../../components/Loader";
import no_notes_found from '../../assets/no_notes_found.svg';

import moment from "moment";
import "moment/locale/pt-br";

import type { notesState, notesActions } from '../../reducers/noteReducer';
import type { pinnedNotesState, pinnedNotesActions } from "../../reducers/pinNoteReducer";

type Props = {
    isFetching: boolean;
    addNewNote: () => Promise<void>;   
    notesMetadata: FieldArrayWithId<NoteMetadata, "noteMetadata", "id">[];
    pinnedNotes: FieldArrayWithId<NoteMetadata, "noteMetadata", "id">[];
    dispatchNotes: Dispatch<notesActions>;
    dispatchPinNotes: Dispatch<pinnedNotesActions>;
    pinNotesState: pinnedNotesState;
    notesState: notesState;
    delayedSearch: string;
};

export default function CardNotes({ 
    notesMetadata,
    isFetching, 
    pinnedNotes,
    addNewNote,
    pinNotesState,
    dispatchPinNotes,
    notesState,
    delayedSearch
 }: Props) { 
    const [pinWasClicked, setPinWasClicked] = useState(false);
    const [pageWasRefreshed, setPageWasRefreshed] = useState(false);
    const [viewPort, setViewPort] = useState({ width: window.innerWidth });
    const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [openPinNoteCollapsable, setOpenPinNoteCollapsable] = useState(false);

    const { page } = notesState;
    const { hasNextPage: pinHasNextPage, page: pinPage } = pinNotesState;
    
    const navigate = useNavigate();
    const { setSelectedNote } = useSelectedNote();
    const baseUrl = useGetUrl({ absolutePath: true, removeNoteId: true });
    const { setNoteSettings, noteSettings: { status } } = useNoteSettings();
    const goBackUrl = useGetUrl({ absolutePath: true, goToPageNumber: 1 });
    const { userData: { settings: { showPinnedNotesInFolder }} } = useUserData();

    useUpdateViewport(setViewPort, 500);

    const hours = (date: string) => moment(date).format("LT");
    const days = (date: string) => moment(date).format("ll");

    useEffect(() => {
        const fn = (e: Event) => {
            if(status && status === "saving") {
                e.preventDefault();
                console.log('fsidfhasjfhjadsfa');
                setPageWasRefreshed(true);
                setOpenConfirmationModal(true);
            }
        };
        window.addEventListener('beforeunload', fn);

        return () => window.removeEventListener('beforeunload', fn);
    }, [status]);

    useEffect(() => {
        if(status && status !== 'saving') {
            if(selectedNoteId) {
                setSelectedNote(selectedNoteId);
                navigate(`${baseUrl}/note/${selectedNoteId}`);
                setSelectedNoteId(null);
                setOpenConfirmationModal(false);
            } else if (pageWasRefreshed) {
                setPageWasRefreshed(false);
                setOpenConfirmationModal(false);
                location.reload();
            }
        }
    }, [status]);

    const handleNoteClick = (_id: string) => {
        if(status && status === 'saving') {
            setSelectedNoteId(_id);
            setOpenConfirmationModal(true);
        } else {
            setSelectedNote(_id);
            setNoteSettings((prevSettings) => {
                return {
                    ...prevSettings,
                    expanded: window.outerWidth <= 1030 ? true : false
                }
            });
        }
    };

    return (
        <div 
            className="bg-[#f8f8f8] dark:bg-[#0f1011] text-gray-900 dark:text-gray-300 overflow-scroll h-screen scrollbar-thin scrollbar-thumb-gray-900 dark:scrollbar-thumb-gray-300 !scrollbar-rounded overflow-x-hidden"
        >
            <Modal
                title="Hold up..."
                open={openConfirmationModal}
                setOpen={setOpenConfirmationModal}
                options={{
                    titleWrapperClassName: "!px-6",
                    titleCustomClassName: "xxs:!text-[20px]",
                    modalWrapperClassName: "px-0 w-[24rem] xxs:!w-[21rem]",
                }}
            >
                <div className="px-6">
                    <div className="flex flex-col justify-center items-center space-y-6 mt-5">
                        <div className="alert !bg-neutral-900 mx-auto w-[21.2rem] xxs:w-[16.5rem] max-h-32">
                            <div className="text-[13.5px] uppercase tracking-wide flex flex-row">
                                <div className="mr-3 my-auto">
                                    <AiFillInfoCircle 
                                        size={30}
                                        className="stroke-info flex-shrink-0 text-blue-500" 
                                    />
                                </div>
                                <span className="text-gray-300">
                                    To avoid any data loss, please wait for the note finish saving!
                                </span>
                            </div>
                        </div>
                        <p className="text-md uppercase tracking-wide animate-pulse">Saving...</p>
                        <span className="loading loading-spinner loading-lg"/>
                    </div>
                </div>
            </Modal>
            {isFetching ? (
                    <div className="flex flex-col items-center mt-14">
                        <Loader />
                        <p className="mt-2 text-xl animate-pulse">Loading notes...</p>
                    </div>
                ) : (
                    <>
                        {notesMetadata.length > 0 ? (
                            <div className="w-fit xxs:!w-screen lg:!w-[360px] mx-auto">
                                {!delayedSearch && (pinnedNotes.length > 0 && page === 1) && (
                                    <>
                                        <div className={`mt-7 ${showPinnedNotesInFolder && "xxs:ml-[0.6rem] ml-2"} !z-0`}>
                                            {showPinnedNotesInFolder ? (
                                                <div
                                                    className="transition-all collapse xxs:ml-0 ml-3 dark:border-[#363636] border bg-[#eeeff1] dark:!bg-[#181818] !rounded-lg lg:ml-0 border-stone-300 dark:hover:border-[#404040] duration-200"
                                                    style={{
                                                        width: viewPort.width <= 1023 
                                                            ? (viewPort.width <= 640 ? viewPort.width - 19.5 : viewPort.width - 100)
                                                            : 344,
                                                        zIndex: 0,
                                                        position: 'static'
                                                    }}
                                                >
                                                    <input 
                                                        checked={openPinNoteCollapsable}
                                                        type="checkbox" 
                                                        className="peer" 
                                                        onChange={() => {
                                                            setPinWasClicked(!pinWasClicked);
                                                            setOpenPinNoteCollapsable(!openPinNoteCollapsable);
                                                        }}
                                                    /> 
                                                    <div className="collapse-title">
                                                        <div className="!ml-6 mt-2 mb-2 flex flex-row space-x-2 justify-center items-center">
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
                                                        <div className="flex flex-row flex-wrap my-5 gap-y-6 gap-x-3 justify-center items-center">
                                                            {pinnedNotes.map((pinnedNotes, idx) => {
                                                                return (
                                                                    <Cards  
                                                                        key={pinnedNotes._id}
                                                                        idx={idx}
                                                                        note={pinnedNotes}
                                                                        customWidth={"!w-[145px] xxs:!w-[142.5px]"}
                                                                        handleNoteClick={handleNoteClick}
                                                                        days={days}
                                                                        hours={hours}
                                                                        noteArraySize={(pinnedNotes as any).length}
                                                                    />
                                                                )
                                                            })} 
                                                            <div className="flex flex-row items-center space-x-10 justify-center w-full mt-5">
                                                                <button 
                                                                    className="uppercase text-[11px] tracking-wide cursor-pointer hover:tracking-widest duration-300 border border-gray-600 py-2 px-3 rounded-full disabled:cursor-not-allowed disabled:tracking-wide disabled:text-gray-500"
                                                                    disabled={pinPage > 1 ? false : true}
                                                                    onClick={() => {
                                                                        setOpenPinNoteCollapsable(true);
                                                                        dispatchPinNotes({ type: "PAGE", payload: pinPage - 1 });
                                                                    }}
                                                                >
                                                                    previous page
                                                                </button>
                                                                <button 
                                                                    className="uppercase text-[11px] tracking-wide cursor-pointer hover:tracking-widest duration-300 border border-gray-600 py-2 px-3 rounded-full disabled:cursor-not-allowed disabled:tracking-wide disabled:text-gray-500"
                                                                    disabled={pinHasNextPage ? false : true}
                                                                    onClick={() => {
                                                                        setOpenPinNoteCollapsable(true);
                                                                        dispatchPinNotes({ type: "PAGE", payload: pinPage + 1 });
                                                                    }}
                                                                >
                                                                    next page
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="xxs:px-2">
                                                    <div className="mt-2 mb-10 flex flex-row space-x-2 justify-center items-center">
                                                        <p className="uppercase text-xs tracking-widest">Pinned notes</p>
                                                        <BsFillPinAngleFill />
                                                    </div> 
                                                    <div className="flex flex-row flex-wrap px-2 xxs:px-0 my-5 gap-y-6 gap-x-3 mb-9 justify-center items-center">
                                                        {pinnedNotes.map((pinnedNotes, idx) => {
                                                            return (
                                                                <Cards  
                                                                    key={pinnedNotes._id}
                                                                    idx={idx}
                                                                    days={days}
                                                                    hours={hours}
                                                                    note={pinnedNotes}
                                                                    handleNoteClick={handleNoteClick}
                                                                    noteArraySize={(pinnedNotes as any).length}
                                                                />
                                                            )
                                                        })} 
                                                        <div className="flex flex-row items-center space-x-10 justify-center w-full mt-5">
                                                            <button 
                                                                className="text-gray-300 uppercase text-[11px] tracking-wide cursor-pointer hover:tracking-widest duration-300 border border-gray-600 py-2 px-3 rounded-full disabled:cursor-not-allowed disabled:tracking-wide disabled:text-gray-500"
                                                                disabled={pinPage > 1 ? false : true}
                                                                onClick={() => dispatchPinNotes({ type: "PAGE", payload: pinPage - 1 })}
                                                            >
                                                                previous page
                                                            </button>
                                                            <button 
                                                                className="text-gray-300 uppercase text-[11px] tracking-wide cursor-pointer hover:tracking-widest duration-300 border border-gray-600 py-2 px-3 rounded-full disabled:cursor-not-allowed disabled:tracking-wide disabled:text-gray-500"
                                                                disabled={pinHasNextPage ? false : true}
                                                                onClick={() => dispatchPinNotes({ type: "PAGE", payload: pinPage + 1 })}
                                                            >
                                                                next page
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div 
                                            className={`
                                                border border-transparent border-t-stone-300 dark:!border-t-[#404040] mb-10 mx-auto
                                                ${showPinnedNotesInFolder && "mt-7 !mb-7"}
                                            `}
                                            style={{
                                                width: viewPort.width <= 1023 
                                                    ? (viewPort.width <= 640 ? viewPort.width - 45 : viewPort.width - 140)
                                                    : 330
                                            }}
                                        />
                                    </>
                                )}
                                <div className="flex flex-row flex-wrap px-2 my-5 gap-y-6 gap-x-4 lg:gap-x-3 mb-48 xxs:mb-64 justify-center items-center">
                                    {notesMetadata.map((unpinnedNotes, idx) => {
                                        return (
                                            <Cards  
                                                key={unpinnedNotes._id}
                                                idx={idx}
                                                days={days}
                                                hours={hours}
                                                note={unpinnedNotes}
                                                handleNoteClick={handleNoteClick}
                                                noteArraySize={notesMetadata.length}
                                            />
                                        )  
                                    })}
                                </div>
                            </div>
                            ) : (
                                <div className="flex flex-col space-y-3 justify-center items-center mt-6 mx-auto">
                                    <img src={no_notes_found} className="mt-5 w-48 dark:opacity-75 md:w-60 lg:w-44"/>
                                    <p className="dark:!text-gray-400 text-stone-600 text-[13px] uppercase tracking-wide">
                                        {!delayedSearch ? "No notes were found!" : "Ouhh, it's quite empty here..."}
                                    </p>  
                                    {page > 1 ? (
                                        <button
                                            className="text-gray-900 dark:text-gray-200 text-sm font-light tracking-widest uppercase px-3 h-10 rounded-full dark:hover:!bg-stone-900 hover:bg-[#dadada] border border-gray-500 transition-all duration-500 ease-in-out text-center w-[270px] mx-auto"
                                            onClick={() => navigate(goBackUrl as string)}
                                        > 
                                            Go back
                                        </button>
                                    ) : (
                                        <button 
                                            className="!mt-4 text-gray-900 dark:text-gray-200 text-xs font-light tracking-widest uppercase px-3 h-10 rounded-full hover:bg-[#dddddd] dark:hover:!bg-stone-900 border border-gray-500 transition-all duration-500 ease-in-out w-[270px] mx-auto"
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
    note: FieldArrayWithId<NoteMetadata, "noteMetadata", "id">;
    noteArraySize: number;
    idx: number;
    customWidth?: number | string;
    days: (date: string) => string;
    hours: (date: string) => string;
    handleNoteClick:  (_id: string) => void;

};

export function Test ({ note, idx, handleNoteClick, days, hours, customWidth, noteArraySize }: CardsProps) {
    const { image, label, _id, body, createdAt, updatedAt, name: noteName, labelArraySize } = note;
    const { color, type, fontColor, name } = label || {};

    const { selectedNote } = useSelectedNote();
    const baseUrl = useGetUrl({ absolutePath: true, removeNoteId: true });

    return (
        <Link   
            key={idx}
            relative="path"
            to={`${baseUrl}/note/${_id}`}
            className={`
                flex flex-wrap cursor-pointer 
                ${(idx === noteArraySize - 1 && (noteArraySize - 1) % 2 == 0) && "mb-10"}
            `} 
            onClick={() => handleNoteClick(_id)}
        >
            <div 
                className={`
                    text-gray-900 dark:text-gray-300 rounded-lg h-[18.4rem] border border-stone-300 dark:border-[#323232] bg-[#ffffff] hover:bg-[#f3f3f3] dark:hover:!bg-[#202020] dark:bg-[#181818] pt-3 shadow-lg hover:shadow-gray-400 dark:shadow-transparent hover:border transition duration-300 dark:hover:border-gray-500
                    ${selectedNote === _id && "!border-black dark:!border-[#626262]"}
                    ${customWidth ? customWidth : "w-[165px] xxs:!w-[159.5px]"}
                `}
            >
                <p className="text-lg px-3 mb-3 truncate">{noteName}</p>
                <div className={`h-[196px] flex flex-col px-2 ${image !== '' && "!h-[148px]"}`}>
                    <div 
                        className={`
                            w-[143px] xxs:w-[135px] !mb-1 line-clamp-7 pl-1
                            ${!labelArraySize && image === '' && "!line-clamp-8"}
                            ${labelArraySize && image !== '' && "!line-clamp-5"}
                            ${!labelArraySize && image !== '' && "!line-clamp-6"}
                            ${customWidth && "!w-[121px] xxs:!w-[122.5px] !pl-[5px]"}
                        `}
                    >
                        {body}
                    </div>
                    {label && labelArraySize > 0 && (
                        <div className="mt-1">
                            {type === "default" ? (
                                    <div className="flex space-x-1">
                                        <p 
                                            className="badge !text-[11px] badge-outline !py-1 uppercase text-xs tracking-wide"
                                            style={{ 
                                                backgroundColor: color, 
                                                borderColor: color, 
                                                color: fontColor 
                                            }}
                                        >
                                            {name && name.length > 16 ? name.slice(0, 11) + '...' : name}
                                        </p>
                                        {labelArraySize > 1 && (
                                        <div className="rounded-full w-[22px] h-[21px] bg-gray-800 dark:!bg-[#343434] text-gray-300">
                                            <p className="text-[9px] ml-[4.5px] mt-[4px]">
                                                {'+ ' + (labelArraySize > 9 ? 9 : labelArraySize - 1)}
                                            </p>
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
                                        {labelArraySize > 1 && (
                                        <div className="rounded-full w-[22px] h-[21px] bg-gray-800 dark:!bg-[#343434] text-gray-300">
                                            <p className="text-[9px] ml-[4.5px] mt-[4px]">
                                                {'+ ' + (labelArraySize > 9 ? 9 : labelArraySize - 1)}
                                            </p>
                                        </div>
                                        )}
                                    </div>
                                )
                            }
                        </div>
                    )}
                </div>
                <p className={`text-xs tracking-tighter mt-2 px-4 pb-[0.04rem] xxs:text-[11px] ${customWidth && "!px-3 !text-[11px]"}`}>
                    {!updatedAt ? days(createdAt) + " at " + hours(createdAt) : days(updatedAt) + " at " + hours(updatedAt)}
                </p>    
                {image !== '' && (
                    <img 
                        src={image}
                        className={`
                            ${selectedNote === _id && "!border-black dark:!border-[#626262]"}
                            ${customWidth ? "w-[9.1rem] xxs:!w-[8.88rem]" : "w-[164px] xxs:!w-[9.98rem]"}
                            border border-b-0 border-r-0 border-l-0 dark:border-t-[#2f2f2f] border-t-[#d6d3d1] mt-3 rounded-b-[6.5px] object-cover !h-[3.49rem] xxs:!h-[3.52rem] min-w-[98.9%]
                        `}
                    />
                )}
            </div>
        </Link>
    );
}

export const Cards = memo(Test);