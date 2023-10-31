import { useState, Dispatch } from "react";
import { Link } from "react-router-dom";

import { BsJournalText, BsSearch, BsFilter, BsXLg, BsList } from "react-icons/bs";
import { MdKeyboardDoubleArrowRight, MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { GrChapterAdd } from 'react-icons/gr';

import useGetUrl from "../../hooks/useGetUrl";
import useNavbar from "../../hooks/useNavbar";
import useSelectedNote from "../../hooks/useSelectedNote";

import { motion } from "framer-motion";

import type { notesState, notesActions } from "../../reducers/noteReducer";
import type { pinnedNotesState } from "../../reducers/pinNoteReducer";

type Props = {
    pinNotesState: pinnedNotesState;
    notesState: notesState;
    dispatchNotes: Dispatch<notesActions>;
}

export default function NoteTopBar({ dispatchNotes, pinNotesState, notesState }: Props) {
    const { navbar, setNavbar } = useNavbar();
    const { setSelectedNote } = useSelectedNote();

    const { hasNextPage, page, search, totalDocs } = notesState;
    const { totalDocs: pinTotalDocs } = pinNotesState;

    const getSearchInUrl = useGetUrl({
        options: {
            usePage: false,
            getSearchQueryInUrl: true,
        }
    });

    const [showSearch, setShowSearch] = useState(getSearchInUrl ? true : false);
    
    const allDocs = 
        totalDocs && pinTotalDocs ? totalDocs + pinTotalDocs
        : !totalDocs && pinTotalDocs ? pinTotalDocs : totalDocs;

    
    const getBaseUrl = useGetUrl({
        options: {
            usePage: false,
            absolutePath: true,
            removeNoteId: true
        }
    });

    const handleSearchClick = () => {
        setShowSearch(showSearch ? false : true);

        if(search && showSearch) {
            dispatchNotes({ type: 'SEARCH', payload: "" });
            history.replaceState({}, "", "/notes/page/1");
        }
    };

    const onInputChange = (currentTarget: HTMLInputElement) => {
        dispatchNotes({ type: 'SEARCH', payload: currentTarget.value });
        setSelectedNote('');
        
        if(!currentTarget.value) {
            return history.replaceState({}, "", getBaseUrl as string);
        } 

        const nextURL = '/notes/page/1/search/' + currentTarget.value;
        history.replaceState({}, "", nextURL);
    };

    const handleNextPageClick = () => {
        dispatchNotes({ type: 'PAGE', payload: ++notesState.page });
        setSelectedNote('');
    };

    const handlePrevPageClick = () => {
        dispatchNotes({ type: 'PAGE', payload: --notesState.page });
        setSelectedNote('');
    }

    const forwardPage = useGetUrl({ 
        options: {
            usePage: true,
            incrementPage: true,
            absolutePath: true,
            removeNoteId: true
        }
    });

    const backwardPage = useGetUrl({ 
        options: {
            usePage: true,
            decrementPage: true,
            absolutePath: true,
            removeNoteId: true
        }
    });

    const hide = { opacity: 0, transitionEnd: { display: "none" }};
    const show = { display: "block", opacity: 1 };

    return (
        <>
            <div className="overflow-hidden flex flex-col pt-2 bg-[#f8f8f8] dark:bg-[#0f1011] h-[100px]">
                <div className="flex flex-col mb-[4px]">
                    <div className="flex flex-row justify-between px-3 py-2 text-gray-900 dark:text-gray-300">
                        <div className="text-center flex flex-row space-x-1 px-2">
                            <BsJournalText size={23} className="pt-1" />
                            <p className="text-xl">Notes</p>
                        </div>
                        <button
                            className="sm:hidden"
                            onClick={() => setNavbar(!navbar)}
                        >
                            {!navbar ? <BsList size={29} /> : <BsXLg size={23} className="mb-[2px] mr-1 mt-1" />}
                        </button>
                    </div>
                    <div className="flex flex-row flex-wrap gap-x-1 justify-between px-3 py-2 max-w-screen text-gray-900 dark:text-gray-300">
                        <p className="pl-3 pt-1">{allDocs} notes</p>
                        <div className="flex flex-row space-x-2">
                            <div className="px-1 py-1 rounded cursor-not-allowed text-gray-500"> 
                                <BsFilter size={25}/> 
                            </div>
                            <div className="tooltip tooltip-left tooltip-left-color-controller before:!mr-[5px] after:!mr-[3px]" data-tip="Search">
                                <button 
                                    type="button"
                                    className="hover:bg-[#dadada] dark:hover:bg-stone-600 px-[7px] py-2 rounded"
                                    onClick={() => handleSearchClick()}
                                >
                                    <BsSearch size={18} />
                                </button>
                            </div>
                            {/* <div className="tooltip tooltip-left tooltip-left-color-controller before:!mr-[5px] after:!mr-[3px]" data-tip="Note visualization">
                                <button 
                                    type="button"
                                    className="hover:bg-[#dadada] dark:hover:bg-stone-600 px-[5px] py-[6px] rounded"
                                    onClick={() => handleSearchClick()}
                                >
                                    <LiaThListSolid size={22} />
                                </button>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
            <motion.div
                animate={showSearch ? show : hide}
                transition={{ duration: 0.4 }}
                className={`bg-[#f8f8f8] dark:bg-[#0f1011] px-6 pb-2 hidden ${showSearch && "!grid"}`}
            >
                <input
                    className="sign-text-inputs bg-[#eeeff1] dark:bg-[#1c1d1e] dark:text-gray-300 text-gray-900 h-10 border !border-stone-400 dark:!border-[#404040] hover:!border-gray-600 shadow-none"
                    onChange={({currentTarget}) => onInputChange(currentTarget)}
                    placeholder="Search..."
                    value={search}
                />
            </motion.div>
            <div className="bg-[#eaeaea] dark:!bg-[#0f1011] border border-transparent border-t-stone-300 border-b-stone-300 dark:border-t-[#404040] dark:border-b-[#404040] text-gray-300">
                <div className="btn-group bg-[#f8f8f8] dark:!bg-[#0f1011] flex !justify-between px-6">
                    {page === 1 ? (
                        <button className="btn !border-transparent !bg-inherit text-gray-500 cursor-not-allowed"> 
                            <MdKeyboardDoubleArrowLeft size={18} className="cursor-not-allowed" />
                        </button>
                    ) : (
                        <Link 
                            className="btn bg-[#f8f8f8] dark:!bg-[#0f1011] hover:!bg-[#f8f8f8] !border-transparent text-lg transition-all duration-300 ease-in-out hover:!text-2xl"
                            onClick={() => handlePrevPageClick()}
                            to={search ?`${backwardPage}/search/${search}` : backwardPage as string}
                        > 
                            <MdKeyboardDoubleArrowLeft className="text-gray-900 dark:text-gray-300" />
                        </Link>
                    )}
                    <p className="bg-[#f8f8f8] text-gray-900 dark:text-gray-300 dark:!bg-[#0f1011] uppercase tracking-widest text-sm cursor-default my-auto">
                        Page {page}
                    </p>
                    {!hasNextPage ? (
                        <button className="btn !border-transparent !bg-inherit text-gray-500 cursor-not-allowed">
                            <MdKeyboardDoubleArrowRight 
                                className="cursor-not-allowed" 
                                size={18} 
                            />
                        </button>
                    ) : (
                        <Link 
                            className="btn bg-[#f8f8f8] dark:!bg-[#0f1011] hover:!bg-[#f8f8f8] !border-transparent text-lg transition-all duration-300 ease-in-out hover:!text-2xl"
                            onClick={() => handleNextPageClick()}
                            to={search ?`${forwardPage}/search/${search}` : forwardPage as string }
                        > 
                            <MdKeyboardDoubleArrowRight className="text-gray-900 dark:text-gray-300" />
                        </Link>
                    )}
                </div>
            </div>
        </>
    )
}