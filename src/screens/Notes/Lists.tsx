import { useState, Dispatch, useEffect } from "react";
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

export default function Lists({ 
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
    const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [openPinNoteCollapsable, setOpenPinNoteCollapsable] = useState(false);
    const [viewPort, setViewPort] = useState({ width: window.innerWidth, height: window.innerHeight });

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
    const { width: currentWidth, height: currentHeight } = viewPort;
    
    useEffect(() => {
        const fn = (e: Event) => {
            if(status && status === "saving") {
                e.preventDefault();
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
            className="bg-[#f8f8f8] dark:bg-[#0f1011] text-gray-900 dark:text-gray-300 overflow-scroll h-screen scrollbar-thin scrollbar-thumb-gray-500 overflow-x-hidden"
            style={{ height: currentHeight - 148 }}
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
                    <div className="flex flex-col items-center mt-14 space-y-5">
                        <span className="loading loading-spinner loading-lg" />
                        <p className="mt-2 text-xl animate-pulse">Loading notes...</p>
                    </div>
                ) : (
                    <>
                        {notesMetadata.length ? (
                            <div className="w-fit xxs:!w-screen lg:!w-[360px]">
                                {!delayedSearch && (pinnedNotes.length && page === 1) && (
                                    <>
                                        <div className="mt-5">
                                            {showPinnedNotesInFolder ? (
                                                <div 
                                                    className="py-2 collapse border border-l-0 border-r-0 bg-[#eeeff1] dark:!bg-[#181818] rounded-none border-stone-300 dark:border-[#323232] dark:hover:border-[#404040] transition-all duration-200 ease-in-out"
                                                    style={{
                                                        width: currentWidth <= 1023 
                                                        ? (currentWidth <= 640 ? currentWidth : currentWidth - 50)
                                                        : 378,
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
                                                    <div className="collapse-title !pr-20">
                                                        <div className="mt-2 mb-2 flex flex-row space-x-2 justify-center items-center">
                                                            <p className="uppercase text-xs tracking-widest my-auto">Pinned notes</p>
                                                            <BsFillPinAngleFill />
                                                            <div className="absolute right-20">
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
                                                    <div className="collapse-content !px-0 !mx-0">
                                                        <div className="flex flex-row flex-wrap mt-5 mb-2">
                                                            {pinnedNotes.map((pinnedNotes, idx) => {
                                                                return (
                                                                    <Cards  
                                                                        key={pinnedNotes._id}
                                                                        idx={idx}
                                                                        days={days}
                                                                        note={pinnedNotes}
                                                                        handleNoteClick={handleNoteClick}
                                                                        customBodyWidth={"!w-[70vw] md:!w-[70vw] xl:!w-[210px] lg:!w-[210px] xxs:!w-[70vw]"}
                                                                        customImageWidth={"!w-[20px] sm:!w-[106px] md:!w-[120px] xl:!w-[120px] lg:!w-[120px] xxs:!w-[94px]"}
                                                                        customWidth={"!w-[90vw] sm:!w-[92vw] md:!w-[95vw] xl:!w-[380px] lg:!w-[380px] xxs:!w-screen dark:!bg-[#181818] !bg-[#eeeff1] hover:!bg-[#dddddd] shadow-none"}
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
                                                <div className="xxs:px-2 mt-7 pl-0 pr-0 md:pr-5 lg:pr-0 lg:!pl-5 xl:!pl-5">
                                                    <div className="flex flex-row space-x-2 justify-center items-center">
                                                        <p className="uppercase text-xs tracking-widest">Pinned notes</p>
                                                        <BsFillPinAngleFill />
                                                    </div> 
                                                    <div className="flex flex-row flex-wrap !mt-8 justify-center items-center">
                                                        {pinnedNotes.map((pinnedNotes, idx) => {
                                                            return (
                                                                <Cards  
                                                                    key={pinnedNotes._id}
                                                                    idx={idx}
                                                                    days={days}
                                                                    note={pinnedNotes}
                                                                    handleNoteClick={handleNoteClick}
                                                                    customBodyWidth={"!w-[70vw] md:!w-[70vw] xl:!w-[210px] lg:!w-[210px] xxs:!w-[70vw]"}
                                                                    customWidth={"!w-[92vw] sm:!w-[93vw] md:!w-[94vw] xl:!w-[380px] lg:!w-[380px] xxs:!w-screen"}
                                                                    customImageWidth={"!w-[20px] sm:!w-[106px] md:!w-[110px] xl:!w-[120px] lg:!w-[120px] xxs:!w-[94px]"}
                                                                />
                                                            )
                                                        })} 
                                                        <div className="flex flex-row items-center space-x-10 justify-center w-full mt-10 mb-8 !text-gray-900 dark:!text-gray-300">
                                                            <button 
                                                                className="uppercase text-[11px] tracking-wide cursor-pointer hover:tracking-widest duration-300 border border-gray-600 py-2 px-3 rounded-full disabled:cursor-not-allowed disabled:tracking-wide disabled:text-gray-500"
                                                                disabled={pinPage > 1 ? false : true}
                                                                onClick={() => dispatchPinNotes({ type: "PAGE", payload: pinPage - 1 })}
                                                            >
                                                                previous page
                                                            </button>
                                                            <button 
                                                                className="uppercase text-[11px] tracking-wide cursor-pointer hover:tracking-widest duration-300 border border-gray-600 py-2 px-3 rounded-full disabled:cursor-not-allowed disabled:tracking-wide disabled:text-gray-500"
                                                                disabled={pinHasNextPage ? false : true}
                                                                onClick={() => dispatchPinNotes({ type: "PAGE", payload: pinPage + 1 })}
                                                            >
                                                                next page
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div 
                                                        className={`
                                                            border border-transparent border-t-stone-300 dark:!border-t-[#404040] mx-auto w-80
                                                            ${showPinnedNotesInFolder ? "mt-7 !mb-7" : "mb-10"}
                                                        `}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                                <div className="pl-0 pr-0 md:pr-5 lg:pr-0 lg:!pl-5 xl:!pl-5">
                                    <div className="flex flex-row flex-wrap mt-5 mb-1 justify-center items-center">
                                        {notesMetadata.map((unpinnedNotes, idx) => {
                                            return (
                                                <Cards  
                                                    key={unpinnedNotes._id}
                                                    idx={idx}
                                                    days={days}
                                                    note={unpinnedNotes}
                                                    handleNoteClick={handleNoteClick}
                                                    customBodyWidth={"!w-[70vw] md:!w-[70vw] xl:!w-[210px] lg:!w-[210px] xxs:!w-[70vw]"}
                                                    customWidth={"!w-[92vw] sm:!w-[93vw] md:!w-[94vw] xl:!w-[380px] lg:!w-[380px] xxs:!w-screen"}
                                                    customImageWidth={"!w-[20px] sm:!w-[106px] md:!w-[130px] xl:!w-[120px] lg:!w-[120px] xxs:!w-[94px]"}
                                                />
                                            )  
                                        })}
                                    </div>
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
    idx: number;
    customWidth?: number | string;
    customBodyWidth?: number | string;
    customImageWidth?: number | string;
    days: (date: string) => string;
    handleNoteClick:  (_id: string) => void;
};

export function Cards ({ note, idx, handleNoteClick, days, customWidth, customBodyWidth, customImageWidth }: CardsProps) {
    const { image, label, _id, body, createdAt, updatedAt, name: noteName, labelArraySize } = note;
    const { color, type, fontColor, name } = label || {};

    const { selectedNote } = useSelectedNote();
    const baseUrl = useGetUrl({ absolutePath: true, removeNoteId: true });

    return (
        <Link   
            key={note._id}
            relative="path"
            to={`${baseUrl}/note/${_id}`}
            onClick={() => handleNoteClick(_id)}
            className="flex flex-wrap cursor-pointer"
        >
            <div 
                className={`
                    !w-[379px] text-gray-900 dark:text-gray-300 h-[135px] hover:!bg-[#f3f3f3] dark:hover:!bg-[#202020] border-stone-300 dark:border-[#323232] bg-[#ffffff] dark:bg-[#0f1011] pt-3 shadow-lg hover:shadow-gray-400 dark:shadow-transparent transition duration-300
                    ${selectedNote === _id && "dark:!bg-[#181818] !bg-[#eaeaea]"}
                    ${customWidth ? customWidth : "!w-[379px] xxs:!w-[159.5px]"}
                    ${idx !== 0 ? "border border-r-0 border-l-0 border-t-0"  : "border border-r-0 border-l-0"}
                    px-2
                `}
            >
                <div className="flex flex-col px-2 !h-[110px]">
                    <p className="text-[16px] truncate">{noteName}</p>
                    <div className="flex flex-row space-x-2">
                        <div
                            className={`
                                text-[14px] !w-[240px] xxs:w-[135px] line-clamp-2 h-[40px] my-auto
                                ${customBodyWidth ? customBodyWidth : customWidth && "!text-[14px] !w-[180px] xxs:!w-[122.5px] !pl-[5px]"}
                                ${image !== '' && "!w-[190px] xxs:!w-[122.5px]"}
                                ${!image && "!my-3"}
                            `}
                        >
                            {body}
                        </div>
                        {image && (
                            <img 
                                src={image}
                                className={`
                                    ${customImageWidth && customImageWidth}
                                    mt-2 dark:border-t-[#2f2f2f] border-t-[#d6d3d1] rounded-[6.5px] object-cover !h-[60px] xxs:!h-[3.52rem]
                                `}
                            />
                        )}
                    </div>
                    <div className="flex flex-row space-x-3">
                        <p 
                            className="!pl-0 my-auto text-[11px] tracking-tighter"
                        >
                            {!updatedAt ? days(createdAt) : days(updatedAt)}
                        </p>
                        {(label && labelArraySize) && (
                            <>
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}